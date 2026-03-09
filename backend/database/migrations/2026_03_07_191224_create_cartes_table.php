<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cartes', function (Blueprint $table) {
            $table->id('id_carte');                            // Clé primaire auto-incrémentée
            $table->unsignedBigInteger('id_client')->unique(); // FK client(Client propriétaire de la carte)
            $table->unsignedBigInteger('id_agent');            //FK agent(Agent ayant activé la carte)
            $table->unsignedBigInteger('id_kiosque');         //FK kiosue(Kiosque d'activation de la carte)
            $table->string('numero_carte',20)->unique();      //Numéro unique lisible de la carte (CPN1, CPN2…)
            $table->string('qr_code_uid', 191)->unique();    //Identifiant unique encodé dans le QR code
            $table->text('qr_code_image');                  //Image QR code en base64 ou chemin fichier
            $table->enum('statut',['vierge','actif','expiré','terminé']); //État courant de la carte
            $table->enum('duree',['15 jours','30 jours']);               //Durée de validité choisie lors activation
            $table->decimal('montant_initial',15,2);                     //Montant de versement initial (1K–100K XAF)
            $table->decimal('frais_garde',15,2);                         // Frais de garde prélevés à l'ouverture(Frais de garde= 50% du montant_initial)
            $table->tinyInteger('progression');                          //Pourcentage de progression de la carte
            $table->date('date_creation');                              //Date de génération du QR code par l'admin
            $table->date('date_activation')->nullable();               //Date du 1er enregistrement client
            $table->date('date_expiration')->nullable();               //Date d'expiration calculée à partir de date_activation + durée
            $table->tinyInteger('nb_depots_jour')->default(0);         //Compteur de dépôts effectués aujourd'hui( max 3 par jour)
            $table->tinyInteger('nb_retraits_jour')->default(0);       //Compteur de retraits effectués aujourd'hui( max  par jour)
            $table->date('reset_date')->useCurrent(); //Date de réinitialisation quotidienne des compteurs de dépôts/retraits
            $table->timestamps();

            $table->foreign('id_client')->references('id_client')->on('clients')->onDelete('cascade'); //FK clients
            $table->foreign('id_agent')->references('id_agent')->on('agents')->onDelete('cascade');    //FK agents
            $table->foreign('id_kiosque')->references('id_kiosque')->on('kiosques')->onDelete('cascade'); //FK kiosques
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('cartes');
    }
};
