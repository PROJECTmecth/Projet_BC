<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('journals', function (Blueprint $table) {
            $table->id('id_journal');                  // Clé primaire auto-incrémentée
            $table->unsignedBigInteger('id_admin');    // FK vers users (Admin ayant déclenché l'action)
            $table->string('action_nom',100);          //Nom de l'action réalisée
            $table->string('module',60);               //Module applicatif concerné (ex: "Gestion des Agents", "Kiosques", etc.)
            $table->string('entite_cible',60);         //Entité cible de l'action
            $table->unsignedBigInteger('id_entite_cible')->nullable();           //ID de l'entité cible (ex: id_agent, id_kiosque, etc.)
            $table->dateTime('date_action')->default(DB::raw('CURRENT_TIMESTAMP')); //Date et heure de l'action  précis 
            $table->text('details_techniques')->nullable();                         //Détails techniques supplémentaires (ex: données modifiées, erreurs rencontrées, etc.)
            $table->string('ip_address',45);                                        //Adresse IP de la session admin ayant réalisé l'action
            $table->enum('statut_action',['succès','échec']);                       //Indique si l'action a été réalisée avec succès ou si elle a échoué
            $table->timestamps();

            $table->foreign('id_admin')->references('id_user')->on('users')->onDelete('cascade');  //FK users (Admin)
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('journals');
    }
};