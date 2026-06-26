<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LibrarianFlowTest extends TestCase
{
    use RefreshDatabase;

    private function librarian(): User
    {
        return User::factory()->role(User::ROLE_LIBRARIAN)->create();
    }

    private function member(): User
    {
        return User::factory()->role(User::ROLE_MEMBER)->create();
    }

    public function test_member_cannot_access_librarian_endpoints(): void
    {
        Sanctum::actingAs($this->member());

        $this->getJson('/api/v1/members')->assertForbidden();
        $this->getJson('/api/v1/librarian/loans')->assertForbidden();
        $this->postJson('/api/v1/books', [])->assertForbidden();
    }

    public function test_librarian_can_list_and_create_members(): void
    {
        Sanctum::actingAs($this->librarian());
        User::factory()->count(3)->role(User::ROLE_MEMBER)->create();

        $this->getJson('/api/v1/members')->assertOk()->assertJsonStructure(['data', 'meta']);

        $this->postJson('/api/v1/members', [
            'name' => 'Anggota Baru',
            'email' => 'baru@member.test',
            'phone' => '0812-0000-0000',
        ])->assertCreated();

        $this->assertDatabaseHas('users', ['email' => 'baru@member.test', 'role' => 'member']);
    }

    public function test_librarian_can_approve_pending_loan(): void
    {
        $librarian = $this->librarian();
        $book = Book::factory()->create(['stock' => 2]);
        $loan = Loan::factory()->for($this->member())->for($book)->create();

        Sanctum::actingAs($librarian);

        $this->postJson("/api/v1/librarian/loans/{$loan->id}/approve")
            ->assertOk()
            ->assertJsonPath('data.display_status', 'active');

        $this->assertNotNull($loan->fresh()->borrowed_at);
        $this->assertNotNull($loan->fresh()->due_date);
    }

    public function test_returning_a_late_loan_charges_a_fine(): void
    {
        $book = Book::factory()->create(['stock' => 1]);
        $loan = Loan::factory()->for($this->member())->for($book)->create([
            'status' => Loan::STATUS_ACTIVE,
            'borrowed_at' => now()->subDays(20),
            'due_date' => now()->subDays(6),
        ]);

        Sanctum::actingAs($this->librarian());

        $this->postJson("/api/v1/librarian/loans/{$loan->id}/return")
            ->assertOk()
            ->assertJsonPath('data.display_status', 'late');

        $this->assertSame(6 * Loan::FINE_PER_DAY, $loan->fresh()->fine);
    }

    public function test_member_can_borrow_an_available_book(): void
    {
        $book = Book::factory()->create(['stock' => 1]);

        Sanctum::actingAs($this->member());

        $this->postJson('/api/v1/loans', ['book_id' => $book->id])
            ->assertCreated()
            ->assertJsonPath('data.display_status', 'pending');
    }
}
