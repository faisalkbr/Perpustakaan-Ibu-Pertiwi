<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStaffRequest;
use App\Http\Requests\UpdateStaffRequest;
use App\Http\Resources\StaffResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class StaffController extends Controller
{
    /**
     * GET /api/v1/staff — list staff accounts (head only). ?search=, ?role=, ?status=
     */
    public function index(Request $request)
    {
        $staff = User::query()
            ->staff()
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = $request->query('search');
                $q->where(fn ($w) => $w->where('name', 'like', "%{$term}%")->orWhere('email', 'like', "%{$term}%"));
            })
            ->when(
                in_array($request->query('role'), [User::ROLE_LIBRARIAN, User::ROLE_HEAD], true),
                fn ($q) => $q->where('role', $request->query('role'))
            )
            ->when($request->query('status') === 'active', fn ($q) => $q->where('is_active', true))
            ->when($request->query('status') === 'inactive', fn ($q) => $q->where('is_active', false))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return StaffResource::collection($staff);
    }

    /**
     * POST /api/v1/staff
     */
    public function store(StoreStaffRequest $request)
    {
        $data = $request->validated();
        $data['password'] = $data['password'] ?? 'password';
        $data['is_active'] = $data['is_active'] ?? true;

        $staff = User::create($data);

        return StaffResource::make($staff)->response()->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * GET /api/v1/staff/{staff}
     */
    public function show(User $staff)
    {
        $this->assertStaff($staff);

        return StaffResource::make($staff);
    }

    /**
     * PATCH /api/v1/staff/{staff}
     */
    public function update(UpdateStaffRequest $request, User $staff)
    {
        $this->assertStaff($staff);

        $data = $request->validated();

        // The head cannot demote or deactivate their own account — prevents lockout.
        if ($staff->is($request->user())) {
            if (array_key_exists('role', $data) && $data['role'] !== User::ROLE_HEAD) {
                throw ValidationException::withMessages([
                    'role' => ['Anda tidak dapat mengubah peran akun Anda sendiri.'],
                ]);
            }
            if (array_key_exists('is_active', $data) && ! $data['is_active']) {
                throw ValidationException::withMessages([
                    'is_active' => ['Anda tidak dapat menonaktifkan akun Anda sendiri.'],
                ]);
            }
        }

        $staff->update($data);

        return StaffResource::make($staff);
    }

    /**
     * DELETE /api/v1/staff/{staff}
     */
    public function destroy(Request $request, User $staff)
    {
        $this->assertStaff($staff);

        if ($staff->is($request->user())) {
            throw ValidationException::withMessages([
                'staff' => ['Anda tidak dapat menghapus akun Anda sendiri.'],
            ]);
        }

        $staff->delete();

        return response()->noContent();
    }

    /**
     * Ensure the bound user is actually a staff account (not a member).
     */
    private function assertStaff(User $staff): void
    {
        abort_unless(
            in_array($staff->role, [User::ROLE_LIBRARIAN, User::ROLE_HEAD], true),
            Response::HTTP_NOT_FOUND
        );
    }
}
