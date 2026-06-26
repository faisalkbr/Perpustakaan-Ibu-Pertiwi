<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class HeadFlowTest extends TestCase
{
    use RefreshDatabase;

    private function headUser(): User
    {
        return User::factory()->role(User::ROLE_HEAD)->create();
    }

    private function librarian(): User
    {
        return User::factory()->role(User::ROLE_LIBRARIAN)->create();
    }

    public function test_librarian_cannot_access_head_endpoints(): void
    {
        Sanctum::actingAs($this->librarian());

        $this->getJson('/api/v1/staff')->assertForbidden();
        $this->getJson('/api/v1/reports/summary')->assertForbidden();
        $this->postJson('/api/v1/staff', [])->assertForbidden();
    }

    public function test_head_can_list_and_create_staff(): void
    {
        Sanctum::actingAs($this->headUser());
        User::factory()->count(2)->role(User::ROLE_LIBRARIAN)->create();

        $this->getJson('/api/v1/staff')->assertOk()->assertJsonStructure(['data', 'meta']);

        $this->postJson('/api/v1/staff', [
            'name' => 'Pustakawan Baru',
            'email' => 'baru@perpustakaan.test',
            'role' => User::ROLE_LIBRARIAN,
        ])->assertCreated()->assertJsonPath('data.role', 'librarian');

        $this->assertDatabaseHas('users', [
            'email' => 'baru@perpustakaan.test',
            'role' => 'librarian',
        ]);
    }

    public function test_staff_list_excludes_members(): void
    {
        Sanctum::actingAs($this->headUser());
        User::factory()->role(User::ROLE_MEMBER)->create(['email' => 'member@x.test']);

        $emails = collect($this->getJson('/api/v1/staff')->json('data'))->pluck('email');

        $this->assertNotContains('member@x.test', $emails);
    }

    public function test_head_cannot_deactivate_their_own_account(): void
    {
        $head = $this->headUser();
        Sanctum::actingAs($head);

        $this->patchJson("/api/v1/staff/{$head->id}", ['is_active' => false])
            ->assertStatus(422)
            ->assertJsonValidationErrors('is_active');

        $this->assertTrue($head->fresh()->is_active);
    }

    public function test_report_summary_returns_totals_and_trend(): void
    {
        $head = $this->headUser();
        $member = User::factory()->role(User::ROLE_MEMBER)->create();
        $book = Book::factory()->create(['stock' => 3]);

        Loan::factory()->for($member)->for($book)->create([
            'status' => Loan::STATUS_RETURNED,
            'borrowed_at' => now()->subDays(20),
            'due_date' => now()->subDays(6),
            'returned_at' => now(),
            'fine' => 6 * Loan::FINE_PER_DAY,
        ]);

        Sanctum::actingAs($head);

        $this->getJson('/api/v1/reports/summary?type=denda')
            ->assertOk()
            ->assertJsonPath('data.type', 'denda')
            ->assertJsonPath('data.totals.fines', 6 * Loan::FINE_PER_DAY)
            ->assertJsonStructure([
                'data' => [
                    'period' => ['start', 'end'],
                    'totals' => ['loans', 'fines', 'active', 'returned', 'members', 'books'],
                    'top_book',
                    'trend',
                    'transactions',
                ],
            ]);
    }
}
