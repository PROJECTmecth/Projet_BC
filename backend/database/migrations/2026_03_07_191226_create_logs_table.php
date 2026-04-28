<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('logs', function (Blueprint $table) {
            $table->id('id_log'); // Clé primaire auto-incrémentée

            // Clé étrangère vers l'admin utilisateur
            $table->foreignId('id_admin')
                  ->constrained('users', 'id_user')
                  ->cascadeOnDelete(); // FK vers users (Admin ayant déclenché l'action)

            // Informations sur l'action
            $table->string('action_nom', 100);          // Nom de l'action réalisée
            $table->string('module', 60);               // Module concerné (ex: "Gestion des Agents")
            $table->string('entite_cible', 60);         // Entité cible de l'action
            $table->unsignedBigInteger('id_entite_cible')->nullable(); // ID de l'entité cible (ex: id_agent)

            $table->dateTime('date_action')->default(DB::raw('CURRENT_TIMESTAMP')); // Date et heure exactes
            $table->text('details_techniques')->nullable();                          // Détails techniques supplémentaires
            $table->string('ip_address', 45);                                        // Adresse IP de l'admin
            $table->enum('statut_action', ['succès', 'échec']);                      // Statut de l'action

            $table->timestamps(); // created_at & updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logs');
    }
};