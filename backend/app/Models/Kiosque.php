<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kiosque extends Model
{
    use HasFactory;

    // Clé primaire personnalisée
    protected $primaryKey = 'id_kiosque';

    // Champs modifiables en mass assignment
    protected $fillable = [
        'code_kiosque',
        'nom_kiosque',
        'adresse',
        'ville',
        'telephone',
        'statut_service',
        'id_admin',
    ];

    /**
     * Relation vers l'admin (User) responsable du kiosque
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'id_admin', 'id_user');
    }

    /**
     * Relation vers les agents attachés à ce kiosque
     */
    public function agents()
    {
        return $this->hasMany(Agent::class, 'id_kiosque', 'id_kiosque');
    }

    /**
     * Vérifie si le kiosque est actif
     */
    public function estActif(): bool
    {
        return $this->statut_service === 'actif';
    }

    /**
     * Vérifie si le kiosque est inactif
     */
    public function estInactif(): bool
    {
        return $this->statut_service === 'inactif';
    }
}