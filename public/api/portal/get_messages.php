<?php
require_once '../config.php';
header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
// Prevent browser caching
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

require_once '../config.php';
require_once '../RedisService.php';
require_once '../auth_check.php';

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed"]);
    exit;
}

$userId = $currentUser['id'];

// 2. REDIS CACHE CHECK
$redis = new RedisService();
$cacheKey = "chat_history_" . $userId;
$cachedMessages = $redis->get($cacheKey);

if ($cachedMessages) {
    echo json_encode(["messages" => $cachedMessages, "source" => "cache"]);
    $conn->close();
    exit;
}

// 3. Pobierz z SQL (jeśli brak w cache)
$msgStmt = $conn->prepare("SELECT * FROM messages WHERE user_id = ? ORDER BY created_at ASC");
$msgStmt->bind_param("i", $userId);
$msgStmt->execute();
$messages = $msgStmt->get_result()->fetch_all(MYSQLI_ASSOC);

// 4. Mark admin messages as read
$updateStmt = $conn->prepare("UPDATE messages SET is_read = 1 WHERE user_id = ? AND sender_type = 'admin'");
$updateStmt->bind_param("i", $userId);
$updateStmt->execute();

// Zapisz w Redis na 1 godzinę (lub do momentu nowej wiadomości)
$redis->set($cacheKey, $messages, 3600);

echo json_encode([
    "messages" => $messages,
    "source" => "database"
]);

$conn->close();
?>