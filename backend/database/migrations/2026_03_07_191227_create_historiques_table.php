<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('historiques', function (Blueprint $table) {
            $table->id('id_histo');                  // Clé primaire auto-incrémentée
            $table->unsignedBigInteger('id_agent');  // FK vers agents(Agent ou admin consultant l'historique)
            $table->unsignedBigInteger('id_kiosque')->nullable();  //Kiosque filtré dans cet historique
            $table->date('periode_debut');                        //Date de début de la période couverte par cet historique
            $table->date('periode_fin');                          //Date de fin de la période couverte par cet historique
            $table->integer('nb_depots')->default(0);             //Nombre total de dépôts sur la période
            $table->integer('nb_retraits')->default(0);           //Nombre total de retraits sur la période
            $table->integer('nb_retraits_sc')->default(0);         //Nombre total de retraits de solde compte sur la période
            $table->integer('nb_transactions')->default(0);       //Nombre total de transactions sur la période
            $table->decimal('volume_total',15,2)->default(0);     //Somme totale des montants traités
            $table->decimal('total_depots',15,2)->default(0);      //Montant total des dépôts 
            $table->decimal('total_retraits',15,2)->default(0);    //Montant total des retraits
            $table->decimal('total_retraits_sc',15,2)->default(0); //Montant total des retraits de solde compte
            $table->decimal('total_penalites',15,2)->default(0);   //Montant total des pénalités prélevées
            $table->dateTime('generated_at')->default(DB::raw('CURRENT_TIMESTAMP'));  //Date de génération du rapport d'historique   
            $table->enum('format_export',['PDF','Excel'])->nullable();  //Format de fichier choisi pour l'export de cet historique('PDF','Excel')
            $table->timestamps();

            $table->foreign('id_agent')->references('id_agent')->on('agents')->onDelete('cascade');  //FK agents
            $table->foreign('id_kiosque')->references('id_kiosque')->on('kiosques')->onDelete('cascade');  //FK kiosques
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('historiques');
    }
};