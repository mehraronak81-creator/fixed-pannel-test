@extends('layouts.vantablack', ['navbar' => 'colors', 'sideEditor' => false])

@section('title')
    Vantablack Colors
@endsection

@section('content')
    <div class="row">
        <div class="col-md-12">
            <div class="header">
                <p>Color settings</p>
                <span class="description-text">Utilize the Vantablack theme color picker to apply your color scheme effortlessly, revert to the default color settings, toggle between various input types, and explore our website's color scheme generator. Don't forget to save your changes!</span>
                <br/><br />
                <button onclick="toggleInputType()" class="button button-primary">Toggle Input Type</button>
            </div>
        </div>
    </div>
    <form action="{{ route('admin.vantablack.colors') }}" method="POST">
        <div class="row">
            <div class="col-md-8">
                <div class="content-box">
                    <div class="row">
                        <div class="col-md-12">
                            <p style="font-size:2.5rem;font-weight:bold;">Darkmode colors<p>
                            <p style="margin:0;font-weight:bold;">Primary color<p>
                            <small class="color-margin">Primary is the main color of your brand</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:primary">Premium color</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:primary" value="{{ old('vantablack:primary', $primary) }}" />
                                <button type="button" data-name="vantablack:primary" data-value="#4a35cf">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <div style="margin:30px 0px;width:100%;height:1px;background-color:var(--gray500);"> </div>
                            <p style="margin:0;font-weight:bold;">Success colors<p>
                            <small class="color-margin">This are the colors of the green buttons</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:successText">Success text</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:successText" value="{{ old('vantablack:successText', $successText) }}" />
                                <button type="button" data-name="vantablack:successText" data-value="#e1ffd8">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:successBorder">Success border</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:successBorder" value="{{ old('vantablack:successBorder', $successBorder) }}" />
                                <button type="button" data-name="vantablack:successBorder" data-value="#56aa2b">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:successBackground">Success background color</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:successBackground" value="{{ old('vantablack:successBackground', $successBackground) }}" />
                                <button type="button" data-name="vantablack:successBackground" data-value="#3d8f1f">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <div style="margin:30px 0px;width:100%;height:1px;background-color:var(--gray500);"> </div>
                            <p style="margin:0;font-weight:bold;">Danger colors<p>
                            <small class="color-margin">This are the colors of the red buttons</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:dangerText">Danger text</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:dangerText" value="{{ old('vantablack:dangerText', $dangerText) }}" />
                                <button type="button" data-name="vantablack:dangerText" data-value="#ffd8d8">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:dangerBorder">Danger border</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:dangerBorder" value="{{ old('vantablack:dangerBorder', $dangerBorder) }}" />
                                <button type="button" data-name="vantablack:dangerBorder" data-value="#aa2a2a">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:dangerBackground">Danger background color</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:dangerBackground" value="{{ old('vantablack:dangerBackground', $dangerBackground) }}" />
                                <button type="button" data-name="vantablack:dangerBackground" data-value="#8f1f20">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <div style="margin:30px 0px;width:100%;height:1px;background-color:var(--gray500);"> </div>
                            <p style="margin:0;font-weight:bold;">Secondary colors<p>
                            <small class="color-margin">This are the colors of the gray buttons</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:secondaryText">Secondary text</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:secondaryText" value="{{ old('vantablack:secondaryText', $secondaryText) }}" />
                                <button type="button" data-name="vantablack:secondaryText" data-value="#b2b2c1">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:secondaryBorder">Secondary border</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:secondaryBorder" value="{{ old('vantablack:secondaryBorder', $secondaryBorder) }}" />
                                <button type="button" data-name="vantablack:secondaryBorder" data-value="#42425b">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:secondaryBackground">Secondary background color</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:secondaryBackground" value="{{ old('vantablack:secondaryBackground', $secondaryBackground) }}" />
                                <button type="button" data-name="vantablack:secondaryBackground" data-value="#2b2b40">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <div style="margin:30px 0px;width:100%;height:1px;background-color:var(--gray500);"> </div>
                            <p style="margin:0;font-weight:bold;">Gray colors<p>
                            <small class="color-margin">This are the colors of the colors of the panel</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:gray50">Gray 50</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:gray50" value="{{ old('vantablack:gray50', $gray50) }}" />
                                <button type="button" data-name="vantablack:gray50" data-value="#f4f4f4">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                            <small class="color-margin">The color of the lightest text</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:gray100">Gray 100</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:gray100" value="{{ old('vantablack:gray100', $gray100) }}" />
                                <button type="button" data-name="vantablack:gray100" data-value="#d5d5db">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                            <small class="color-margin">The color of the light text</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:gray200">Gray 200</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:gray200" value="{{ old('vantablack:gray200', $gray200) }}" />
                                <button type="button" data-name="vantablack:gray200" data-value="#b2b2c1">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                            <small class="color-margin">The color of all regular text</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:gray300">Gray 300</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:gray300" value="{{ old('vantablack:gray300', $gray300) }}" />
                                <button type="button" data-name="vantablack:gray300" data-value="#8282a4">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                            <small class="color-margin">The color of all sub text</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:gray400">Gray 400</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:gray400" value="{{ old('vantablack:gray400', $gray400) }}" />
                                <button type="button" data-name="vantablack:gray400" data-value="#5e5e7f">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                            <small class="color-margin">The color for small details</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:gray500">Gray 500</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:gray500" value="{{ old('vantablack:gray500', $gray500) }}" />
                                <button type="button" data-name="vantablack:gray500" data-value="#42425b">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                            <small class="color-margin">Color used for border</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:gray600">Gray 600</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:gray600" value="{{ old('vantablack:gray600', $gray600) }}" />
                                <button type="button" data-name="vantablack:gray600" data-value="#2b2b40">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                            <small class="color-margin">Color used for the input</small>
                        </div> 
                        <div class="col-md-4 input-field">
                            <label for="vantablack:gray700">Gray 700</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:gray700" value="{{ old('vantablack:gray700', $gray700) }}" />
                                <button type="button" data-name="vantablack:gray700" data-value="#1d1d37">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                            <small class="color-margin">Color used for the boxes</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:gray800">Gray 800</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:gray800" value="{{ old('vantablack:gray800', $gray800) }}" />
                                <button type="button" data-name="vantablack:gray800" data-value="#0b0d2a">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                            <small class="color-margin">Color used for the background</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:gray900">Gray 900</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:gray900" value="{{ old('vantablack:gray900', $gray900) }}" />
                                <button type="button" data-name="vantablack:gray900" data-value="#040519">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                            <small class="color-margin">Color the darkest elements</small>
                        </div>
                    </div>
                </div>
            </div> 
            <div class="col-md-4">
                <div style="
                    background-color: {{ $gray800 }};
                    border-radius: 10px;
                    margin-top: 20px;
                    padding:25px;color:{{ $gray200 }} !important;
                ">
                    <div style="
                        font-size: 2rem;
                        font-weight: 400;
                        color: {{ $gray50 }};
                        display: flex;
                        align-items: center;
                        column-gap: 10px;
                    ">
                        <img src="/vantablack/Vantablack.png" style="width:32px"/>
                        Vantablack Theme
                    </div>
                    <div style="
                        display: flex;
                        align-items: center;
                        column-gap: 5px;
                        margin: 10px 0px;
                        font-size: 1.5rem;
                    ">
                        <i data-lucide="globe-2" style="width:20px;color:{{ $gray300 }}"></i> play.vantahost.com:25565
                    </div>
                    <hr style="border-color:{{ $gray500 }};"/>
                    <div style="
                        display: flex;
                        align-items: center;
                        column-gap: 10px;
                        margin-top: 10px;
                    ">
                        <div style="
                            background-color: {{ $successBackground }};
                            color: {{ $successText }};
                            border: 1px solid {{ $successBorder }};
                            padding: 7px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 100%;
                            border-radius: 5px;
                        ">
                            <i data-lucide="play" style="width:20px"></i>
                        </div>
                        <div style="
                            background-color: {{ $secondaryBackground }};
                            color: {{ $secondaryText }};
                            border: 1px solid {{ $secondaryBorder }};
                            padding: 7px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 100%;
                            border-radius: 5px;
                        ">
                            <i data-lucide="rotate-ccw" style="width:20px"></i>
                        </div>
                        <div style="
                            background-color: {{ $dangerBackground }};
                            color: {{ $dangerText }};
                            border: 1px solid {{ $dangerBorder }};
                            padding: 7px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 100%;
                            border-radius: 5px;
                        ">
                            <i data-lucide="stop-circle" style="width:20px"></i>
                        </div>
                    </div>
                    <div style="
                        margin:20px 0;
                        background-color: {{ $gray700 }};
                        padding:15px;
                        border-radius:7px;
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                    ">
                        <div>    
                            <span style="color: {{ $gray300 }}">CPU Usage: </span>
                            <div style="
                                display:flex;
                                align-items:center;
                                column-gap:5px;
                            ">
                                <span style="font-size:2rem;font-weight:500;color:{{ $gray50 }}">20.4%</span>
                                <span>/ 100% </span>
                            </div>
                        </div>
                        <div style="
                            width: 50px;
                            height: 50px;
                            background-color: {{ $primary }};
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            border-radius: 5px;
                        ">
                            <i data-lucide="cpu" style="width:30px"></i>
                        </div>
                    </div>
                    <div style="
                        margin:20px 0;
                        background-color: {{ $gray700 }};
                        padding:15px;
                        border-radius:7px;
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                    ">
                        <div>    
                            <span style="color: {{ $gray300 }}">Memory Usage: </span>
                            <div style="
                                display:flex;
                                align-items:center;
                                column-gap:5px;
                            ">
                                <span style="font-size:2rem;font-weight:500;color:{{ $gray50 }}">20 GB</span>
                                <span>/ 40 GB </span>
                            </div>
                        </div>
                        <div style="
                            width: 50px;
                            height: 50px;
                            background-color: {{ $primary }};
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            border-radius: 5px;
                        ">
                            <i data-lucide="memory-stick" style="width:30px"></i>
                        </div>
                    </div>
                    <div style="
                        background-color: {{ $primary }};
                        color: white;
                        padding:10px 15px;
                        text-align:center;
                        border-radius:5px;
                        font-weight:500;
                    ">Example button</div>
                </div>
            </div>
            <div class="col-md-8">
                <div class="content-box">
                    <div class="row">
                        <div class="col-md-12">
                            <p style="font-size:2.5rem;font-weight:bold;">Lightmode colors<p>
                            <p style="margin:0;font-weight:bold;">Primary color<p>
                            <small class="color-margin">Primary is the main color of your brand</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:lightmode_primary">Premium color</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:lightmode_primary" value="{{ old('vantablack:lightmode_primary', $lightmode_primary) }}" />
                                <button type="button" data-name="vantablack:lightmode_primary" data-value="#4a35cf">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <div style="margin:30px 0px;width:100%;height:1px;background-color:var(--gray500);"> </div>
                            <p style="margin:0;font-weight:bold;">Success colors<p>
                            <small class="color-margin">This are the colors of the green buttons</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:lightmode_successText">Success text</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:lightmode_successText" value="{{ old('vantablack:lightmode_successText', $lightmode_successText) }}" />
                                <button type="button" data-name="vantablack:lightmode_successText" data-value="#e1ffd8">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:lightmode_successBorder">Success border</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:lightmode_successBorder" value="{{ old('vantablack:lightmode_successBorder', $lightmode_successBorder) }}" />
                                <button type="button" data-name="vantablack:lightmode_successBorder" data-value="#56aa2b">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:lightmode_successBackground">Success background color</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:lightmode_successBackground" value="{{ old('vantablack:lightmode_successBackground', $lightmode_successBackground) }}" />
                                <button type="button" data-name="vantablack:lightmode_successBackground" data-value="#3d8f1f">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <div style="margin:30px 0px;width:100%;height:1px;background-color:var(--gray500);"> </div>
                            <p style="margin:0;font-weight:bold;">Danger colors<p>
                            <small class="color-margin">This are the colors of the red buttons</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:lightmode_dangerText">Danger text</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:lightmode_dangerText" value="{{ old('vantablack:lightmode_dangerText', $lightmode_dangerText) }}" />
                                <button type="button" data-name="vantablack:lightmode_dangerText" data-value="#ffd8d8">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:lightmode_dangerBorder">Danger border</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:lightmode_dangerBorder" value="{{ old('vantablack:lightmode_dangerBorder', $lightmode_dangerBorder) }}" />
                                <button type="button" data-name="vantablack:lightmode_dangerBorder" data-value="#aa2a2a">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:lightmode_dangerBackground">Danger background color</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:lightmode_dangerBackground" value="{{ old('vantablack:lightmode_dangerBackground', $lightmode_dangerBackground) }}" />
                                <button type="button" data-name="vantablack:lightmode_dangerBackground" data-value="#8f1f20">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <div style="margin:30px 0px;width:100%;height:1px;background-color:var(--gray500);"> </div>
                            <p style="margin:0;font-weight:bold;">Secondary colors<p>
                            <small class="color-margin">This are the colors of the gray buttons</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:lightmode_secondaryText">Secondary text</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:lightmode_secondaryText" value="{{ old('vantablack:lightmode_secondaryText', $lightmode_secondaryText) }}" />
                                <button type="button" data-name="vantablack:lightmode_secondaryText" data-value="#46464d">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:lightmode_secondaryBorder">Secondary border</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:lightmode_secondaryBorder" value="{{ old('vantablack:lightmode_secondaryBorder', $lightmode_secondaryBorder) }}" />
                                <button type="button" data-name="vantablack:lightmode_secondaryBorder" data-value="#c0c0d3">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:lightmode_secondaryBackground">Secondary background color</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:lightmode_secondaryBackground" value="{{ old('vantablack:lightmode_secondaryBackground', $lightmode_secondaryBackground) }}" />
                                <button type="button" data-name="vantablack:lightmode_secondaryBackground" data-value="#a6a7bd">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <div style="margin:30px 0px;width:100%;height:1px;background-color:var(--gray500);"> </div>
                            <p style="margin:0;font-weight:bold;">Gray colors<p>
                            <small class="color-margin">This are the colors of the colors of the panel</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:lightmode_gray50">Gray 50</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:lightmode_gray50" value="{{ old('vantablack:lightmode_gray50', $lightmode_gray50) }}" />
                                <button type="button" data-name="vantablack:lightmode_gray50" data-value="#141415">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                            <small class="color-margin">The color of the lightest text</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:lightmode_gray100">Gray 100</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:lightmode_gray100" value="{{ old('vantablack:lightmode_gray100', $lightmode_gray100) }}" />
                                <button type="button" data-name="vantablack:lightmode_gray100" data-value="#27272c">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                            <small class="color-margin">The color of the light text</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:lightmode_gray200">Gray 200</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:lightmode_gray200" value="{{ old('vantablack:lightmode_gray200', $lightmode_gray200) }}" />
                                <button type="button" data-name="vantablack:lightmode_gray200" data-value="#46464d">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                            <small class="color-margin">The color of all regular text</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:lightmode_gray300">Gray 300</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:lightmode_gray300" value="{{ old('vantablack:lightmode_gray300', $lightmode_gray300) }}" />
                                <button type="button" data-name="vantablack:lightmode_gray300" data-value="#626272">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                            <small class="color-margin">The color of all sub text</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:lightmode_gray400">Gray 400</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:lightmode_gray400" value="{{ old('vantablack:lightmode_gray400', $lightmode_gray400) }}" />
                                <button type="button" data-name="vantablack:lightmode_gray400" data-value="#757689">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                            <small class="color-margin">The color for small details</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:lightmode_gray500">Gray 500</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:lightmode_gray500" value="{{ old('vantablack:lightmode_gray500', $lightmode_gray500) }}" />
                                <button type="button" data-name="vantablack:lightmode_gray500" data-value="#a6a7bd">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                            <small class="color-margin">Color used for border</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:lightmode_gray600">Gray 600</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:lightmode_gray600" value="{{ old('vantablack:lightmode_gray600', $lightmode_gray600) }}" />
                                <button type="button" data-name="vantablack:lightmode_gray600" data-value="#c0c0d3">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                            <small class="color-margin">Color used for the input</small>
                        </div> 
                        <div class="col-md-4 input-field">
                            <label for="vantablack:lightmode_gray700">Gray 700</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:lightmode_gray700" value="{{ old('vantablack:lightmode_gray700', $lightmode_gray700) }}" />
                                <button type="button" data-name="vantablack:lightmode_gray700" data-value="#e7e7ef">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                            <small class="color-margin">Color used for the boxes</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:lightmode_gray800">Gray 800</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:lightmode_gray800" value="{{ old('vantablack:lightmode_gray800', $lightmode_gray800) }}" />
                                <button type="button" data-name="vantablack:lightmode_gray800" data-value="#f0f1f5">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                            <small class="color-margin">Color used for the background</small>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="vantablack:lightmode_gray900">Gray 900</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="vantablack:lightmode_gray900" value="{{ old('vantablack:lightmode_gray900', $lightmode_gray900) }}" />
                                <button type="button" data-name="vantablack:lightmode_gray900" data-value="#ffffff">
                                    <i data-lucide="rotate-ccw"></i>
                                </button>
                            </div>
                            <small class="color-margin">Color the darkest elements</small>
                        </div>
                    </div>
                </div>
            </div> 
            <div class="col-md-4">
                <div style="
                    background-color: {{ $lightmode_gray800 }};
                    border-radius: 10px;
                    margin-top: 20px;
                    padding:25px;color:{{ $lightmode_gray200 }} !important;
                ">
                    <div style="
                        font-size: 2rem;
                        font-weight: 400;
                        color: {{ $lightmode_gray50 }};
                        display: flex;
                        align-items: center;
                        column-gap: 10px;
                    ">
                        <img src="/vantablack/Vantablack.png" style="width:32px"/>
                        Vantablack Theme
                    </div>
                    <div style="
                        display: flex;
                        align-items: center;
                        column-gap: 5px;
                        margin: 10px 0px;
                        font-size: 1.5rem;
                    ">
                        <i data-lucide="globe-2" style="width:20px;color:{{ $lightmode_gray300 }}"></i> play.vantahost.com:25565
                    </div>
                    <hr style="border-color:{{ $lightmode_gray500 }};"/>
                    <div style="
                        display: flex;
                        align-items: center;
                        column-gap: 10px;
                        margin-top: 10px;
                    ">
                        <div style="
                            background-color: {{ $lightmode_successBackground }};
                            color: {{ $lightmode_successText }};
                            border: 1px solid {{ $lightmode_successBorder }};
                            padding: 7px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 100%;
                            border-radius: 5px;
                        ">
                            <i data-lucide="play" style="width:20px"></i>
                        </div>
                        <div style="
                            background-color: {{ $lightmode_secondaryBackground }};
                            color: {{ $lightmode_secondaryText }};
                            border: 1px solid {{ $lightmode_secondaryBorder }};
                            padding: 7px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 100%;
                            border-radius: 5px;
                        ">
                            <i data-lucide="rotate-ccw" style="width:20px"></i>
                        </div>
                        <div style="
                            background-color: {{ $lightmode_dangerBackground }};
                            color: {{ $lightmode_dangerText }};
                            border: 1px solid {{ $lightmode_dangerBorder }};
                            padding: 7px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 100%;
                            border-radius: 5px;
                        ">
                            <i data-lucide="stop-circle" style="width:20px"></i>
                        </div>
                    </div>
                    <div style="
                        margin:20px 0;
                        background-color: {{ $lightmode_gray700 }};
                        padding:15px;
                        border-radius:7px;
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                    ">
                        <div>    
                            <span style="color: {{ $lightmode_gray300 }}">CPU Usage: </span>
                            <div style="
                                display:flex;
                                align-items:center;
                                column-gap:5px;
                            ">
                                <span style="font-size:2rem;font-weight:500;color:{{ $lightmode_gray50 }}">20.4%</span>
                                <span>/ 100% </span>
                            </div>
                        </div>
                        <div style="
                            width: 50px;
                            height: 50px;
                            background-color: {{ $lightmode_primary }};
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            border-radius: 5px;
                        ">
                            <i data-lucide="cpu" style="width:30px"></i>
                        </div>
                    </div>
                    <div style="
                        margin:20px 0;
                        background-color: {{ $lightmode_gray700 }};
                        padding:15px;
                        border-radius:7px;
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                    ">
                        <div>    
                            <span style="color: {{ $lightmode_gray300 }}">Memory Usage: </span>
                            <div style="
                                display:flex;
                                align-items:center;
                                column-gap:5px;
                            ">
                                <span style="font-size:2rem;font-weight:500;color:{{ $lightmode_gray50 }}">20 GB</span>
                                <span>/ 40 GB </span>
                            </div>
                        </div>
                        <div style="
                            width: 50px;
                            height: 50px;
                            background-color: {{ $lightmode_primary }};
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            border-radius: 5px;
                        ">
                            <i data-lucide="memory-stick" style="width:30px"></i>
                        </div>
                    </div>
                    <div style="
                        background-color: {{ $lightmode_primary }};
                        color: white;
                        padding:10px 15px;
                        text-align:center;
                        border-radius:5px;
                        font-weight:500;
                    ">Example button</div>
                </div>
            </div>
        </div>
        <div class="floating-button-2">
            {!! csrf_field() !!}
            <button type="submit" class="button button-primary">Save changes</button>
        </div>
    </form>
    <script>
    var resetButtons = document.querySelectorAll('button[data-name]');

    resetButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var inputName = button.getAttribute('data-name');
            var inputElement = document.querySelector('input[name="' + inputName + '"]');
            var value = button.getAttribute('data-value');

            inputElement.value = value;

            console.log('Input value for', inputName, 'reset to:', value);
        });
    });

    function toggleInputType() {
        var inputs = document.querySelectorAll('input');
        inputs.forEach(function(input) {
            if (input.type === 'text') {
            input.type = 'color';
            } else if (input.type === 'color') {
            input.type = 'text';
            }
        });
    }
    </script>
@endsection