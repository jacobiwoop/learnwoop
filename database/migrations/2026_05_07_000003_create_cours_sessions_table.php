<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cours_sessions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cours_id');
            $table->foreign('cours_id')->references('id')->on('cours');
            $table->string('titre');
            $table->text('description')->nullable();
            $table->enum('type', ['live', 'rediffusion']);
            $table->dateTime('date_heure');
            $table->integer('duree_minutes')->nullable();
            $table->string('lien_live')->nullable();
            $table->string('livekit_room_name')->nullable();
            $table->string('lien_video')->nullable();
            $table->enum('statut', ['programmé', 'en_cours', 'terminé', 'annulé'])->default('programmé');
            $table->integer('ordre')->default(0);
            $table->timestamps();

            $table->index('cours_id');
            $table->index('type');
            $table->index('statut');
            $table->index('date_heure');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('cours_sessions');
    }
};