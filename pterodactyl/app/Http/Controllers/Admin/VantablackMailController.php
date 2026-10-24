<?php

namespace Pterodactyl\Http\Controllers\Admin\Vantablack;

use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Http\Requests\Admin\Vantablack\VantablackMailRequest;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class VantablackMailController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
        private SettingsRepositoryInterface $settings
    ) {
    }

    public function index(): View
    {
        return view('admin.vantablack.mail', [
            'mail_color' => $this->settings->get('settings::vantablack:mail_color', '#4a35cf'),
            'mail_backgroundColor' => $this->settings->get('settings::vantablack:mail_backgroundColor', '#F5F5FF'),
            'mail_logo' => $this->settings->get('settings::vantablack:mail_logo', '/vantablack/Vantablack.png'),
            'mail_logoFull' => $this->settings->get('settings::vantablack:mail_logoFull', false),
            'mail_mode' => $this->settings->get('settings::vantablack:mail_mode', 'light'),

            'mail_discord' => $this->settings->get('settings::vantablack:mail_discord', ''),
            'mail_twitter' => $this->settings->get('settings::vantablack:mail_twitter', ''),
            'mail_facebook' => $this->settings->get('settings::vantablack:mail_facebook', ''),
            'mail_instagram' => $this->settings->get('settings::vantablack:mail_instagram', ''),
            'mail_linkedin' => $this->settings->get('settings::vantablack:mail_linkedin', ''),
            'mail_youtube' => $this->settings->get('settings::vantablack:mail_youtube', ''),

            'mail_status' => $this->settings->get('settings::vantablack:mail_status', ''),
            'mail_billing' => $this->settings->get('settings::vantablack:mail_billing', ''),
            'mail_support' => $this->settings->get('settings::vantablack:mail_support', ''),
        ]);
    }

    public function store(VantablackMailRequest $request): RedirectResponse
    {
        foreach ($request->validated() as $key => $value) {
            $this->settings->set('settings::' . $key, $value ?? '');
        }

        $this->alert->success('Vantablack mail settings have been updated.')->flash();

        return redirect()->route('admin.vantablack.mail');
    }
}
