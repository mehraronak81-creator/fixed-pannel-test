@extends('layouts.vantablack', ['navbar' => 'advanced', 'sideEditor' => false])

@section('title')
    Vantablack Advanced
@endsection

@section('content')
    <form action="{{ route('admin.vantablack.advanced') }}" method="POST">
        <div class="content-box">
            <div class="header">
                <p>Advanced settings</p>
                <span class="description-text">Change Vantablack advanced settings.</span>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Profile type</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Choose profile picture type</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="vantablack:profileType" value="{{ old('vantablack:profileType', $profileType) }}">
                            <option value="boring">Boring Avatars</option>
                            <option value="avataaars" @if(old('vantablack:profileType', $profileType) == 'avataaars') selected @endif>Avataaars Neutral</option>
                            <option value="bottts" @if(old('vantablack:profileType', $profileType) == 'bottts') selected @endif>Bottts Neutral</option>
                            <option value="identicon" @if(old('vantablack:profileType', $profileType) == 'identicon') selected @endif>Identicon</option>
                            <option value="initials" @if(old('vantablack:profileType', $profileType) == 'initials') selected @endif>Initials</option>
                            <option value="gravatar" @if(old('vantablack:profileType', $profileType) == 'gravatar') selected @endif>Gravatar</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">IP Flag</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Show flags with your IP</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="vantablack:ipFlag" value="{{ old('vantablack:ipFlag', $ipFlag) }}">
                            <option value="false">Disable</option>
                            <option value="true" @if(old('vantablack:ipFlag', $ipFlag) == 'true') selected @endif>Enable</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Low Resources Alert</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Enable or disable low resources alert</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="vantablack:lowResourcesAlert" value="{{ old('vantablack:lowResourcesAlert', $lowResourcesAlert) }}">
                            <option value="false">Disable</option>
                            <option value="true" @if(old('vantablack:lowResourcesAlert', $lowResourcesAlert) == 'true') selected @endif>Enable</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Mode toggler</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Enable or disable mode toggler</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="vantablack:modeToggler" value="{{ old('vantablack:modeToggler', $modeToggler) }}">
                            <option value="false">Disable</option>
                            <option value="true" @if(old('vantablack:modeToggler', $modeToggler) == 'true') selected @endif>Enable</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="padding-top:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Language switcher</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Enable or disable language switcher</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="vantablack:langSwitch" value="{{ old('vantablack:langSwitch', $langSwitch) }}">
                            <option value="false">Disable</option>
                            <option value="true" @if(old('vantablack:langSwitch', $langSwitch) == 'true') selected @endif>Enable</option>
                        </select>
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