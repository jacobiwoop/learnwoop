<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ressource extends Model
{
    use HasFactory;

    protected $fillable = [
        'titre',
        'description',
        'type',
        'url',
        'taille_fichier',
        'ordre'
    ];

    public function cour()
    {
        return $this->belongsTo(Cour::class);
    }

    public function session()
    {
        return $this->belongsTo(Session::class);
    }
}