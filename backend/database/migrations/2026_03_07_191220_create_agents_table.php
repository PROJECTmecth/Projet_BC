<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agents', function (Blueprint $table) {
            $table->id('id_agent');          // Clé primaire auto-incrémentée
            
            $table->foreignId('id_user')
          ->constrained('users', 'id')
          ->cascadeOnDelete();  // FK vers users

           $table->foreignId('id_kiosque')
          ->constrained('kiosques', 'id_kiosque')
          ->cascadeOnDelete();  // FK vers kiosques

            $table->string('telephone', 20);          // Téléphone (+242 + 9 chiffres)
            $table->string('adresse', 255);           // Adresse physique
            $table->dateTime('derniere_sync')->nullable(); // Dernier horodatage de syncronisation
            $table->enum('statut_ligne', ['en_ligne', 'hors_ligne'])->default('en_ligne'); // statu de presence en ligne de l'agent
            $table->timestamps();                     // created_at & updated_at

           
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agents');
    }
};