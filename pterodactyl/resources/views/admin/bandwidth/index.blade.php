@extends('layouts.admin')

@section('title')
    Bandwidth Limiter
@endsection

@section('content-header')
    <div class="vh-page-heading">
        <div>
            <span class="vh-page-eyebrow">Network / Traffic Shaping</span>
            <h1>Bandwidth Limiter</h1>
            <p>Cap network throughput per server so a single game server cannot saturate a node's uplink. A global default is applied to every server and can be overridden or removed individually.</p>
        </div>
    </div>
@endsection

@section('content')
    <div class="row">
        <div class="col-md-4">
            <div class="box vh-control-card">
                <div class="box-header with-border">
                    <h3 class="box-title"><i data-lucide="gauge"></i> Global Default Policy</h3>
                </div>
                <form action="{{ route('admin.bandwidth.default') }}" method="POST">
                    {!! csrf_field() !!}
                    <div class="box-body">
                        <div class="form-group">
                            <label for="default_mbps">Default cap per server (Mbit/s)</label>
                            <div class="input-group">
                                <input type="number" id="default_mbps" name="default_mbps" class="form-control" min="1" max="100000" value="{{ old('default_mbps', $defaultMbps) }}" required>
                                <span class="input-group-addon">Mbit/s</span>
                            </div>
                            <p class="small text-muted no-margin">Applied to every server that does not have an explicit override below.</p>
                        </div>
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="enabled" value="1" @if($globalEnabled) checked @endif> Enable bandwidth limiting globally
                            </label>
                        </div>
                        <p class="vh-health-note"><i data-lucide="info"></i> The panel stores this policy only. Enforcement runs on each node host via the shaping script, which reads <code>/admin/bandwidth/policy.json</code>. See the README for the one-line cron install.</p>
                    </div>
                    <div class="box-footer">
                        <button type="submit" class="btn btn-primary btn-block"><i data-lucide="save"></i> Save default policy</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="col-md-8">
            <div class="box vh-control-card">
                <div class="box-header with-border">
                    <h3 class="box-title"><i data-lucide="server"></i> Per-Server Overrides</h3>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Server</th>
                                <th>Node</th>
                                <th>Effective Cap</th>
                                <th style="min-width:280px;">Set Limit</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($servers as $server)
                                @php
                                    $hasOverride = $limits->has($server->id);
                                    $overrideRate = $limits->get($server->id);
                                    $overrideEnabled = $enabledMap->get($server->id, true);
                                    if (!$hasOverride) {
                                        $effective = $globalEnabled ? $defaultMbps . ' Mbit/s (default)' : 'Unlimited (global off)';
                                        $badge = 'label-default';
                                    } elseif (!$overrideEnabled || $overrideRate === null) {
                                        $effective = 'Unlimited (override)';
                                        $badge = 'label-warning';
                                    } else {
                                        $effective = $overrideRate . ' Mbit/s (custom)';
                                        $badge = 'label-success';
                                    }
                                @endphp
                                <tr>
                                    <td>
                                        <a href="{{ route('admin.servers.view', $server->id) }}"><strong>{{ $server->name }}</strong></a>
                                    </td>
                                    <td><small class="text-muted">{{ $server->node?->name ?? '—' }}</small></td>
                                    <td><span class="label {{ $badge }}">{{ $effective }}</span></td>
                                    <td>
                                        <form action="{{ route('admin.bandwidth.server', $server->id) }}" method="POST" class="vh-bw-form">
                                            {!! csrf_field() !!}
                                            <div class="input-group input-group-sm">
                                                <select name="mode" class="form-control vh-bw-mode">
                                                    <option value="custom">Custom</option>
                                                    <option value="default">Use default</option>
                                                    <option value="unlimited">Unlimited (remove)</option>
                                                </select>
                                                <input type="number" name="rate_mbps" class="form-control vh-bw-rate" min="1" max="100000" placeholder="Mbit/s" value="{{ $overrideRate ?? $defaultMbps }}">
                                                <span class="input-group-btn">
                                                    <button type="submit" class="btn btn-primary btn-sm">Apply</button>
                                                </span>
                                            </div>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr><td colspan="4" class="text-center text-muted">No servers found.</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                @if($servers instanceof \Illuminate\Contracts\Pagination\Paginator)
                    <div class="box-footer">{!! $servers->render() !!}</div>
                @endif
            </div>
        </div>
    </div>
@endsection

@section('footer-scripts')
    @parent
    <script>
        document.querySelectorAll('.vh-bw-form').forEach(function (form) {
            var mode = form.querySelector('.vh-bw-mode');
            var rate = form.querySelector('.vh-bw-rate');
            function sync() { rate.style.display = mode.value === 'custom' ? '' : 'none'; }
            mode.addEventListener('change', sync);
            sync();
        });
    </script>
@endsection
