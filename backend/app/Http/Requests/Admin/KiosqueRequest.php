<?php
// app/Http/Requests/KiosqueRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class KiosqueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // En update, on exclut le kiosque courant de l'unicité du code
        $id = $this->route('kiosque')?->id_kiosque;

        return [
            'code_kiosque'   => [
                'required',
                'string',
                'max:20',
                "unique:kiosques,code_kiosque,{$id},id_kiosque",
            ],
            'nom_kiosque'    => ['required', 'string', 'max:150'],
            'adresse'        => ['required', 'string', 'max:255'],
            'ville'          => ['required', 'string', 'max:100'],
            // ✅ nullable — sera renseigné à la création de l'agent
            'telephone'      => [
                'nullable',
                'string',
                'max:20',
                'regex:/^\+242\s?\d{2}\s?\d{3}\s?\d{4}$/',
            ],
            'statut_service' => ['sometimes', 'in:actif,inactif'],
            // id_admin → PK de users est "id"
            'id_admin'       => ['nullable', 'exists:users,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'code_kiosque.required' => 'Le code kiosque est obligatoire.',
            'code_kiosque.unique'   => 'Ce code kiosque est déjà utilisé.',
            'nom_kiosque.required'  => 'Le nom du kiosque est obligatoire.',
            'adresse.required'      => "L'adresse est obligatoire.",
            'ville.required'        => 'La ville est obligatoire.',
            'telephone.regex'       => 'Format attendu : +242 XX XXX XXXX',
            'id_admin.exists'       => "Cet administrateur n'existe pas.",
        ];
    }
}