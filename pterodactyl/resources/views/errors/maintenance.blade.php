<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ config('app.name', 'Pterodactyl') }} ? Maintenance</title>
        <style>
            body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #131a20; color: #e5e7eb; font-family: system-ui, sans-serif; }
            main { max-width: 34rem; padding: 2.5rem; text-align: center; }
            h1 { margin: 0 0 1rem; font-size: 1.875rem; }
            p { margin: 0; color: #9ca3af; line-height: 1.6; }
        </style>
    </head>
    <body>
        <main>
            <h1>We'll be back soon.</h1>
            <p>This panel is temporarily unavailable while maintenance is being performed.</p>
        </main>
    </body>
</html>
