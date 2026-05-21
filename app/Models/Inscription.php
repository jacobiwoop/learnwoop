<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'etudiant_id',
        'cours_id',
        'statut',
        'progression'
    ];

    public function etudiant()
    {
        return $this->belongsTo(User::class);
    }

    public function cour()
    {
        return $this->belongsTo(Cour::class, 'cours_id');
    }
}