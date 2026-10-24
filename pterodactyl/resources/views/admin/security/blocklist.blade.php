@extends('layouts.admin')

@section('title')
    IP & Abuse Blocklist
@endsection

@section('content-header')
    <div class="vh-page-heading">
        <div>
            <span class="vh-page-eyebrow">Security / Abuse Prevention</span>
            <h1>IP & Abuse Blocklist</h1>
            <p>Restrict offending IPv4/IPv6 addresses and CIDR subnets from accessing login endpoints and APIs.</p>
        </div>
    </div>
@endsection

@section('content')
    <div class="row">
        <div class="col-md-4">
            <div class="box vh-control-card">
                <div class="box-header with-border">
                    <h3 class="box-title"><i data-lucide="shield-ban"></i> Block IP / Subnet</h3>
                </div>
                <form action="{{ route('admin.security.blocklist.store') }}" method="POST">
                    {!! csrf_field() !!}
                    <div class="box-body">
                        <div class="form-group">
                            <label for="ip_address">IP Address</label>
                            <input type="text" id="ip_address" name="ip_address" class="form-control" placeholder="e.g. 198.51.100.42">
                        </div>
                        <div class="form-group">
                            <label for="cidr_subnet">CIDR Subnet (Optional)</label>
                            <input type="text" id="cidr_subnet" name="cidr_subnet" class="form-control" placeholder="e.g. 198.51.100.0/24">
                        </div>
                        <div class="form-group">
                            <label for="reason">Block Reason</label>
                            <input type="text" id="reason" name="reason" class="form-control" placeholder="e.g. Credential stuffing, Port scanning, Abuse" required>
                        </div>
                        <div class="form-group">
                            <label for="expires_at">Expiration Date (Leave blank for permanent)</label>
                            <input type="datetime-local" id="expires_at" name="expires_at" class="form-control">
                        </div>
                    </div>
                    <div class="box-footer">
                        <button type="submit" class="btn btn-danger"><i data-lucide="ban"></i> Add to Blocklist</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="col-md-8">
            <div class="box vh-control-card">
                <div class="box-header with-border">
                    <h3 class="box-title"><i data-lucide="list"></i> Active Blocked Entries</h3>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Target IP / Subnet</th>
                                <th>Reason</th>
                                <th>Added By</th>
                                <th>Expires At</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($entries as $entry)
                                <tr>
                                    <td>
                                        <code>{{ $entry->ip_address ?? $entry->cidr_subnet }}</code>
                                    </td>
                                    <td>{{ $entry->reason }}</td>
                                    <td><small>{{ $entry->created_by }}</small></td>
                                    <td><small>{{ $entry->expires_at ?? 'Permanent' }}</small></td>
                                    <td>
                                        <form action="{{ route('admin.security.blocklist.delete', $entry->id) }}" method="POST" style="display:inline;">
                                            {!! csrf_field() !!}
                                            {!! method_field('DELETE') !!}
                                            <button type="submit" class="btn btn-xs btn-success" title="Unblock IP"><i data-lucide="check-circle"></i> Unblock</button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="text-center text-muted">No IP or subnet blocks currently configured.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
@endsection
