<?php

use App\Models\User;
use App\Models\Cour;
use App\Models\Organisation;
use App\Models\Inscription;

beforeEach(function () {
    Organisation::create(['nom' => 'Test Org', 'slug' => 'test-org', 'email' => 'test@test.com']);
});

it('allows an enrolled student to leave a course', function () {
    $student = User::factory()->create(['role' => 'etudiant', 'organisation_id' => 1]);
    $teacher = User::factory()->create(['role' => 'prof', 'organisation_id' => 1]);
    
    // Utiliser la factory pour créer le cours afin de respecter les contraintes SQL (statut, etc.)
    $course = Cour::factory()->create([
        'prof_id' => $teacher->id,
        'organisation_id' => 1
    ]);

    // Inscrire l'étudiant
    Inscription::create([
        'etudiant_id' => $student->id,
        'cours_id' => $course->id,
        'statut' => 'actif',
        'progression' => 0
    ]);

    expect(Inscription::where('etudiant_id', $student->id)->where('cours_id', $course->id)->exists())->toBeTrue();

    $this->actingAs($student);

    // Appeler la route de désinscription
    $response = $this->delete(route('courses.quitter', $course->id));

    expect($response->status())->toBe(302);
    $response->assertRedirect(route('courses.index'));

    // Vérifier que l'étudiant n'est plus inscrit
    expect(Inscription::where('etudiant_id', $student->id)->where('cours_id', $course->id)->exists())->toBeFalse();
});
