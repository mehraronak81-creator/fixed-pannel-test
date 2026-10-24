<?php

namespace Pterodactyl\Http\Controllers\Admin\Vantablack;

use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Http\Requests\Admin\Vantablack\VantablackRequest;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class VantablackController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
        private SettingsRepositoryInterface $settings
    ) {
    }

    public function index(): View
    {
        return view('admin.vantablack.index', [
            'logo' => $this->settings->get('settings::vantablack:logo', '/vantablack/Vantablack.png'),
            'fullLogo' => $this->settings->get('settings::vantablack:fullLogo', false),
            'logoHeight' => $this->settings->get('settings::vantablack:logoHeight', '32px'),
            'discord' => $this->settings->get('settings::vantablack:discord', 'none'),
            'support' => $this->settings->get('settings::vantablack:support', 'https://discord.gg/2vx6tCXmr4'),
            'status' => $this->settings->get('settings::vantablack:status', ''),
            'billing' => $this->settings->get('settings::vantablack:billing', ''),
        ]);
    }

    public function store(VantablackRequest $request): RedirectResponse
    {
        foreach ($request->validated() as $key => $value) {
            $this->settings->set('settings::' . $key, $value ?? '');
        }

        $this->alert->success('Vantablack settings have been updated.')->flash();

        return redirect()->route('admin.vantablack');
    }
}
