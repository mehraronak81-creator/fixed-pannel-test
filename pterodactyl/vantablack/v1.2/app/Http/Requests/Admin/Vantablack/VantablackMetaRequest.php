<?php

namespace Pterodactyl\Http\Requests\Admin\Vantablack;

use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class VantablackMetaRequest extends AdminFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'vantablack:meta_color' => 'required|string',
            'vantablack:meta_title' => 'required|string',
            'vantablack:meta_description' => 'required|string',
            'vantablack:meta_image' => 'required|string',
            'vantablack:meta_favicon' => 'required|string',
        ];
    }
}