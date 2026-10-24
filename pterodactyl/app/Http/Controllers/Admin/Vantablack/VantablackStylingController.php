<?php

namespace Pterodactyl\Http\Controllers\Admin\Vantablack;

use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Http\Requests\Admin\Vantablack\VantablackStylingRequest;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class VantablackStylingController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
        private SettingsRepositoryInterface $settings
    ) {
    }

    public function index(): View
    {
        return view('admin.vantablack.styling', [
            'backgroundImage' => $this->settings->get('settings::vantablack:backgroundImage', '/vantablack/background-login.png'),
            'backgroundImageLight' => $this->settings->get('settings::vantablack:backgroundImageLight', 'none'),
            'backdrop' => $this->settings->get('settings::vantablack:backdrop', false),
            'backdropPercentage' => $this->settings->get('settings::vantablack:backdropPercentage', '100%'),
            'defaultMode' => $this->settings->get('settings::vantablack:defaultMode', 'darkmode'),
            'font' => $this->settings->get('settings::vantablack:font', 'Inter'),
            'buttonStyle' => $this->settings->get('settings::vantablack:buttonStyle', 'solid'),
            'cardStyle' => $this->settings->get('settings::vantablack:cardStyle', 'elevated'),
            'uiDensity' => $this->settings->get('settings::vantablack:uiDensity', 'comfortable'),
            'buttonWeight' => $this->settings->get('settings::vantablack:buttonWeight', '600'),
            'copyright' => $this->settings->get('settings::vantablack:copyright', 'VantaHost - Built by Vantablack, a Void Development company.'),
            'radiusInput' => $this->settings->get('settings::vantablack:radiusInput', '7px'),
            'borderInput' => $this->settings->get('settings::vantablack:borderInput', true),
            'radiusBox' => $this->settings->get('settings::vantablack:radiusBox', '10px'),
            'flashMessage' => $this->settings->get('settings::vantablack:flashMessage', 1),
            'pageTitle' => $this->settings->get('settings::vantablack:pageTitle', true),
            'loginBackground' => $this->settings->get('settings::vantablack:loginBackground', '/vantablack/background-login.png'),
            'loginGradient' => $this->settings->get('settings::vantablack:loginGradient', false),
        ]);
    }

    public function store(VantablackStylingRequest $request): RedirectResponse
    {
        foreach ($request->validated() as $key => $value) {
            $this->settings->set('settings::' . $key, $value ?? '');
        }

        $this->alert->success('Vantablack styling settings have been updated.')->flash();

        return redirect()->route('admin.vantablack.styling');
    }
}
