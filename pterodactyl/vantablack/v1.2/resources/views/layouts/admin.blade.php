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
            {!! Theme::css('vendor/adminlte/admin.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/sweetalert/sweetalert.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/animate/animate.min.css?t={cache-version}') !!}
            {!! Theme::css('css/pterodactyl.css?t={cache-version}') !!}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/css/ionicons.min.css">

            <!--[if lt IE 9]>
            <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
            <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
            <![endif]-->
        @show
    </head>
    <body class="hold-transition skin-vantahost fixed sidebar-mini" data-button-style="{{ $siteConfiguration['vantablack']['buttonStyle'] }}" data-card-style="{{ $siteConfiguration['vantablack']['cardStyle'] }}" data-ui-density="{{ $siteConfiguration['vantablack']['uiDensity'] }}">
        <div class="wrapper">
            <header class="main-header">
                <a href="{{ route('admin.index') }}" class="logo" aria-label="VantaHost Admin home">
                    <span class="vh-logo-mark"><img src="{{ $siteConfiguration['vantablack']['logo'] }}" alt=""></span>
                    <span class="vh-logo-copy"><strong>VantaHost</strong><small>ADMIN CONSOLE</small></span>
                </a>
                <nav class="navbar navbar-static-top">
                    <a href="#" class="sidebar-toggle" data-toggle="push-menu" role="button" aria-label="Toggle admin navigation">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </a>
                    <div class="vh-admin-context hidden-xs">
                        <span>Control center</span>
                        <small>Infrastructure operations</small>
                    </div>
                    <div class="navbar-custom-menu">
                        <ul class="nav navbar-nav">
                            <li class="user-menu">
                                <a href="{{ route('account') }}" class="vh-profile-link">
                                    <img src="https://www.gravatar.com/avatar/{{ md5(strtolower(Auth::user()->email)) }}?s=160" class="user-image" alt="">
                                    <span class="hidden-xs"><strong>{{ Auth::user()->name_first }}</strong><small>Administrator</small></span>
                                </a>
                            </li>
                            <li><a href="{{ route('index') }}" class="vh-header-action" data-toggle="tooltip" data-placement="bottom" title="Open user panel"><i class="fa fa-server"></i><span class="hidden-sm hidden-xs">User panel</span></a></li>
                            <li><a href="{{ route('auth.logout') }}" class="vh-header-action" id="logoutButton" data-toggle="tooltip" data-placement="bottom" title="Log out"><i class="fa fa-sign-out"></i></a></li>
                        </ul>
                    </div>
                </nav>
            </header>
            <aside class="main-sidebar">
                <section class="sidebar">
                    <div class="vh-sidebar-status">
                        <span class="vh-status-pulse" aria-hidden="true"></span>
                        <div><strong>Admin workspace</strong><small>Secure session active</small></div>
                    </div>
                    <ul class="sidebar-menu">
                        <li class="header">BASIC ADMINISTRATION</li>
                        <li class="{{ Route::currentRouteName() !== 'admin.index' ?: 'active' }}">
                            <a href="{{ route('admin.index') }}">
                                <i data-lucide="home"></i> <span>Overview</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.settings') ?: 'active' }}">
                            <a href="{{ route('admin.settings')}}">
                                <i data-lucide="settings"></i> <span>Settings</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.vantablack') ?: 'active' }}">
                            <a href="{{ route('admin.vantablack')}}">
                                <i data-lucide="wand-2"></i><span>VantaHost Studio</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.api') ?: 'active' }}">
                            <a href="{{ route('admin.api.index')}}">
                                <i data-lucide="webhook"></i> <span>Application API</span>
                            </a>
                        </li>
                        <li class="header">MANAGEMENT</li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.databases') ?: 'active' }}">
                            <a href="{{ route('admin.databases') }}">
                                <i data-lucide="database"></i> <span>Databases</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.locations') ?: 'active' }}">
                            <a href="{{ route('admin.locations') }}">
                                <i data-lucide="globe-2"></i> <span>Locations</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.nodes') ?: 'active' }}">
                            <a href="{{ route('admin.nodes') }}">
                                <i data-lucide="server"></i> <span>Nodes</span>
                            </a>
                        </li>
                        <li class="{{ Route::currentRouteName() !== 'admin.health' ?: 'active' }}">
                            <a href="{{ route('admin.health') }}">
                                <i data-lucide="heart-pulse"></i> <span>Node Health</span>
                                <span class="vh-nav-badge">LIVE</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.servers') ?: 'active' }}">
                            <a href="{{ route('admin.servers') }}">
                                <i data-lucide="terminal-square"></i> <span>Servers</span>
                            </a>
                        </li>
                        <li class="{{ Route::currentRouteName() !== 'admin.servers.trash' ?: 'active' }}">
                            <a href="{{ route('admin.servers.trash') }}">
                                <i data-lucide="trash-2"></i> <span>File Recycle Bin</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.users') ?: 'active' }}">
                            <a href="{{ route('admin.users') }}">
                                <i data-lucide="users"></i> <span>Users</span>
                            </a>
                        </li>
                        <li class="{{ Route::currentRouteName() !== 'admin.roles' ?: 'active' }}">
                            <a href="{{ route('admin.roles') }}">
                                <i data-lucide="shield-check"></i> <span>Staff Roles</span>
                            </a>
                        </li>
                        <li class="header">SECURITY & OPERATIONS</li>
                        <li class="{{ Route::currentRouteName() !== 'admin.ddos' ?: 'active' }}">
                            <a href="{{ route('admin.ddos') }}">
                                <i data-lucide="shield"></i> <span>DDoS Protection</span>
                            </a>
                        </li>
                        <li class="{{ Route::currentRouteName() !== 'admin.security.blocklist' ?: 'active' }}">
                            <a href="{{ route('admin.security.blocklist') }}">
                                <i data-lucide="shield-ban"></i> <span>IP Blocklist</span>
                            </a>
                        </li>
                        <li class="{{ Route::currentRouteName() !== 'admin.announcements' ?: 'active' }}">
                            <a href="{{ route('admin.announcements') }}">
                                <i data-lucide="megaphone"></i> <span>Announcements</span>
                            </a>
                        </li>
                        <li class="{{ Route::currentRouteName() !== 'admin.alerts' ?: 'active' }}">
                            <a href="{{ route('admin.alerts') }}">
                                <i data-lucide="bell"></i> <span>Resource Alerts</span>
                            </a>
                        </li>
                        <li class="{{ Route::currentRouteName() !== 'admin.backups' ?: 'active' }}">
                            <a href="{{ route('admin.backups') }}">
                                <i data-lucide="archive"></i> <span>Backup Manager</span>
                            </a>
                        </li>
                        <li class="{{ Route::currentRouteName() !== 'admin.activity' ?: 'active' }}">
                            <a href="{{ route('admin.activity') }}">
                                <i data-lucide="list-tree"></i> <span>Audit Logs</span>
                            </a>
                        </li>
                        <li class="header">SERVICE MANAGEMENT</li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.mounts') ?: 'active' }}">
                            <a href="{{ route('admin.mounts') }}">
                                <i data-lucide="folder"></i> <span>Mounts</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.nests') ?: 'active' }}">
                            <a href="{{ route('admin.nests') }}">
                                <i data-lucide="layout-grid"></i> <span>Nests</span>
                            </a>
                        </li>
                    </ul>
                </section>
            </aside>
            <div class="content-wrapper">
                <section class="content-header">
                    @yield('content-header')
                </section>
                <section class="content">
                    <div class="row">
                        <div class="col-xs-12">
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
                        </div>
                    </div>
                    @yield('content')
                </section>
            </div>
            <footer class="main-footer">
                <div class="pull-right vh-runtime-meta">
                    <span><i class="fa fa-fw {{ $appIsGit ? 'fa-git-square' : 'fa-code-fork' }}"></i>{{ $appVersion }}</span>
                    <span><i class="fa fa-fw fa-clock-o"></i>{{ round(microtime(true) - LARAVEL_START, 3) }}s</span>
                </div>
                <strong>VantaHost Control Plane</strong><span class="vh-footer-divider">/</span> Built by Vantablack, a <a href="https://discord.gg/2vx6tCXmr4" target="_blank" rel="noopener noreferrer">Void Development</a> company.
            </footer>
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
