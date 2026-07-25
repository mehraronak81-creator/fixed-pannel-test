<!DOCTYPE html>
<html>
    <head>
        <title>{{ config('app.name', 'Pterodactyl') }}</title>

        @section('meta')
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
            <meta name="csrf-token" content="{{ csrf_token() }}">
            
            <!-- meta data -->

            <meta name="theme-color" content="{{ $siteConfiguration['vantablack']['meta_color'] }}"/>
            <link rel="icon" type="image/x-icon" href="{{ $siteConfiguration['vantablack']['meta_favicon'] }}">

            <meta name="title" content="{{ $siteConfiguration['vantablack']['meta_title'] }}" />
            <meta name="description" content="{{ $siteConfiguration['vantablack']['meta_description'] }}" />

            <meta property="og:type" content="website" />
            <meta property="og:url" content="{{config('app.url', 'https://localhost')}}" />
            <meta property="og:title" content="{{ $siteConfiguration['vantablack']['meta_title'] }}" />
            <meta property="og:description" content="{{ $siteConfiguration['vantablack']['meta_description'] }}" />
            <meta property="og:image" content="{{ $siteConfiguration['vantablack']['meta_image'] }}" />

            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content="{{config('app.url', 'https://localhost')}}" />
            <meta property="twitter:title" content="{{ $siteConfiguration['vantablack']['meta_title'] }}" />
            <meta property="twitter:description" content="{{ $siteConfiguration['vantablack']['meta_description'] }}" />
            <meta property="twitter:image" content="{{ $siteConfiguration['vantablack']['meta_image'] }}" />

            <!-- meta data -->
            <!--
            <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png?v=3041cf234d50072cfa636ac560ac966f">
            <link rel="icon" type="image/png" href="/favicons/favicon-32x32.png" sizes="32x32">
            <link rel="icon" type="image/png" href="/favicons/favicon-16x16.png" sizes="16x16">
            <link rel="manifest" href="/favicons/manifest.json">
            <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#bc6e3c">
            <link rel="shortcut icon" href="/favicons/favicon.ico">
            <meta name="msapplication-config" content="/favicons/browserconfig.xml">
        -->
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
            @import url('//fonts.googleapis.com/css?family=Rubik:300,400,500&display=swap');
            @import url('//fonts.googleapis.com/css?family=IBM+Plex+Mono|IBM+Plex+Sans:500&display=swap');
        </style>

        @yield('assets')

        @include('layouts.scripts')
    </head>
    <body class="{{ $css['body'] ?? 'bg-neutral-50' }}">
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
