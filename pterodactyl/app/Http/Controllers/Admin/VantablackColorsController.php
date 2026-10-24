<?php

namespace Pterodactyl\Http\Controllers\Admin\Vantablack;

use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Http\Requests\Admin\Vantablack\VantablackColorsRequest;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class VantablackColorsController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
        private SettingsRepositoryInterface $settings
    ) {
    }

    public function index(): View
    {
        return view('admin.vantablack.colors', [
            'primary' => $this->settings->get('settings::vantablack:primary', '#4A35CF'),

            'successText' => $this->settings->get('settings::vantablack:successText', '#E1FFD8'),
            'successBorder' => $this->settings->get('settings::vantablack:successBorder', '#56AA2B'),
            'successBackground' => $this->settings->get('settings::vantablack:successBackground', '#3D8F1F'),

            'dangerText' => $this->settings->get('settings::vantablack:dangerText', '#FFD8D8'),
            'dangerBorder' => $this->settings->get('settings::vantablack:dangerBorder', '#AA2A2A'),
            'dangerBackground' => $this->settings->get('settings::vantablack:dangerBackground', '#8F1F20'),

            'secondaryText' => $this->settings->get('settings::vantablack:secondaryText', '#B2B2C1'),
            'secondaryBorder' => $this->settings->get('settings::vantablack:secondaryBorder', '#42425B'),
            'secondaryBackground' => $this->settings->get('settings::vantablack:secondaryBackground', '#2B2B40'),

            'gray50' => $this->settings->get('settings::vantablack:gray50', '#F4F4F4'),
            'gray100' => $this->settings->get('settings::vantablack:gray100', '#D5D5DB'),
            'gray200' => $this->settings->get('settings::vantablack:gray200', '#B2B2C1'),
            'gray300' => $this->settings->get('settings::vantablack:gray300', '#8282A4'),
            'gray400' => $this->settings->get('settings::vantablack:gray400', '#5E5E7F'),
            'gray500' => $this->settings->get('settings::vantablack:gray500', '#42425B'),
            'gray600' => $this->settings->get('settings::vantablack:gray600', '#2B2B40'),
            'gray700' => $this->settings->get('settings::vantablack:gray700', '#1D1D37'),
            'gray800' => $this->settings->get('settings::vantablack:gray800', '#0B0D2A'),
            'gray900' => $this->settings->get('settings::vantablack:gray900', '#040519'),

            'lightmode_primary' => $this->settings->get('settings::vantablack:lightmode_primary', '#4A35CF'),

            'lightmode_successText' => $this->settings->get('settings::vantablack:lightmode_successText', '#E1FFD8'),
            'lightmode_successBorder' => $this->settings->get('settings::vantablack:lightmode_successBorder', '#56AA2B'),
            'lightmode_successBackground' => $this->settings->get('settings::vantablack:lightmode_successBackground', '#3D8F1F'),

            'lightmode_dangerText' => $this->settings->get('settings::vantablack:lightmode_dangerText', '#FFD8D8'),
            'lightmode_dangerBorder' => $this->settings->get('settings::vantablack:lightmode_dangerBorder', '#AA2A2A'),
            'lightmode_dangerBackground' => $this->settings->get('settings::vantablack:lightmode_dangerBackground', '#8F1F20'),

            'lightmode_secondaryText' => $this->settings->get('settings::vantablack:lightmode_secondaryText', '#46464D'),
            'lightmode_secondaryBorder' => $this->settings->get('settings::vantablack:lightmode_secondaryBorder', '#C0C0D3'),
            'lightmode_secondaryBackground' => $this->settings->get('settings::vantablack:lightmode_secondaryBackground', '#A6A7BD'),

            'lightmode_gray50' => $this->settings->get('settings::vantablack:lightmode_gray50', '#141415'),
            'lightmode_gray100' => $this->settings->get('settings::vantablack:lightmode_gray100', '#27272C'),
            'lightmode_gray200' => $this->settings->get('settings::vantablack:lightmode_gray200', '#46464D'),
            'lightmode_gray300' => $this->settings->get('settings::vantablack:lightmode_gray300', '#626272'),
            'lightmode_gray400' => $this->settings->get('settings::vantablack:lightmode_gray400', '#757689'),
            'lightmode_gray500' => $this->settings->get('settings::vantablack:lightmode_gray500', '#A6A7BD'),
            'lightmode_gray600' => $this->settings->get('settings::vantablack:lightmode_gray600', '#C0C0D3'),
            'lightmode_gray700' => $this->settings->get('settings::vantablack:lightmode_gray700', '#E7E7EF'),
            'lightmode_gray800' => $this->settings->get('settings::vantablack:lightmode_gray800', '#F0F1F5'),
            'lightmode_gray900' => $this->settings->get('settings::vantablack:lightmode_gray900', '#FFFFFF'),
        ]);
    }

    public function store(VantablackColorsRequest $request): RedirectResponse
    {
        foreach ($request->validated() as $key => $value) {
            $this->settings->set('settings::' . $key, $value ?? '');
        }

        $this->alert->success('Vantablack color settings have been updated.')->flash();

        return redirect()->route('admin.vantablack.colors');
    }
}
