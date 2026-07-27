<?php

namespace Pterodactyl\Http\Requests\Admin\Vantablack;

use Illuminate\Validation\Rule;
use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class VantablackMetaRequest extends AdminFormRequest
{
    /**
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'vantablack:meta_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'vantablack:meta_title' => 'required|string|max:70',
            'vantablack:meta_site_name' => 'required|string|max:70',
            'vantablack:meta_description' => 'required|string|max:180',
            'vantablack:meta_image' => 'required|string|max:2048',
            'vantablack:meta_favicon' => 'required|string|max:2048',
            'vantablack:meta_canonical' => 'nullable|string|max:2048',
            'vantablack:meta_robots' => ['required', Rule::in(['index,follow', 'noindex,follow', 'noindex,nofollow'])],
        ];
    }
}
