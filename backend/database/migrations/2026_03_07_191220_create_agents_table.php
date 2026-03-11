<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agents', function (Blueprint $table) {
            $table->id('id_agent');
            $table->unsignedBigInteger('id_user');
            $table->unsignedBigInteger('id_kiosque');
            $table->string('telephone', 20);
            $table->string('adresse', 255);
            $table->dateTime('derniere_sync')->nullable();
            $table->enum('statut_ligne', ['en_ligne', 'hors_ligne'])->default('hors_ligne');
            $table->timestamps();

            // ✅ Correction : references('id') car users utilise $table->id()
            $table->foreign('id_user')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('id_kiosque')->references('id_kiosque')->on('kiosques')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agents');
    }
};