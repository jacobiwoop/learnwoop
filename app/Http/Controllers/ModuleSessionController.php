<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\Session;
use Illuminate\Http\Request;

class ModuleSessionController extends Controller
{
    public function store(Request $request, Module $module)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'duree_minutes' => 'required|integer|min:1',
        ]);

        $ordre = $module->sessions()->count() + 1;

        $module->sessions()->create([
            'cours_id' => $module->cours_id,
            'titre' => $validated['titre'],
            'duree_minutes' => $validated['duree_minutes'],
            'type' => 'rediffusion',
            'date_heure' => now(), // Nécessaire car non-nullable dans le schéma
            'statut' => 'terminé',
            'ordre' => $ordre,
        ]);

        return redirect()->back()->with('success', 'Leçon ajoutée avec succès !');
    }

    public function update(Request $request, Session $session)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'duree_minutes' => 'required|integer|min:1',
        ]);

        $session->update([
            'titre' => $validated['titre'],
            'duree_minutes' => $validated['duree_minutes'],
        ]);

        return redirect()->back()->with('success', 'Leçon mise à jour avec succès !');
    }

    public function destroy(Session $session)
    {
        $session->delete();

        return redirect()->back()->with('success', 'Leçon supprimée avec succès !');
    }
}
