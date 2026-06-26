<?php

namespace App\Http\Resources;

use App\Models\Loan;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Loan
 */
class LoanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'display_status' => $this->displayStatus(),
            'borrowed_at' => $this->borrowed_at?->toDateString(),
            'due_date' => $this->due_date?->toDateString(),
            'returned_at' => $this->returned_at?->toDateString(),
            'fine' => $this->fine,
            'days_remaining' => $this->daysRemaining(),
            'book' => BookResource::make($this->whenLoaded('book')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
