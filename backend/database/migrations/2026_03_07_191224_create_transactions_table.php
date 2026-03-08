<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id('id_trans');                 // Clé primaire auto-incrémentée
            $table->unsignedBigInteger('id_carte');  // FK vers cartes(Carte concernée par l'opération)
            $table->unsignedBigInteger('id_client'); // FK vers clients(Client concerné par l'opération)
            $table->unsignedBigInteger('id_agent');  // FK vers agents(Agent ayant effectué l'opération)
            $table->unsignedBigInteger('id_kiosque'); // FK vers kiosques(Kiosque où l'opération a été réalisée)
            $table->enum('type_op',['dépôt_cash','retrait_partiel','retrait_solde_compte']);  //Type d'opération financière
            $table->decimal('montant',15,2);                                                  //Montant de l'opération en XAF
            $table->decimal('penalite',10,2)->default(0);                                     //Frais de pénalité prélevés pour les retraits partiels
            $table->decimal('solde_avant',15,2);                                              //Solde du compte avant l'opération
            $table->decimal('solde_apres',15,2);                                              //Solde du compte après l'opération
            $table->dateTime('date_heure')->default(DB::raw('CURRENT_TIMESTAMP'));           //Horodatage exact de l'opération
            $table->enum('sync_status',['synchronisé','en_attente'])->default('en_attente'); //Statut de synchronisation avec le serveur central
            //$table->boolean('sms_envoye')->default(false);                                //Indique si une notification SMS a été envoyée au client pour cette transaction(version future)
            $table->timestamps();

            $table->foreign('id_carte')->references('id_carte')->on('cartes')->onDelete('cascade');     //FK cartes
            $table->foreign('id_client')->references('id_client')->on('clients')->onDelete('cascade');  //FK clients
            $table->foreign('id_agent')->references('id_agent')->on('agents')->onDelete('cascade');     //FK agents
            $table->foreign('id_kiosque')->references('id_kiosque')->on('kiosques')->onDelete('cascade');  //FK kiosques
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};