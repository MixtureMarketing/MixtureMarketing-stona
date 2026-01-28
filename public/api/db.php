<?php
require_once __DIR__ . '/config.php';

function get_db_connection() {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (\PDOException $e) {
        // W produkcji nie pokazujemy szczegółów błędu użytkownikowi
        error_log($e->getMessage());
        throw new \PDOException($e->getMessage(), (int)$e->getCode());
    }
}
?>
