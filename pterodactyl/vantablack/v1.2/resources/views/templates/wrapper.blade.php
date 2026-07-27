<!DOCTYPE html>
<html>
    <head>
        <title>{{ $siteConfiguration['vantablack']['meta_title'] }}</title>

        @section('meta')
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
            <meta name="csrf-token" content="{{ csrf_token() }}">
            
            @include('partials.vantablack-meta')
            @include('partials.vantablack-appearance')
        @show

        @section('user-data')
            @if(!is_null(Auth::user()))
                <script>
                    window.PterodactylUser = {!! json_encode(Auth::user()->toVueObject()) !!};
                </script>
            @endif
            @if(!empty($siteConfiguration))
                <script>
                    window.SiteConfiguration = {!! json_encode($siteConfiguration) !!};
                </script>
            @endif
        @show
        <style>
            :root{
                <?php if ($siteConfiguration['vantablack']['borderInput'] === 'true') {
                    echo '--borderInput: 1px solid;
';  
                }?>
                --radiusBox: {{ $siteConfiguration['vantablack']['radiusBox'] }};
                --radiusInput: {{ $siteConfiguration['vantablack']['radiusInput'] }};
            }

            <?php if ($siteConfiguration['vantablack']['defaultMode'] === 'darkmode') {
                echo ':root';
            } else {
                echo '.lightmode';
            }?>{
                --image: url({{ $siteConfiguration['vantablack']['backgroundImage'] }});
                --primary: {{ $siteConfiguration['vantablack']['primary'] }};

                --successText: {{ $siteConfiguration['vantablack']['successText'] }};
                --successBorder: {{ $siteConfiguration['vantablack']['successBorder'] }};
                --successBackground: {{ $siteConfiguration['vantablack']['successBackground'] }};

                --dangerText: {{ $siteConfiguration['vantablack']['dangerText'] }};
                --dangerBorder: {{ $siteConfiguration['vantablack']['dangerBorder'] }};
                --dangerBackground: {{ $siteConfiguration['vantablack']['dangerBackground'] }}; 

                --secondaryText: {{ $siteConfiguration['vantablack']['secondaryText'] }};
                --secondaryBorder: {{ $siteConfiguration['vantablack']['secondaryBorder'] }};
                --secondaryBackground: {{ $siteConfiguration['vantablack']['secondaryBackground'] }};

                --gray50: {{ $siteConfiguration['vantablack']['gray50'] }};
                --gray100: {{ $siteConfiguration['vantablack']['gray100'] }};
                --gray200: {{ $siteConfiguration['vantablack']['gray200'] }};
                --gray300: {{ $siteConfiguration['vantablack']['gray300'] }};
                --gray400: {{ $siteConfiguration['vantablack']['gray400'] }};
                --gray500: {{ $siteConfiguration['vantablack']['gray500'] }};
                --gray600: {{ $siteConfiguration['vantablack']['gray600'] }};
                --gray700: color-mix(in srgb, {{ $siteConfiguration['vantablack']['gray700'] }} {{ $siteConfiguration['vantablack']['backdropPercentage'] }}, transparent);
                --gray800: {{ $siteConfiguration['vantablack']['gray800'] }};
                --gray900: {{ $siteConfiguration['vantablack']['gray900'] }};

                --gray700-default: {{ $siteConfiguration['vantablack']['gray700'] }};;
            }
            <?php if ($siteConfiguration['vantablack']['defaultMode'] !== 'darkmode') {
                echo ':root';
            } else {
                echo '.lightmode';
            }?>{
                --image: url({{ $siteConfiguration['vantablack']['backgroundImageLight'] }});
                --primary: {{ $siteConfiguration['vantablack']['lightmode_primary'] }};

                --successText: {{ $siteConfiguration['vantablack']['lightmode_successText'] }};
                --successBorder: {{ $siteConfiguration['vantablack']['lightmode_successBorder'] }};
                --successBackground: {{ $siteConfiguration['vantablack']['lightmode_successBackground'] }};

                --dangerText: {{ $siteConfiguration['vantablack']['lightmode_dangerText'] }};
                --dangerBorder: {{ $siteConfiguration['vantablack']['lightmode_dangerBorder'] }};
                --dangerBackground: {{ $siteConfiguration['vantablack']['lightmode_dangerBackground'] }}; 

                --secondaryText: {{ $siteConfiguration['vantablack']['lightmode_secondaryText'] }};
                --secondaryBorder: {{ $siteConfiguration['vantablack']['lightmode_secondaryBorder'] }};
                --secondaryBackground: {{ $siteConfiguration['vantablack']['lightmode_secondaryBackground'] }};

                --gray50: {{ $siteConfiguration['vantablack']['lightmode_gray50'] }};
                --gray100: {{ $siteConfiguration['vantablack']['lightmode_gray100'] }};
                --gray200: {{ $siteConfiguration['vantablack']['lightmode_gray200'] }};
                --gray300: {{ $siteConfiguration['vantablack']['lightmode_gray300'] }};
                --gray400: {{ $siteConfiguration['vantablack']['lightmode_gray400'] }};
                --gray500: {{ $siteConfiguration['vantablack']['lightmode_gray500'] }};
                --gray600: {{ $siteConfiguration['vantablack']['lightmode_gray600'] }}; 
                --gray700: color-mix(in srgb, {{ $siteConfiguration['vantablack']['lightmode_gray700'] }} {{ $siteConfiguration['vantablack']['backdropPercentage'] }}, transparent);
                --gray800: {{ $siteConfiguration['vantablack']['lightmode_gray800'] }};
                --gray900: {{ $siteConfiguration['vantablack']['lightmode_gray900'] }};

                --gray700-default: {{ $siteConfiguration['vantablack']['lightmode_gray700'] }};;
            }

            <?php if ($siteConfiguration['vantablack']['backdrop'] === 'true') {
                echo '.backdrop{border:1px solid;border-color:var(--gray600)!important;backdrop-filter:blur(16px);}';
            }?>


        </style>

        @yield('assets')

        @include('layouts.scripts')
    </head>
    <body class="{{ $css['body'] ?? 'bg-neutral-50' }}" data-button-style="{{ $siteConfiguration['vantablack']['buttonStyle'] }}" data-card-style="{{ $siteConfiguration['vantablack']['cardStyle'] }}" data-ui-density="{{ $siteConfiguration['vantablack']['uiDensity'] }}">
        @section('content')
            @yield('above-container')
            @yield('container')
            @yield('below-container')
        @show
        @section('scripts')
            {!! $asset->js('main.js') !!}
        @show

    
    </body>
</html>
