@extends('layouts.vantablack', ['navbar' => 'meta', 'sideEditor' => true])

@section('title')
    Vantablack Meta data
@endsection

@section('content')

    <form action="{{ route('admin.vantablack.meta') }}" method="POST">
        <div class="header">
            <p>Meta Data settings</p>
            <span class="description-text">Change the meta data settings of Vantablack Theme.</span>
        </div>
        <div class="input-field hr">
            <label for="vantablack:meta_favicon">Favicon</label>
            <input type="text" id="vantablack:meta_favicon" name="vantablack:meta_favicon" value="{{ old('vantablack:meta_favicon', $meta_favicon) }}" />
        </div>
        <div class="input-field hr">
            <label for="vantablack:meta_title">Meta title</label>
            <input type="text" id="vantablack:meta_title" name="vantablack:meta_title" value="{{ old('vantablack:meta_title', $meta_title) }}" />
        </div>
        <div class="input-field hr">
            <label for="vantablack:meta_image">Meta image</label>
            <input type="text" id="vantablack:meta_image" name="vantablack:meta_image" value="{{ old('vantablack:meta_image', $meta_image) }}" />
        </div>
        <div class="input-field">
            <label for="vantablack:meta_description">Meta description</label>
            <textarea type="text" id="vantablack:meta_description" name="vantablack:meta_description" width="100%" rows="5">{{ old('vantablack:meta_description', $meta_description) }}</textarea>
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