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
        'statut'
    ];

    public function sessions()
    {
        return $this->hasMany(Session::class);
    }

    public function ressources()
    {
        return $this->hasMany(Ressource::class);
    }

    public function inscriptions()
    {
        return $this->hasMany(Inscription::class);
    }
}