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
            <span><i data-lucide="shield-check"></i> All systems nominal</span>
        </div>
        <div class="control-hero-grid">
            <a href="{{ route('admin.vantablack.styling') }}" class="quick-link">
                <span><i data-lucide="sparkles" style="width:14px;display:inline;vertical-align:middle;margin-right:4px;color:var(--primary);"></i> Styling</span>
                <small>Colors and surfaces</small>
            </a>
            <a href="{{ route('admin.vantablack.components') }}" class="quick-link">
                <span><i data-lucide="layout-grid" style="width:14px;display:inline;vertical-align:middle;margin-right:4px;color:var(--primary);"></i> Components</span>
                <small>Dashboard modules</small>
            </a>
            <a href="{{ route('admin.vantablack.layout') }}" class="quick-link">
                <span><i data-lucide="layout" style="width:14px;display:inline;vertical-align:middle;margin-right:4px;color:var(--primary);"></i> Layout</span>
                <small>Navigation and shells</small>
            </a>
            <a href="{{ route('admin.vantablack.meta') }}" class="quick-link">
                <span><i data-lucide="tags" style="width:14px;display:inline;vertical-align:middle;margin-right:4px;color:var(--primary);"></i> Metadata</span>
                <small>SEO and sharing</small>
            </a>
            <a href="{{ route('admin.vantablack.colors') }}" class="quick-link">
                <span><i data-lucide="palette" style="width:14px;display:inline;vertical-align:middle;margin-right:4px;color:var(--primary);"></i> Colors</span>
                <small>Theme palette</small>
            </a>
            <a href="{{ route('admin.vantablack.mail') }}" class="quick-link">
                <span><i data-lucide="mailbox" style="width:14px;display:inline;vertical-align:middle;margin-right:4px;color:var(--primary);"></i> Mail</span>
                <small>Email experience</small>
            </a>
            <a href="{{ route('admin.vantablack.announcement') }}" class="quick-link">
                <span><i data-lucide="megaphone" style="width:14px;display:inline;vertical-align:middle;margin-right:4px;color:var(--primary);"></i> Announcements</span>
                <small>Banners and alerts</small>
            </a>
            <a href="{{ route('index') }}" class="quick-link" target="_blank" rel="noopener noreferrer">
                <span><i data-lucide="external-link" style="width:14px;display:inline;vertical-align:middle;margin-right:4px;color:var(--primary);"></i> Preview</span>
                <small>Open live dashboard</small>
            </a>
            <a href="{{ route('admin.vantablack.advanced') }}" class="quick-link">
                <span><i data-lucide="sliders-horizontal" style="width:14px;display:inline;vertical-align:middle;margin-right:4px;color:var(--primary);"></i> Advanced</span>
                <small>Profile and panel behavior</small>
            </a>
            <a href="{{ route('admin.settings') }}" class="quick-link">
                <span><i data-lucide="shield-cog" style="width:14px;display:inline;vertical-align:middle;margin-right:4px;color:var(--primary);"></i> Panel admin</span>
                <small>Open core panel settings</small>
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
            <small>Enter the URL of your panel logo image. Recommended size: 32x32px or larger.</small>
        </div>
        <div class="input-field hr">
            <label for="vantablack:logoHeight">Panel logo height</label>
            <input type="text" id="vantablack:logoHeight" name="vantablack:logoHeight" value="{{ old('vantablack:logoHeight', $logoHeight) }}" />
            <small>CSS value for logo height (e.g., 32px, 2rem).</small>
        </div>
        <div class="input-field hr">
            <label for="vantablack:fullLogo">Logo only</label>
            <select name="vantablack:fullLogo" value="{{ old('vantablack:fullLogo', $fullLogo) }}">
                <option value="false">Disable</option>
                <option value="true" @if(old('vantablack:fullLogo', $fullLogo) == 'true') selected @endif>Enable</option>
            </select>
            <small>Enable to hide the text next to the panel logo, showing only the logo image.</small>
        </div>
        <div class="input-field hr">
            <label for="vantablack:discord">Discord server ID</label>
            <input type="text" id="vantablack:discord" name="vantablack:discord" value="{{ old('vantablack:discord', $discord) }}" />
            <small>Your Discord server ID for the widget integration. Leave empty to remove Discord from the panel.</small>
        </div>
        <div class="input-field hr">
            <label for="vantablack:support">Support center URL</label>
            <input type="text" id="vantablack:support" name="vantablack:support" value="{{ old('vantablack:support', $support) }}" />
            <small>Link to your helpdesk, ticket system, or support Discord. Defaults to the official VantaHost Discord.</small>
        </div>
        <div class="input-field hr">
            <label for="vantablack:status">Status page URL</label>
            <input type="text" id="vantablack:status" name="vantablack:status" value="{{ old('vantablack:status', $status) }}" />
            <small>Link to your UptimeRobot, Instatus, or Betterstack status page. Leave empty to hide.</small>
        </div>
        <div class="input-field hr">
            <label for="vantablack:billing">Billing area URL</label>
            <input type="text" id="vantablack:billing" name="vantablack:billing" value="{{ old('vantablack:billing', $billing) }}" />
            <small>Link to your WHMCS, Blesta, or Stripe billing portal. Leave empty to hide.</small>
        </div>
        <div class="floating-button">
            {!! csrf_field() !!}
            <button type="submit" class="button button-primary">Save changes</button>
        </div>
    </form>
@endsection
