<?php

use App\Models\User;
use App\Models\Session;
use App\Models\Cour;
use App\Models\Organisation;
use Carbon\Carbon;

beforeEach(function () {
    Organisation::create(['nom' => 'Test Org', 'slug' => 'test-org', 'email' => 'test@test.com']);
});

it('converts datetime-local input to UTC correctly', function () {
    $user = User::factory()->create(['role' => 'prof', 'organisation_id' => 1]);
    $this->actingAs($user);

    // Simulate what frontend sends: date-local value converted to UTC ISO string
    // User in Paris selects 14:00, frontend converts to UTC: 2026-05-21T12:00:00.000Z
    $frontendValue = '2026-05-21T12:00:00.000Z'; // 14:00 Paris in UTC

    $response = $this->post(route('courses.store'), [
        'titre' => 'Test Cours',
        'type_planification' => 'flexible',
        'sessions' => [
            [
                'titre' => 'Session Test',
                'date_heure' => $frontendValue,
                'duree_minutes' => 60,
                'type' => 'live',
            ],
        ],
    ]);

    expect($response->status())->toBe(302);

    $cour = Cour::where('prof_id', $user->id)->first();
    expect($cour)->not->toBeNull();

    $session = Session::where('cours_id', $cour->id)->first();
    expect($session)->not->toBeNull();

    $dateHeureParsed = Carbon::parse($session->date_heure);
    $dateHeureInParis = $dateHeureParsed->copy()->setTimezone('Europe/Paris');

    expect($dateHeureInParis->format('H:i'))->toBe('14:00')
        ->and($dateHeureParsed->getTimezone()->getName())->toBe('UTC');
});

it('LiveKitController uses UTC timezone for time window', function () {
    $user = User::factory()->create(['role' => 'prof', 'organisation_id' => 1]);
    $this->actingAs($user);
    
    $cour = Cour::factory()->create(['prof_id' => $user->id]);

    $this->post(route('courses.sessions.store', $cour->id), [
        'type' => 'live',
        'date_heure' => Carbon::now('UTC')->addMinutes(5)->toISOString(),
        'duree_minutes' => 60,
    ]);

    $response = $this->get(route('livekit.token'));

    expect($response->status())->toBe(200);
    expect($response->json('token'))->not->toBeNull();
});
