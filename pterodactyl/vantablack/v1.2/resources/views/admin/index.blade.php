@extends('layouts.admin')

@section('title')
    Control Center
@endsection

@section('content-header')
    <div class="vh-page-heading">
        <div>
            <span class="vh-page-eyebrow">Infrastructure overview</span>
            <h1>Good to see you, {{ Auth::user()->name_first }}.</h1>
            <p>Monitor your fleet, reach core operations, and verify panel health from one workspace.</p>
        </div>
        <div class="vh-heading-actions">
            <a href="{{ route('admin.vantablack') }}" class="btn btn-default"><i data-lucide="wand-2"></i> Open Studio</a>
            <a href="{{ route('admin.servers.new') }}" class="btn btn-primary"><i data-lucide="plus"></i> Deploy server</a>
        </div>
    </div>
@endsection

@section('content')
    <div class="vh-metric-grid">
        <a href="{{ route('admin.servers') }}" class="vh-metric-card vh-metric-primary">
            <span class="vh-metric-icon"><i data-lucide="gamepad-2"></i></span>
            <span class="vh-metric-copy"><small>Total servers</small><strong>{{ number_format($fleet['servers']) }}</strong><em>{{ number_format($fleet['suspended']) }} suspended</em></span>
            <i data-lucide="arrow-up-right" class="vh-metric-arrow"></i>
        </a>
        <a href="{{ route('admin.nodes') }}" class="vh-metric-card vh-metric-cyan">
            <span class="vh-metric-icon"><i data-lucide="server-cog"></i></span>
            <span class="vh-metric-copy"><small>Compute nodes</small><strong>{{ number_format($fleet['nodes']) }}</strong><em>{{ number_format($fleet['locations']) }} locations</em></span>
            <i data-lucide="arrow-up-right" class="vh-metric-arrow"></i>
        </a>
        <a href="{{ route('admin.users') }}" class="vh-metric-card vh-metric-violet">
            <span class="vh-metric-icon"><i data-lucide="users"></i></span>
            <span class="vh-metric-copy"><small>Customer accounts</small><strong>{{ number_format($fleet['users']) }}</strong><em>Managed identities</em></span>
            <i data-lucide="arrow-up-right" class="vh-metric-arrow"></i>
        </a>
        <div class="vh-metric-card vh-metric-green" id="vh-panel-health">
            <span class="vh-metric-icon"><i data-lucide="activity"></i></span>
            <span class="vh-metric-copy"><small>Panel health</small><strong data-health-status>Checking</strong><em data-health-detail>Verifying services...</em></span>
            <span class="vh-live-dot is-checking" data-health-dot></span>
        </div>
    </div>

    <div class="row vh-admin-grid">
        <div class="col-lg-8">
            <section class="box vh-control-card">
                <div class="box-header with-border vh-card-header">
                    <div>
                        <span class="vh-card-eyebrow">Live infrastructure</span>
                        <h3 class="box-title">Node fleet</h3>
                        <p>Real reachability and host details reported by each Wings daemon.</p>
                    </div>
                    <button type="button" class="btn btn-default btn-sm" id="vh-refresh-nodes"><i class="fa fa-refresh"></i> Refresh</button>
                </div>
                <div class="box-body vh-node-list">
                    @forelse($nodes as $node)
                        <article class="vh-node-row" data-node-health data-health-url="{{ url('/admin/nodes/view/' . $node->id . '/system-information') }}">
                            <div class="vh-node-symbol"><i data-lucide="server"></i><span class="vh-node-state is-checking" data-node-dot></span></div>
                            <div class="vh-node-main">
                                <div class="vh-node-name"><a href="{{ route('admin.nodes.view', $node->id) }}">{{ $node->name }}</a><span data-node-status>Connecting</span></div>
                                <p>{{ $node->fqdn }} <span>/</span> {{ $node->location?->short ?? 'No location' }}</p>
                            </div>
                            <div class="vh-node-capacity hidden-xs">
                                <span><small>Servers</small>{{ number_format($node->servers_count) }}</span>
                                <span><small>Memory</small>{{ number_format($node->memory / 1024, 1) }} GB</span>
                                <span><small>Disk</small>{{ number_format($node->disk / 1024, 1) }} GB</span>
                            </div>
                            <div class="vh-node-runtime hidden-sm hidden-xs" data-node-runtime>Waiting for Wings</div>
                            <a href="{{ route('admin.nodes.view', $node->id) }}" class="vh-row-action" aria-label="Manage {{ $node->name }}"><i data-lucide="chevron-right"></i></a>
                        </article>
                    @empty
                        <div class="vh-empty-state"><i data-lucide="server-off"></i><h3>No nodes configured</h3><p>Add a compute node to begin deploying game servers.</p><a href="{{ route('admin.nodes.new') }}" class="btn btn-primary">Create node</a></div>
                    @endforelse
                </div>
            </section>
        </div>
        <div class="col-lg-4">
            <section class="box vh-control-card">
                <div class="box-header with-border vh-card-header">
                    <div><span class="vh-card-eyebrow">Workspace</span><h3 class="box-title">Quick operations</h3><p>Jump into common administration tasks.</p></div>
                </div>
                <div class="box-body vh-quick-actions">
                    <a href="{{ route('admin.servers.new') }}"><span><i data-lucide="plus-circle"></i></span><div><strong>Deploy a server</strong><small>Create and assign a new instance</small></div><i data-lucide="arrow-right"></i></a>
                    <a href="{{ route('admin.nodes') }}"><span><i data-lucide="server-cog"></i></span><div><strong>Manage nodes</strong><small>Capacity and daemon settings</small></div><i data-lucide="arrow-right"></i></a>
                    <a href="{{ route('admin.settings') }}"><span><i data-lucide="settings-2"></i></span><div><strong>Panel settings</strong><small>Core services and mail</small></div><i data-lucide="arrow-right"></i></a>
                    <a href="{{ route('admin.vantablack.styling') }}"><span><i data-lucide="palette"></i></span><div><strong>Appearance</strong><small>Theme and interface controls</small></div><i data-lucide="arrow-right"></i></a>
                </div>
            </section>
            <section class="box vh-control-card vh-version-card {{ $version->isLatestPanel() ? 'is-current' : 'needs-update' }}">
                <div class="box-body">
                    <span class="vh-version-icon"><i data-lucide="{{ $version->isLatestPanel() ? 'shield-check' : 'shield-alert' }}"></i></span>
                    <div><small>Panel release</small><strong>v{{ config('app.version') }}</strong><p>{{ $version->isLatestPanel() ? 'Core panel is up to date.' : 'A newer Pterodactyl release is available.' }}</p></div>
                </div>
            </section>
        </div>
    </div>
