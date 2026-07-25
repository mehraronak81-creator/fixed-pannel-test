<?php

namespace Pterodactyl\Http\Requests\Admin\Vantablack;

use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class VantablackAnnouncementRequest extends AdminFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'vantablack:announcementType' => 'required|string',
            'vantablack:announcementMessage' => 'nullable|string',
            'vantablack:announcementCloseable' => 'required|in:true,false',
        ];
    }
}