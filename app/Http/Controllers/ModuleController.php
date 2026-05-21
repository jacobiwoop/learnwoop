<?php

namespace App\Http\Controllers;

use App\Models\Cour;
use App\Models\Module;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    public function store(Request $request, Cour $course)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
        ]);

        $ordre = $course->modules()->count() + 1;

        $course->modules()->create([
            'titre' => $validated['titre'],
            'ordre' => $ordre,
        ]);

        return redirect()->back()->with('success', 'Module créé avec succès !');
    }

    public function update(Request $request, Module $module)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
        ]);

        $module->update([
            'titre' => $validated['titre'],
        ]);

        return redirect()->back()->with('success', 'Module mis à jour avec succès !');
    }

    public function destroy(Module $module)
    {
        $module->delete();

        return redirect()->back()->with('success', 'Module supprimé avec succès !');
    }
}
