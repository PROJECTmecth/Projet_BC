<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Journal extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_journal'; // Clé primaire personnalisée

    protected $fillable = [
        'id_admin',
        'action_nom',
        'module',
        'entite_cible',
        'id_entite_cible',
        'date_action',
        'details_techniques',
        'ip_address',
        'statut_action',
    ];

    /**
     * Relation vers l'admin utilisateur qui a effectué l'action
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'id_admin', 'id_user');
    }

    /**
     * Retourne la cible de l'action (ex: Agent, Kiosque…)
     * Ici on peut créer une relation polymorphe si nécessaire plus tard
     */
    public function cible()
    {
        return $this->morphTo(null, 'entite_cible', 'id_entite_cible');
    }
}