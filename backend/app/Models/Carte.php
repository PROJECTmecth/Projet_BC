<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Carte extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_carte'; // Clé primaire personnalisée

    protected $fillable = [
        'id_client',
        'id_agent',
        'id_kiosque',
        'numero_carte',
        'qr_code_uid',      // Identifiant QR unique
        'qr_code_image',
        'statut',
        'duree',
        'montant_initial',
        'frais_garde',
        'progression',
        'date_creation',
        'date_activation',
        'date_expiration',
        'nb_depots_jour',
        'nb_retraits_jour',
        'reset_date',
    ];

    /**
     * Relation vers le client propriétaire de la carte
     */
    public function client()
    {
        return $this->belongsTo(Client::class, 'id_client', 'id_client');
    }

    /**
     * Relation vers l'agent qui a activé la carte
     */
    public function agent()
    {
        return $this->belongsTo(Agent::class, 'id_agent', 'id_agent');
    }

    /**
     * Relation vers le kiosque d'activation
     */
    public function kiosque()
    {
        return $this->belongsTo(Kiosque::class, 'id_kiosque', 'id_kiosque');
    }
}