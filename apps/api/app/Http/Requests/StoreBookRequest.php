<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreBookRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:2', 'max:150'],
            'author' => ['required', 'string', 'min:2', 'max:100'],
            'publisher' => ['nullable', 'string', 'max:120'],
            'isbn' => ['nullable', 'string', 'max:20', 'unique:books,isbn'],
            'category' => ['nullable', 'string', 'max:60'],
            'published_year' => ['nullable', 'integer', 'min:1450', 'max:'.(date('Y') + 1)],
            'stock' => ['required', 'integer', 'min:0', 'max:1000000'],
            'description' => ['nullable', 'string', 'max:2000'],
            'cover_url' => ['nullable', 'url', 'max:500'],
        ];
    }
}
