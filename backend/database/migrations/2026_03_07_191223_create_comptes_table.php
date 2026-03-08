<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('comptes', function (Blueprint $table) {
            $table->id('id_compte');                           // Clé primaire auto-incrémentée
            $table->unsignedBigInteger('id_client')->unique(); //FK(Client propriétaire du compte)
            $table->decimal('solde_total',15,2)->default(0);  //Solde courant du compte client
            $table->decimal('total_depots',15,2)->default(0); //Cumul total des dépôts  effectués
            $table->decimal('total_retraits',15,2)->default(0);  //Cumul total des retraits  effectués
            $table->decimal('total_retraits_partiels',15,2)->default(0);  //Cumul total des retraits partiels effectués
            $table->decimal('total_penalites',15,2)->default(0);         //Total des frais de pénalité prélevés
            $table->decimal('total_frais_garde',15,2)->default(0);      //Frais de garde prélevés à l'ouverture
            $table->string('devise',10)->default('XAF');                //Devise utilisée pour toutes les opérations         //
            $table->dateTime('date_ouverture');                        //Date de première activation de la carte
            $table->dateTime('date_cloture')->nullable();             //Date de clôture (retrait solde de compte)
            $table->timestamps();

            $table->foreign('id_client')->references('id_client')->on('clients')->onDelete('cascade'); //FK clients
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('comptes');
    }
};