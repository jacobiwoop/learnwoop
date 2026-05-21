<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Organisation extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'slug',
        'email',
        'telephone',
        'adresse',
        'ville',
        'pays',
        'logo_url',
        'statut',
        'abonnement_actif',
        'date_expiration_abonnement'
    ];

    /**
     * Get the users for the organisation.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the courses for the organisation.
     */
    public function cours()
    {
        return $this->hasMany(Cour::class);
    }
}
