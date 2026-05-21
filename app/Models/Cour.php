<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cour extends Model
{
    use HasFactory;

    protected $fillable = [
        'titre',
        'slug',
        'description',
        'image_couverture',
        'prof_id',
        'organisation_id',
        'statut',
        'type_planification'
    ];

    public function sessions()
    {
        return $this->hasMany(Session::class, 'cours_id');
    }

    public function ressources()
    {
        return $this->hasMany(Ressource::class, 'cours_id');
    }

    public function inscriptions()
    {
        return $this->hasMany(Inscription::class, 'cours_id');
    }

    public function horaires()
    {
        return $this->hasMany(CourHoraire::class);
    }

    public function modules()
    {
        return $this->hasMany(Module::class, 'cours_id')->orderBy('ordre');
    }
}