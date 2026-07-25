<?php

namespace Pterodactyl\Http\Requests\Admin\Vantablack;

use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class VantablackLayoutRequest extends AdminFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'vantablack:layout' => 'required|numeric',
            'vantablack:searchComponent' => 'required|numeric',

            'vantablack:logoPosition' => 'required|numeric',
            'vantablack:socialPosition' => 'required|numeric',
            'vantablack:loginLayout' => 'required|numeric',
        ];
    }
}