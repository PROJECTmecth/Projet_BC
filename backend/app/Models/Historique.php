<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Historique extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_histo'; // Clé primaire personnalisée

    protected $fillable = [
        'id_agent',
        'id_kiosque',
        'periode_debut',
        'periode_fin',
        'nb_depots',
        'nb_retraits',
        'nb_retraits_sc',
        'nb_transactions',
        'volume_total',
        'total_depots',
        'total_retraits',
        'total_retraits_sc',
        'total_penalites',
        'generated_at',
        'format_export',
    ];

    /**
     * Relation vers l'agent ou admin qui consulte l'historique
     */
    public function agent()
    {
        return $this->belongsTo(Agent::class, 'id_agent', 'id_agent');
    }

    /**
     * Relation vers le kiosque filtré dans cet historique
     */
    public function kiosque()
    {
        return $this->belongsTo(Kiosque::class, 'id_kiosque', 'id_kiosque');
    }
}
