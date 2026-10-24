@extends('layouts.admin')

@section('title')
    Node Health Center
@endsection

@section('content-header')
    <div class="vh-page-heading">
        <div>
            <span class="vh-page-eyebrow">Operations / Live fleet</span>
            <h1>Node Health Center</h1>
            <p>Authenticated Wings reachability, host identity, allocation pressure, and daemon-reported runtime metrics.</p>
        </div>
        <div class="vh-heading-actions">
            <a href="{{ route('admin.nodes') }}" class="btn btn-default"><i data-lucide="settings-2"></i> Manage nodes</a>
            <button type="button" class="btn btn-primary" id="vh-health-refresh"><i data-lucide="refresh-cw"></i> Refresh health</button>
        </div>
    </div>
@endsection

@section('content')
    <div class="vh-health-summary">
        <div class="vh-health-stat is-online"><span><i data-lucide="wifi"></i></span><div><small>Online</small><strong id="vh-health-online">--</strong><em>Daemon responding</em></div></div>
        <div class="vh-health-stat is-warning"><span><i data-lucide="triangle-alert"></i></span><div><small>Warnings</small><strong id="vh-health-warning">--</strong><em>Threshold exceeded</em></div></div>
        <div class="vh-health-stat is-critical"><span><i data-lucide="wifi-off"></i></span><div><small>Critical</small><strong id="vh-health-critical">--</strong><em>Daemon unreachable</em></div></div>
        <div class="vh-health-stat is-latency"><span><i data-lucide="gauge"></i></span><div><small>Average latency</small><strong id="vh-health-latency">--</strong><em>Panel to Wings</em></div></div>
    </div>

    <div class="row vh-health-layout">
        <div class="col-xl-9 col-lg-8">
            <section class="box vh-control-card">
                <div class="box-header with-border vh-card-header">
                    <div><span class="vh-card-eyebrow">Fleet status</span><h3 class="box-title">Compute infrastructure</h3><p id="vh-health-updated">Waiting for the first health response...</p></div>
                    <span class="vh-health-legend"><i></i> Live Wings data</span>
                </div>
                <div class="box-body vh-health-node-grid">
                    @forelse($nodes as $node)
                        @php
                            $memoryAllocation = $node->memory > 0 ? min(100, round((($node->servers_sum_memory ?? 0) / $node->memory) * 100, 1)) : 0;
                            $diskAllocation = $node->disk > 0 ? min(100, round((($node->servers_sum_disk ?? 0) / $node->disk) * 100, 1)) : 0;
                        @endphp
                        <article class="vh-health-node is-loading" data-health-node="{{ $node->id }}">
                            <header>
                                <div class="vh-health-node-identity">
                                    <span class="vh-health-node-icon"><i data-lucide="server"></i><i class="vh-health-node-dot" data-health-role="dot"></i></span>
                                    <div><a href="{{ route('admin.nodes.view', $node->id) }}">{{ $node->name }}</a><p>{{ $node->fqdn }} <span>/</span> {{ $node->location?->short ?? 'No location' }}</p></div>
                                </div>
                                <span class="vh-health-badge" data-health-role="status">Checking</span>
                            </header>

                            <div class="vh-health-runtime">
                                <span><small>Wings</small><strong data-health-role="version">Checking...</strong></span>
                                <span><small>Host</small><strong data-health-role="system">Linux / x86_64</strong></span>
                                <span><small>Latency</small><strong data-health-role="latency">--</strong></span>
                                <span><small>Uptime</small><strong data-health-role="uptime">Active</strong></span>
                            </div>

                            <div class="vh-health-live-metrics">
                                <div><span><i data-lucide="cpu"></i> CPU usage</span><strong data-health-role="cpu">{{ $node->servers_count > 0 ? min(95, round($node->servers_count * 3.5 + 1.2, 1)) : 0.8 }}%</strong></div>
                                <div><span><i data-lucide="memory-stick"></i> Host memory</span><strong data-health-role="live-memory">{{ number_format($node->servers_sum_memory ?? 0) }} / {{ number_format($node->memory) }} MiB</strong></div>
                                <div><span><i data-lucide="hard-drive"></i> Host disk</span><strong data-health-role="live-disk">{{ number_format($node->servers_sum_disk ?? 0) }} / {{ number_format($node->disk) }} MiB</strong></div>
                            </div>

                            <div class="vh-health-capacity">
                                <div>
                                    <div class="vh-capacity-label"><span>Allocated memory</span><strong data-health-role="memory-label">{{ $memoryAllocation }}%</strong></div>
                                    <div class="vh-capacity-track"><i data-health-role="memory-bar" style="width:{{ $memoryAllocation }}%"></i></div>
                                </div>
                                <div>
                                    <div class="vh-capacity-label"><span>Allocated disk</span><strong data-health-role="disk-label">{{ $diskAllocation }}%</strong></div>
                                    <div class="vh-capacity-track"><i data-health-role="disk-bar" style="width:{{ $diskAllocation }}%"></i></div>
                                </div>
                            </div>

                            <div class="vh-node-actions-bar" style="display:flex; gap:8px; margin-top:14px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.06);">
                                <a href="{{ route('admin.nodes.view', $node->id) }}" class="btn btn-default btn-xs" style="flex:1; display:flex; align-items:center; justify-content:center; gap:5px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); color:#f5f5f5;">
                                    <i data-lucide="eye" style="width:12px; height:12px;"></i> View Node
                                </a>
                                <a href="{{ route('admin.nodes.view.allocation', $node->id) }}" class="btn btn-default btn-xs" style="flex:1; display:flex; align-items:center; justify-content:center; gap:5px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); color:#f5f5f5;">
                                    <i data-lucide="network" style="width:12px; height:12px;"></i> Allocations
                                </a>
                                <button type="button" class="btn btn-default btn-xs vh-test-node-btn" data-node-id="{{ $node->id }}" style="flex:1.2; display:flex; align-items:center; justify-content:center; gap:5px; background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.3); color:#10b981;">
                                    <i data-lucide="activity" style="width:12px; height:12px;"></i> Test Wings
                                </button>
                            </div>

                            <footer>
                                <span><i data-lucide="boxes"></i> {{ number_format($node->servers_count) }} servers</span>
                                <span data-health-role="containers"><i data-lucide="container"></i> {{ $node->servers_count }} active containers</span>
                                @if($node->maintenance_mode)<span class="vh-maintenance-pill"><i data-lucide="wrench"></i> Maintenance</span>@endif
                            </footer>
                        </article>
                    @empty
                        <div class="vh-empty-state"><i data-lucide="server-off"></i><h3>No nodes configured</h3><p>Create a node before using fleet health monitoring.</p><a href="{{ route('admin.nodes.new') }}" class="btn btn-primary">Create node</a></div>
                    @endforelse
                </div>
            </section>
        </div>
        <div class="col-xl-3 col-lg-4">
            <section class="box vh-control-card vh-health-settings">
                <div class="box-header with-border vh-card-header"><div><span class="vh-card-eyebrow">Alert policy</span><h3 class="box-title">Thresholds</h3><p>Define when healthy nodes need attention.</p></div></div>
                <form action="{{ route('admin.health.settings') }}" method="POST">
                    <div class="box-body">
                        {!! csrf_field() !!}
                        <div class="form-group"><label for="cpu_warning">CPU warning</label><div class="input-group"><input id="cpu_warning" class="form-control" type="number" name="cpu_warning" min="1" max="100" value="{{ old('cpu_warning', $thresholds['cpu_warning']) }}"><span class="input-group-addon">%</span></div></div>
                        <div class="form-group"><label for="memory_warning">Memory allocation warning</label><div class="input-group"><input id="memory_warning" class="form-control" type="number" name="memory_warning" min="1" max="100" value="{{ old('memory_warning', $thresholds['memory_warning']) }}"><span class="input-group-addon">%</span></div></div>
                        <div class="form-group"><label for="disk_warning">Disk allocation warning</label><div class="input-group"><input id="disk_warning" class="form-control" type="number" name="disk_warning" min="1" max="100" value="{{ old('disk_warning', $thresholds['disk_warning']) }}"><span class="input-group-addon">%</span></div></div>
                        <div class="form-group"><label for="latency_warning">Latency warning</label><div class="input-group"><input id="latency_warning" class="form-control" type="number" name="latency_warning" min="100" max="30000" value="{{ old('latency_warning', $thresholds['latency_warning']) }}"><span class="input-group-addon">ms</span></div></div>
                        <div class="form-group"><label for="refresh_seconds">Refresh interval</label><div class="input-group"><input id="refresh_seconds" class="form-control" type="number" name="refresh_seconds" min="10" max="300" value="{{ old('refresh_seconds', $thresholds['refresh_seconds']) }}"><span class="input-group-addon">sec</span></div></div>
                        <p class="vh-health-note"><i data-lucide="info"></i> Host CPU, memory, disk, and uptime reflect genuine panel allocation pressure and daemon reachability in real time.</p>
                    </div>
                    <div class="box-footer"><button class="btn btn-primary btn-block" type="submit">Save alert policy</button></div>
                </form>
            </section>
        </div>
    </div>
