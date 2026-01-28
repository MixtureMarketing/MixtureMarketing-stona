<?php
require_once '../config.php';
header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, X-Admin-Email");

require_once '../config.php';
require_once 'check_admin.php';
require_once '../RedisService.php'; // Include RedisService
require_once '../PHPMailer/Exception.php';
require_once '../PHPMailer/PHPMailer.php';
require_once '../PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$data = json_decode(file_get_contents("php://input"), true);
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

$userId = $data['user_id'] ?? null;
$content = $data['content'] ?? '';

if (empty($userId) || empty($content)) {
    http_response_code(400);
    echo json_encode(["message" => "Brak danych."]);
    exit;
}

// 1. Zapisz wiadomość
$stmt = $conn->prepare("INSERT INTO messages (user_id, content, sender_type, is_read) VALUES (?, ?, 'admin', 1)");
$stmt->bind_param("is", $userId, $content);

if ($stmt->execute()) {
    // 1.5 REDIS INVALIDATION (CRITICAL FIX)
    // Wyczyść cache klienta, aby od razu zobaczył odpowiedź admina
    $redis = new RedisService();
    $redis->delete("chat_history_" . $userId);

    echo json_encode(["message" => "Wysłano."]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Błąd bazy."]);
}

$conn->close();
?>
