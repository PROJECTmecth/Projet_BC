<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Kiosque;

class Agent extends Model
{
    use HasFactory;

    // Clé primaire personnalisée
    protected $primaryKey = 'id_agent';

    // Champs modifiables en mass assignment
    protected $fillable = [
        'id_user',
        'id_kiosque',
        'telephone',
        'adresse',
        'derniere_sync',
        'statut_ligne',
    ];

    // Casts
    protected $casts = [
        'derniere_sync' => 'datetime',
    ];

    /**
     * Relation vers le User associé
     * Chaque agent correspond à un utilisateur
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    /**
     * Relation vers le Kiosque associé
     */
    public function kiosque()
    {
        return $this->belongsTo(Kiosque::class, 'id_kiosque', 'id_kiosque');
    }

    /**
     * Vérifie si l'agent est en ligne
     */
    public function estEnLigne(): bool
    {
        return $this->statut_ligne === 'en_ligne';
    }

    /**
     * Vérifie si l'agent est hors ligne
     */
    public function estHorsLigne(): bool
    {
        return $this->statut_ligne === 'hors_ligne';
    }
}