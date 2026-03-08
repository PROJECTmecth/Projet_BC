<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('logs', function (Blueprint $table) {
            $table->id('id_log');
            $table->unsignedBigInteger('id_admin');
            $table->string('action_nom',100);
            $table->string('module',60);
            $table->string('entite_cible',60);
            $table->unsignedBigInteger('id_entite_cible')->nullable();
            $table->dateTime('date_action')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->text('details_techniques')->nullable();
            $table->string('ip_address',45);
            $table->enum('statut_action',['succès','échec']);
            $table->timestamps();

            $table->foreign('id_admin')->references('id_user')->on('users')->onDelete('cascade');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('logs');
    }
};