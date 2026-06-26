<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $staffId = $this->route('staff')?->id;

        return [
            'name' => ['sometimes', 'required', 'string', 'min:2', 'max:100'],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:150', Rule::unique('users', 'email')->ignore($staffId)],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'role' => ['sometimes', 'required', Rule::in([User::ROLE_LIBRARIAN, User::ROLE_HEAD])],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
