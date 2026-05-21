<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\OrganisationController;
use App\Http\Controllers\Api\CourController;
use App\Http\Controllers\Api\SessionController;
use App\Http\Controllers\Api\RessourceController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\InscriptionController;

Route::middleware('api').group(function () {
    Route::apiResource('users', UserController::class);
    Route::apiResource('organisations', OrganisationController::class);
    Route::apiResource('cours', CourController::class);
    Route::apiResource('sessions', SessionController::class);
    Route::get('/cours/{courseId}/sessions', [SessionController::class, 'forCourse']);