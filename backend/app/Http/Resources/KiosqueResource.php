<?php
// app/Http/Resources/Admin/KiosqueResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KiosqueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id_kiosque,
            'code_kiosque'   => $this->code_kiosque,
            'nom_kiosque'    => $this->nom_kiosque,
            'adresse'        => $this->adresse,
            'ville'          => $this->ville,
            'telephone'      => $this->telephone,
            'statut_service' => $this->statut_service,
            'est_actif'      => $this->estActif(),

            'admin' => $this->whenLoaded('admin', fn() => [
                'id'  => $this->admin->id,
                'nom' => $this->admin->name,
            ]),

            'agents' => $this->whenLoaded('agents', fn() =>
                $this->agents->map(fn($agent) => [
                    'id'           => $agent->id_agent,
                    'nom'          => $agent->user?->name ?? '—',
                    'telephone'    => $agent->telephone,
                    'statut_ligne' => $agent->statut_ligne,
                    'est_en_ligne' => $agent->estEnLigne(),
                ])
            ),

            'nb_agents'  => $this->whenCounted('agents'),
            'created_at' => $this->created_at?->format('d/m/Y H:i'),
            'updated_at' => $this->updated_at?->format('d/m/Y H:i'),
        ];
    }
}