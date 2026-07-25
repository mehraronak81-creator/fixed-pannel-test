<?php

namespace Pterodactyl\Http\Requests\Admin\Vantablack;

use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class VantablackColorsRequest extends AdminFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'vantablack:primary' => 'required|string',

            'vantablack:successText' => 'required|string',
            'vantablack:successBorder' => 'required|string',
            'vantablack:successBackground' => 'required|string',

            'vantablack:dangerText' => 'required|string',
            'vantablack:dangerBorder' => 'required|string',
            'vantablack:dangerBackground' => 'required|string',

            'vantablack:secondaryText' => 'required|string',
            'vantablack:secondaryBorder' => 'required|string',
            'vantablack:secondaryBackground' => 'required|string',

            'vantablack:gray50' => 'required|string',
            'vantablack:gray100' => 'required|string',
            'vantablack:gray200' => 'required|string',
            'vantablack:gray300' => 'required|string',
            'vantablack:gray400' => 'required|string',
            'vantablack:gray500' => 'required|string',
            'vantablack:gray600' => 'required|string',
            'vantablack:gray700' => 'required|string',
            'vantablack:gray800' => 'required|string',
            'vantablack:gray900' => 'required|string',


            'vantablack:lightmode_primary' => 'required|string',

            'vantablack:lightmode_successText' => 'required|string',
            'vantablack:lightmode_successBorder' => 'required|string',
            'vantablack:lightmode_successBackground' => 'required|string',

            'vantablack:lightmode_dangerText' => 'required|string',
            'vantablack:lightmode_dangerBorder' => 'required|string',
            'vantablack:lightmode_dangerBackground' => 'required|string',

            'vantablack:lightmode_secondaryText' => 'required|string',
            'vantablack:lightmode_secondaryBorder' => 'required|string',
            'vantablack:lightmode_secondaryBackground' => 'required|string',

            'vantablack:lightmode_gray50' => 'required|string',
            'vantablack:lightmode_gray100' => 'required|string',
            'vantablack:lightmode_gray200' => 'required|string',
            'vantablack:lightmode_gray300' => 'required|string',
            'vantablack:lightmode_gray400' => 'required|string',
            'vantablack:lightmode_gray500' => 'required|string',
            'vantablack:lightmode_gray600' => 'required|string',
            'vantablack:lightmode_gray700' => 'required|string',
            'vantablack:lightmode_gray800' => 'required|string',
            'vantablack:lightmode_gray900' => 'required|string',
        ];
    }
}