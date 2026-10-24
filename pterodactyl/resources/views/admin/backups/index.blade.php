@extends('layouts.admin')

@section('title')
    Automated Backup Manager
@endsection

@section('content-header')
    <div class="vh-page-heading">
        <div>
            <span class="vh-page-eyebrow">Data Retention / Automated Backups</span>
            <h1>Automated Backup Manager</h1>
            <p>Schedule and monitor recurring backups globally across all server clusters from a central control plane.</p>
        </div>
    </div>
@endsection

@section('content')
    <div class="row">
        <div class="col-md-5">
            <div class="box vh-control-card">
                <div class="box-header with-border">
                    <h3 class="box-title"><i data-lucide="archive"></i> Create Backup Policy</h3>
                </div>
                <form action="{{ route('admin.backups.store') }}" method="POST">
                    {!! csrf_field() !!}
                    <div class="box-body">
                        <div class="form-group">
                            <label for="name">Policy Name</label>
                            <input type="text" id="name" name="name" class="form-control" placeholder="e.g. Daily Nightly Snapshots" required>
                        </div>
                        <div class="form-group">
                            <label for="cron_expression">Cron Schedule Expression</label>
                            <input type="text" id="cron_expression" name="cron_expression" class="form-control" value="0 3 * * *" required>
                            <small class="text-muted">Standard 5-field cron syntax (default: <code>0 3 * * *</code> for daily at 03:00 UTC).</small>
                        </div>
                        <div class="form-group">
                            <label for="max_backups">Retention Limit (Max Backups Per Server)</label>
                            <input type="number" id="max_backups" name="max_backups" class="form-control" min="1" max="50" value="7" required>
                        </div>
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="locked" value="1"> Lock backups (Prevent client manual deletion)
                            </label>
                        </div>
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="is_active" value="1" checked> Enable Policy
                            </label>
                        </div>
                    </div>
                    <div class="box-footer">
                        <button type="submit" class="btn btn-primary"><i data-lucide="plus-circle"></i> Save Backup Policy</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="col-md-7">
            <div class="box vh-control-card">
                <div class="box-header with-border">
                    <h3 class="box-title"><i data-lucide="shield"></i> Global Backup Policies</h3>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Policy Name</th>
                                <th>Cron Schedule</th>
                                <th>Retention</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($policies as $policy)
                                <tr>
                                    <td><strong>{{ $policy->name }}</strong></td>
                                    <td><code>{{ $policy->cron_expression }}</code></td>
                                    <td><span class="label label-default">{{ $policy->max_backups }} copies</span></td>
                                    <td>
                                        @if($policy->is_active)
                                            <span class="label label-success">Active</span>
                                        @else
                                            <span class="label label-default">Disabled</span>
                                        @endif
                                    </td>
                                    <td>
                                        <form action="{{ route('admin.backups.delete', $policy->id) }}" method="POST" style="display:inline;">
                                            {!! csrf_field() !!}
                                            {!! method_field('DELETE') !!}
                                            <button type="submit" class="btn btn-xs btn-danger"><i data-lucide="trash-2"></i></button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="text-center text-muted">No global backup policies created.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="box vh-control-card margin-top">
                <div class="box-header with-border">
                    <h3 class="box-title"><i data-lucide="activity"></i> Execution History</h3>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Started At</th>
                                <th>Policy</th>
                                <th>Servers Processed</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($runs as $run)
                                <tr>
                                    <td><small>{{ $run->started_at }}</small></td>
                                    <td>{{ $run->policy_name }}</td>
                                    <td>{{ $run->servers_processed }} servers</td>
                                    <td><span class="label label-success">{{ strtoupper($run->status) }}</span></td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="4" class="text-center text-muted">No policy runs executed yet.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
@endsection
