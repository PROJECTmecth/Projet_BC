<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kiosques', function (Blueprint $table) {
            $table->id('id_kiosque');
            $table->string('code_kiosque', 20)->unique();
            $table->string('nom_kiosque', 150);
            $table->string('adresse', 255);
            $table->string('ville', 100);
            $table->string('telephone', 20);
            $table->enum('statut_service', ['actif', 'inactif'])->default('actif');
            $table->unsignedBigInteger('id_admin')->nullable();
            $table->timestamps();

            // ✅ Correction : references('id') car users utilise $table->id()
            $table->foreign('id_admin')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kiosques');
    }
};