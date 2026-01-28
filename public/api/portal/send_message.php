<?php
require_once '../config.php';
header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once '../config.php';
require_once '../PHPMailer/Exception.php';
require_once '../PHPMailer/PHPMailer.php';
require_once '../PHPMailer/SMTP.php';
require_once '../RedisService.php';
require_once '../auth_check.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$data = json_decode(file_get_contents("php://input"), true);
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

$content = $data['content'] ?? '';
$senderType = $data['sender_type'] ?? 'client'; 

if (empty($content)) {
    http_response_code(400);
    echo json_encode(["message" => "Brak danych."]);
    exit;
}

$userId = $currentUser['id'];
$email = $currentUser['email'];

// 2. Zapisz wiadomość
$insertStmt = $conn->prepare("INSERT INTO messages (user_id, content, sender_type) VALUES (?, ?, ?)");
$insertStmt->bind_param("iss", $userId, $content, $senderType);

if ($insertStmt->execute()) {
    
    // REDIS INVALIDATION: Wyczyść cache tego użytkownika, aby pobrał nową wiadomość
    $redis = new RedisService();
    $redis->delete("chat_history_" . $userId);

    echo json_encode(["message" => "Wysłano."]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Błąd bazy danych."]);
}

$conn->close();
?>