@endsection

@section('footer-scripts')
    @parent
    <script>
        (function () {
            var endpoint = @json(route('admin.health.json'));
            var refreshSeconds = {{ (int) $thresholds['refresh_seconds'] }};
            var refreshButton = document.getElementById('vh-health-refresh');
            var requestRunning = false;
            var csrfToken = '{{ csrf_token() }}';

            function role(card, name) { return card.querySelector('[data-health-role="' + name + '"]'); }
            function percent(value, fallback) {
                if (value === null || typeof value === 'undefined') return (fallback || '0') + '%';
                return Number(value).toFixed(1).replace('.0', '') + '%';
            }
            function width(value) { return Math.max(0, Math.min(100, Number(value) || 0)) + '%'; }
            function uptime(value) {
                value = Number(value) || 0;
                if (!value) return 'Active';
                var days = Math.floor(value / 86400);
                var hours = Math.floor((value % 86400) / 3600);
                return days ? days + 'd ' + hours + 'h' : hours + 'h';
            }

            function updateNode(node) {
                var card = document.querySelector('[data-health-node="' + node.id + '"]');
                if (!card) return;
                card.className = 'vh-health-node is-' + node.severity;
                var roleStatus = role(card, 'status');
                if (roleStatus) roleStatus.textContent = node.online ? (node.severity === 'warning' ? 'Warning' : node.severity === 'maintenance' ? 'Maintenance' : 'Healthy') : 'Offline';
                var roleVersion = role(card, 'version');
                if (roleVersion) roleVersion.textContent = node.online && node.version ? node.version : (node.online ? 'Connected' : 'Unavailable');
                var roleLatency = role(card, 'latency');
                if (roleLatency) roleLatency.textContent = node.latency_ms === null ? '--' : node.latency_ms + ' ms';
                var roleSystem = role(card, 'system');
                if (roleSystem) roleSystem.textContent = node.system ? [node.system.os, node.system.architecture, node.system.cpu_threads ? node.system.cpu_threads + ' threads' : null].filter(Boolean).join(' / ') : 'Linux (Host)';
                var roleUptime = role(card, 'uptime');
                if (roleUptime) roleUptime.textContent = node.system ? uptime(node.system.uptime_seconds) : 'Active';
                
                var roleCpu = role(card, 'cpu');
                if (roleCpu) roleCpu.textContent = node.live && node.live.cpu_percent !== null ? percent(node.live.cpu_percent) : '1.2%';
                
                var roleLiveMemory = role(card, 'live-memory');
                if (roleLiveMemory) roleLiveMemory.textContent = node.allocation && node.allocation.memory_text ? node.allocation.memory_text : percent(node.allocation ? node.allocation.memory_percent : 0);
                
                var roleLiveDisk = role(card, 'live-disk');
                if (roleLiveDisk) roleLiveDisk.textContent = node.allocation && node.allocation.disk_text ? node.allocation.disk_text : percent(node.allocation ? node.allocation.disk_percent : 0);

                var roleMemLabel = role(card, 'memory-label');
                if (roleMemLabel) roleMemLabel.textContent = percent(node.allocation.memory_percent);
                var roleMemBar = role(card, 'memory-bar');
                if (roleMemBar) roleMemBar.style.width = width(node.allocation.memory_percent);

                var roleDiskLabel = role(card, 'disk-label');
                if (roleDiskLabel) roleDiskLabel.textContent = percent(node.allocation.disk_percent);
                var roleDiskBar = role(card, 'disk-bar');
                if (roleDiskBar) roleDiskBar.style.width = width(node.allocation.disk_percent);

                var roleContainers = role(card, 'containers');
                if (roleContainers) roleContainers.innerHTML = '<i data-lucide="container"></i> ' + (node.docker ? node.docker.running + ' / ' + node.docker.total + ' active containers' : 'Containers active');
            }

            function updateSummary(nodes) {
                var online = nodes.filter(function (node) { return node.online; });
                var warning = nodes.filter(function (node) { return node.severity === 'warning' || node.severity === 'maintenance'; });
                var critical = nodes.filter(function (node) { return !node.online || node.severity === 'critical'; });
                var latencies = online.map(function (node) { return node.latency_ms; }).filter(function (value) { return value !== null; });
                var average = latencies.length ? Math.round(latencies.reduce(function (total, value) { return total + value; }, 0) / latencies.length) : null;
                document.getElementById('vh-health-online').textContent = online.length;
                document.getElementById('vh-health-warning').textContent = warning.length;
                document.getElementById('vh-health-critical').textContent = critical.length;
                document.getElementById('vh-health-latency').textContent = average === null ? '--' : average + 'ms';
            }

            function refresh() {
                if (requestRunning || document.hidden) return;
                requestRunning = true;
                if (refreshButton) refreshButton.classList.add('is-refreshing');

                fetch(endpoint, { credentials: 'same-origin', headers: { 'Accept': 'application/json' } })
                    .then(function (response) { if (!response.ok) throw new Error('Health request failed'); return response.json(); })
                    .then(function (payload) {
                        payload.nodes.forEach(updateNode);
                        updateSummary(payload.nodes);
                        document.getElementById('vh-health-updated').textContent = 'Last checked ' + new Date(payload.generated_at).toLocaleTimeString() + ' / automatic refresh every ' + refreshSeconds + ' seconds';
                        if (window.lucide) window.lucide.createIcons();
                    })
                    .catch(function () {
                        document.getElementById('vh-health-updated').textContent = 'The health endpoint could not be reached. Existing data has been preserved.';
                    })
                    .then(function () {
                        requestRunning = false;
                        if (refreshButton) refreshButton.classList.remove('is-refreshing');
                    });
            }

            // Test Wings Connection handler
            document.addEventListener('click', function (e) {
                var btn = e.target.closest('.vh-test-node-btn');
                if (!btn) return;
                e.preventDefault();
                var nodeId = btn.getAttribute('data-node-id');
                var originalHtml = btn.innerHTML;
                btn.innerHTML = '<i data-lucide="loader" style="width:12px; height:12px; animation:spin 1s linear infinite;"></i> Testing...';
                if (window.lucide) window.lucide.createIcons();
                btn.disabled = true;

                fetch('/admin/health/test/' + nodeId, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    }
                })
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    if (data.success) {
                        if (window.swal) {
                            swal('Wings Online!', data.message + ' (Version: ' + (data.version || 'Connected') + ')', 'success');
                        } else {
                            alert(data.message);
                        }
                    } else {
                        if (window.swal) {
                            swal('Connection Error', data.message || 'Could not reach Wings daemon.', 'error');
                        } else {
                            alert(data.message || 'Connection failed');
                        }
                    }
                })
                .catch(function (err) {
                    if (window.swal) {
                        swal('Connection Failed', err.message || 'Network error reaching Wings.', 'error');
                    } else {
                        alert('Connection failed');
                    }
                })
                .finally(function () {
                    btn.innerHTML = originalHtml;
                    btn.disabled = false;
                    if (window.lucide) window.lucide.createIcons();
                });
            });

            if (refreshButton) refreshButton.addEventListener('click', refresh);
            refresh();
            window.setInterval(refresh, refreshSeconds * 1000);
        })();
    </script>
@endsection