#!/usr/bin/env bash
#
# Vantablack per-server bandwidth shaper
# ======================================
#
# Applies the panel's bandwidth policy to running game-server containers on a
# Pterodactyl/Wings NODE HOST using Linux `tc` (HTB) + IFB for ingress.
#
# It fetches the policy JSON produced by the panel:
#     GET https://<panel>/admin/bandwidth/policy.json
# and, for every server container found on this host, caps egress (upload) and
# ingress (download) to the effective rate. Servers marked "unlimited" have any
# previously applied shaping removed.
#
# WHY: Wings itself does not rate-limit network throughput, so without this a
# single busy server can saturate the node's uplink. This script is the
# enforcement half of the panel's Bandwidth Limiter feature.
#
# REQUIREMENTS (run on each NODE, not the panel):
#   - root
#   - iproute2 (tc), jq, curl, docker
#   - kernel modules: sch_htb, ifb, act_mirred  (usually present)
#
# INSTALL (run on the node):
#   sudo cp vantablack-bandwidth.sh /usr/local/bin/vantablack-bandwidth
#   sudo chmod +x /usr/local/bin/vantablack-bandwidth
#   # store the panel URL + an admin cookie/token-less internal fetch:
#   echo 'PANEL_URL=https://panel.example.com' | sudo tee /etc/vantablack-bandwidth.env
#   echo 'POLICY_TOKEN=<optional shared secret>' | sudo tee -a /etc/vantablack-bandwidth.env
#   # run every minute:
#   ( crontab -l 2>/dev/null; echo '* * * * * /usr/local/bin/vantablack-bandwidth >/var/log/vantablack-bandwidth.log 2>&1' ) | crontab -
#
# NOTE: /admin/bandwidth/policy.json requires an authenticated admin session.
# For unattended node fetches, expose the policy behind your own reverse-proxy
# allow-list or add a shared-secret guard in the controller. This script sends
# the POLICY_TOKEN as an "X-Vanta-Token" header if set.
#
set -euo pipefail

ENV_FILE="${ENV_FILE:-/etc/vantablack-bandwidth.env}"
[ -f "$ENV_FILE" ] && . "$ENV_FILE"

PANEL_URL="${PANEL_URL:-}"
POLICY_TOKEN="${POLICY_TOKEN:-}"

if [ -z "$PANEL_URL" ]; then
    echo "PANEL_URL is not set (put it in $ENV_FILE)." >&2
    exit 1
fi

for bin in tc jq curl docker; do
    command -v "$bin" >/dev/null 2>&1 || { echo "Missing required binary: $bin" >&2; exit 1; }
done

POLICY_URL="${PANEL_URL%/}/admin/bandwidth/policy.json"

echo "[$(date -Is)] Fetching policy from $POLICY_URL"
POLICY_JSON="$(curl -fsSL ${POLICY_TOKEN:+-H "X-Vanta-Token: $POLICY_TOKEN"} "$POLICY_URL")" || {
    echo "Failed to fetch policy; leaving existing shaping untouched." >&2
    exit 1
}

# Ensure the IFB device used for ingress shaping exists.
ensure_ifb() {
    modprobe ifb numifbs=1 2>/dev/null || true
    ip link show ifb0 >/dev/null 2>&1 || ip link add ifb0 type ifb 2>/dev/null || true
    ip link set dev ifb0 up 2>/dev/null || true
}

# Remove shaping from an interface (egress qdisc + ingress redirect).
clear_iface() {
    local dev="$1"
    tc qdisc del dev "$dev" root 2>/dev/null || true
    tc qdisc del dev "$dev" ingress 2>/dev/null || true
}

# Apply a symmetric Mbit/s cap to a container veth interface.
# Egress is shaped directly on the veth; ingress is redirected to ifb0.
apply_cap() {
    local dev="$1" mbps="$2"
    local rate="${mbps}mbit"
    local burst="$(( mbps * 1024 / 8 ))kb"

    clear_iface "$dev"

    # Egress (server upload)
    tc qdisc add dev "$dev" root handle 1: htb default 10
    tc class add dev "$dev" parent 1: classid 1:10 htb rate "$rate" ceil "$rate" burst "$burst"

    # Ingress (server download) via ifb0
    tc qdisc add dev "$dev" handle ffff: ingress
    tc filter add dev "$dev" parent ffff: protocol ip u32 match u32 0 0 \
        action mirred egress redirect dev ifb0
}

ensure_ifb

# Reset ifb0 aggregate qdisc each run so we can rebuild per-container classes.
tc qdisc del dev ifb0 root 2>/dev/null || true
tc qdisc add dev ifb0 root handle 1: htb default 10 2>/dev/null || true

# Iterate servers from the policy. Container names in Wings are the server UUID.
echo "$POLICY_JSON" | jq -c '.servers[]' | while read -r row; do
    uuid="$(echo "$row" | jq -r '.uuid')"
    unlimited="$(echo "$row" | jq -r '.unlimited')"
    rate="$(echo "$row" | jq -r '.rate_mbps // empty')"

    # Find the docker container for this server (Wings names it after the uuid).
    cid="$(docker ps --filter "name=$uuid" --format '{{.ID}}' | head -n1 || true)"
    [ -z "$cid" ] && continue

    # Resolve the host-side veth for the container's eth0.
    ifindex="$(docker exec "$cid" cat /sys/class/net/eth0/iflink 2>/dev/null || true)"
    [ -z "$ifindex" ] && continue
    veth="$(grep -l "^$ifindex$" /sys/class/net/*/ifindex 2>/dev/null | head -n1 | awk -F/ '{print $5}' || true)"
    [ -z "$veth" ] && continue

    if [ "$unlimited" = "true" ] || [ -z "$rate" ]; then
        echo "  $uuid ($veth): unlimited -> clearing"
        clear_iface "$veth"
    else
        echo "  $uuid ($veth): capping at ${rate} Mbit/s"
        apply_cap "$veth" "$rate"
    fi
done

echo "[$(date -Is)] Done."
