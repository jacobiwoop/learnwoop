<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role'
    ];

    public function cours()
    {
        return $this->hasMany(Cour::class, 'prof_id');
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    public function inscriptions()
    {
        return $this->hasMany(Inscription::class);
    }
}