<?php

namespace Tests\Unit;

use App\Http\Controllers\Agent\AgentClientsController;
use App\Models\Carte;
use App\Models\Compte;
use Tests\TestCase as BaseTestCase;

class AgentDepositRuleTest extends BaseTestCase
{
    private function createController(): AgentClientsController
    {
        return new AgentClientsController();
    }

    private function invokePrivateMethod(object $object, string $method, array $args = [])
    {
        $reflection = new \ReflectionClass($object);
        $reflectionMethod = $reflection->getMethod($method);
        $reflectionMethod->setAccessible(true);

        return $reflectionMethod->invokeArgs($object, $args);
    }

    public function test_deposit_base_uses_current_balance_when_available(): void
    {
        $controller = $this->createController();

        $carte = new Carte([
            'montant_initial' => 100000,
            'duree' => '15 jours',
        ]);

        $compte = new Compte([
            'solde_total' => 50000,
        ]);

        $result = $this->invokePrivateMethod($controller, 'resolveDepositBaseAmount', [$carte, $compte]);
        $this->assertSame(50000.0, $result);
    }

    public function test_deposit_amount_is_split_into_50000_units(): void
    {
        $controller = $this->createController();

        $this->assertSame(2, $this->invokePrivateMethod($controller, 'calculateDepositOperationUnits', [100000]));
        $this->assertSame(3, $this->invokePrivateMethod($controller, 'calculateDepositOperationUnits', [150000]));
        $this->assertSame(2, $this->invokePrivateMethod($controller, 'calculateDepositOperationUnits', [1000, 500]));
    }

    public function test_daily_operation_limit_blocks_a_fourth_operation(): void
    {
        $controller = $this->createController();

        $carte = new Carte([
            'nb_depots_jour' => 3,
            'nb_retraits_jour' => 0,
            'reset_date' => now()->toDateString(),
        ]);

        $this->assertFalse($this->invokePrivateMethod($controller, 'canProcessDailyOperation', [$carte]));
    }
}
