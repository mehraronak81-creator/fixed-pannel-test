<?php

namespace Pterodactyl\Http\Requests\Admin\Vantablack;

use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class VantablackRequest extends AdminFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'vantablack:logo' => 'required|string',
            'vantablack:fullLogo' => 'required|in:true,false',
            'vantablack:logoHeight' => 'required|string',
            'vantablack:discord' => 'nullable|string',
            'vantablack:support' => 'nullable|string',
            'vantablack:status' => 'nullable|string',
            'vantablack:billing' => 'nullable|string',
        ];
    }
}