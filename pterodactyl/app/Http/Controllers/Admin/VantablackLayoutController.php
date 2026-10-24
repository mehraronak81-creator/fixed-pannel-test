<?php

namespace Pterodactyl\Http\Controllers\Admin\Vantablack;

use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Http\Requests\Admin\Vantablack\VantablackLayoutRequest;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class VantablackLayoutController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
        private SettingsRepositoryInterface $settings
    ) {
    }

    public function index(): View
    {
        return view('admin.vantablack.layout', [
            'layout' => $this->settings->get('settings::vantablack:layout', 1),
            'searchComponent' => $this->settings->get('settings::vantablack:searchComponent', 1),
            'logoPosition' => $this->settings->get('settings::vantablack:logoPosition', 1),
            'socialPosition' => $this->settings->get('settings::vantablack:socialPosition', 1),
            'loginLayout' => $this->settings->get('settings::vantablack:loginLayout', 1),
        ]);
    }

    public function store(VantablackLayoutRequest $request): RedirectResponse
    {
        foreach ($request->validated() as $key => $value) {
            $this->settings->set('settings::' . $key, $value ?? '');
        }

        $this->alert->success('Vantablack layout settings have been updated.')->flash();

        return redirect()->route('admin.vantablack.layout');
    }
}
