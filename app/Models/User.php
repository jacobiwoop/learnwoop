<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

    #[Fillable(['nom', 'prenom', 'email', 'password', 'role', 'organisation_id', 'avatar_url', 'telephone', 'statut'])]
    #[Hidden(['password', 'remember_token'])]
    class User extends Authenticatable
    {
        /** @use HasFactory<UserFactory> */
        use HasFactory, Notifiable;

        /**
         * Get the attributes that should be cast.
         *
         * @return array<string, string>
         */
        protected function casts(): array
        {
            return [
                'email_verified_at' => 'datetime',
                'password' => 'hashed',
            ];
        }

        /**
         * Get the organisation that the user belongs to.
         */
        public function organisation()
        {
            return $this->belongsTo(Organisation::class);
        }

        /**
         * Get the courses taught by the user (as a professor).
         */
        public function coursEnseignes()
        {
            return $this->hasMany(Cour::class, 'prof_id');
        }

        public function notes()
        {
            return $this->hasMany(Note::class);
        }

        public function inscriptions()
        {
            return $this->hasMany(Inscription::class, 'etudiant_id');
        }

        /**
         * Check if the user is a teacher.
         */
        public function isTeacher()
        {
            return $this->role === 'prof';
        }

        /**
         * Check if the user is an admin.
         */
        public function isAdmin()
        {
            return $this->role === 'admin';
        }
    }

