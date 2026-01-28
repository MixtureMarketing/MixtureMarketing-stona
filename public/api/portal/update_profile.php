<?php
require_once '../config.php';
header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once '../config.php';
require_once '../auth_check.php'; // sets $currentUser

$data = json_decode(file_get_contents("php://input"), true);
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed"]);
    exit;
}

$name = $data['name'] ?? '';
$companyName = $data['company_name'] ?? '';

if (empty($name)) {
    http_response_code(400);
    echo json_encode(["message" => "Imię i nazwisko nie może być puste."]);
    exit;
}

$userId = $currentUser['id'];

$stmt = $conn->prepare("UPDATE users SET name = ?, company_name = ? WHERE id = ?");
$stmt->bind_param("ssi", $name, $companyName, $userId);

if ($stmt->execute()) {
    // Return updated user data
    $userRes = $conn->query("SELECT id, name, email, role, company_name FROM users WHERE id = $userId");
    $updatedUser = $userRes->fetch_assoc();
    
    echo json_encode([
        "message" => "Profil zaktualizowany pomyślnie.",
        "user" => $updatedUser
    ]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Błąd podczas aktualizacji profilu."]);
}

$conn->close();
?>
