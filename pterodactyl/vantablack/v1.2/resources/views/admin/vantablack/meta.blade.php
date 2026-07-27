@extends('layouts.vantablack', ['navbar' => 'meta', 'sideEditor' => true])

@section('title')
    VantaHost Metadata
@endsection

@section('content')

    <form action="{{ route('admin.vantablack.meta') }}" method="POST">
        <div class="header">
            <p>SEO and sharing</p>
            <span class="description-text">Control search previews, social sharing cards, favicons, and crawler visibility.</span>
        </div>
        <div class="input-field hr">
            <label for="vantablack:meta_site_name">Site name</label>
            <input type="text" maxlength="70" id="vantablack:meta_site_name" name="vantablack:meta_site_name" value="{{ old('vantablack:meta_site_name', $meta_site_name) }}" />
            <small>Brand name used by Open Graph previews.</small>
        </div>
        <div class="input-field hr">
            <label for="vantablack:meta_favicon">Favicon</label>
            <input type="text" id="vantablack:meta_favicon" name="vantablack:meta_favicon" value="{{ old('vantablack:meta_favicon', $meta_favicon) }}" />
        </div>
        <div class="input-field hr">
            <label for="vantablack:meta_title">Meta title</label>
            <input type="text" maxlength="70" id="vantablack:meta_title" name="vantablack:meta_title" value="{{ old('vantablack:meta_title', $meta_title) }}" />
        </div>
        <div class="input-field hr">
            <label for="vantablack:meta_image">Meta image</label>
            <input type="text" id="vantablack:meta_image" name="vantablack:meta_image" value="{{ old('vantablack:meta_image', $meta_image) }}" />
        </div>
        <div class="input-field">
            <label for="vantablack:meta_description">Meta description</label>
            <textarea maxlength="180" id="vantablack:meta_description" name="vantablack:meta_description" rows="5">{{ old('vantablack:meta_description', $meta_description) }}</textarea>
        </div>
        <div class="input-field hr">
            <label for="vantablack:meta_canonical">Canonical URL</label>
            <input type="text" maxlength="2048" id="vantablack:meta_canonical" name="vantablack:meta_canonical" value="{{ old('vantablack:meta_canonical', $meta_canonical) }}" placeholder="{{ config('app.url') }}" />
            <small>Leave blank to use APP_URL.</small>
        </div>
        <div class="input-field hr">
            <label for="vantablack:meta_robots">Search engine visibility</label>
            <select id="vantablack:meta_robots" name="vantablack:meta_robots">
                <option value="index,follow" @if(old('vantablack:meta_robots', $meta_robots) === 'index,follow') selected @endif>Index pages and follow links</option>
                <option value="noindex,follow" @if(old('vantablack:meta_robots', $meta_robots) === 'noindex,follow') selected @endif>Do not index pages</option>
                <option value="noindex,nofollow" @if(old('vantablack:meta_robots', $meta_robots) === 'noindex,nofollow') selected @endif>Private panel</option>
            </select>
        </div>
        <div class="input-field hr">
            <label for="vantablack:meta_color">Meta color</label>
            <input type="color" id="vantablack:meta_color" name="vantablack:meta_color" value="{{ old('vantablack:meta_color', $meta_color) }}" />
        </div>
        <div class="floating-button">
            {!! csrf_field() !!}
            <button type="submit" class="button button-primary">Save changes</button>
        </div>
    </form>
@endsection
