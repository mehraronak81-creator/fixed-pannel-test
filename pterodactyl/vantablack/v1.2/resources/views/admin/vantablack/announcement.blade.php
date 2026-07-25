@extends('layouts.vantablack', ['navbar' => 'announcement', 'sideEditor' => true])

@section('title')
    Vantablack Announcements
@endsection

@section('content')

    <form action="{{ route('admin.vantablack.announcement') }}" method="POST">
        <div class="header">
            <p>Announcement settings</p>
            <span class="description-text">Change the announcement settings of Vantablack Theme.</span>
        </div>
        <div class="input-field">
            <label for="vantablack:announcementType">Select announcement type</label>
            <select name="vantablack:announcementType" value="{{ old('vantablack:announcementType', $announcementType) }}">
                @if(old('vantablack:announcementType', $announcementType) == 'party') <option value="party">Party</option> @endif
                <option value="disabled">Disabled</option>
                <option value="update" @if(old('vantablack:announcementType', $announcementType) == 'update') selected @endif>Update</option>
                <option value="info" @if(old('vantablack:announcementType', $announcementType) == 'info') selected @endif>Info</option>
                <option value="success" @if(old('vantablack:announcementType', $announcementType) == 'success') selected @endif>Success</option>
                <option value="alert" @if(old('vantablack:announcementType', $announcementType) == 'alert') selected @endif>Alert</option>
                <option value="warning" @if(old('vantablack:announcementType', $announcementType) == 'warning') selected @endif>Warning</option>
            </select>
            <small>Set announcement type disabled to disable announcements.</small>
        </div>
        <div class="input-field">
            <label for="vantablack:announcementCloseable">Closable announcement</label>
            <select name="vantablack:announcementCloseable" value="{{ old('vantablack:announcementCloseable', $announcementCloseable) }}">
                <option value="true">Enable</option>
                <option value="false" @if(old('vantablack:announcementCloseable', $announcementCloseable) == 'false') selected @endif>Disable</option>
            </select>
        </div>
        <div class="input-field">
            <label for="vantablack:announcementMessage">Announcement message</label>
            <textarea type="text" id="vantablack:announcementMessage" name="vantablack:announcementMessage" width="100%" rows="5">{{ old('vantablack:announcementMessage', $announcementMessage) }}</textarea>
            <small>For styling use BBCode format.</small>
        </div>
        <div class="floating-button">
            {!! csrf_field() !!}
            <button type="submit" class="button button-primary">Save changes</button>
        </div>
    </form>
@endsection