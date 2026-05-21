<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    use HasFactory;

    protected $table = 'cours_sessions';

    protected $fillable = [
        'cours_id',
        'titre',
        'description',
        'type',
        'date_heure',
        'duree_minutes',
        'lien_live',
        'livekit_room_name',
        'lien_video',
        'statut',
        'ordre',
        'module_id'
    ];

    public function cour()
    {
        return $this->belongsTo(Cour::class, 'cours_id');
    }

    public function module()
    {
        return $this->belongsTo(Module::class, 'module_id');
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