<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBookRequest extends FormRequest
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
     * Uses "sometimes" so a PATCH only validates the fields that are present.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $bookId = $this->route('book')?->id;

        return [
            'title' => ['sometimes', 'required', 'string', 'min:2', 'max:150'],
            'author' => ['sometimes', 'required', 'string', 'min:2', 'max:100'],
            'publisher' => ['sometimes', 'nullable', 'string', 'max:120'],
            'isbn' => ['sometimes', 'nullable', 'string', 'max:20', Rule::unique('books', 'isbn')->ignore($bookId)],
            'category' => ['sometimes', 'nullable', 'string', 'max:60'],
            'published_year' => ['sometimes', 'nullable', 'integer', 'min:1450', 'max:'.(date('Y') + 1)],
            'stock' => ['sometimes', 'required', 'integer', 'min:0', 'max:1000000'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'cover_url' => ['sometimes', 'nullable', 'url', 'max:500'],
        ];
    }
}
