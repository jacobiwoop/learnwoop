<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    use HasFactory;

    protected $fillable = [
        'cours_id',
        'titre',
        'ordre',
    ];

    public function cour()
    {
        return $this->belongsTo(Cour::class, 'cours_id');
    }

    public function sessions()
    {
        return $this->hasMany(Session::class, 'module_id')->orderBy('ordre');
    }
}
