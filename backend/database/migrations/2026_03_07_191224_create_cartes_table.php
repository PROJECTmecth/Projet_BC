<?php
// ─────────────────────────────────────────────────────────────────────────────
// fichier : database/migrations/xxxx_xx_xx_create_cartes_table.php
//
// MODIFICATION IMPORTANTE :
//   id_client, id_agent, id_kiosque sont maintenant NULLABLE
//   car un QR vierge n'a pas encore de client/agent/kiosque associé.
//   Ces champs seront remplis par l'agent lors de l'activation de la carte.
//
// AUSSI :
//   numero_carte   → nullable() car généré après l'insert (basé sur id_carte)
//   qr_code_image  → nullable() car optionnel à la génération
//   duree          → nullable() car remplie à l'activation
//   montant_initial→ default(0)
//   frais_garde    → default(0)
//   progression    → default(0)
// ─────────────────────────────────────────────────────────────────────────────

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cartes', function (Blueprint $table) {
            $table->id('id_carte'); // Clé primaire auto-incrémentée

            // ── Clés étrangères — NULLABLE car remplies à l'activation ──────
            $table->foreignId('id_client')
                  ->nullable()           // ← nullable : pas de client à la génération
                  ->unique()             // Une carte par client
                  ->constrained('clients', 'id_client')
                  ->cascadeOnDelete();

            $table->foreignId('id_agent')
                  ->nullable()           // ← nullable : pas d'agent à la génération
                  ->constrained('agents', 'id_agent')
                  ->cascadeOnDelete();

            $table->foreignId('id_kiosque')
            
                  ->nullable()           // ← nullable : pas de kiosque à la génération
                  ->constrained('kiosques', 'id_kiosque')
                  ->cascadeOnDelete();

            // ── Informations sur la carte ─────────────────────────────────
            $table->string('numero_carte', 20)->unique()->nullable(); // ← nullable : généré après insert
            $table->string('qr_code_uid', 191)->unique();             // UUID v4 — généré à la création
            $table->text('qr_code_image')->nullable();                // ← nullable : optionnel
            $table->enum('statut', ['vierge', 'actif', 'expiré', 'terminé'])->default('vierge');
            $table->enum('duree', ['15 jours', '30 jours'])->nullable(); // ← nullable : rempli à l'activation

            $table->decimal('montant_initial', 15, 2)->default(0);   // 0 à la génération
            $table->decimal('frais_garde', 15, 2)->default(0);       // 0 à la génération
            $table->tinyInteger('progression')->default(0);           // 0 à la génération

            // ── Dates ─────────────────────────────────────────────────────
            $table->date('date_creation');                            // Date génération QR
            $table->date('date_activation')->nullable();              // Date 1er enregistrement client
            $table->date('date_expiration')->nullable();              // Date d'expiration

            // ── Compteurs journaliers ──────────────────────────────────────
            $table->tinyInteger('nb_depots_jour')->default(0);
            $table->tinyInteger('nb_retraits_jour')->default(0);
            $table->date('reset_date')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cartes');
    }
};
