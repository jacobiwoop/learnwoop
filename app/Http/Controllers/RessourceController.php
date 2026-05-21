<?php

namespace App\Http\Controllers;

use App\Models\Cour;
use App\Models\Ressource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RessourceController extends Controller
{
    /**
     * Stocker une nouvelle ressource (fichier ou lien).
     */
    public function store(Request $request, Cour $course)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:pdf,video,slide,document,image,lien,autre',
            'source_type' => 'required|in:fichier,lien',
            'fichier' => 'required_if:source_type,fichier|file|max:51200', // 50MB max
            'url' => 'required_if:source_type,lien|nullable|string',
            'session_id' => 'nullable|exists:cours_sessions,id',
        ]);

        $url = null;
        $tailleFichier = null;

        if ($validated['source_type'] === 'fichier') {
            if ($request->hasFile('fichier')) {
                $file = $request->file('fichier');
                $path = $file->store('ressources', 'public');
                $url = Storage::url($path);
                $tailleFichier = $file->getSize();
            }
        } else {
            $url = $validated['url'];
        }

        $ordre = $course->ressources()->count() + 1;

        $course->ressources()->create([
            'session_id' => $validated['session_id'] ?? null,
            'titre' => $validated['titre'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'url' => $url,
            'taille_fichier' => $tailleFichier,
            'ordre' => $ordre,
        ]);

        return redirect()->back()->with('success', 'Ressource ajoutée avec succès.');
    }

    /**
     * Supprimer une ressource et son fichier associé du disque.
     */
    public function destroy(Ressource $ressource)
    {
        // Supprimer le fichier local si applicable
        if (str_starts_with($ressource->url, '/storage/ressources/')) {
            $path = str_replace('/storage/', '', $ressource->url);
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

        $ressource->delete();

        return redirect()->back()->with('success', 'Ressource supprimée avec succès.');
    }
}
