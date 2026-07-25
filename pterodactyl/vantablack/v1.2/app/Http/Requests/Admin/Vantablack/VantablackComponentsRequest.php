<?php

namespace Pterodactyl\Http\Requests\Admin\Vantablack;

use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class VantablackComponentsRequest extends AdminFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'vantablack:serverRow' => 'required|numeric',
            'vantablack:socialButtons' => 'required|in:true,false',
            'vantablack:discordBox' => 'required|in:true,false',

            'vantablack:statsCards' => 'required|numeric',
            'vantablack:sideGraphs' => 'required|numeric',
            'vantablack:graphs' => 'required|numeric',

            'vantablack:slot1' => 'required|string',
            'vantablack:slot2' => 'required|string',
            'vantablack:slot3' => 'required|string',
            'vantablack:slot4' => 'required|string',
            'vantablack:slot5' => 'required|string',
            'vantablack:slot6' => 'required|string',
            'vantablack:slot7' => 'required|string',
        ];
    }
}