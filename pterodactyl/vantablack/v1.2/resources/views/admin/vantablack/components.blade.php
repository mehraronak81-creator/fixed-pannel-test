@extends('layouts.vantablack', ['navbar' => 'components', 'sideEditor' => false])

@section('title')
    Vantablack Layout
@endsection

@section('content')

    <form action="{{ route('admin.vantablack.components') }}" method="POST">
        <div class="content-box">
            <div class="header">
                <p>Components dashboard</p>
                <span class="description-text">Manage all components of the server list page.</span>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Server row style</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Choose between different server row styles</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field input-options input-rows">
                        <div>
                            <input type="radio" name="vantablack:serverRow" value="1" id="serverRow-1" {{ $serverRow == 1 ? "checked" : "" }}>
                            <label for="serverRow-1">
                                <img src="/vantablack/ServerRow-1.svg" />
                            </label>
                        </div>
                        <div>
                            <input type="radio" name="vantablack:serverRow" value="2" id="serverRow-2" {{ $serverRow == 2 ? "checked" : "" }}>
                            <label for="serverRow-2">
                                <img src="/vantablack/ServerRow-2.svg" />
                            </label>
                        </div>
                        <div>
                            <input type="radio" name="vantablack:serverRow" value="3" id="serverRow-3" {{ $serverRow == 3 ? "checked" : "" }}>
                            <label for="serverRow-3">
                                <img src="/vantablack/ServerRow-3.svg" />
                            </label>
                        </div>
                        <!--<div>
                            <input type="radio" name="vantablack:serverRow" value="4" id="serverRow-4" {{ $serverRow == 4 ? "checked" : "" }}>
                            <label for="serverRow-4">
                                <img src="/vantablack/ServerRow-4.svg" />
                            </label>
                        </div>-->
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Social buttons</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Enable or disable social buttons on homepage</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="vantablack:socialButtons" value="{{ old('vantablack:socialButtons', $socialButtons) }}">
                            <option value="false">Disable</option>
                            <option value="true" @if(old('vantablack:socialButtons', $socialButtons) == 'true') selected @endif>Enable</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Discord join box</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Enable or disable discord box on homepage</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="vantablack:discordBox" value="{{ old('vantablack:discordBox', $discordBox) }}">
                            <option value="false">Disable</option>
                            <option value="true" @if(old('vantablack:discordBox', $discordBox) == 'true') selected @endif>Enable</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="header" style="margin-top:50px;">
                <p>Console components</p>
                <span class="description-text">Manage all components on the console page.</span>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Stats cards</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Enable stat cards above and under console.</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field input-options input-rows">
                        <div>
                            <input type="radio" name="vantablack:statsCards" value="1" id="statsCards-1" {{ $statsCards == 1 ? "checked" : "" }}>
                            <label for="statsCards-1">
                                <img src="/vantablack/Console.svg" />
                            </label>
                        </div>
                        <div>
                            <input type="radio" name="vantablack:statsCards" value="2" id="statsCards-2" {{ $statsCards == 2 ? "checked" : "" }}>
                            <label for="statsCards-2">
                                <img src="/vantablack/StatsCards-1.svg" />
                            </label>
                        </div>
                        <div>
                            <input type="radio" name="vantablack:statsCards" value="3" id="statsCards-3" {{ $statsCards == 3 ? "checked" : "" }}>
                            <label for="statsCards-3">
                                <img src="/vantablack/StatsCards-2.svg" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Graphs next to console</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Enable side graphs on left or right side.</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field input-options input-rows">
                        <div>
                            <input type="radio" name="vantablack:sideGraphs" value="1" id="sideGraphs-1" {{ $sideGraphs == 1 ? "checked" : "" }}>
                            <label for="sideGraphs-1">
                                <img src="/vantablack/Console.svg" />
                            </label>
                        </div>
                        <div>
                            <input type="radio" name="vantablack:sideGraphs" value="2" id="sideGraphs-2" {{ $sideGraphs == 2 ? "checked" : "" }}>
                            <label for="sideGraphs-2">
                                <img src="/vantablack/SideGraphs-1.svg" />
                            </label>
                        </div>
                        <div>
                            <input type="radio" name="vantablack:sideGraphs" value="3" id="sideGraphs-3" {{ $sideGraphs == 3 ? "checked" : "" }}>
                            <label for="sideGraphs-3">
                                <img src="/vantablack/SideGraphs-2.svg" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Graphs</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Enable side graphs on above or under console.</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field input-options input-rows">
                        <div>
                            <input type="radio" name="vantablack:graphs" value="1" id="graphs-1" {{ $graphs == 1 ? "checked" : "" }}>
                            <label for="graphs-1">
                                <img src="/vantablack/Console.svg" />
                            </label>
                        </div>
                        <div>
                            <input type="radio" name="vantablack:graphs" value="2" id="graphs-2" {{ $graphs == 2 ? "checked" : "" }}>
                            <label for="graphs-2">
                                <img src="/vantablack/Graphs-1.svg" />
                            </label>
                        </div>
                        <div>
                            <input type="radio" name="vantablack:graphs" value="3" id="graphs-3" {{ $graphs == 3 ? "checked" : "" }}>
                            <label for="graphs-3">
                                <img src="/vantablack/Graphs-2.svg" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="header" style="margin-top:50px;">
                <p>Server dashboard components</p>
                <span class="description-text">Manage all components on the server dashboard page. On the server dashboard page works with slots, there is a grid layout with 2 boxes next to each other. However, a widget can also overlap 2 boxes.</span>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Server dashboard slot 1</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Modify what will be shown in slot 1</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="vantablack:slot1" value="{{ old('vantablack:slot1', $slot1) }}">
                            <option value="disabled">Disable</option>
                            <option value="banner" @if(old('vantablack:slot1', $slot1) == 'banner') selected @endif>Banner</option>
                            <option value="statCards" @if(old('vantablack:slot1', $slot1) == 'statCards') selected @endif>Stat cards</option>
                            <option value="graphs" @if(old('vantablack:slot1', $slot1) == 'graphs') selected @endif>Graphs</option>
                            <option value="sideGraphs" @if(old('vantablack:slot1', $slot1) == 'sideGraphs') selected @endif>Side Graphs</option>
                            <option value="SFTP" @if(old('vantablack:slot1', $slot1) == 'SFTP') selected @endif>SFTP Details</option>
                            <option value="info" @if(old('vantablack:slot1', $slot1) == 'info') selected @endif>Server Info</option>
                            <option value="infoAdvanced" @if(old('vantablack:slot1', $slot1) == 'infoAdvanced') selected @endif>Server Info Advanced</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Server dashboard slot 2</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Modify what will be shown in slot 2</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="vantablack:slot2" value="{{ old('vantablack:slot2', $slot2) }}">
                            <option value="disabled">Disable</option>
                            <option value="banner" @if(old('vantablack:slot2', $slot2) == 'banner') selected @endif>Banner</option>
                            <option value="statCards" @if(old('vantablack:slot2', $slot2) == 'statCards') selected @endif>Stat cards</option>
                            <option value="graphs" @if(old('vantablack:slot2', $slot2) == 'graphs') selected @endif>Graphs</option>
                            <option value="sideGraphs" @if(old('vantablack:slot2', $slot2) == 'sideGraphs') selected @endif>Side Graphs</option>
                            <option value="SFTP" @if(old('vantablack:slot2', $slot2) == 'SFTP') selected @endif>SFTP Details</option>
                            <option value="info" @if(old('vantablack:slot2', $slot2) == 'info') selected @endif>Server Info</option>
                            <option value="infoAdvanced" @if(old('vantablack:slot2', $slot2) == 'infoAdvanced') selected @endif>Server Info Advanced</option>
                        </select>
                    </div>
                </div>
            </div> 
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Server dashboard slot 3</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Modify what will be shown in slot 3</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="vantablack:slot3" value="{{ old('vantablack:slot3', $slot3) }}">
                            <option value="disabled">Disable</option>
                            <option value="banner" @if(old('vantablack:slot3', $slot3) == 'banner') selected @endif>Banner</option>
                            <option value="statCards" @if(old('vantablack:slot3', $slot3) == 'statCards') selected @endif>Stat cards</option>
                            <option value="graphs" @if(old('vantablack:slot3', $slot3) == 'graphs') selected @endif>Graphs</option>
                            <option value="sideGraphs" @if(old('vantablack:slot3', $slot3) == 'sideGraphs') selected @endif>Side Graphs</option>
                            <option value="SFTP" @if(old('vantablack:slot3', $slot3) == 'SFTP') selected @endif>SFTP Details</option>
                            <option value="info" @if(old('vantablack:slot3', $slot3) == 'info') selected @endif>Server Info</option>
                            <option value="infoAdvanced" @if(old('vantablack:slot3', $slot3) == 'infoAdvanced') selected @endif>Server Info Advanced</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Server dashboard slot 4</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Modify what will be shown in slot 4</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="vantablack:slot4" value="{{ old('vantablack:slot4', $slot4) }}">
                            <option value="disabled">Disable</option>
                            <option value="banner" @if(old('vantablack:slot4', $slot4) == 'banner') selected @endif>Banner</option>
                            <option value="statCards" @if(old('vantablack:slot4', $slot4) == 'statCards') selected @endif>Stat cards</option>
                            <option value="graphs" @if(old('vantablack:slot4', $slot4) == 'graphs') selected @endif>Graphs</option>
                            <option value="sideGraphs" @if(old('vantablack:slot4', $slot4) == 'sideGraphs') selected @endif>Side Graphs</option>
                            <option value="SFTP" @if(old('vantablack:slot4', $slot4) == 'SFTP') selected @endif>SFTP Details</option>
                            <option value="info" @if(old('vantablack:slot4', $slot4) == 'info') selected @endif>Server Info</option>
                            <option value="infoAdvanced" @if(old('vantablack:slot4', $slot4) == 'infoAdvanced') selected @endif>Server Info Advanced</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Server dashboard slot 5</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Modify what will be shown in slot 5</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="vantablack:slot5" value="{{ old('vantablack:slot5', $slot5) }}">
                            <option value="disabled">Disable</option>
                            <option value="banner" @if(old('vantablack:slot5', $slot5) == 'banner') selected @endif>Banner</option>
                            <option value="statCards" @if(old('vantablack:slot5', $slot5) == 'statCards') selected @endif>Stat cards</option>
                            <option value="graphs" @if(old('vantablack:slot5', $slot5) == 'graphs') selected @endif>Graphs</option>
                            <option value="sideGraphs" @if(old('vantablack:slot5', $slot5) == 'sideGraphs') selected @endif>Side Graphs</option>
                            <option value="SFTP" @if(old('vantablack:slot5', $slot5) == 'SFTP') selected @endif>SFTP Details</option>
                            <option value="info" @if(old('vantablack:slot5', $slot5) == 'info') selected @endif>Server Info</option>
                            <option value="infoAdvanced" @if(old('vantablack:slot5', $slot5) == 'infoAdvanced') selected @endif>Server Info Advanced</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Server dashboard slot 6</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Modify what will be shown in slot 6</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="vantablack:slot6" value="{{ old('vantablack:slot6', $slot6) }}">
                            <option value="disabled">Disable</option>
                            <option value="banner" @if(old('vantablack:slot6', $slot6) == 'banner') selected @endif>Banner</option>
                            <option value="statCards" @if(old('vantablack:slot6', $slot6) == 'statCards') selected @endif>Stat cards</option>
                            <option value="graphs" @if(old('vantablack:slot6', $slot6) == 'graphs') selected @endif>Graphs</option>
                            <option value="sideGraphs" @if(old('vantablack:slot6', $slot6) == 'sideGraphs') selected @endif>Side Graphs</option>
                            <option value="SFTP" @if(old('vantablack:slot6', $slot6) == 'SFTP') selected @endif>SFTP Details</option>
                            <option value="info" @if(old('vantablack:slot6', $slot6) == 'info') selected @endif>Server Info</option>
                            <option value="infoAdvanced" @if(old('vantablack:slot6', $slot6) == 'infoAdvanced') selected @endif>Server Info Advanced</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="padding-top:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Server dashboard slot 7</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Modify what will be shown in slot 7</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="vantablack:slot7" value="{{ old('vantablack:slot7', $slot7) }}">
                            <option value="disabled">Disable</option>
                            <option value="banner" @if(old('vantablack:slot7', $slot7) == 'banner') selected @endif>Banner</option>
                            <option value="statCards" @if(old('vantablack:slot7', $slot7) == 'statCards') selected @endif>Stat cards</option>
                            <option value="graphs" @if(old('vantablack:slot7', $slot7) == 'graphs') selected @endif>Graphs</option>
                            <option value="sideGraphs" @if(old('vantablack:slot7', $slot7) == 'sideGraphs') selected @endif>Side Graphs</option>
                            <option value="SFTP" @if(old('vantablack:slot7', $slot7) == 'SFTP') selected @endif>SFTP Details</option>
                            <option value="info" @if(old('vantablack:slot7', $slot7) == 'info') selected @endif>Server Info</option>
                            <option value="infoAdvanced" @if(old('vantablack:slot7', $slot7) == 'infoAdvanced') selected @endif>Server Info Advanced</option>
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