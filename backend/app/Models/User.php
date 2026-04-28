<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // ✅ primaryKey = 'id' par défaut (migration utilise $table->id())

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'statut',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public const ROLE_ADMIN     = 'admin';
    public const ROLE_AGENT     = 'agent';
    public const STATUT_ACTIF   = 'actif';
    public const STATUT_INACTIF = 'inactif';

    public function isAdmin(): bool { return $this->role   === self::ROLE_ADMIN; }
    public function isAgent(): bool { return $this->role   === self::ROLE_AGENT; }
    public function isActif(): bool { return $this->statut === self::STATUT_ACTIF; }

    /**
     * Un User (role=agent) possède un profil Agent
     * FK : agents.id_user → users.id
     */
    public function agent()
    {
        return $this->hasOne(Agent::class, 'id_user', 'id');
    }

    /**
     * Un User (role=admin) peut être responsable de kiosques
     * FK : kiosques.id_admin → users.id
     */
    public function kiosques()
    {
        return $this->hasMany(Kiosque::class, 'id_admin', 'id');
    }
}