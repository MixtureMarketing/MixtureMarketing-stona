<?php
require_once '../config.php';
header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once '../config.php';

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));
$token = $data->token ?? '';

if (empty($token)) {
    http_response_code(400);
    echo json_encode(["message" => "Brak tokena."]);
    exit;
}

// 1. Sprawdź token
$stmt = $conn->prepare("SELECT id, email, expires_at, used FROM auth_tokens WHERE token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(["message" => "Nieprawidłowy token."]);
    exit;
}

$tokenData = $result->fetch_assoc();

// Walidacja czasu i użycia
if ($tokenData['used'] == 1) {
    http_response_code(401);
    echo json_encode(["message" => "Link został już wykorzystany."]);
    exit;
}

if (strtotime($tokenData['expires_at']) < time()) {
    http_response_code(401);
    echo json_encode(["message" => "Link wygasł."]);
    exit;
}

// 2. Oznacz jako użyty
$updateStmt = $conn->prepare("UPDATE auth_tokens SET used = 1 WHERE id = ?");
$updateStmt->bind_param("i", $tokenData['id']);
$updateStmt->execute();

// 3. Pobierz dane użytkownika
$userStmt = $conn->prepare("SELECT id, name, email, role, company_name FROM users WHERE email = ?");
$userStmt->bind_param("s", $tokenData['email']);
$userStmt->execute();
$userResult = $userStmt->get_result();
$user = $userResult->fetch_assoc();

if (!$user) {
    http_response_code(404);
    echo json_encode(["message" => "Użytkownik nie istnieje."]);
    exit;
}

// 4. Wygeneruj session_token
$sessionToken = bin2hex(random_bytes(32));
$expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));

// Aktualizacja starej tabeli (dla kompatybilności wstecznej)
$sessionStmt = $conn->prepare("UPDATE users SET session_token = ?, session_expires = ? WHERE id = ?");
$sessionStmt->bind_param("ssi", $sessionToken, $expiresAt, $user['id']);
$sessionStmt->execute();

// Wstawienie do nowej tabeli sessions (DLA RUM I NOWYCH API)
// Upewnij się, że role, ip i user_agent są zapisane
$role = $user['role'];
$ip = $_SERVER['REMOTE_ADDR'] ?? '';
$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';

$newSessionStmt = $conn->prepare("INSERT INTO sessions (user_id, session_token, role, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?, ?)");
$newSessionStmt->bind_param("isssss", $user['id'], $sessionToken, $role, $ip, $ua, $expiresAt);
$newSessionStmt->execute();

// Sukces
http_response_code(200);
echo json_encode([
    "message" => "Zalogowano pomyślnie",
    "user" => $user,
    "session_token" => $sessionToken
]);

$conn->close();
?>
