<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ressource extends Model
{
    use HasFactory;

    protected $fillable = [
        'cours_id',
        'session_id',
        'titre',
        'description',
        'type',
        'url',
        'taille_fichier',
        'ordre'
    ];

    public function cour()
    {
        return $this->belongsTo(Cour::class, 'cours_id');
    }

    public function session()
    {
        return $this->belongsTo(Session::class);
    }
}