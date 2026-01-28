<?php
require_once 'db.php';

header('Content-Type: application/json');

try {
    $pdo = get_db_connection();
    
    // Tabela do metryk wydajności (RUM)
    $sql = "CREATE TABLE IF NOT EXISTS performance_metrics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        metric_name VARCHAR(10) NOT NULL, -- LCP, CLS, FID, INP, TTFB
        metric_value FLOAT NOT NULL,
        page_url VARCHAR(255) NOT NULL,
        user_agent VARCHAR(255),
        device_type VARCHAR(20), -- mobile, desktop
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $pdo->exec($sql);
    
    echo JSON_encode(['status' => 'success', 'message' => 'Tabela performance_metrics została utworzona lub już istnieje.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo JSON_encode(['status' => 'error', 'message' => 'Błąd bazy danych: ' . $e->getMessage()]);
}
?>
