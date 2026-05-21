<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CourseController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [CourseController::class, 'dashboard'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('courses', \App\Http\Controllers\CourseController::class);

    // CRUD Modules
    Route::post('/courses/{course}/modules', [\App\Http\Controllers\ModuleController::class, 'store'])->name('modules.store');
    Route::put('/modules/{module}', [\App\Http\Controllers\ModuleController::class, 'update'])->name('modules.update');
    Route::delete('/modules/{module}', [\App\Http\Controllers\ModuleController::class, 'destroy'])->name('modules.destroy');

    // CRUD Leçons (Sessions de module)
    Route::post('/modules/{module}/sessions', [\App\Http\Controllers\ModuleSessionController::class, 'store'])->name('modules.sessions.store');
    Route::put('/sessions/{session}', [\App\Http\Controllers\ModuleSessionController::class, 'update'])->name('sessions.update');
    Route::delete('/sessions/{session}', [\App\Http\Controllers\ModuleSessionController::class, 'destroy'])->name('sessions.destroy');

    // CRUD Ressources
    Route::post('/courses/{course}/ressources', [\App\Http\Controllers\RessourceController::class, 'store'])->name('ressources.store');
    Route::delete('/ressources/{ressource}', [\App\Http\Controllers\RessourceController::class, 'destroy'])->name('ressources.destroy');

    // Route d'inscription à un cours
    Route::post('/courses/{course}/inscrire', [\App\Http\Controllers\CourseController::class, 'inscrire'])->name('courses.inscrire');
    Route::delete('/courses/{course}/quitter', [\App\Http\Controllers\CourseController::class, 'quitter'])->name('courses.quitter');

    // Sessions de calendrier (live / rediffusion, sans module)
    Route::post('/courses/{course}/sessions', [\App\Http\Controllers\CourseController::class, 'storeSession'])->name('courses.sessions.store');
    Route::delete('/courses/sessions/{session}', [\App\Http\Controllers\CourseController::class, 'destroySession'])->name('courses.sessions.destroy');

    // Page de diffusion en direct (Interface style Meet)
    Route::get('/diffusion', function() {
        return Inertia::render('Diffusion/Show');
    })->name('diffusion');

    // Route d'obtention de token pour LiveKit
    Route::get('/live-token', [\App\Http\Controllers\LiveKitController::class, 'getToken'])->name('livekit.token');

    // Calendrier général
    Route::get('/calendar', [\App\Http\Controllers\CourseController::class, 'generalCalendar'])->name('calendar');
});

require __DIR__.'/auth.php';
