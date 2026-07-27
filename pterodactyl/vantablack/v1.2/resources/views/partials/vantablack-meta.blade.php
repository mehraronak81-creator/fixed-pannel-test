@php
    $vantablackMeta = $siteConfiguration['vantablack'];
    $canonicalUrl = trim((string) ($vantablackMeta['meta_canonical'] ?? '')) ?: config('app.url', url('/'));
    $metaImage = (string) ($vantablackMeta['meta_image'] ?? '');
    $faviconUrl = (string) ($vantablackMeta['meta_favicon'] ?? '/favicon.ico');
    $toAbsoluteUrl = static fn (string $value): string => \Illuminate\Support\Str::startsWith($value, ['http://', 'https://']) ? $value : url($value);
@endphp
<meta name="theme-color" content="{{ $vantablackMeta['meta_color'] }}">
<meta name="description" content="{{ $vantablackMeta['meta_description'] }}">
<meta name="robots" content="{{ $vantablackMeta['meta_robots'] }}">
<link rel="canonical" href="{{ $toAbsoluteUrl($canonicalUrl) }}">
<link rel="icon" href="{{ $toAbsoluteUrl($faviconUrl) }}">
<link rel="apple-touch-icon" href="{{ $toAbsoluteUrl($faviconUrl) }}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{{ $vantablackMeta['meta_site_name'] }}">
<meta property="og:url" content="{{ $toAbsoluteUrl($canonicalUrl) }}">
<meta property="og:title" content="{{ $vantablackMeta['meta_title'] }}">
<meta property="og:description" content="{{ $vantablackMeta['meta_description'] }}">
<meta property="og:image" content="{{ $toAbsoluteUrl($metaImage) }}">
<meta property="og:locale" content="{{ str_replace('-', '_', $siteConfiguration['locale']) }}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ $vantablackMeta['meta_title'] }}">
<meta name="twitter:description" content="{{ $vantablackMeta['meta_description'] }}">
<meta name="twitter:image" content="{{ $toAbsoluteUrl($metaImage) }}">
