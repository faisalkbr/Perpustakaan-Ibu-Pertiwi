<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/v1/auth/register
     */
    public function register(RegisterRequest $request)
    {
        $user = User::create($request->validated());

        $token = $user->createToken('spa')->plainTextToken;

        return response()->json([
            'user' => $user->only('id', 'name', 'email', 'role'),
            'token' => $token,
        ], Response::HTTP_CREATED);
    }

    /**
     * POST /api/v1/auth/login
     */
    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->validated('email'))->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        $token = $user->createToken('spa')->plainTextToken;

        return response()->json([
            'user' => $user->only('id', 'name', 'email', 'role'),
            'token' => $token,
        ]);
    }

    /**
     * GET /api/v1/auth/me
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->only('id', 'name', 'email', 'role'),
        ]);
    }

    /**
     * POST /api/v1/auth/logout — revokes the token used for the request.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }
}
