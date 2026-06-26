<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\LoanController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1 routes
|--------------------------------------------------------------------------
| All routes here are prefixed with /api by the framework; the group below
| adds /v1, so the base path the React app talks to is: /api/v1
*/

Route::prefix('v1')->group(function (): void {
    // ---- Public auth endpoints ----
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);

    // ---- Protected endpoints (Sanctum bearer token) ----
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);

        Route::get('categories', [CategoryController::class, 'index']);
        Route::apiResource('books', BookController::class);

        // Member borrowing flow
        Route::get('loans', [LoanController::class, 'index']);
        Route::post('loans', [LoanController::class, 'store']);
        Route::get('loans/{loan}', [LoanController::class, 'show']);
    });
});
