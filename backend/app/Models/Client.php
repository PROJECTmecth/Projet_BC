<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Carte;
use App\Models\Compte;

class Client extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_client'; // Clé primaire personnalisée
    public $timestamps = false; // La table n'a pas de updated_at
    protected $fillable = [
        'genre',
        'nom',
        'prenom',
        'adresse',
        'ville',
        'activite',
        'nationalite',
        'type_piece',
        'num_piece',
        'telephone',
        'id_agent',
        'id_user',
        'created_at',
    ];

    /**
     * Agent ayant enregistré le client
     */
    public function agent()
    {
        return $this->belongsTo(Agent::class, 'id_agent', 'id_agent');
    }

    /**
     * Utilisateur associé (créateur ou administrateur)
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id');
    }

    /**
     * Carte associée au client
     */
    public function carte()
    {
        return $this->hasOne(Carte::class, 'id_client', 'id_client');
    }

    /**
     * Compte associé au client
     */
    public function compte()
    {
        return $this->hasOne(Compte::class, 'id_client', 'id_client');
    }
}
