<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCoursTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cours', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image_couverture')->nullable();
            $table->unsignedBigInteger('prof_id');
            $table->foreign('prof_id')->references('id')->on('users');
            $table->unsignedBigInteger('organisation_id')->nullable();
            $table->foreign('organisation_id')->references('id')->on('organisations');
            $table->enum('statut', ['brouillon', 'publié', 'archivé'])->default('brouillon');
            $table->timestamps();

            $table->index('slug');
            $table->index('prof_id');
            $table->index('organisation_id');
            $table->index('statut');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('cours');
    }
}