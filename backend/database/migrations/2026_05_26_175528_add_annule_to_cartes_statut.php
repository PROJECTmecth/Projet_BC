<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE cartes MODIFY COLUMN statut ENUM('vierge','actif','expiré','terminé','annulé') DEFAULT 'vierge'");
    }

    public function down(): void
    {
        DB::statement("UPDATE cartes SET statut = 'vierge' WHERE statut = 'annulé'");
        DB::statement("ALTER TABLE cartes MODIFY COLUMN statut ENUM('vierge','actif','expiré','terminé') DEFAULT 'vierge'");
    }
};
