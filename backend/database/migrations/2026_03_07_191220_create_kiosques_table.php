<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('kiosques', function (Blueprint $table) {
            $table->id('id_kiosque');    // Clé primaire auto-incrémentée

            $table->string('code_kiosque', 20)->unique(); //matricule kioque
            $table->string('nom_kiosque', 150);          //nom kiosque
            $table->string('adresse', 255);             // Adresse physique
            $table->string('ville', 100);              // ville 
            $table->string('telephone', 20);          // Téléphone (+242 + 9 chiffres)
            $table->enum('statut_service', ['actif', 'inactif'])->default('actif');  //état operationnel du kioque


            // Après ✅
            $table->foreignId('id_admin')
                ->nullable()
                ->constrained('users', 'id')
                ->nullOnDelete();; // FK vers users

            $table->timestamps(); // created_at & updated_at
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('kiosques');
    }
};
