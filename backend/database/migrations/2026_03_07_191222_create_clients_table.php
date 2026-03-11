<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id('id_client'); // Clé primaire auto-incrémentée

            // Informations personnelles
            $table->enum('genre',['Homme','Femme']);                      // Genre du client
            $table->string('nom',100);                                     // Nom de famille
            $table->string('prenom',100);                                  // Prénom
            $table->string('adresse',255);                                  // Adresse physique
            $table->string('ville',100);                                    // Ville de résidence
            $table->string('activite',150);                                 // Activité professionnelle
            $table->enum('nationalite',['Résident','Étranger']);            // Statut de résidence
            $table->enum('type_piece',['CNI','NIU','Passeport','Permis']); // Type de pièce d'identité présentée
            $table->string('num_piece',50)->unique();                       // Numéro unique de la pièce
            $table->string('telephone',20);                                 // Numéro de téléphone (+242 + 9 chiffres)

            // Clés étrangères
            $table->foreignId('id_agent')                                   // FK vers agents
                  ->constrained('agents','id_agent')
                  ->cascadeOnDelete();

            $table->foreignId('id_user')                                    // FK vers users
                  ->constrained('users','id_user')
                  ->cascadeOnDelete();

            // Horodatage
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP')); // Date d'enregistrement
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients'); // Supprime la table si rollback
    }
};