<?php

namespace Pterodactyl\Http\Requests\Admin\Vantablack;

use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class VantablackMailRequest extends AdminFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'vantablack:mail_color' => 'required|string',
            'vantablack:mail_backgroundColor' => 'required|string',
            'vantablack:mail_logo' => 'required|string',
            'vantablack:mail_logoFull' => 'required|in:true,false',
            'vantablack:mail_mode' => 'required|string',

            'vantablack:mail_discord' => 'nullable|string',
            'vantablack:mail_twitter' => 'nullable|string',
            'vantablack:mail_facebook' => 'nullable|string',
            'vantablack:mail_instagram' => 'nullable|string',
            'vantablack:mail_linkedin' => 'nullable|string',
            'vantablack:mail_youtube' => 'nullable|string',

            'vantablack:mail_status' => 'nullable|string',
            'vantablack:mail_billing' => 'nullable|string',
            'vantablack:mail_support' => 'nullable|string',
        ];
    }
}