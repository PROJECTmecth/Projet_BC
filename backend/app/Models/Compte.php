<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Compte extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_compte'; // Clé primaire personnalisée
    protected $fillable = [
        'id_client',
        'solde_total',
        'total_depots',
        'total_retraits',
        'total_retraits_partiels',
        'total_penalites',
        'total_frais_garde',
        'devise',
        'date_ouverture',
        'date_cloture',
    ];

    /**
     * Client propriétaire du compte
     */
    public function client()
    {
        return $this->belongsTo(Client::class, 'id_client', 'id_client');
    }
}