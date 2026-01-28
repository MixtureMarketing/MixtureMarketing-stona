<?php
require_once 'db.php';

header('Content-Type: application/json');

try {
    $pdo = get_db_connection();
    
    // Tabela sesji (używana przez system logowania)
    $sql = "CREATE TABLE IF NOT EXISTS sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        session_token VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        ip_address VARCHAR(45),
        user_agent VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        INDEX (session_token),
        INDEX (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $pdo->exec($sql);
    
    echo JSON_encode(['status' => 'success', 'message' => 'Tabela sessions została utworzona lub już istnieje.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo JSON_encode(['status' => 'error', 'message' => 'Błąd bazy danych: ' . $e->getMessage()]);
}
?>
