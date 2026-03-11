<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id('id_trans'); // Clé primaire auto-incrémentée

            // Clés étrangères
            $table->foreignId('id_carte')
                  ->constrained('cartes', 'id_carte')
                  ->cascadeOnDelete(); // Carte concernée

            $table->foreignId('id_client')
                  ->constrained('clients', 'id_client')
                  ->cascadeOnDelete(); // Client concerné

            $table->foreignId('id_agent')
                  ->constrained('agents', 'id_agent')
                  ->cascadeOnDelete(); // Agent ayant effectué l'opération

            $table->foreignId('id_kiosque')
                  ->constrained('kiosques', 'id_kiosque')
                  ->cascadeOnDelete(); // Kiosque où l'opération a été réalisée

            // Détails de l'opération
            $table->enum('type_op', ['dépôt_cash','retrait_partiel','retrait_solde_compte']); // Type d'opération financière
            $table->decimal('montant', 15, 2);          // Montant de l'opération en XAF
            $table->decimal('penalite', 10, 2)->default(0); // Frais de pénalité pour les retraits partiels
            $table->decimal('solde_avant', 15, 2);      // Solde avant l'opération
            $table->decimal('solde_apres', 15, 2);      // Solde après l'opération

            // Horodatage et statut
            $table->dateTime('date_heure')->default(DB::raw('CURRENT_TIMESTAMP')); // Horodatage exact
            $table->enum('sync_status', ['synchronisé','en_attente'])->default('en_attente'); // Statut de synchronisation
           
            //$table->boolean('sms_envoye')->default(false); // Notification SMS (version future)

            $table->timestamps(); // created_at & updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};