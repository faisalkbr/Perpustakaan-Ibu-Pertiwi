<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\LibrarianLoanController;
use App\Http\Controllers\Api\LoanController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\StaffController;
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

        // ---- Shared reads (any authenticated user) ----
        Route::get('categories', [CategoryController::class, 'index']);
        Route::get('books', [BookController::class, 'index']);
        Route::get('books/{book}', [BookController::class, 'show']);

        // ---- Member borrowing flow ----
        Route::get('loans', [LoanController::class, 'index']);
        Route::post('loans', [LoanController::class, 'store']);
        Route::get('loans/{loan}', [LoanController::class, 'show']);

        // ---- Librarian / Head only ----
        Route::middleware('role:librarian,head')->group(function (): void {
            // Manage books
            Route::post('books', [BookController::class, 'store']);
            Route::match(['put', 'patch'], 'books/{book}', [BookController::class, 'update']);
            Route::delete('books/{book}', [BookController::class, 'destroy']);

            // Manage members
            Route::apiResource('members', MemberController::class);

            // Loan workflow
            Route::get('librarian/loans', [LibrarianLoanController::class, 'index']);
            Route::get('librarian/loans/counts', [LibrarianLoanController::class, 'counts']);
            Route::post('librarian/loans/{loan}/approve', [LibrarianLoanController::class, 'approve']);
            Route::post('librarian/loans/{loan}/reject', [LibrarianLoanController::class, 'reject']);
            Route::post('librarian/loans/{loan}/return', [LibrarianLoanController::class, 'returnBook']);
        });

        // ---- Head librarian only ----
        Route::middleware('role:head')->group(function (): void {
            // Manage staff accounts (librarian / head)
            Route::apiResource('staff', StaffController::class);

            // Reports & recap
            Route::get('reports/summary', [ReportController::class, 'summary']);
        });
    });
});
