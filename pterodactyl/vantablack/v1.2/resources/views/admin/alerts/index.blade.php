@extends('layouts.admin')

@section('title')
    Resource Usage Alerts
@endsection

@section('content-header')
    <div class="vh-page-heading">
        <div>
            <span class="vh-page-eyebrow">Monitoring / Alerts</span>
            <h1>Resource Usage Alerts</h1>
            <p>Set threshold notifications for CPU, RAM, and Disk exhaustion across client servers.</p>
        </div>
    </div>
@endsection

@section('content')
    <div class="row">
        <div class="col-md-5">
            <div class="box vh-control-card">
                <div class="box-header with-border">
                    <h3 class="box-title"><i data-lucide="bell"></i> Add Alert Rule</h3>
                </div>
                <form action="{{ route('admin.alerts.store') }}" method="POST">
                    {!! csrf_field() !!}
                    <div class="box-body">
                        <div class="form-group">
                            <label for="server_id">Target Server</label>
                            <select id="server_id" name="server_id" class="form-control" required>
                                <option value="">Select a server...</option>
                                @foreach($servers as $server)
                                    <option value="{{ $server->id }}">{{ $server->name }} ({{ $server->uuidShort }})</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="metric">Monitored Metric</label>
                            <select id="metric" name="metric" class="form-control" required>
                                <option value="cpu">CPU Usage (%)</option>
                                <option value="memory">RAM / Memory Usage (%)</option>
                                <option value="disk">Disk Storage Usage (%)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="threshold_percent">Alert Threshold (%)</label>
                            <input type="number" id="threshold_percent" name="threshold_percent" class="form-control" min="50" max="100" value="90" required>
                        </div>
                        <div class="form-group">
                            <label for="cooldown_minutes">Notification Cooldown (Minutes)</label>
                            <input type="number" id="cooldown_minutes" name="cooldown_minutes" class="form-control" min="5" max="1440" value="30" required>
                        </div>
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="notify_email" value="1" checked> Send Email Notification
                            </label>
                        </div>
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="notify_panel" value="1" checked> Show Panel Alert Banner
                            </label>
                        </div>
                    </div>
                    <div class="box-footer">
                        <button type="submit" class="btn btn-primary"><i data-lucide="plus-circle"></i> Create Alert Rule</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="col-md-7">
            <div class="box vh-control-card">
                <div class="box-header with-border">
                    <h3 class="box-title"><i data-lucide="sliders"></i> Configured Alert Rules</h3>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Server</th>
                                <th>Metric</th>
                                <th>Threshold</th>
                                <th>Cooldown</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($rules as $rule)
                                <tr>
                                    <td><strong>{{ $rule->server_name }}</strong></td>
                                    <td><code>{{ strtoupper($rule->metric) }}</code></td>
                                    <td><span class="label label-warning">&ge; {{ $rule->threshold_percent }}%</span></td>
                                    <td>{{ $rule->cooldown_minutes }} mins</td>
                                    <td>
                                        <form action="{{ route('admin.alerts.delete', $rule->id) }}" method="POST" style="display:inline;">
                                            {!! csrf_field() !!}
                                            {!! method_field('DELETE') !!}
                                            <button type="submit" class="btn btn-xs btn-danger"><i data-lucide="trash-2"></i></button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="text-center text-muted">No resource alert rules configured yet.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="box vh-control-card margin-top">
                <div class="box-header with-border">
                    <h3 class="box-title"><i data-lucide="alert-circle"></i> Triggered Alert History</h3>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Triggered At</th>
                                <th>Server</th>
                                <th>Value Recorded</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($events as $event)
                                <tr>
                                    <td><small>{{ $event->triggered_at }}</small></td>
                                    <td>{{ $event->server_name }}</td>
                                    <td><span class="label label-danger">{{ $event->value_recorded }}%</span></td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="3" class="text-center text-muted">No recent alert events. All systems operating within thresholds.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
@endsection