@endsection

@section('footer-scripts')
    @parent
    <script>
        (function () {
            var healthUrl = @json(route('admin.system-health.json'));
            var healthCard = document.getElementById('vh-panel-health');
            var refreshButton = document.getElementById('vh-refresh-nodes');

            function setPanelHealth(ok, data) {
                if (!healthCard) return;
                healthCard.querySelector('[data-health-status]').textContent = ok ? 'Operational' : 'Attention';
                healthCard.querySelector('[data-health-detail]').textContent = ok
                    ? 'PHP ' + data.php_version + ' / ' + data.queue_driver + ' queue'
                    : 'Health endpoint unavailable';
                healthCard.querySelector('[data-health-dot]').className = 'vh-live-dot ' + (ok ? 'is-online' : 'is-offline');
            }

            function checkPanel() {
                fetch(healthUrl, { credentials: 'same-origin', headers: { 'Accept': 'application/json' } })
                    .then(function (response) { if (!response.ok) throw new Error('Health check failed'); return response.json(); })
                    .then(function (data) { setPanelHealth(data.status === 'ok', data); })
                    .catch(function () { setPanelHealth(false, {}); });
            }

            function checkNode(row) {
                var status = row.querySelector('[data-node-status]');
                var dot = row.querySelector('[data-node-dot]');
                var runtime = row.querySelector('[data-node-runtime]');
                status.textContent = 'Connecting';
                dot.className = 'vh-node-state is-checking';
                runtime.textContent = 'Waiting for Wings';

                fetch(row.dataset.healthUrl, { credentials: 'same-origin', headers: { 'Accept': 'application/json' } })
                    .then(function (response) { if (!response.ok) throw new Error('Node unavailable'); return response.json(); })
                    .then(function (data) {
                        status.textContent = 'Online';
                        status.className = 'is-online';
                        dot.className = 'vh-node-state is-online';
                        runtime.textContent = [data.system && data.system.type, data.system && data.system.cpus ? data.system.cpus + ' CPU' : null, data.version ? 'Wings ' + data.version : null].filter(Boolean).join(' / ');
                    })
                    .catch(function () {
                        status.textContent = 'Offline';
                        status.className = 'is-offline';
                        dot.className = 'vh-node-state is-offline';
                        runtime.textContent = 'Daemon unreachable';
                    });
            }

            function checkNodes() {
                document.querySelectorAll('[data-node-health]').forEach(checkNode);
            }

            if (refreshButton) refreshButton.addEventListener('click', checkNodes);
            checkPanel();
            checkNodes();
        })();
    </script>
@endsection