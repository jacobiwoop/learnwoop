<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cour_horaires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cour_id')->constrained('cours')->onDelete('cascade');
            $table->tinyInteger('jour_semaine')->comment('0=Dimanche, 1=Lundi, ..., 6=Samedi');
            $table->time('heure_debut');
            $table->time('heure_fin');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cour_horaires');
    }
};
