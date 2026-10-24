@extends('layouts.admin')

@section('title')
    Audit & Activity Logs
@endsection

@section('content-header')
    <div class="vh-page-heading">
        <div>
            <span class="vh-page-eyebrow">Security / Accountability</span>
            <h1>Audit & Activity Logs</h1>
            <p>Track administrator actions, server modifications, authentication attempts, and system events.</p>
        </div>
    </div>
@endsection

@section('content')
    <div class="row">
        <div class="col-xs-12">
            <div class="box vh-control-card">
                <div class="box-header with-border">
                    <h3 class="box-title"><i data-lucide="filter"></i> Filter Activity Logs</h3>
                </div>
                <div class="box-body">
                    <form method="GET" action="{{ route('admin.activity') }}" class="form-inline">
                        <div class="form-group margin-r-5">
                            <input type="text" name="actor" class="form-control" placeholder="User or email..." value="{{ $filters['actor'] }}">
                        </div>
                        <div class="form-group margin-r-5">
                            <input type="text" name="event" class="form-control" placeholder="Event (e.g. server:create)..." value="{{ $filters['event'] }}">
                        </div>
                        <div class="form-group margin-r-5">
                            <input type="text" name="ip" class="form-control" placeholder="IP address..." value="{{ $filters['ip'] }}">
                        </div>
                        <button type="submit" class="btn btn-primary"><i data-lucide="search"></i> Search</button>
                        <a href="{{ route('admin.activity') }}" class="btn btn-default">Reset</a>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-xs-12">
            <div class="box vh-control-card">
                <div class="box-header with-border">
                    <h3 class="box-title"><i data-lucide="list"></i> Log Trajectory</h3>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Actor</th>
                                <th>Event</th>
                                <th>IP Address</th>
                                <th>Properties</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($logs as $log)
                                <tr>
                                    <td><small class="text-muted">{{ $log->timestamp }}</small></td>
                                    <td>
                                        @if($log->actor)
                                            <strong>{{ $log->actor->username }}</strong><br><small class="text-muted">{{ $log->actor->email }}</small>
                                        @else
                                            <span class="label label-default">System / Daemon</span>
                                        @endif
                                    </td>
                                    <td><code>{{ $log->event }}</code></td>
                                    <td><small>{{ $log->ip }}</small></td>
                                    <td>
                                        @if(!empty($log->properties))
                                            <small class="text-muted" style="font-family: monospace;">{{ json_encode($log->properties) }}</small>
                                        @else
                                            <span class="text-muted">-</span>
                                        @endif
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="text-center text-muted">No activity logs found matching the selected criteria.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                @if($logs->hasPages())
                    <div class="box-footer">
                        {!! $logs->render() !!}
                    </div>
                @endif
            </div>
        </div>
    </div>
@endsection
