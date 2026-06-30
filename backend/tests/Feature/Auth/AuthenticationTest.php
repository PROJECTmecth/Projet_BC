<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create([
            'name' => 'testuser',
            'password' => bcrypt('password'),
        ]);

        $response = $this->postJson('/api/login', [
            'name' => 'testuser',
            'password' => 'password',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message',
            'token',
            'user' => [
                'id',
                'name',
                'email',
                'role',
                'statut',
            ]
        ]);
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create([
            'name' => 'testuser',
            'password' => bcrypt('password'),
        ]);

        $response = $this->postJson('/api/login', [
            'name' => 'testuser',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422);
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create([
            'name' => 'testuser',
        ]);

        $token = $user->createToken('bc_token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/logout');

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Déconnecté avec succès.',
        ]);
    }
}
