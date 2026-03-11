<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('localisations', function (Blueprint $table) {
            $table->id('id_loc');// Clé primaire auto-incrémentée

            $table->foreignId('id_kiosque')
            ->unique()
          ->constrained('kiosques', 'id_kiosque')
          ->cascadeOnDelete();                                   // FK vers kiosques // FK vers kiosques
            $table->decimal('latitude',10,8);                    //Latitude GPS du kiosque
            $table->decimal('longitude',11,8);                   //Longitude GPS du kiosque
            $table->string('adresse_maps',255)->nullable();      //Adresse formatée par Maps (
            $table->dateTime('derniere_sync');                   //Horodatage de la dernière mise à jour GPS
            $table->enum('source',['GPS','manuel'])->default('GPS'); //Source de la localisation
            $table->timestamps();                                    

        });
    }
    public function down(): void
    {
        Schema::dropIfExists('localisations');
    }
};