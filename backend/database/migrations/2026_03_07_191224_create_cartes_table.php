<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cartes', function (Blueprint $table) {
            $table->id('id_carte');
            $table->unsignedBigInteger('id_client')->unique();
            $table->unsignedBigInteger('id_agent');
            $table->unsignedBigInteger('id_kiosque');
            $table->string('numero_carte', 20)->unique();
            $table->string('qr_code_uid', 191)->unique();
            $table->text('qr_code_image');
            $table->enum('statut', ['vierge', 'actif', 'expiré', 'terminé']);
            $table->enum('duree', ['15 jours', '30 jours']);
            $table->decimal('montant_initial', 15, 2);
            $table->decimal('frais_garde', 15, 2);
            $table->tinyInteger('progression');
            $table->date('date_creation');
            $table->date('date_activation')->nullable();
            $table->date('date_expiration')->nullable();
            $table->tinyInteger('nb_depots_jour')->default(0);
            $table->tinyInteger('nb_retraits_jour')->default(0);

            // ✅ Fix : CURRENT_DATE non supporté comme default en MySQL
            // On utilise nullable() + on remplira via le modèle/observer
            $table->date('reset_date')->nullable();

            $table->timestamps();

            $table->foreign('id_client')->references('id_client')->on('clients')->onDelete('cascade');
            $table->foreign('id_agent')->references('id_agent')->on('agents')->onDelete('cascade');
            $table->foreign('id_kiosque')->references('id_kiosque')->on('kiosques')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cartes');
    }
};