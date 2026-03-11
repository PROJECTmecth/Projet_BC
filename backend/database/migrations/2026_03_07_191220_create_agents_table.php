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
            $table->foreignId('id_user')
                ->constrained('users', 'id')
                ->cascadeOnDelete();
            $table->foreignId('id_kiosque')
                ->constrained('kiosques', 'id_kiosque')
                ->cascadeOnDelete();
            $table->string('telephone', 20);
            $table->string('adresse', 255);
            $table->dateTime('derniere_sync')->nullable();
            $table->enum('statut_ligne', ['en_ligne', 'hors_ligne'])->default('hors_ligne');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agents');
    }
};