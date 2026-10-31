<?php

namespace Pterodactyl\Http\Requests\Admin;

use Pterodactyl\Models\Node;

class NodeFormRequest extends AdminFormRequest
{
    public function rules(): array
    {
        $rules = Node::$validationRules;
        $rules['upload_size'] = 'required|integer|min:1|max:10240';

        return $rules;
    }
}
