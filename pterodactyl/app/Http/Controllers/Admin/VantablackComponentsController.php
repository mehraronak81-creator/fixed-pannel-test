<?php

namespace Pterodactyl\Http\Controllers\Admin\Vantablack;

use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Http\Requests\Admin\Vantablack\VantablackComponentsRequest;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class VantablackComponentsController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
        private SettingsRepositoryInterface $settings
    ) {
    }

    public function index(): View
    {
        return view('admin.vantablack.components', [
            'serverRow' => $this->settings->get('settings::vantablack:serverRow', 1),
            'socialButtons' => $this->settings->get('settings::vantablack:socialButtons', false),
            'discordBox' => $this->settings->get('settings::vantablack:discordBox', true),
            'modsInstaller' => $this->settings->get('settings::vantablack:modsInstaller', true),
            'modsDefaultLoader' => $this->settings->get('settings::vantablack:modsDefaultLoader', 'fabric'),
            'modsDefaultVersion' => $this->settings->get('settings::vantablack:modsDefaultVersion', ''),

            'statsCards' => $this->settings->get('settings::vantablack:statsCards', 1),
            'sideGraphs' => $this->settings->get('settings::vantablack:sideGraphs', 2),
            'graphs' => $this->settings->get('settings::vantablack:graphs', 2),

            'slot1' => $this->settings->get('settings::vantablack:slot1', 'disabled'),
            'slot2' => $this->settings->get('settings::vantablack:slot2', 'disabled'),
            'slot3' => $this->settings->get('settings::vantablack:slot3', 'disabled'),
            'slot4' => $this->settings->get('settings::vantablack:slot4', 'disabled'),
            'slot5' => $this->settings->get('settings::vantablack:slot5', 'disabled'),
            'slot6' => $this->settings->get('settings::vantablack:slot6', 'disabled'),
            'slot7' => $this->settings->get('settings::vantablack:slot7', 'disabled'),
        ]);
    }

    public function store(VantablackComponentsRequest $request): RedirectResponse
    {
        foreach ($request->validated() as $key => $value) {
            $this->settings->set('settings::' . $key, $value ?? '');
        }

        $this->alert->success('Vantablack component settings have been updated.')->flash();

        return redirect()->route('admin.vantablack.components');
    }
}
