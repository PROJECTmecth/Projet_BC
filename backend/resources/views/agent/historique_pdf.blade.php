<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Historique des transactions</title>
    <style>
        body { font-family: "Helvetica", sans-serif; font-size: 12px; color: #333; }
        h1 { text-align: center; color: #1e293b; margin-bottom: 20px; }
        .info { text-align: center; margin-bottom: 30px; font-size: 14px; color: #64748b; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
        th { background-color: #f8fafc; font-weight: bold; color: #1e293b; }
        .amount { font-weight: bold; }
        .text-center { text-align: center; }
        .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; }
    </style>
</head>
<body>
    <h1>Historique des opérations</h1>
    <div class="info">
        Période du <strong>{{ \Carbon\Carbon::parse($dateDebut)->format('d/m/Y') }}</strong> au <strong>{{ \Carbon\Carbon::parse($dateFin)->format('d/m/Y') }}</strong>
    </div>

    <table>
        <thead>
            <tr>
                <th>Date / Heure</th>
                <th>Client</th>
                <th>Opération</th>
                <th>Montant</th>
                <th>N° Carte</th>
            </tr>
        </thead>
        <tbody>
            @forelse($rows as $row)
            <tr>
                <td>{{ \Carbon\Carbon::parse($row->date_heure)->format('d/m/Y H:i') }}</td>
                <td>{{ $row->client_prenom }} {{ $row->client_nom }}</td>
                <td>{{ $row->type_op }}</td>
                <td class="amount">{{ number_format($row->montant, 0, ',', ' ') }} F</td>
                <td>{{ $row->numero_carte ?? '—' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="5" class="text-center">Aucune transaction trouvée sur cette période.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Généré le {{ now()->format('d/m/Y à H:i') }} par BOMBA CASH
    </div>
</body>
</html>
