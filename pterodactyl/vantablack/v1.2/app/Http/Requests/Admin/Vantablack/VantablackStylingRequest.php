<?php

namespace Pterodactyl\Http\Requests\Admin\Vantablack;

use Illuminate\Validation\Rule;
use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class VantablackStylingRequest extends AdminFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'vantablack:backgroundImage' => 'nullable|string',
            'vantablack:backgroundImageLight' => 'nullable|string',
            'vantablack:backdrop' => 'required|in:true,false',
            'vantablack:backdropPercentage' => 'required|string',
            'vantablack:defaultMode' => ['required', Rule::in(['darkmode', 'lightmode'])],
            'vantablack:font' => ['required', Rule::in(['Inter', 'Roboto', 'Rubik', 'IBM Plex Sans', 'system-ui'])],
            'vantablack:buttonStyle' => ['required', Rule::in(['solid', 'soft', 'glass'])],
            'vantablack:cardStyle' => ['required', Rule::in(['flat', 'elevated', 'glass'])],
            'vantablack:uiDensity' => ['required', Rule::in(['compact', 'comfortable', 'spacious'])],
            'vantablack:buttonWeight' => ['required', Rule::in(['500', '600', '700'])],
            'vantablack:copyright' => 'required|string',
            'vantablack:radiusInput' => 'required|string',
            'vantablack:borderInput' => 'required|in:true,false',
            'vantablack:radiusBox' => 'required|string',
            'vantablack:flashMessage' => 'required|numeric',
            'vantablack:pageTitle' => 'required|string',
            'vantablack:loginBackground' => 'nullable|string',
            'vantablack:loginGradient' => 'required|in:true,false',
        ];
    }
}
