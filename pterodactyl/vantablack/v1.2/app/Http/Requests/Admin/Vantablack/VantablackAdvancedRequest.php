<?php

namespace Pterodactyl\Http\Requests\Admin\Vantablack;

use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class VantablackAdvancedRequest extends AdminFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'vantablack:profileType' => 'required|string',
            'vantablack:modeToggler' => 'required|in:true,false',
            'vantablack:langSwitch' => 'required|in:true,false',
            'vantablack:ipFlag' => 'required|in:true,false',
            'vantablack:lowResourcesAlert' => 'required|in:true,false',
        ];
    }
}