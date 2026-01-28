<?php
require_once '../config.php';
header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, X-Admin-Email");
// Prevent browser caching
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

require_once '../config.php';
require_once 'check_admin.php';

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// 1. Pobierz listę konwersacji (użytkowników z wiadomościami)
// Sortujemy po dacie ostatniej wiadomości
$conversationsQuery = "
    SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.company_name,
        MAX(m.created_at) as last_message_date,
        (SELECT COUNT(*) FROM messages WHERE user_id = u.id AND sender_type = 'client' AND is_read = 0) as unread_count
    FROM users u
    JOIN messages m ON u.id = m.user_id
    GROUP BY u.id
    ORDER BY last_message_date DESC
";

$conversations = $conn->query($conversationsQuery)->fetch_all(MYSQLI_ASSOC);

// 2. Jeśli podano ID użytkownika, pobierz pełną historię
$activeUserId = $_GET['user_id'] ?? null;
$messages = [];

if ($activeUserId) {
    $stmt = $conn->prepare("SELECT * FROM messages WHERE user_id = ? ORDER BY created_at ASC");
    $stmt->bind_param("i", $activeUserId);
    $stmt->execute();
    $messages = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    // Oznacz jako przeczytane - SECURE VERSION
    $updateStmt = $conn->prepare("UPDATE messages SET is_read = 1 WHERE user_id = ? AND sender_type = 'client'");
    $updateStmt->bind_param("i", $activeUserId);
    $updateStmt->execute();
}

echo json_encode([
    "conversations" => $conversations,
    "messages" => $messages
]);

$conn->close();
?>
