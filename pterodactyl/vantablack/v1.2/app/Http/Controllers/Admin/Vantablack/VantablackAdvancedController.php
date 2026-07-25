<?php

namespace Pterodactyl\Http\Controllers\Admin\Vantablack;

use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Http\Requests\Admin\Vantablack\VantablackAdvancedRequest;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class VantablackAdvancedController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
        private SettingsRepositoryInterface $settings
    ) {
    }

    public function index(): View
    {
        return view('admin.vantablack.advanced', [
            'profileType' => $this->settings->get('settings::vantablack:profileType', 'gravatar'),
            'modeToggler' => $this->settings->get('settings::vantablack:modeToggler', true),
            'langSwitch' => $this->settings->get('settings::vantablack:langSwitch', true),
            'ipFlag' => $this->settings->get('settings::vantablack:ipFlag', true),
            'lowResourcesAlert' => $this->settings->get('settings::vantablack:lowResourcesAlert', false),
        ]);
    }

    public function store(VantablackAdvancedRequest $request): RedirectResponse
    {
        foreach ($request->validated() as $key => $value) {
            $this->settings->set('settings::' . $key, $value ?? '');
        }

        $this->alert->success('Vantablack advanced settings have been updated.')->flash();

        return redirect()->route('admin.vantablack.advanced');
    }
}
