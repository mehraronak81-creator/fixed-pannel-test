@extends('layouts.admin')

@section('title')
    Broadcast Banners & Announcements
@endsection

@section('content-header')
    <div class="vh-page-heading">
        <div>
            <span class="vh-page-eyebrow">Communication / Site Broadcasts</span>
            <h1>Broadcast Banners & Announcements</h1>
            <p>Post site-wide or node-specific banner notifications for maintenance window alerts, outages, and updates.</p>
        </div>
    </div>
@endsection

@section('content')
    <div class="row">
        <div class="col-md-5">
            <div class="box vh-control-card">
                <div class="box-header with-border">
                    <h3 class="box-title"><i data-lucide="megaphone"></i> Post New Announcement</h3>
                </div>
                <form action="{{ route('admin.announcements.store') }}" method="POST">
                    {!! csrf_field() !!}
                    <div class="box-body">
                        <div class="form-group">
                            <label for="title">Title</label>
                            <input type="text" id="title" name="title" class="form-control" placeholder="e.g. Scheduled Node Maintenance" required>
                        </div>
                        <div class="form-group">
                            <label for="type">Banner Style / Type</label>
                            <select id="type" name="type" class="form-control">
                                <option value="info">Info (Blue)</option>
                                <option value="warning">Warning (Yellow)</option>
                                <option value="danger">Critical / Danger (Red)</option>
                                <option value="success">Success (Green)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="node_id">Target Node (Optional)</label>
                            <select id="node_id" name="node_id" class="form-control">
                                <option value="">Global (All users across panel)</option>
                                @foreach($nodes as $node)
                                    <option value="{{ $node->id }}">Node: {{ $node->name }} ({{ $node->fqdn }})</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="content">Announcement Message</label>
                            <textarea id="content" name="content" class="form-control" rows="4" placeholder="Message content shown in the banner..." required></textarea>
                        </div>
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="is_dismissible" value="1" checked> User can dismiss banner
                            </label>
                        </div>
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="is_active" value="1" checked> Publish immediately (Active)
                            </label>
                        </div>
                    </div>
                    <div class="box-footer">
                        <button type="submit" class="btn btn-primary"><i data-lucide="send"></i> Post Announcement</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="col-md-7">
            <div class="box vh-control-card">
                <div class="box-header with-border">
                    <h3 class="box-title"><i data-lucide="list"></i> Active & Past Announcements</h3>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Banner</th>
                                <th>Target</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($announcements as $item)
                                <tr>
                                    <td>
                                        <strong class="text-{{ $item->type }}">{{ $item->title }}</strong>
                                        <br><small class="text-muted">{{ Str::limit($item->content, 80) }}</small>
                                    </td>
                                    <td>
                                        @if($item->node_id)
                                            <span class="label label-info">Node #{{ $item->node_id }}</span>
                                        @else
                                            <span class="label label-default">Global</span>
                                        @endif
                                    </td>
                                    <td>
                                        @if($item->is_active)
                                            <span class="label label-success">Active</span>
                                        @else
                                            <span class="label label-default">Inactive</span>
                                        @endif
                                    </td>
                                    <td><small>{{ $item->created_at }}</small></td>
                                    <td>
                                        <form action="{{ route('admin.announcements.delete', $item->id) }}" method="POST" style="display:inline;">
                                            {!! csrf_field() !!}
                                            {!! method_field('DELETE') !!}
                                            <button type="submit" class="btn btn-xs btn-danger" onclick="return confirm('Delete this announcement?')"><i data-lucide="trash-2"></i></button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="text-center text-muted">No announcements posted yet.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
@endsection
