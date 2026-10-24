@extends('layouts.admin')

@section('title')
    List Servers
@endsection

@section('content-header')
    @php
        use Pterodactyl\Models\Server;
        use Pterodactyl\Models\Node;

        $kpiTotal = Server::count();
        $kpiSuspended = Server::where('status', 'suspended')->count();
        $kpiActive = Server::whereNull('status')->count();
        $kpiRam = Server::sum('memory');
        $kpiDisk = Server::sum('disk');
        $allNodes = Node::orderBy('name')->get();
    @endphp

    <div class="vh-page-heading">
        <div>
            <span class="vh-page-eyebrow">Fleet management / Compute</span>
            <h1>Server Infrastructure</h1>
            <p>Monitor container distribution, live resource caps, node bindings, and administrative controls across all active servers.</p>
        </div>
        <div class="vh-heading-actions">
            <a href="{{ route('admin.servers.trash') }}" class="btn btn-default"><i data-lucide="trash-2"></i> Recycle Bin</a>
            <a href="{{ route('admin.servers.new') }}" class="btn btn-primary"><i data-lucide="plus-circle"></i> Create Server</a>
        </div>
    </div>
@endsection

@section('content')
    <!-- Fleet KPI Overview Strip -->
    <div class="vh-metric-grid" style="margin-bottom: 22px;">
        <div class="vh-metric-card vh-metric-primary">
            <span class="vh-metric-icon"><i data-lucide="server"></i></span>
            <div class="vh-metric-copy">
                <small>Total Fleet</small>
                <strong>{{ number_format($kpiTotal) }}</strong>
                <em>Registered servers</em>
            </div>
        </div>

        <div class="vh-metric-card vh-metric-green">
            <span class="vh-metric-icon"><i data-lucide="check-circle-2"></i></span>
            <div class="vh-metric-copy">
                <small>Active & Online</small>
                <strong>{{ number_format($kpiActive) }}</strong>
                <em>Operational containers</em>
            </div>
        </div>

        <div class="vh-metric-card {{ $kpiSuspended > 0 ? 'vh-metric-violet' : 'vh-metric-cyan' }}">
            <span class="vh-metric-icon"><i data-lucide="pause-circle"></i></span>
            <div class="vh-metric-copy">
                <small>Suspended</small>
                <strong>{{ number_format($kpiSuspended) }}</strong>
                <em>Access restricted</em>
            </div>
        </div>

        <div class="vh-metric-card vh-metric-cyan">
            <span class="vh-metric-icon"><i data-lucide="cpu"></i></span>
            <div class="vh-metric-copy">
                <small>Allocated RAM / Disk</small>
                <strong>{{ round($kpiRam / 1024, 1) }} GB</strong>
                <em>Disk: {{ round($kpiDisk / 1024, 1) }} GB limit</em>
            </div>
        </div>
    </div>

    <!-- Filter & Search Control Bar -->
    <div class="box vh-control-card" style="margin-bottom: 20px;">
        <div class="box-body" style="padding: 16px 20px;">
            <form action="{{ route('admin.servers') }}" method="GET" class="row" style="margin: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 12px;">
                <div style="flex: 2; min-width: 220px;">
                    <div class="input-group" style="width: 100%;">
                        <input type="text" name="filter[*]" class="form-control" placeholder="Search by name, owner username, UUID, or node..." value="{{ request()->input('filter.*') ?? request()->input('filter.name') ?? request()->input('query') }}">
                    </div>
                </div>

                <div style="flex: 1; min-width: 160px;">
                    <select name="filter[node_id]" class="form-control" onchange="this.form.submit()">
                        <option value="">All Nodes ({{ $allNodes->count() }})</option>
                        @foreach($allNodes as $n)
                            <option value="{{ $n->id }}" {{ request()->input('filter.node_id') == $n->id ? 'selected' : '' }}>{{ $n->name }} ({{ $n->fqdn }})</option>
                        @endforeach
                    </select>
                </div>

                <div style="flex: 1; min-width: 140px;">
                    <select name="filter[status]" class="form-control" onchange="this.form.submit()">
                        <option value="">All Statuses</option>
                        <option value="active" {{ request()->input('filter.status') === 'active' ? 'selected' : '' }}>Active Only</option>
                        <option value="suspended" {{ request()->input('filter.status') === 'suspended' ? 'selected' : '' }}>Suspended Only</option>
                    </select>
                </div>

                <div style="display: flex; gap: 8px;">
                    <button type="submit" class="btn btn-primary"><i data-lucide="search"></i> Filter</button>
                    @if(request()->has('filter') || request()->has('query'))
                        <a href="{{ route('admin.servers') }}" class="btn btn-default"><i data-lucide="x"></i> Clear</a>
                    @endif
                </div>
            </form>
        </div>
    </div>

    <!-- Liquid Glass Server List Table -->
    <div class="box vh-control-card">
        <div class="box-header with-border vh-card-header">
            <div>
                <span class="vh-card-eyebrow">Inventory</span>
                <h3 class="box-title">Registered Fleet Servers</h3>
                <p>Showing {{ $servers->firstItem() ?? 0 }} to {{ $servers->lastItem() ?? 0 }} of {{ $servers->total() }} servers matching current filter.</p>
            </div>
        </div>

        <div class="box-body table-responsive no-padding">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th style="width: 22%;">Server Name</th>
                        <th style="width: 11%;">UUID</th>
                        <th style="width: 12%;">Owner</th>
                        <th style="width: 12%;">Node</th>
                        <th style="width: 15%;">Connection</th>
                        <th style="width: 16%;">Resources (RAM / CPU / Disk)</th>
                        <th style="width: 8%;">Status</th>
                        <th style="width: 10%; text-align: right;">Quick Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($servers as $server)
                        @php
                            $connAddress = ($server->allocation?->alias ?? $server->node?->fqdn ?? $server->allocation?->ip ?? '0.0.0.0') . ':' . ($server->allocation?->port ?? '0000');
                        @endphp
                        <tr>
                            <td>
                                <a href="{{ route('admin.servers.view', $server->id) }}" style="font-weight: 650; font-size: 13px; color: #ffffff;">
                                    {{ $server->name }}
                                </a>
                                @if($server->description)
                                    <p style="margin: 2px 0 0; font-size: 10px; color: #71717a; max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                        {{ $server->description }}
                                    </p>
                                @endif
                            </td>

                            <td>
                                <span class="vh-copy-pill" data-copy="{{ $server->uuid }}" title="Click to copy full UUID: {{ $server->uuid }}">
                                    {{ $server->uuidShort }}
                                    <i data-lucide="copy"></i>
                                </span>
                            </td>

                            <td>
                                <a href="{{ route('admin.users.view', $server->user_id) }}" style="color: #e4e4e7; font-weight: 550;">
                                    {{ $server->user?->username ?? 'Unknown' }}
                                </a>
                            </td>

                            <td>
                                <a href="{{ route('admin.nodes.view', $server->node_id) }}" style="color: #e4e4e7;">
                                    {{ $server->node?->name ?? 'Unknown' }}
                                </a>
                            </td>

                            <td>
                                <span class="vh-copy-pill" data-copy="{{ $connAddress }}" title="Click to copy connection address">
                                    {{ $connAddress }}
                                    <i data-lucide="copy"></i>
                                </span>
                            </td>

                            <td>
                                <span style="font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                                    <span style="color: #10b981;" title="RAM limit">{{ $server->memory == 0 ? '∞' : number_format($server->memory) . ' MiB' }}</span>
                                    <span style="color: #52525b;">/</span>
                                    <span style="color: #06b6d4;" title="CPU limit">{{ $server->cpu == 0 ? '∞' : $server->cpu . '%' }}</span>
                                    <span style="color: #52525b;">/</span>
                                    <span style="color: #a78bfa;" title="Disk limit">{{ $server->disk == 0 ? '∞' : number_format($server->disk) . ' MiB' }}</span>
                                </span>
                            </td>

                            <td>
                                @if($server->isSuspended())
                                    <span class="label label-danger">Suspended</span>
                                @elseif(!is_null($server->status))
                                    <span class="label label-warning">{{ ucfirst($server->status) }}</span>
                                @else
                                    <span class="label label-success">Active</span>
                                @endif
                            </td>

                            <td style="text-align: right;">
                                <div style="display: inline-flex; align-items: center; gap: 6px;">
                                    <!-- Open in User Panel -->
                                    <a href="/server/{{ $server->uuidShort }}" target="_blank" rel="noopener noreferrer" class="btn btn-default btn-xs" title="Open in User Panel" style="padding: 5px 8px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.08); color: #fff;">
                                        <i data-lucide="external-link" style="width: 13px; height: 13px;"></i>
                                    </a>

                                    <!-- Manage Server -->
                                    <a href="{{ route('admin.servers.view.manage', $server->id) }}" class="btn btn-default btn-xs" title="Manage Server" style="padding: 5px 8px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.08); color: #fff;">
                                        <i data-lucide="wrench" style="width: 13px; height: 13px;"></i>
                                    </a>

                                    <!-- Suspend / Unsuspend -->
                                    <form action="{{ route('admin.servers.view.manage.suspension', $server->id) }}" method="POST" style="display: inline-block; margin: 0;" onsubmit="return confirm('Are you sure you want to {{ $server->isSuspended() ? 'unsuspend' : 'suspend' }} server \'{{ addslashes($server->name) }}\'?')">
                                        {!! csrf_field() !!}
                                        <input type="hidden" name="action" value="{{ $server->isSuspended() ? 'unsuspend' : 'suspend' }}" />
                                        <button type="submit" class="btn {{ $server->isSuspended() ? 'btn-success' : 'btn-warning' }} btn-xs" title="{{ $server->isSuspended() ? 'Unsuspend Server Access' : 'Suspend Server Access' }}" style="padding: 5px 8px;">
                                            <i data-lucide="{{ $server->isSuspended() ? 'play' : 'pause' }}" style="width: 13px; height: 13px;"></i>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" class="text-center" style="padding: 40px 20px;">
                                <div class="vh-empty-state">
                                    <i data-lucide="search-x"></i>
                                    <h3>No servers found</h3>
                                    <p>No fleet servers matched your current filter criteria.</p>
                                    <a href="{{ route('admin.servers') }}" class="btn btn-default">Reset filters</a>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($servers->hasPages())
            <div class="box-footer" style="padding: 14px 20px; display: flex; align-items: center; justify-content: space-between;">
                <div style="font-size: 11px; color: #a1a1aa;">
                    Showing {{ $servers->firstItem() }} to {{ $servers->lastItem() }} of {{ $servers->total() }} results
                </div>
                <div>
                    {!! $servers->appends(request()->query())->render() !!}
                </div>
            </div>
        @endif
    </div>

    <!-- Notification Toast for Copy to Clipboard -->
    <div id="vh-copy-toast" style="position: fixed; bottom: 24px; right: 24px; background: rgba(16, 185, 129, 0.95); backdrop-filter: blur(12px); color: #fff; font-size: 12px; font-weight: 600; padding: 10px 18px; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: none; z-index: 99999; align-items: center; gap: 8px;">
        <i data-lucide="check" style="width: 15px; height: 15px;"></i> Copied to clipboard!
    </div>
@endsection

@section('footer-scripts')
    @parent
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            var toast = document.getElementById('vh-copy-toast');
            var toastTimeout;

            function showCopyToast(msg) {
                if (!toast) return;
                toast.innerHTML = '<i data-lucide="check" style="width: 15px; height: 15px;"></i> ' + (msg || 'Copied to clipboard!');
                toast.style.display = 'flex';
                if (window.lucide) window.lucide.createIcons();
                clearTimeout(toastTimeout);
                toastTimeout = setTimeout(function () {
                    toast.style.display = 'none';
                }, 2200);
            }

            document.addEventListener('click', function (e) {
                var pill = e.target.closest('.vh-copy-pill');
                if (!pill) return;
                var text = pill.getAttribute('data-copy');
                if (!text) return;

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(function () {
                        showCopyToast('Copied: ' + text);
                    }).catch(function () {
                        fallbackCopy(text);
                    });
                } else {
                    fallbackCopy(text);
                }
            });

            function fallbackCopy(text) {
                var ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                try {
                    document.execCommand('copy');
                    showCopyToast('Copied: ' + text);
                } catch (err) {}
                document.body.removeChild(ta);
            }
        });
    </script>
@endsection
