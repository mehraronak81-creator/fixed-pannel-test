<?php

namespace Pterodactyl\Http\Requests\Admin;

class StoreHealthSettingsRequest extends AdminFormRequest
{
    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'cpu_warning' => ['required', 'integer', 'min:1', 'max:100'],
            'memory_warning' => ['required', 'integer', 'min:1', 'max:100'],
            'disk_warning' => ['required', 'integer', 'min:1', 'max:100'],
            'latency_warning' => ['required', 'integer', 'min:100', 'max:30000'],
            'refresh_seconds' => ['required', 'integer', 'min:10', 'max:300'],
        ];
    }
}