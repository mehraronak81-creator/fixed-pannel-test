@extends('layouts.admin')

@section('title')
    Staff & Sub-Admin Role Manager
@endsection

@section('content-header')
    <div class="vh-page-heading">
        <div>
            <span class="vh-page-eyebrow">Access Control / Granular Permissions</span>
            <h1>Staff & Sub-Admin Role Manager</h1>
            <p>Define custom permission roles for support agents and sub-admins without granting full root administrator privileges.</p>
        </div>
    </div>
@endsection

@section('content')
    <div class="row">
        <div class="col-md-5">
            <div class="box vh-control-card">
                <div class="box-header with-border">
                    <h3 class="box-title"><i data-lucide="shield-plus"></i> Create Sub-Admin Role</h3>
                </div>
                <form action="{{ route('admin.roles.store') }}" method="POST">
                    {!! csrf_field() !!}
                    <div class="box-body">
                        <div class="form-group">
                            <label for="name">Role Name</label>
                            <input type="text" id="name" name="name" class="form-control" placeholder="e.g. Tier 1 Support Agent" required>
                        </div>
                        <div class="form-group">
                            <label for="description">Role Description</label>
                            <input type="text" id="description" name="description" class="form-control" placeholder="e.g. Can view servers and assist users without editing node configurations">
                        </div>
                        <div class="form-group">
                            <label>Assigned Permissions</label>
                            @foreach($availablePermissions as $key => $label)
                                <div class="checkbox">
                                    <label>
                                        <input type="checkbox" name="permissions[]" value="{{ $key }}"> {{ $label }} (<code>{{ $key }}</code>)
                                    </label>
                                </div>
                            @endforeach
                        </div>
                    </div>
                    <div class="box-footer">
                        <button type="submit" class="btn btn-primary"><i data-lucide="plus-circle"></i> Create Staff Role</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="col-md-7">
            <div class="box vh-control-card">
                <div class="box-header with-border">
                    <h3 class="box-title"><i data-lucide="users"></i> Configured Staff Roles</h3>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Role Name</th>
                                <th>Description</th>
                                <th>Permissions</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($roles as $role)
                                <tr>
                                    <td><strong>{{ $role->name }}</strong></td>
                                    <td><small>{{ $role->description }}</small></td>
                                    <td>
                                        @php $perms = json_decode($role->permissions ?? '[]', true); @endphp
                                        @foreach($perms as $p)
                                            <span class="label label-info">{{ $p }}</span>
                                        @endforeach
                                    </td>
                                    <td>
                                        <form action="{{ route('admin.roles.delete', $role->id) }}" method="POST" style="display:inline;">
                                            {!! csrf_field() !!}
                                            {!! method_field('DELETE') !!}
                                            <button type="submit" class="btn btn-xs btn-danger"><i data-lucide="trash-2"></i></button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="4" class="text-center text-muted">No custom sub-admin roles created.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
@endsection
