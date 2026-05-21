<?php

namespace App\Http\Controllers;

use App\Models\Cour;
use App\Models\Session;
use App\Models\Inscription;
use App\Models\CourHoraire;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseController extends Controller
{
    /**
     * Affiche la liste des cours selon le rôle.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->isTeacher()) {
            $courses = $user->coursEnseignes()->with('sessions')->get();
            $availableCourses = [];
        } else {
            // Étudiant: cours inscrits
            $courses = $user->inscriptions()->with('cour.sessions')->get()->pluck('cour');
            
            // Cours disponibles (tous sauf ceux auxquels il est inscrit)
            $inscritsIds = $user->inscriptions()->pluck('cours_id');
            $availableCourses = Cour::whereNotIn('id', $inscritsIds)->with('sessions')->get();
        }

        // Adapter les données pour le frontend
        $formattedCourses = $courses->map(function ($cour) {
            return [
                'id' => $cour->id,
                'titre' => $cour->titre,
                'categorie' => 'General',
                'progression' => 0, 
                'image' => $cour->image_couverture ?: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBtCOLErSI3tiAadp3mU_JUvjljFi0hT0vxNxxeuVAKNvgUUrSIkbp8_1kWeEUlDuoVKaJb61Xd11N_Y-5436rA6EcNvZWs9dhMlJGE-Q0bM1X2qfQPhjlszhwD9K-umjNaLIdctPxZXl-yijSYy8e6YfRRc861D_leP-2wjXhJm2wJxxNyh06Y0f0eAFChzqJ-nCCTRgEJQFWN5nufo8Y4E2qdf0wxkIDMZyU05J508l7s6ggwRzmst_5UCxbxxiFtvX09-fsJmk',
                'color' => '#ffdf9e',
                'textColor' => '#261a00'
            ];
        });

        $formattedAvailable = collect($availableCourses)->map(function ($cour) {
            return [
                'id' => $cour->id,
                'titre' => $cour->titre,
                'categorie' => 'General',
                'sessions' => $cour->sessions,
                'image' => $cour->image_couverture ?: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBtCOLErSI3tiAadp3mU_JUvjljFi0hT0vxNxxeuVAKNvgUUrSIkbp8_1kWeEUlDuoVKaJb61Xd11N_Y-5436rA6EcNvZWs9dhMlJGE-Q0bM1X2qfQPhjlszhwD9K-umjNaLIdctPxZXl-yijSYy8e6YfRRc861D_leP-2wjXhJm2wJxxNyh06Y0f0eAFChzqJ-nCCTRgEJQFWN5nufo8Y4E2qdf0wxkIDMZyU05J508l7s6ggwRzmst_5UCxbxxiFtvX09-fsJmk',
                'color' => '#ffdf9e',
                'textColor' => '#261a00'
            ];
        });

        return Inertia::render('Courses/Index', [
            'courses' => $formattedCourses,
            'availableCourses' => $formattedAvailable
        ]);
    }

    /**
     * Affiche le formulaire de création de cours.
     */
    public function create()
    {
        return Inertia::render('Courses/Create');
    }

    /**
     * Sauvegarde le nouveau cours et ses sessions.
     */
    public function store(Request $request)
    {
        // 1. Validation de base
        $rules = [
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_couverture' => 'nullable|string',
            'type_planification' => 'required|in:regulier,flexible',
        ];

        // Validation conditionnelle
        if ($request->type_planification === 'flexible') {
            $rules['sessions'] = 'required|array';
            $rules['sessions.*.titre'] = 'nullable|string|max:255';
            $rules['sessions.*.date_heure'] = 'required|date';
            $rules['sessions.*.duree_minutes'] = 'required|integer|min:1';
        } else {
            $rules['horaires'] = 'required|array';
            $rules['horaires.*.jour_semaine'] = 'required|integer|min:0|max:6';
            $rules['horaires.*.heure_debut'] = 'required|date_format:H:i';
            $rules['horaires.*.heure_fin'] = 'required|date_format:H:i|after:horaires.*.heure_debut';
        }

        $validated = $request->validate($rules);

        // 2. Création du cours
        $cour = Cour::create([
            'titre' => $validated['titre'],
            'slug' => \Illuminate\Support\Str::slug($validated['titre']) . '-' . uniqid(),
            'description' => $validated['description'] ?? null,
            'image_couverture' => $validated['image_couverture'] ?? null,
            'prof_id' => $request->user()->id,
            'organisation_id' => $request->user()->organisation_id,
            'statut' => 'brouillon',
            'type_planification' => $validated['type_planification']
        ]);

        // 3. Sauvegarde de la planification
        if ($validated['type_planification'] === 'flexible' && isset($validated['sessions'])) {
            foreach ($validated['sessions'] as $index => $sessionData) {
                $dateHeureUtc = Carbon::parse($sessionData['date_heure'])->setTimezone('UTC');
                $cour->sessions()->create([
                    'titre' => $sessionData['titre'] ?? 'Session ' . ($index + 1),
                    'date_heure' => $dateHeureUtc,
                    'duree_minutes' => $sessionData['duree_minutes'],
                    'type' => 'live',
                    'statut' => 'programmé',
                    'ordre' => $index + 1,
                ]);
            }
        } elseif ($validated['type_planification'] === 'regulier' && isset($validated['horaires'])) {
            foreach ($validated['horaires'] as $horaireData) {
                $cour->horaires()->create([
                    'jour_semaine' => $horaireData['jour_semaine'],
                    'heure_debut' => $horaireData['heure_debut'],
                    'heure_fin' => $horaireData['heure_fin'],
                ]);
            }
        }

        // 4. Redirection vers la liste des cours
        return redirect()->route('courses.index')->with('success', 'Cours créé avec succès !');
    }

    /**
     * Affiche les détails d'un cours spécifique.
     */
    public function show($id)
    {
        $course = Cour::with(['modules.sessions', 'sessions' => function ($query) {
            $query->whereNull('module_id');
        }, 'ressources', 'horaires'])->findOrFail($id);
        
        return Inertia::render('Courses/Show', [
            'course' => $course
        ]);
    }

    /**
     * Supprime le cours et toutes ses relations (sessions, horaires).
     */
    public function destroy($id)
    {
        $course = Cour::findOrFail($id);
        
        // Supprimer manuellement les sessions associées
        $course->sessions()->delete();
        
        // Supprimer manuellement les horaires associés
        $course->horaires()->delete();
        
        // Supprimer le cours
        $course->delete();
        
        return redirect()->route('courses.index')->with('success', 'Cours supprimé avec succès !');
    }

    /**
     * Crée une session de calendrier directement sur le cours (sans module).
     * Utilisé par le bouton "Programmer une Session" dans l'onglet Calendrier.
     */
    public function storeSession(Request $request, Cour $course)
    {
        $validated = $request->validate([
            'titre'         => 'nullable|string|max:255',
            'type'          => 'required|in:live,rediffusion',
            'date_heure'    => 'required|date',
            'duree_minutes' => 'required|integer|min:1',
            'lien_live'     => 'nullable|string|max:2048',
            'lien_video'    => 'nullable|string|max:2048',
        ]);

        $ordre = $course->sessions()->whereNull('module_id')->count() + 1;

        $dateHeureUtc = Carbon::parse($validated['date_heure'])->setTimezone('UTC');

        $course->sessions()->create([
            'titre'         => $validated['titre'] ?? ('Session ' . $ordre),
            'type'          => $validated['type'],
            'date_heure'    => $dateHeureUtc,
            'duree_minutes' => $validated['duree_minutes'],
            'lien_live'     => $validated['lien_live'] ?? null,
            'lien_video'    => $validated['lien_video'] ?? null,
            'statut'        => $validated['type'] === 'live' ? 'programmé' : 'terminé',
            'ordre'         => $ordre,
        ]);

        return redirect()->back()->with('success', 'Session programmée avec succès !');
    }

    /**
     * Supprime une session de calendrier (sans module).
     */
    public function destroySession(Session $session)
    {
        $session->delete();

        return redirect()->back()->with('success', 'Session supprimée avec succès !');
    }

    /**
     * Inscrire un étudiant à un cours.
     */
    public function inscrire(Request $request, Cour $course)
    {
        $user = $request->user();
        
        // Vérifier si déjà inscrit
        $existant = Inscription::where('etudiant_id', $user->id)
            ->where('cours_id', $course->id)
            ->first();
            
        if ($existant) {
            return redirect()->back()->with('error', 'Vous êtes déjà inscrit à ce cours.');
        }
        
        // Créer l'inscription
        Inscription::create([
            'etudiant_id' => $user->id,
            'cours_id' => $course->id,
            'statut' => 'actif',
            'progression' => 0
        ]);
        
        return redirect()->back()->with('success', 'Vous êtes maintenant inscrit à ce cours !');
    }

    /**
     * Désinscrire/Quitter un cours pour un étudiant.
     */
    public function quitter(Request $request, Cour $course)
    {
        $user = $request->user();
        
        \App\Models\Inscription::where('etudiant_id', $user->id)
            ->where('cours_id', $course->id)
            ->delete();
            
        return redirect()->route('courses.index')->with('success', 'Vous avez quitté le cours.');
    }

    /**
     * Affiche le calendrier général avec tous les cours de l'utilisateur.
     */
    public function generalCalendar(Request $request)
    {
        $user = $request->user();
        
        // Récupérer tous les cours de l'utilisateur
        if ($user->isTeacher()) {
            // Professeur : tous ses cours
            $courses = $user->coursEnseignes()->with(['sessions', 'horaires'])->get();
        } else {
            // Étudiant : cours inscrits
            $courses = $user->inscriptions()->with(['cour.sessions', 'cour.horaires'])->get()->pluck('cour');
        }
        
        // Algorithme du programme du jour
        $programmeDuJour = [];
        $now = Carbon::now('UTC');
        $currentDayOfWeek = $now->dayOfWeek; // 0 = Dimanche, 1 = Lundi, etc.
        
        foreach ($courses as $course) {
            // Traitement des sessions flexibles
            foreach ($course->sessions as $session) {
                $sessionDate = Carbon::parse($session->date_heure);
                
                // Vérifier si la session est aujourd'hui
                if ($sessionDate->isSameDay($now)) {
                    $startTime = Carbon::parse($session->date_heure);
                    $endTime = $startTime->copy()->addMinutes($session->duree_minutes);
                    
                    // Calcul marge active (±10 min)
                    $marginStart = $startTime->copy()->subMinutes(10);
                    $marginEnd = $endTime->copy()->addMinutes(10);
                    
                    $isLive = $now->between($marginStart, $marginEnd);
                    
                    $programmeDuJour[] = [
                        'type' => 'session',
                        'id' => $session->id,
                        'titre' => $session->titre,
                        'course_titre' => $course->titre,
                        'course_id' => $course->id,
                        'course_color' => '#ffdf9e',
                        'heure_debut' => $session->date_heure,
                        'duree_minutes' => $session->duree_minutes,
                        'is_live' => $isLive,
                        'type_cours' => $session->type,
                        'lien' => $session->lien_live ?: $session->lien_video
                    ];
                }
            }
            
            // Traitement des horaires réguliers
            foreach ($course->horaires as $horaire) {
                // Convertir jour_semaine (0-6) en index compatible
                // Horaire: 0=Dimanche, 1=Lundi...6=Samedi
                // Carbon: 0=Dimanche, 1=Lundi...6=Samedi
                $horaireDay = (int)$horaire->jour_semaine;
                
                if ($horaireDay === $currentDayOfWeek) {
                    // Projeter sur aujourd'hui
                    $startString = $horaire->heure_debut;
                    $endString = $horaire->heure_fin;
                    
                    $startTime = Carbon::createFromFormat('H:i', $startString, 'UTC')->setDate($now->year, $now->month, $now->day);
                    $endTime = Carbon::createFromFormat('H:i', $endString, 'UTC')->setDate($now->year, $now->month, $now->day);
                    
                    // Calcul marge active
                    $marginStart = $startTime->copy()->subMinutes(10);
                    $marginEnd = $endTime->copy()->addMinutes(10);
                    
                    $isLive = $now->between($marginStart, $marginEnd);
                    
                    $programmeDuJour[] = [
                        'type' => 'horaire',
                        'id' => $horaire->id,
                        'titre' => $course->titre,
                        'course_titre' => $course->titre,
                        'course_id' => $course->id,
                        'course_color' => '#ffdf9e',
                        'heure_debut' => $startTime->toISOString(),
                        'duree_minutes' => $startTime->diffInMinutes($endTime),
                        'is_live' => $isLive,
                        'type_cours' => 'regulier',
                        'lien' => null
                    ];
                }
            }
        }
        
        // Trier par heure de début
        usort($programmeDuJour, function($a, $b) {
            return strcmp($a['heure_debut'], $b['heure_debut']);
        });
        
        return Inertia::render('Calendar/Index', [
            'courses' => $courses->toArray(),
            'programme_du_jour' => $programmeDuJour,
            'today' => $now->toDateString()
        ]);
    }

    /**
     * Affiche le dashboard avec le programme du jour.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        
        if ($user->isTeacher()) {
            $courses = $user->coursEnseignes()->with(['sessions', 'horaires'])->get();
            $recentCourses = $user->coursEnseignes()->latest()->take(3)->get();
            $totalCoursesCount = $user->coursEnseignes()->count();
        } else {
            $courses = $user->inscriptions()->with(['cour.sessions', 'cour.horaires'])->get()->pluck('cour');
            $coursesQuery = $user->inscriptions()->with('cour')->latest();
            $recentCourses = $coursesQuery->take(3)->get()->pluck('cour');
            $totalCoursesCount = $coursesQuery->count();
        }
        
        // Calculer le programme du jour
        $now = Carbon::now('UTC');
        $currentDayOfWeek = $now->dayOfWeek;
        $programmeDuJour = [];
        
        foreach ($courses as $course) {
            foreach ($course->sessions as $session) {
                $sessionDate = Carbon::parse($session->date_heure);
                
                if ($sessionDate->isSameDay($now)) {
                    $startTime = Carbon::parse($session->date_heure);
                    $endTime = $startTime->copy()->addMinutes($session->duree_minutes);
                    
                    $marginStart = $startTime->copy()->subMinutes(10);
                    $marginEnd = $endTime->copy()->addMinutes(10);
                    
                    $isLive = $now->between($marginStart, $marginEnd);
                    
                    $programmeDuJour[] = [
                        'type' => 'session',
                        'id' => $session->id,
                        'titre' => $session->titre,
                        'course_titre' => $course->titre,
                        'course_id' => $course->id,
                        'heure_debut' => $session->date_heure,
                        'duree_minutes' => $session->duree_minutes,
                        'is_live' => $isLive,
                        'type_cours' => $session->type,
                        'lien' => $session->lien_live ?: $session->lien_video
                    ];
                }
            }
            
            foreach ($course->horaires as $horaire) {
                $horaireDay = (int)$horaire->jour_semaine;
                
                if ($horaireDay === $currentDayOfWeek) {
                    $startString = $horaire->heure_debut;
                    $endString = $horaire->heure_fin;
                    
                    $startTime = Carbon::createFromFormat('H:i', $startString, 'UTC')->setDate($now->year, $now->month, $now->day);
                    $endTime = Carbon::createFromFormat('H:i', $endString, 'UTC')->setDate($now->year, $now->month, $now->day);
                    
                    $marginStart = $startTime->copy()->subMinutes(10);
                    $marginEnd = $endTime->copy()->addMinutes(10);
                    
                    $isLive = $now->between($marginStart, $marginEnd);
                    
                    $programmeDuJour[] = [
                        'type' => 'horaire',
                        'id' => $horaire->id,
                        'titre' => $course->titre,
                        'course_titre' => $course->titre,
                        'course_id' => $course->id,
                        'heure_debut' => $startTime->toISOString(),
                        'duree_minutes' => $startTime->diffInMinutes($endTime),
                        'is_live' => $isLive,
                        'type_cours' => 'regulier',
                        'lien' => null
                    ];
                }
            }
        }
        
        usort($programmeDuJour, function($a, $b) {
            return strcmp($a['heure_debut'], $b['heure_debut']);
        });
        
        return Inertia::render('Dashboard', [
            'recentCourses' => $recentCourses,
            'totalCoursesCount' => $totalCoursesCount,
            'programme_du_jour' => $programmeDuJour,
            'today' => $now->toDateString()
        ]);
    }
}
