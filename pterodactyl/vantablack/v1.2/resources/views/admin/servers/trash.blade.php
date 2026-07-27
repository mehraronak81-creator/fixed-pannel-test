@extends('layouts.admin')

@section('title')
    Deleted File Recycle Bin
@endsection

@section('content-header')
    <div class="vh-page-heading">
        <div>
            <span class="vh-page-eyebrow">Server Management / File Recovery</span>
            <h1>File Recycle Bin</h1>
            <p>Recover user deleted files within the 7-day retention window or permanently purge expired items.</p>
        </div>
    </div>
@endsection

@section('content')
    <div class="row">
        <div class="col-xs-12">
            <div class="box vh-control-card">
                <div class="box-header with-border">
                    <h3 class="box-title"><i data-lucide="trash-2"></i> Deleted Items Inspector</h3>
                </div>
                <div class="box-body">
                    <form method="GET" action="{{ route('admin.servers.trash') }}" class="form-inline">
                        <div class="form-group margin-r-5">
                            <select name="server_id" class="form-control">
                                <option value="">Filter by Server (All)...</option>
                                @foreach($servers as $server)
                                    <option value="{{ $server->id }}" {{ (string)$selectedServer === (string)$server->id ? 'selected' : '' }}>{{ $server->name }}</option>
                                @endforeach
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary"><i data-lucide="filter"></i> Filter</button>
                        <a href="{{ route('admin.servers.trash') }}" class="btn btn-default">Reset</a>
                    </form>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Original Path</th>
                                <th>Server</th>
                                <th>Deleted By</th>
                                <th>Size</th>
                                <th>Deleted At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($trashItems as $item)
                                <tr>
                                    <td><code>{{ $item->original_path }}</code></td>
                                    <td><strong>{{ $item->server_name }}</strong></td>
                                    <td>{{ $item->user_name ?? 'System' }}</td>
                                    <td>{{ number_format($item->size_bytes / 1024, 1) }} KB</td>
                                    <td><small>{{ $item->deleted_at }}</small></td>
                                    <td>
                                        <form action="{{ route('admin.servers.trash.restore', $item->id) }}" method="POST" style="display:inline;">
                                            {!! csrf_field() !!}
                                            <button type="submit" class="btn btn-xs btn-success"><i data-lucide="rotate-ccw"></i> Restore</button>
                                        </form>
                                        <form action="{{ route('admin.servers.trash.purge', $item->id) }}" method="POST" style="display:inline;">
                                            {!! csrf_field() !!}
                                            {!! method_field('DELETE') !!}
                                            <button type="submit" class="btn btn-xs btn-danger" onclick="return confirm('Permanently purge this item?')"><i data-lucide="trash"></i> Purge</button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="text-center text-muted">No deleted files in recycle bin.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
@endsection
