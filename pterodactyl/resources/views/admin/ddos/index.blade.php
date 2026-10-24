@extends('layouts.admin')

@section('title')
    DDoS Protection Center
@endsection

@section('content-header')
    <div class="vh-page-heading">
        <div>
            <span class="vh-page-eyebrow">Security / Upstream Mitigation</span>
            <h1>DDoS Protection Center</h1>
            <p>Monitor edge scrubbing status, configure provider API integrations, and review real-time attack anomaly events.</p>
        </div>
        <div class="vh-heading-actions">
            <span class="vh-status-pill is-active"><i data-lucide="shield-check"></i> Edge Active</span>
        </div>
    </div>
@endsection

@section('content')
    <div class="row">
        <div class="col-md-3 col-sm-6 col-xs-12">
            <div class="info-box bg-dark">
                <span class="info-box-icon bg-green"><i data-lucide="shield"></i></span>
                <div class="info-box-content">
                    <span class="info-box-text">Mitigation Engine</span>
                    <span class="info-box-number" style="text-transform: capitalize;">{{ $mitigationMode }}</span>
                </div>
            </div>
        </div>
        <div class="col-md-3 col-sm-6 col-xs-12">
            <div class="info-box bg-dark">
                <span class="info-box-icon bg-blue"><i data-lucide="server"></i></span>
                <div class="info-box-content">
                    <span class="info-box-text">Protected Nodes</span>
                    <span class="info-box-number">{{ count($nodes) }}</span>
                </div>
            </div>
        </div>
        <div class="col-md-3 col-sm-6 col-xs-12">
            <div class="info-box bg-dark">
                <span class="info-box-icon bg-yellow"><i data-lucide="activity"></i></span>
                <div class="info-box-content">
                    <span class="info-box-text">Recent Events</span>
                    <span class="info-box-number">{{ count($events) }}</span>
                </div>
            </div>
        </div>
        <div class="col-md-3 col-sm-6 col-xs-12">
            <div class="info-box bg-dark">
                <span class="info-box-icon bg-purple"><i data-lucide="globe"></i></span>
                <div class="info-box-content">
                    <span class="info-box-text">Scrubbing Provider</span>
                    <span class="info-box-number" style="font-size: 13px;">{{ $providerName }}</span>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-md-6">
            <div class="box vh-control-card">
                <div class="box-header with-border">
                    <h3 class="box-title"><i data-lucide="sliders"></i> Upstream Provider Adapter Settings</h3>
                </div>
                <form action="{{ route('admin.ddos.update') }}" method="POST">
                    {!! csrf_field() !!}
                    <div class="box-body">
                        <div class="form-group">
                            <label for="provider_name">Upstream Provider Name</label>
                            <input type="text" id="provider_name" name="provider_name" class="form-control" value="{{ old('provider_name', $providerName) }}" placeholder="e.g. OVHcloud, Path.net, CosmicGuard, Corero" required>
                        </div>
                        <div class="form-group">
                            <label for="edge_ip">Scrubbing / Edge IP / Subnet</label>
                            <input type="text" id="edge_ip" name="edge_ip" class="form-control" value="{{ old('edge_ip', $edgeIp) }}" placeholder="e.g. 192.0.2.0/24 or scrubbing.provider.com">
                        </div>
                        <div class="form-group">
                            <label for="api_endpoint">Provider API Endpoint</label>
                            <input type="url" id="api_endpoint" name="api_endpoint" class="form-control" value="{{ old('api_endpoint', $apiEndpoint) }}" placeholder="https://api.provider.com/v1/mitigation">
                        </div>
                        <div class="form-group">
                            <label for="api_key">API Key / Token (Encrypted at rest)</label>
                            <input type="password" id="api_key" name="api_key" class="form-control" value="{{ old('api_key', $apiKey) }}" placeholder="Paste provider API authorization key">
                        </div>
                        <div class="form-group">
                            <label for="webhook_secret">Incoming Webhook Secret</label>
                            <input type="text" id="webhook_secret" name="webhook_secret" class="form-control" value="{{ old('webhook_secret', $webhookSecret) }}" placeholder="Secret token for verifying upstream attack webhooks">
                        </div>
                        <div class="form-group">
                            <label for="mitigation_mode">Edge Mitigation Strategy</label>
                            <select id="mitigation_mode" name="mitigation_mode" class="form-control">
                                <option value="auto" {{ $mitigationMode === 'auto' ? 'selected' : '' }}>Automatic (Dynamic scrubbing on anomaly detection)</option>
                                <option value="always_on" {{ $mitigationMode === 'always_on' ? 'selected' : '' }}>Always On (Persistent BGP/DNS rerouting)</option>
                                <option value="disabled" {{ $mitigationMode === 'disabled' ? 'selected' : '' }}>Disabled (Bypass upstream scrubbing)</option>
                            </select>
                        </div>
                    </div>
                    <div class="box-footer">
                        <button type="submit" class="btn btn-primary"><i data-lucide="save"></i> Save Provider Configuration</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="col-md-6">
            <div class="box vh-control-card">
                <div class="box-header with-border">
                    <h3 class="box-title"><i data-lucide="server"></i> Node Protection Status</h3>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Node</th>
                                <th>Location</th>
                                <th>Servers</th>
                                <th>Edge Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($nodes as $node)
                                <tr>
                                    <td><strong><a href="{{ route('admin.nodes.view', $node->id) }}">{{ $node->name }}</a></strong><br><small class="text-muted">{{ $node->fqdn }}</small></td>
                                    <td>{{ $node->location?->short ?? 'Global' }}</td>
                                    <td><span class="label label-default">{{ $node->servers_count }}</span></td>
                                    <td>
                                        <span class="label label-success"><i data-lucide="shield-check"></i> Protected</span>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="4" class="text-center text-muted">No nodes registered.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-xs-12">
            <div class="box vh-control-card">
                <div class="box-header with-border">
                    <h3 class="box-title"><i data-lucide="list-tree"></i> Live Attack & Mitigation Log</h3>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Node / Target</th>
                                <th>Attack Vector</th>
                                <th>Peak Traffic</th>
                                <th>Status</th>
                                <th>Detected At</th>
                                <th>Resolved At</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($events as $event)
                                <tr>
                                    <td>#{{ $event->id }}</td>
                                    <td>Node #{{ $event->node_id }}</td>
                                    <td><code>{{ $event->attack_type }}</code></td>
                                    <td><strong>{{ $event->peak_gbps }} Gbps</strong> / {{ number_format($event->peak_pps) }} PPS</td>
                                    <td>
                                        @if($event->status === 'mitigating')
                                            <span class="label label-warning">Mitigating</span>
                                        @else
                                            <span class="label label-success">Resolved</span>
                                        @endif
                                    </td>
                                    <td>{{ $event->detected_at }}</td>
                                    <td>{{ $event->resolved_at ?? 'Ongoing' }}</td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="7" class="text-center text-muted">No attack events recorded. Upstream edge is quiet.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
@endsection
