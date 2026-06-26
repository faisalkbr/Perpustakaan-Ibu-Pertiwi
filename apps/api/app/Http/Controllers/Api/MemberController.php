<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMemberRequest;
use App\Http\Requests\UpdateMemberRequest;
use App\Http\Resources\MemberResource;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MemberController extends Controller
{
    /**
     * GET /api/v1/members — list members (librarian). ?search=, ?status=active|inactive
     */
    public function index(Request $request)
    {
        $members = User::query()
            ->members()
            ->withCount(['loans as active_loans_count' => fn ($q) => $q->whereIn('status', Loan::OPEN_STATUSES)])
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = $request->query('search');
                $q->where(fn ($w) => $w->where('name', 'like', "%{$term}%")->orWhere('email', 'like', "%{$term}%"));
            })
            ->when($request->query('status') === 'active', fn ($q) => $q->where('is_active', true))
            ->when($request->query('status') === 'inactive', fn ($q) => $q->where('is_active', false))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return MemberResource::collection($members);
    }

    /**
     * POST /api/v1/members
     */
    public function store(StoreMemberRequest $request)
    {
        $data = $request->validated();
        $data['role'] = User::ROLE_MEMBER;
        $data['password'] = $data['password'] ?? 'password';
        $data['is_active'] = $data['is_active'] ?? true;

        $member = User::create($data);

        return MemberResource::make($member)->response()->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * GET /api/v1/members/{member}
     */
    public function show(User $member)
    {
        abort_unless($member->role === User::ROLE_MEMBER, Response::HTTP_NOT_FOUND);

        return MemberResource::make($member);
    }

    /**
     * PATCH /api/v1/members/{member}
     */
    public function update(UpdateMemberRequest $request, User $member)
    {
        abort_unless($member->role === User::ROLE_MEMBER, Response::HTTP_NOT_FOUND);

        $member->update($request->validated());

        return MemberResource::make($member);
    }

    /**
     * DELETE /api/v1/members/{member}
     */
    public function destroy(User $member)
    {
        abort_unless($member->role === User::ROLE_MEMBER, Response::HTTP_NOT_FOUND);

        $member->delete();

        return response()->noContent();
    }
}
