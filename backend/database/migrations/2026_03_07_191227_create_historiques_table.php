<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('historiques', function (Blueprint $table) {
            $table->id('id_histo'); // Clé primaire auto-incrémentée

            // Clés étrangères
            $table->foreignId('id_agent')
                  ->constrained('agents', 'id_agent')
                  ->cascadeOnDelete(); // Agent ou admin consultant l'historique
            $table->foreignId('id_kiosque')
                  ->nullable()
                  ->constrained('kiosques', 'id_kiosque')
                  ->cascadeOnDelete(); // Kiosque filtré dans cet historique

            // Période et statistiques
            $table->date('periode_debut');               // Date de début de la période
            $table->date('periode_fin');                 // Date de fin de la période
            $table->integer('nb_depots')->default(0);   // Nombre total de dépôts
            $table->integer('nb_retraits')->default(0); // Nombre total de retraits
            $table->integer('nb_retraits_sc')->default(0); // Nombre total de retraits solde compte
            $table->integer('nb_transactions')->default(0); // Nombre total de transactions

            // Totaux monétaires
            $table->decimal('volume_total', 15, 2)->default(0);     // Somme totale des montants traités
            $table->decimal('total_depots', 15, 2)->default(0);    // Montant total des dépôts
            $table->decimal('total_retraits', 15, 2)->default(0);  // Montant total des retraits
            $table->decimal('total_retraits_sc', 15, 2)->default(0); // Montant total des retraits solde compte
            $table->decimal('total_penalites', 15, 2)->default(0); // Montant total des pénalités prélevées

            // Métadonnées
            $table->dateTime('generated_at')->default(DB::raw('CURRENT_TIMESTAMP')); // Date génération rapport
            $table->enum('format_export', ['PDF', 'Excel'])->nullable();             // Format export
            $table->timestamps(); // created_at & updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('historiques');
    }
};