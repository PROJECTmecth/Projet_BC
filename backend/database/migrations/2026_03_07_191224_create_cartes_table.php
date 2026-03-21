<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cartes', function (Blueprint $table) {
            $table->id('id_carte'); // Clé primaire auto-incrémentée

            // Clés étrangères
            $table->foreignId('id_client')
                  ->unique() // Une carte par client
                  ->constrained('clients', 'id_client')
                  ->cascadeOnDelete(); // FK client (propriétaire de la carte)

            $table->foreignId('id_agent')
                  ->constrained('agents', 'id_agent')
                  ->cascadeOnDelete(); // FK agent (activateur de la carte)

            $table->foreignId('id_kiosque')
                  ->constrained('kiosques', 'id_kiosque')
                  ->cascadeOnDelete(); // FK kiosque (activation)

            // Informations sur la carte
            $table->string('numero_carte',20)->unique();      // Numéro unique lisible de la carte
            $table->string('qr_code_uid',191)->unique();      // Identifiant QR unique
            $table->text('qr_code_image');                    // Image QR code en base64 ou chemin
            $table->enum('statut',['vierge','actif','expiré','terminé']); // État courant
            $table->enum('duree',['15 jours','30 jours']);   // Durée de validité
            $table->decimal('montant_initial',15,2);         // Montant initial versé
            $table->decimal('frais_garde',15,2);             // Frais de garde (50% montant initial)
            $table->tinyInteger('progression');              // Pourcentage de progression

            // Dates importantes
            $table->date('date_creation');                   // Date génération QR code
            $table->date('date_activation')->nullable();     // Date 1er enregistrement client
            $table->date('date_expiration')->nullable();     // Date d'expiration

            // Compteurs journaliers
            $table->tinyInteger('nb_depots_jour')->default(0);   // Dépôts du jour (max 3)
            $table->tinyInteger('nb_retraits_jour')->default(0); // Retraits du jour
            
           // ✅ Fix : CURRENT_DATE non supporté comme default en MySQL
            // On utilise nullable() + on remplira via le modèle/observer
            $table->date('reset_date')->nullable(); // Date du dernier reset des compteurs

            $table->timestamps(); // created_at & updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cartes'); // Rollback
    }
};