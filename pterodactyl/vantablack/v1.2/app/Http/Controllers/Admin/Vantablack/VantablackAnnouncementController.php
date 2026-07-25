<?php

namespace Pterodactyl\Http\Controllers\Admin\Vantablack;

use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Http\Requests\Admin\Vantablack\VantablackAnnouncementRequest;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class VantablackAnnouncementController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
        private SettingsRepositoryInterface $settings
    ) {
    }

    public function index(): View
    {
        return view('admin.vantablack.announcement', [
            'announcementType' => $this->settings->get('settings::vantablack:announcementType', 'party'),
            'announcementCloseable' => $this->settings->get('settings::vantablack:announcementCloseable', false),
            'announcementMessage' => $this->settings->get('settings::vantablack:announcementMessage', 'We have a brand new game panel design!'),
        ]);
    }

    public function store(VantablackAnnouncementRequest $request): RedirectResponse
    {
        foreach ($request->validated() as $key => $value) {
            $this->settings->set('settings::' . $key, $value ?? '');
        }

        $this->alert->success('Vantablack announcement settings have been updated.')->flash();

        return redirect()->route('admin.vantablack.announcement');
    }
}
