<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // ✅ ligne manquante

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable; // ✅ HasApiTokens ajouté ici



    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'statut'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public const ROLE_ADMIN = 'admin';
    public const ROLE_AGENT = 'agent';
    public const STATUT_ACTIF = 'actif';
    public const STATUT_INACTIF = 'inactif';

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isAgent(): bool
    {
        return $this->role === self::ROLE_AGENT;
    }

    public function isActif(): bool
    {
        return $this->statut === self::STATUT_ACTIF;
    }

    public function agent()
    {
       return $this->hasOne(Agent::class, 'id_user', 'id');
    }
}