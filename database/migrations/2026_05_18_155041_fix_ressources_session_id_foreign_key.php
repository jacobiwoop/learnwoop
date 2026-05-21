<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Corriger la clé étrangère session_id dans la table ressources.
     * L'ancienne migration pointait vers une table "sessions" qui n'existe pas.
     * La vraie table s'appelle "cours_sessions".
     */
    public function up(): void
    {
        Schema::table('ressources', function (Blueprint $table) {
            // 1. Supprimer l'ancienne contrainte incorrecte
            $table->dropForeign(['session_id']);

            // 2. Recréer la contrainte vers la bonne table
            $table->foreign('session_id')
                  ->references('id')
                  ->on('cours_sessions')
                  ->nullOnDelete();
        });
    }

    /**
     * Annuler la correction (retour à l'état précédent).
     */
    public function down(): void
    {
        Schema::table('ressources', function (Blueprint $table) {
            $table->dropForeign(['session_id']);

            $table->foreign('session_id')
                  ->references('id')
                  ->on('sessions');
        });
    }
};
