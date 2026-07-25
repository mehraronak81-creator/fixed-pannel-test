@extends('layouts.vantablack', ['navbar' => 'styling', 'sideEditor' => false])

@section('title')
    Vantablack Styling
@endsection

@section('content')

    <form action="{{ route('admin.vantablack.styling') }}" method="POST">
        <div class="content-box">
            <div class="header">
                <p>Styling settings</p>
                <span class="description-text">Customize the general appears of Vantablack Theme.</span>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Page titles</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Enable or disable page titles</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="vantablack:pageTitle" value="{{ old('vantablack:pageTitle', $pageTitle) }}">
                            <option value="false">Disable</option>
                            <option value="true" @if(old('vantablack:pageTitle', $pageTitle) == 'true') selected @endif>Enable</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Flash message</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Choose between different flash message styles</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field input-options" style="display:flex;column-gap:5px">
                        <div style="width:100%;">
                            <input type="radio" name="vantablack:flashMessage" value="1" id="flashMessage-1" {{ $flashMessage == 1 ? "checked" : "" }}>
                            <label for="flashMessage-1">
                                Alert at right top corner
                            </label>
                        </div>
                        <div style="width:100%;">
                            <input type="radio" name="vantablack:flashMessage" value="2" id="flashMessage-2" {{ $flashMessage == 2 ? "checked" : "" }}>
                            <label for="flashMessage-2">
                                Alert at bottom center
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Background image</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Leave value empty to disable it</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="vantablack:backgroundImage" value="{{ old('vantablack:backgroundImage', $backgroundImage) }}" />
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Background image light mode</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Leave value empty to disable it</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="vantablack:backgroundImageLight" value="{{ old('vantablack:backgroundImageLight', $backgroundImageLight) }}" />
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Login background image</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Leave value empty to disable it</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="vantablack:loginBackground" value="{{ old('vantablack:loginBackground', $loginBackground) }}" />
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Login overlay gradient</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Enable or disable a static gradient.</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="vantablack:loginGradient" value="{{ old('vantablack:loginGradient', $loginGradient) }}">
                            <option value="false">Disable</option>
                            <option value="true" @if(old('vantablack:logoPosition', $loginGradient) == 'true') selected @endif>Enable</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Backdrop blur</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Enable or disable backdrop blur</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="vantablack:backdrop" value="{{ old('vantablack:backdrop', $backdrop) }}">
                            <option value="false">Disable</option>
                            <option value="true" @if(old('vantablack:backdrop', $backdrop) == 'true') selected @endif>Enable</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Components opacity</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Change the components opacity.</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="vantablack:backdropPercentage" value="{{ old('vantablack:backdropPercentage', $backdropPercentage) }}" />
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Default color mode</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Change the default color mode</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="vantablack:defaultMode" value="{{ old('vantablack:defaultMode', $defaultMode) }}">
                            <option value="lightmode">Lightmode</option>
                            <option value="darkmode" @if(old('vantablack:defaultMode', $defaultMode) == 'darkmode') selected @endif>Darkmode</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Input/Button border radius</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Change the input/button border radius.</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="vantablack:radiusInput" value="{{ old('vantablack:radiusInput', $radiusInput) }}" />
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Box border radius</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Change the box border radius.</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="vantablack:radiusBox" value="{{ old('vantablack:radiusBox', $radiusBox) }}" />
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Input border</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Enable or disable input border</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="vantablack:borderInput" value="{{ old('vantablack:borderInput', $borderInput) }}">
                            <option value="false">Disable</option>
                            <option value="true" @if(old('vantablack:borderInput', $borderInput) == 'true') selected @endif>Enable</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="padding-top:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Copyright text</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">For styling use BBCode format.</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="vantablack:copyright" value="{{ old('vantablack:copyright', $copyright) }}" />
                    </div>
                </div>
            </div>
        </div>
        <div class="floating-button-2">
            {!! csrf_field() !!}
            <button type="submit" class="button button-primary">Save changes</button>
        </div>
    </form>
@endsection