<?php
require_once 'config.php';
header("Content-Type: application/json");

try {
    $dsn = "mysql:host=" . DB_HOST . ";charset=utf8";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    $pdo->exec("USE `" . DB_NAME . "`");
    
    // Sprawdź kolumny w tabeli leads
    $stmt = $pdo->query("DESCRIBE leads");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo json_encode([
        "status" => "success",
        "message" => "Database connection OK",
        "columns" => $columns
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>