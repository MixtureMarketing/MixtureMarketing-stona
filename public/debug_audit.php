<?php
require_once 'api/config.php';

echo "<h3>Test połączenia z bazą AUDYTÓW</h3>";

try {
    $dsn = "mysql:host=" . DB_AUDIT_HOST . ";dbname=" . DB_AUDIT_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_AUDIT_USER, DB_AUDIT_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    echo "<p style='color:green'>✅ Połączono z bazą: " . DB_AUDIT_NAME . "</p>";

    // Przykładowe dane audytu (zgodne z Twoim interfejsem AuditResult)
    $mockAuditData = [
        'client' => [
            'url' => 'https://test-firma.pl',
            'total_score' => 85,
            'metrics' => [
                'lcp_value' => 1.2,
                'cls_value' => 0.01,
                'scores' => [
                    'performance' => 90,
                    'accessibility' => 85,
                    'seo' => 95,
                    'best_practices' => 90
                ]
            ],
            'tech' => ['gtm' => true, 'pixel' => false, 'analytics' => true, 'ssl' => true, 'cms' => ['WordPress']],
            'seo' => ['title' => 'Testowy Tytuł', 'h1' => 'Witaj na stronie testowej', 'description' => 'Opis testowy'],
            'content' => ['word_count' => 500, 'images_count' => 10, 'h1_count' => 1],
            'reputation' => ['rating' => 4.8, 'reviews_count' => 12, 'score' => 0],
            'audit_results' => ['NO_PIXEL' => true],
            'screenshot' => null
        ]
    ];

    $auditJson = json_encode($mockAuditData);
    $placeId = 'ChIJtest_place_id_123';
    $name = 'Testowa Firma sp. z o.o.';
    $email = 'test@example.com';
    $website = 'https://test-firma.pl';
    $score = 85;

    // Wstawiamy rekord (używamy ID numerycznego lub string - w Twoim schemacie to INT AUTO_INCREMENT)
    $stmt = $pdo->prepare("INSERT INTO leads (place_id, name, website, email, audit_score, audit_data, status) 
                           VALUES (:place_id, :name, :website, :email, :score, :data, 'new')");
    
    $stmt->execute([
        ':place_id' => $placeId,
        ':name' => $name,
        ':website' => $website,
        ':email' => $email,
        ':score' => $score,
        ':data' => $auditJson
    ]);

    $insertedId = $pdo->lastInsertId();

    echo "<div style='background: #eef; padding: 20px; border-radius: 10px; margin-top: 20px;'>";
    echo "<h4>🎉 Sukces! Rekord testowy dodany.</h4>";
    echo "<p>Twój testowy <b>auditId</b> to: <b style='font-size: 20px; color: blue;'>$insertedId</b></p>";
    echo "<p>Teraz otwórz w przeglądarce ten link:</p>";
    echo "<a href='/audyt-360?auditId=$insertedId' target='_blank'><b>OTWÓRZ AUDYT #$insertedId</b></a>";
    echo "</div>";

} catch (PDOException $e) {
    echo "<p style='color:red'>❌ Błąd: " . $e->getMessage() . "</p>";
    echo "<p>Upewnij się, że tabela <b>leads</b> istnieje w bazie <b>" . DB_AUDIT_NAME . "</b> i ma kolumny: place_id, name, website, email, audit_score, audit_data.</p>";
}
?>
