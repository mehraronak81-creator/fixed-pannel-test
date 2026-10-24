@extends('layouts.vantablack', ['navbar' => 'layout', 'sideEditor' => true])

@section('title')
    Vantablack Layout
@endsection

@section('content')

    <form action="{{ route('admin.vantablack.layout') }}" method="POST">
        <div class="header">
            <p>General layout settings</p>
            <span class="description-text">Change the general layout settings of Vantablack Theme.</span>
        </div>
        <div class="input-field input-options hr">
            <span>Layout</span>
            <div>
                <input type="radio" name="vantablack:layout" value="1" id="layout-1" {{ $layout == 1 ? "checked" : "" }}>
                <label for="layout-1">
                    <img src="/vantablack/layout-1.svg" />
                </label>
            </div>
            <div>
                <input type="radio" name="vantablack:layout" value="2" id="layout-2" {{ $layout == 2 ? "checked" : "" }}>
                <label for="layout-2">
                    <img src="/vantablack/layout-2.svg" />
                </label>
            </div>
            <div>
                <input type="radio" name="vantablack:layout" value="3" id="layout-3" {{ $layout == 3 ? "checked" : "" }}>
                <label for="layout-3">
                    <img src="/vantablack/layout-3.svg" />
                </label>
            </div>
            <div>
                <input type="radio" name="vantablack:layout" value="4" id="layout-4" {{ $layout == 4 ? "checked" : "" }}>
                <label for="layout-4">
                    <img src="/vantablack/layout-4.svg" />
                </label>
            </div>
        </div>
        <div class="input-field">
            <label for="vantablack:logoPosition">Search or select bar</label>
            <select name="vantablack:searchComponent" value="{{ old('vantablack:searchComponent', $searchComponent) }}">
                <option value="1">Server select bar</option>
                <option value="2" @if(old('vantablack:searchComponent', $searchComponent) == '2') selected @endif>Searchbar</option>
            </select>
            <small>Where do you want the logo on the login screen.</small>
        </div>
        <div class="header">
            <p>Login layout settings</p>
            <span class="description-text">Change the layout settings of the auth pages of Vantablack Theme.</span>
        </div>
        <div class="input-field input-options hr">
            <span>Login screen layout</span>
            <div>
                <input type="radio" name="vantablack:loginLayout" value="1" id="loginLayout-1" {{ $loginLayout == 1 ? "checked" : "" }}>
                <label for="loginLayout-1">
                    <img src="/vantablack/loginLayout-1.svg" />
                </label>
            </div>
            <div>
                <input type="radio" name="vantablack:loginLayout" value="2" id="loginLayout-2" {{ $loginLayout == 2 ? "checked" : "" }}>
                <label for="loginLayout-2">
                    <img src="/vantablack/loginLayout-2.svg" />
                </label>
            </div>
            <div>
                <input type="radio" name="vantablack:loginLayout" value="3" id="loginLayout-3" {{ $loginLayout == 3 ? "checked" : "" }}>
                <label for="loginLayout-3">
                    <img src="/vantablack/loginLayout-3.svg" />
                </label>
            </div>
        </div>
        <div class="input-field hr">
            <label for="vantablack:socialPosition">Login social position</label>
            <select name="vantablack:socialPosition" value="{{ old('vantablack:socialPosition', $socialPosition) }}">
                <option value="1">Above form</option>
                <option value="2" @if(old('vantablack:socialPosition', $socialPosition) == '2') selected @endif>Under form</option>
            </select>
            <small>Where do you want the social buttons on the login screen.</small>
        </div>
        <div class="input-field">
            <label for="vantablack:logoPosition">Login logo position</label>
            <select name="vantablack:logoPosition" value="{{ old('vantablack:logoPosition', $logoPosition) }}">
                <option value="1">Above form</option>
                <option value="2" @if(old('vantablack:logoPosition', $logoPosition) == '2') selected @endif>Top corner</option>
            </select>
            <small>Where do you want the logo on the login screen.</small>
        </div>
        <div class="floating-button">
            {!! csrf_field() !!}
            <button type="submit" class="button button-primary">Save changes</button>
        </div>
    </form>
@endsection