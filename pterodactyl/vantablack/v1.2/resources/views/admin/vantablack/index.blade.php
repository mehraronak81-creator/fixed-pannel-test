@extends('layouts.vantablack', ['navbar' => 'index', 'sideEditor' => true])

@section('title')
    VantaHost Studio
@endsection

@section('content')
    <div class="control-hero">
        <span class="eyebrow">VANTABLACK CONTROL CENTER</span>
        <h2>Shape your VantaHost experience.</h2>
        <p>One focused workspace for branding, layout, components, and launch-ready panel polish.</p>
        <div class="studio-status">
            <span><i data-lucide="radio"></i> Preview ready</span>
            <span><i data-lucide="layers-3"></i> Current archive: v1.2</span>
        </div>
        <div class="control-hero-grid">
            <a href="{{ route('admin.vantablack.styling') }}" class="quick-link">
                <span>Styling</span>
                <small>Colors and surfaces</small>
            </a>
            <a href="{{ route('admin.vantablack.components') }}" class="quick-link">
                <span>Components</span>
                <small>Dashboard modules</small>
            </a>
            <a href="{{ route('admin.vantablack.layout') }}" class="quick-link">
                <span>Layout</span>
                <small>Navigation and shells</small>
            </a>
            <a href="{{ route('admin.vantablack.meta') }}" class="quick-link">
                <span>Metadata</span>
                <small>SEO and sharing</small>
            </a>
            <a href="{{ route('admin.vantablack.mail') }}" class="quick-link">
                <span>Mail</span>
                <small>Email experience</small>
            </a>
            <a href="{{ route('index') }}" class="quick-link" target="_blank" rel="noopener noreferrer">
                <span>Preview</span>
                <small>Open live dashboard</small>
            </a>
        </div>
    </div>
    <form action="{{ route('admin.vantablack') }}" method="POST">
        <div class="header">
            <p>General settings</p>
            <span class="description-text">Set the VantaHost identity and support destinations used across the panel.</span>
        </div>
        <div class="input-field hr">
            <label for="vantablack:logo">Panel logo</label>
            <input type="text" id="vantablack:logo" name="vantablack:logo" value="{{ old('vantablack:logo', $logo) }}" />
        </div>
        <div class="input-field hr">
            <label for="vantablack:logoHeight">Panel logo height</label>
            <input type="text" id="vantablack:logoHeight" name="vantablack:logoHeight" value="{{ old('vantablack:logoHeight', $logoHeight) }}" />
        </div>
        <div class="input-field hr">
            <label for="vantablack:fullLogo">Logo only</label>
            <select name="vantablack:fullLogo" value="{{ old('vantablack:fullLogo', $fullLogo) }}">
                <option value="false">Disable</option>
                <option value="true" @if(old('vantablack:fullLogo', $fullLogo) == 'true') selected @endif>Enable</option>
            </select>
            <small>Enable or disable the text next to the panel logo.</small>
        </div>
        <div class="input-field hr">
            <label for="vantablack:discord">Discord ID</label>
            <input type="text" id="vantablack:discord" name="vantablack:discord" value="{{ old('vantablack:discord', $discord) }}" />
            <small>Leave empty remove the discord link from your panel</small>
        </div>
        <div class="input-field hr">
            <label for="vantablack:support">Support center</label>
            <input type="text" id="vantablack:support" name="vantablack:support" value="{{ old('vantablack:support', $support) }}" />
            <small>Defaults to the official VantaHost Discord server.</small>
        </div>
        <div class="input-field hr">
            <label for="vantablack:status">Status page</label>
            <input type="text" id="vantablack:status" name="vantablack:status" value="{{ old('vantablack:status', $status) }}" />
            <small>Leave empty to remove the support link from your panel</small>
        </div>
        <div class="input-field hr">
            <label for="vantablack:billing">Billing area</label>
            <input type="text" id="vantablack:billing" name="vantablack:billing" value="{{ old('vantablack:billing', $billing) }}" />
            <small>Leave empty to remove the support link from your panel</small>
        </div>
        <div class="floating-button">
            {!! csrf_field() !!}
            <button type="submit" class="button button-primary">Save changes</button>
        </div>
    </form>
@endsection
