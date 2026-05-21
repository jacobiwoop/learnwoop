<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourHoraire extends Model
{
    use HasFactory;

    protected $fillable = [
        'cour_id',
        'jour_semaine',
        'heure_debut',
        'heure_fin',
    ];

    public function cour()
    {
        return $this->belongsTo(Cour::class);
    }
}
