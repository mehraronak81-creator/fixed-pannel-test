@php
    $vantablackAppearance = $siteConfiguration['vantablack'];
    $fontMap = [
        'Inter' => 'Inter',
        'Roboto' => 'Roboto',
        'Rubik' => 'Rubik',
        'IBM Plex Sans' => 'IBM Plex Sans',
        'system-ui' => 'system-ui',
    ];
    $fontFamily = $fontMap[$vantablackAppearance['font'] ?? 'Inter'] ?? $fontMap['Inter'];
    $cardShadows = [
        'flat' => 'none',
        'elevated' => '0 18px 45px rgba(0, 0, 0, 0.24)',
        'glass' => '0 20px 55px rgba(0, 0, 0, 0.2)',
    ];
    $densitySpacing = [
        'compact' => ['padding' => '0.75rem', 'gap' => '0.75rem', 'card' => '1rem'],
        'comfortable' => ['padding' => '1rem', 'gap' => '1rem', 'card' => '1.35rem'],
        'spacious' => ['padding' => '1.5rem', 'gap' => '1.35rem', 'card' => '1.75rem'],
    ];
    $cardStyle = $vantablackAppearance['cardStyle'] ?? 'elevated';
    $density = $densitySpacing[$vantablackAppearance['uiDensity'] ?? 'comfortable'] ?? $densitySpacing['comfortable'];
@endphp
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Rubik:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
    :root {
        --fontFamily: {!! $fontFamily === 'system-ui' ? 'system-ui' : '"' . $fontFamily . '"' !!};
        --radiusBox: {{ $vantablackAppearance['radiusBox'] }};
        --radiusInput: {{ $vantablackAppearance['radiusInput'] }};
        --primary: {{ $vantablackAppearance['primary'] }};
        --vh-primary: {{ $vantablackAppearance['primary'] }};
        --vh-card-radius: {{ $vantablackAppearance['radiusBox'] }};
        --vh-button-radius: {{ $vantablackAppearance['radiusInput'] }};
        --vh-button-weight: {{ $vantablackAppearance['buttonWeight'] }};
        --vh-card-shadow: {{ $cardShadows[$cardStyle] ?? $cardShadows['elevated'] }};
        --vh-content-padding: {{ $density['padding'] }};
        --vh-content-gap: {{ $density['gap'] }};
        --vh-card-padding: {{ $density['card'] }};
    }
</style>
