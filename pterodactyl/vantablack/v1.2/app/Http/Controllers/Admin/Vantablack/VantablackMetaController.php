<?php

namespace Pterodactyl\Http\Controllers\Admin\Vantablack;

use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Http\Requests\Admin\Vantablack\VantablackMetaRequest;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class VantablackMetaController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
        private SettingsRepositoryInterface $settings
    ) {
    }

    public function index(): View
    {
        return view('admin.vantablack.meta', [
            'meta_color' => $this->settings->get('settings::vantablack:meta_color', '#4a35cf'),
            'meta_title' => $this->settings->get('settings::vantablack:meta_title', 'Pterodactyl Panel'),
            'meta_description' => $this->settings->get('settings::vantablack:meta_description', 'Our official Pterodactyl panel'),
            'meta_image' => $this->settings->get('settings::vantablack:meta_image', '/vantablack/meta-tags.png'),
            'meta_favicon' => $this->settings->get('settings::vantablack:meta_favicon', '/vantablack/Vantablack.png'),
        ]);
    }

    public function store(VantablackMetaRequest $request): RedirectResponse
    {
        foreach ($request->validated() as $key => $value) {
            $this->settings->set('settings::' . $key, $value ?? '');
        }

        $this->alert->success('Vantablack meta settings have been updated.')->flash();

        return redirect()->route('admin.vantablack.meta');
    }
}
