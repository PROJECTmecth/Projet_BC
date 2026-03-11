<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Localisation extends Model
{
    use HasFactory;

    // Clé primaire personnalisée
    protected $primaryKey = 'id_loc';

    // Champs modifiables en mass assignment
    protected $fillable = [
        'id_kiosque',
        'latitude',
        'longitude',
        'adresse_maps',
        'derniere_sync',
        'source',
    ];

    /**
     * Relation vers le kiosque associé
     */
    public function kiosque()
    {
        return $this->belongsTo(Kiosque::class, 'id_kiosque', 'id_kiosque');
    }

    /**
     * Vérifie si la localisation est basée sur GPS
     */
    public function estGPS(): bool
    {
        return $this->source === 'GPS';
    }

    /**
     * Vérifie si la localisation est saisie manuellement
     */
    public function estManuelle(): bool
    {
        return $this->source === 'manuel';
    }
}