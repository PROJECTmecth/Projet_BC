<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_trans'; // Clé primaire personnalisée

    protected $fillable = [
        'id_carte',
        'id_client',
        'id_agent',
        'id_kiosque',
        'type_op',
        'montant',
        'penalite',
        'solde_avant',
        'solde_apres',
        'date_heure',
        'sync_status',
        //'sms_envoye', // à activer si on implémente les notifications SMS
    ];

    /**
     * Relation vers la carte concernée
     */
    public function carte()
    {
        return $this->belongsTo(Carte::class, 'id_carte', 'id_carte');
    }

    /**
     * Relation vers le client concerné
     */
    public function client()
    {
        return $this->belongsTo(Client::class, 'id_client', 'id_client');
    }

    /**
     * Relation vers l'agent ayant effectué l'opération
     */
    public function agent()
    {
        return $this->belongsTo(Agent::class, 'id_agent', 'id_agent');
    }

    /**
     * Relation vers le kiosque où l'opération a été réalisée
     */
    public function kiosque()
    {
        return $this->belongsTo(Kiosque::class, 'id_kiosque', 'id_kiosque');
    }
}