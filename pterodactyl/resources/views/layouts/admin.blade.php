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
            <style>
                /* PURE BLACK BACKGROUND ACROSS THE ENTIRE ADMIN SUITE */
                body,
                body.skin-vantahost,
                .wrapper,
                .skin-vantahost .wrapper,
                .content-wrapper,
                .skin-vantahost .content-wrapper,
                .modal-content {
                    background: #000000 !important;
                    background-color: #000000 !important;
                    background-image: none !important;
                    color: #f5f5f5 !important;
                }

                /* GLASS NAVBAR & SIDEBAR */
                .skin-vantahost .main-header,
                .skin-vantahost .navbar,
                .skin-vantahost .main-sidebar,
                .skin-vantahost .main-header .logo,
                .main-header,
                .main-sidebar,
                .navbar-static-top {
                    background: rgba(6, 6, 8, 0.8) !important;
                    backdrop-filter: blur(20px) !important;
                    -webkit-backdrop-filter: blur(20px) !important;
                    border-color: rgba(255, 255, 255, 0.07) !important;
                }

                .main-footer {
                    background: rgba(6, 6, 8, 0.9) !important;
                    border-top: 1px solid rgba(255, 255, 255, 0.07) !important;
                    color: #71717a !important;
                }

                /* TRANSPARENT LIQUID GLASS CARDS ON ALL INNER ADMIN PAGES */
                .box,
                .box.box-primary,
                .box.box-info,
                .box.box-success,
                .box.box-warning,
                .box.box-danger,
                .box.box-default,
                .skin-vantahost .box,
                .skin-vantahost .info-box,
                .skin-vantahost .small-box,
                .panel,
                .panel-default,
                .panel-primary,
                .panel-info,
                .panel-success,
                .panel-warning,
                .panel-danger,
                .skin-vantahost .panel,
                .vantablack-card,
                .admin-card,
                .vh-metric-card,
                .vh-health-stat,
                .vh-health-node,
                .vh-control-card,
                .modal-content,
                .callout {
                    background: rgba(255, 255, 255, 0.03) !important;
                    background-color: rgba(255, 255, 255, 0.03) !important;
                    backdrop-filter: blur(20px) saturate(180%) !important;
                    -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
                    border: 1px solid rgba(255, 255, 255, 0.09) !important;
                    border-top: 1px solid rgba(255, 255, 255, 0.12) !important;
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.08) !important;
                    border-radius: 12px !important;
                    color: #f5f5f5 !important;
                }

                .box-header,
                .box-body,
                .box-footer,
                .panel-heading,
                .panel-body,
                .panel-footer,
                .modal-header,
                .modal-body,
                .modal-footer {
                    background: transparent !important;
                    background-color: transparent !important;
                    color: #f5f5f5 !important;
                    border-color: rgba(255, 255, 255, 0.07) !important;
                }

                .box-header .box-title,
                .box-header h3,
                .panel-heading h3,
                .modal-title,
                .content-header h1 {
                    color: #ffffff !important;
                    font-weight: 650 !important;
                }

                .content-header > .breadcrumb > li > a,
                .content-header > .breadcrumb > li {
                    color: #a1a1aa !important;
                }

                .content-header > .breadcrumb > li.active {
                    color: #10b981 !important;
                }

                /* CLEAN GLASS TABLES ACROSS USERS, NODES, SERVERS */
                .table,
                .table-striped,
                .table-hover,
                .table-responsive {
                    background: transparent !important;
                }

                .table > thead > tr > th,
                .table > tbody > tr > th,
                .table > tfoot > tr > th,
                .table > thead > tr > td,
                .table > tbody > tr > td,
                .table > tfoot > tr > td,
                .skin-vantahost .table > thead > tr > th,
                .skin-vantahost .table > tbody > tr > td {
                    background: transparent !important;
                    border-top: 1px solid rgba(255, 255, 255, 0.06) !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
                    color: #d4d4d8 !important;
                }

                .table > thead > tr > th,
                .skin-vantahost .table > thead > tr > th {
                    color: #a1a1aa !important;
                    font-size: 11px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                }

                .table-hover > tbody > tr:hover,
                .skin-vantahost .table-hover > tbody > tr:hover,
                table.table tbody tr:hover {
                    background: rgba(255, 255, 255, 0.04) !important;
                }

                /* INPUTS, SELECTS, TEXTAREAS */
                .form-control,
                select.form-control,
                textarea.form-control,
                input[type="text"],
                input[type="password"],
                input[type="email"],
                input[type="number"],
                input[type="search"],
                .select2-container--default .select2-selection--single,
                .select2-container--default .select2-selection--multiple,
                .input-group-addon {
                    background: rgba(0, 0, 0, 0.5) !important;
                    background-color: rgba(0, 0, 0, 0.5) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: #ffffff !important;
                    border-radius: 8px !important;
                    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3) !important;
                }

                .form-control:focus,
                select.form-control:focus,
                textarea.form-control:focus,
                input:focus,
                .select2-container--default.select2-container--open .select2-selection--single {
                    border-color: rgba(16, 185, 129, 0.6) !important;
                    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.18) !important;
                    outline: none !important;
                }

                .select2-dropdown {
                    background: #0a0a0c !important;
                    border: 1px solid rgba(255, 255, 255, 0.12) !important;
                    border-radius: 8px !important;
                    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.8) !important;
                }

                .select2-container--default .select2-results__option--highlighted[aria-selected] {
                    background-color: rgba(16, 185, 129, 0.25) !important;
                    color: #10b981 !important;
                }

                .select2-container--default .select2-results__option[aria-selected=true] {
                    background-color: rgba(255, 255, 255, 0.06) !important;
                }

                /* EMERALD BUTTONS — ZERO LEGACY BLUE/INDIGO BOXES */
                .btn-primary,
                .btn-success,
                .btn-info {
                    background: #10b981 !important;
                    background-image: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
                    border: 1px solid rgba(16, 185, 129, 0.5) !important;
                    color: #ffffff !important;
                    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25) !important;
                    border-radius: 8px !important;
                    transition: all 180ms ease !important;
                }

                .btn-primary:hover,
                .btn-success:hover,
                .btn-info:hover {
                    background: #059669 !important;
                    border-color: #10b981 !important;
                    color: #ffffff !important;
                    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4) !important;
                    transform: translateY(-1px) !important;
                }

                .btn-default {
                    background: rgba(255, 255, 255, 0.05) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: #e4e4e7 !important;
                    border-radius: 8px !important;
                }

                .btn-default:hover {
                    background: rgba(255, 255, 255, 0.09) !important;
                    border-color: rgba(255, 255, 255, 0.2) !important;
                    color: #ffffff !important;
                }

                .btn-warning {
                    background: #f59e0b !important;
                    border-color: #d97706 !important;
                    color: #ffffff !important;
                }

                .btn-danger {
                    background: #ef4444 !important;
                    border-color: #dc2626 !important;
                    color: #ffffff !important;
                }

                /* TABS */
                .nav-tabs,
                .nav-tabs-custom,
                .skin-vantahost .nav-tabs-custom {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
                    background: transparent !important;
                }

                .nav-tabs-custom > .tab-content {
                    background: rgba(255, 255, 255, 0.03) !important;
                    border: 1px solid rgba(255, 255, 255, 0.09) !important;
                    border-radius: 0 0 12px 12px !important;
                }

                .nav-tabs > li > a,
                .nav-tabs-custom > .nav-tabs > li > a {
                    color: #a1a1aa !important;
                    background: transparent !important;
                    border: none !important;
                    border-radius: 8px 8px 0 0 !important;
                }

                .nav-tabs > li.active > a,
                .nav-tabs-custom > .nav-tabs > li.active > a,
                .nav-tabs > li.active:hover > a,
                .nav-tabs-custom > .nav-tabs > li.active:hover > a {
                    background: rgba(16, 185, 129, 0.15) !important;
                    color: #10b981 !important;
                    border-top: 2px solid #10b981 !important;
                    border-left: 1px solid rgba(255, 255, 255, 0.08) !important;
                    border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
                }

                /* PAGINATION */
                .pagination > li > a,
                .pagination > li > span {
                    background: rgba(255, 255, 255, 0.04) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    color: #d4d4d8 !important;
                }

                .pagination > .active > a,
                .pagination > .active > span {
                    background: rgba(16, 185, 129, 0.25) !important;
                    border-color: #10b981 !important;
                    color: #10b981 !important;
                }

                .skin-vantahost a:not(.btn):not(.label):not(.logo):not(.sidebar-toggle):not(.vh-header-action) {
                    color: #f5f5f5 !important;
                    transition: color 150ms ease;
                }
                .skin-vantahost a:not(.btn):not(.label):not(.logo):not(.sidebar-toggle):not(.vh-header-action):hover {
                    color: #10b981 !important;
                }
                .skin-vantahost code,
                .vh-copy-pill {
                    background: rgba(255, 255, 255, 0.05) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    color: #a3a3a3 !important;
                    border-radius: 6px;
                    padding: 3px 8px;
                    font-size: 11px;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    transition: all 180ms ease;
                }
                .vh-copy-pill:hover {
                    background: rgba(255, 255, 255, 0.09) !important;
                    border-color: rgba(255, 255, 255, 0.16) !important;
                    color: #ffffff !important;
                }
                .vh-copy-pill i {
                    font-size: 10px;
                    opacity: 0.6;
                }
                .vh-copy-pill:hover i {
                    opacity: 1;
                    color: #10b981;
                }

                /* OVERRIDE INLINE VANTABLACK BLUE BADGES */
                b[style*="background-color:#17078D"] {
                    background-color: rgba(16, 185, 129, 0.18) !important;
                    color: #34d399 !important;
                    border: 1px solid rgba(16, 185, 129, 0.35) !important;
                }
            </style>

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
                        <li class="{{ Route::currentRouteName() !== 'admin.bandwidth' ?: 'active' }}">
                            <a href="{{ route('admin.bandwidth') }}">
                                <i data-lucide="gauge"></i> <span>Bandwidth Limiter</span>
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
