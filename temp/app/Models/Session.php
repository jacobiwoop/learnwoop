<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Session extends Model
{
    use HasFactory;

    protected $fillable = [
        'titre',
        'description',
        'type',
        'date_heure',
        'duree_minutes',
        'lien_live',
        'livekit_room_name',
        'lien_video',
        'statut',
        'ordre'
    ];

    public function cour()
    {
        return $this->belongsTo(Cour::class);
    }

    public function ressources()
    {
        return $this->hasMany(Ressource::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }
}