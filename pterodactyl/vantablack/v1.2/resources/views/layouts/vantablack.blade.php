<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>{{ $siteConfiguration['vantablack']['meta_title'] }} - @yield('title')</title>
        <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
        <meta name="_token" content="{{ csrf_token() }}">

        @include('partials.vantablack-meta')
        @include('partials.vantablack-appearance')

        @include('layouts.scripts')

        @section('scripts')
            {!! Theme::css('vendor/select2/select2.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/bootstrap/bootstrap.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/sweetalert/sweetalert.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/animate/animate.min.css?t={cache-version}') !!}
            {!! Theme::css('css/vantablack.css?t={cache-version}') !!}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/css/ionicons.min.css">

            <!--[if lt IE 9]>
            <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
            <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
            <![endif]-->
        @show
    </head>
    <body data-button-style="{{ $siteConfiguration['vantablack']['buttonStyle'] }}" data-card-style="{{ $siteConfiguration['vantablack']['cardStyle'] }}" data-ui-density="{{ $siteConfiguration['vantablack']['uiDensity'] }}">

        <nav>
            <button type="button" class="studio-menu-toggle" aria-label="Open Studio navigation">
                <i data-lucide="menu"></i>
            </button>
            <a href="{{ route('admin.vantablack') }}" class="logo">
                <img src="/vantablack/Vantablack.png" class="logo" alt="Vantablack Logo"/>
                VantaHost Studio
            </a>
            <div class="nav-end">
                <button type="button" class="studio-command-button" data-studio-command aria-label="Open Studio quick jump">
                    <i data-lucide="command"></i>
                    <span>Quick jump</span>
                    <kbd>Ctrl K</kbd>
                </button>
                <a href="https://discord.gg/2vx6tCXmr4" target="_blank" rel="noopener noreferrer">
                    <i class="fa-brands fa-discord"></i> Discord
                </a>
                <a href="{{ route('account') }}" class="account">
                    <img src="https://www.gravatar.com/avatar/{{ md5(strtolower(Auth::user()->email)) }}?s=160" class="user-image" alt="User Image">
                    <span>{{ Auth::user()->name_first }} {{ Auth::user()->name_last }}</span>
                </a>
            </div>
        </nav>

        <div class="wrapper">
            <div class="sidebar" id="studio-sidebar" aria-label="VantaHost Studio navigation">
                @php
                    $studioNavigation = [
                        ['key' => 'index', 'route' => 'admin.vantablack', 'icon' => 'wand-2', 'label' => 'Overview', 'description' => 'Brand and support'],
                        ['key' => 'announcement', 'route' => 'admin.vantablack.announcement', 'icon' => 'megaphone', 'label' => 'Announcements', 'description' => 'Banners and notices'],
                        ['key' => 'styling', 'route' => 'admin.vantablack.styling', 'icon' => 'sparkles', 'label' => 'Styling', 'description' => 'Background and radius'],
                        ['key' => 'layout', 'route' => 'admin.vantablack.layout', 'icon' => 'layout', 'label' => 'Layout', 'description' => 'Navigation and login'],
                        ['key' => 'components', 'route' => 'admin.vantablack.components', 'icon' => 'layout-grid', 'label' => 'Components', 'description' => 'Dashboard modules'],
                        ['key' => 'colors', 'route' => 'admin.vantablack.colors', 'icon' => 'palette', 'label' => 'Colors', 'description' => 'Theme palette'],
                        ['key' => 'meta', 'route' => 'admin.vantablack.meta', 'icon' => 'tags', 'label' => 'Metadata', 'description' => 'SEO and sharing'],
                        ['key' => 'mail', 'route' => 'admin.vantablack.mail', 'icon' => 'mailbox', 'label' => 'Mail', 'description' => 'Email experience'],
                        ['key' => 'advanced', 'route' => 'admin.vantablack.advanced', 'icon' => 'sliders-horizontal', 'label' => 'Advanced', 'description' => 'Panel behavior'],
                    ];
                @endphp
                <p class="studio-nav-heading">Studio</p>
                <ul>
                    @foreach($studioNavigation as $item)
                        <li @class(['active' => $navbar === $item['key']])>
                            <a href="{{ route($item['route']) }}" class="studio-nav-link" @if($navbar === $item['key']) aria-current="page" @endif>
                                <span class="studio-nav-icon"><i data-lucide="{{ $item['icon'] }}"></i></span>
                                <span class="studio-nav-copy"><strong>{{ $item['label'] }}</strong><small>{{ $item['description'] }}</small></span>
                            </a>
                        </li>
                    @endforeach
                </ul>
                <p class="studio-nav-heading studio-nav-heading-secondary">Tools</p>
                <ul class="sidebar-bottom">
                    <li>
                        <a href="{{ route('index') }}" target="_blank" rel="noopener noreferrer" class="studio-nav-link">
                            <span class="studio-nav-icon"><i data-lucide="monitor-up"></i></span>
                            <span class="studio-nav-copy"><strong>Live preview</strong><small>Open user dashboard</small></span>
                        </a>
                    </li>
                    <li>
                        <a href="https://discord.gg/2vx6tCXmr4" target="_blank" rel="noopener noreferrer" class="studio-nav-link">
                            <span class="studio-nav-icon"><i data-lucide="circle-help"></i></span>
                            <span class="studio-nav-copy"><strong>Support</strong><small>VantaHost Discord</small></span>
                        </a>
                    </li>
                    <li>
                        <a href="{{ route('admin.settings') }}" class="studio-nav-link">
                            <span class="studio-nav-icon"><i data-lucide="shield-cog"></i></span>
                            <span class="studio-nav-copy"><strong>Panel admin</strong><small>Core panel settings</small></span>
                        </a>
                    </li>
                </ul>
            </div>
            <div class="content-container">

            @if($sideEditor)
                <div class="sideEditor-container">
                    <div class="sideEditor">
                        @if (count($errors) > 0)
                            <div class="alert alert-danger">
                                There was an error validating the data provided.<br><br>
                                <ul>
                                    @foreach ($errors->all() as $error)
                                        <li>{{ $error }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif
                        @foreach (Alert::getMessages() as $type => $messages)
                            @foreach ($messages as $message)
                                <div class="alert alert-{{ $type }} alert-dismissable" role="alert">
                                    {!! $message !!}
                                </div>
                            @endforeach
                        @endforeach
                        @yield('content')
                    </div>
                    <div class="iframe-container">
                        <div class="preview-toolbar">
                            <span><i data-lucide="scan-eye"></i> Live dashboard preview</span>
                            <a href="{{ route('index') }}" target="_blank" rel="noopener noreferrer">Open full preview</a>
                        </div>
                        <iframe src="/" width="100%" title="Live VantaHost dashboard preview"></iframe> 
                    </div>
                </div>
            @else
                <div style="max-height:calc(100vh - 65px);overflow-y:scroll;padding:20px 0;">
                    <div class="container">
                        @if (count($errors) > 0)
                            <div class="alert alert-danger">
                                There was an error validating the data provided.<br><br>
                                <ul>
                                    @foreach ($errors->all() as $error)
                                        <li>{{ $error }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif
                        @foreach (Alert::getMessages() as $type => $messages)
                            @foreach ($messages as $message)
                                <div class="alert alert-{{ $type }} alert-dismissable" role="alert">
                                    {!! $message !!}
                                </div>
                            @endforeach
                        @endforeach
                        @yield('content')
                    </div>
                </div>
            @endif
            </div>
        </div>

        <div id="studio-command-palette" class="studio-command-palette" aria-hidden="true">
            <div class="studio-command-backdrop" data-studio-close></div>
            <div class="studio-command-dialog" role="dialog" aria-modal="true" aria-labelledby="studio-command-title">
                <div class="studio-command-search">
                    <i data-lucide="search"></i>
                    <input id="studio-command-input" type="search" placeholder="Jump to a Studio section..." autocomplete="off">
                    <kbd>ESC</kbd>
                </div>
                <p id="studio-command-title" class="studio-command-label">Studio navigation</p>
                <div class="studio-command-list" id="studio-command-list">
                    <a href="{{ route('admin.vantablack') }}" data-command-item data-search="general identity logo support">General identity</a>
                    <a href="{{ route('admin.vantablack.announcement') }}" data-command-item data-search="announcement banner message">Announcements</a>
                    <a href="{{ route('admin.vantablack.styling') }}" data-command-item data-search="styling background mode radius">Styling</a>
                    <a href="{{ route('admin.vantablack.layout') }}" data-command-item data-search="layout navigation login">Layouts</a>
                    <a href="{{ route('admin.vantablack.components') }}" data-command-item data-search="components dashboard cards graphs">Components</a>
                    <a href="{{ route('admin.vantablack.colors') }}" data-command-item data-search="colors palette primary">Colors</a>
                    <a href="{{ route('admin.vantablack.meta') }}" data-command-item data-search="metadata seo favicon title">Metadata</a>
                    <a href="{{ route('admin.vantablack.mail') }}" data-command-item data-search="mail email smtp">Mail</a>
                    <a href="{{ route('admin.vantablack.advanced') }}" data-command-item data-search="advanced font profile language">Advanced</a>
                    <a href="{{ route('index') }}" target="_blank" data-command-item data-search="preview dashboard live user">Open live preview</a>
                    <a href="https://discord.gg/2vx6tCXmr4" target="_blank" rel="noopener noreferrer" data-command-item data-search="support discord help">Open support Discord</a>
                </div>
            </div>
        </div>


        @section('footer-scripts')
            <script src="/js/keyboard.polyfill.js" type="application/javascript"></script>
            <script>keyboardeventKeyPolyfill.polyfill();</script>

            {!! Theme::js('vendor/jquery/jquery.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/sweetalert/sweetalert.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/bootstrap/bootstrap.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/slimscroll/jquery.slimscroll.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/adminlte/app.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/bootstrap-notify/bootstrap-notify.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/select2/select2.full.min.js?t={cache-version}') !!}
            {!! Theme::js('js/admin/functions.js?t={cache-version}') !!}
            <script src="/js/autocomplete.js" type="application/javascript"></script>
            <script src="https://unpkg.com/lucide@0.263.1"></script>
            <script>
                lucide.createIcons();
            </script>

            <script>
                (function () {
                    var palette = document.getElementById('studio-command-palette');
                    var input = document.getElementById('studio-command-input');
                    var commandItems = Array.prototype.slice.call(document.querySelectorAll('[data-command-item]'));
                    var menuToggle = document.querySelector('.studio-menu-toggle');

                    function setPalette(open) {
                        palette.classList.toggle('is-open', open);
                        palette.setAttribute('aria-hidden', String(!open));
                        if (open) {
                            input.value = '';
                            commandItems.forEach(function (item) { item.hidden = false; });
                            window.setTimeout(function () { input.focus(); }, 40);
                        }
                    }

                    document.querySelectorAll('[data-studio-command]').forEach(function (button) {
                        button.addEventListener('click', function () { setPalette(true); });
                    });
                    document.querySelectorAll('[data-studio-close]').forEach(function (button) {
                        button.addEventListener('click', function () { setPalette(false); });
                    });
                    input.addEventListener('input', function () {
                        var term = input.value.toLowerCase().trim();
                        commandItems.forEach(function (item) {
                            item.hidden = term.length > 0 && !(item.textContent + ' ' + item.dataset.search).toLowerCase().includes(term);
                        });
                    });
                    document.addEventListener('keydown', function (event) {
                        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                            event.preventDefault();
                            setPalette(true);
                        }
                        if (event.key === 'Escape') {
                            setPalette(false);
                            document.body.classList.remove('studio-sidebar-open');
                        }
                    });
                    menuToggle.addEventListener('click', function () {
                        document.body.classList.toggle('studio-sidebar-open');
                    });
                    document.querySelectorAll('#studio-sidebar a').forEach(function (link) {
                        link.addEventListener('click', function () { document.body.classList.remove('studio-sidebar-open'); });
                    });
                })();
            </script>

            @if(Auth::user()->root_admin)
                <script>
                    $('#logoutButton').on('click', function (event) {
                        event.preventDefault();

                        var that = this;
                        swal({
                            title: 'Do you want to log out?',
                            type: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d9534f',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Log out'
                        }, function () {
                             $.ajax({
                                type: 'POST',
                                url: '{{ route('auth.logout') }}',
                                data: {
                                    _token: '{{ csrf_token() }}'
                                },complete: function () {
                                    window.location.href = '{{route('auth.login')}}';
                                }
                        });
                    });
                });
                </script>
            @endif

            <script>
                $(function () {
                    $('[data-toggle="tooltip"]').tooltip();
                })
            </script>
        @show
    </body>
</html>
