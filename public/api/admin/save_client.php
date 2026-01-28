<?php
require_once '../config.php';
header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, X-Admin-Email");

require_once '../config.php';
require_once 'check_admin.php';

$data = json_decode(file_get_contents("php://input"), true);
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

$id = $data['id'] ?? null;
$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$company = $data['company_name'] ?? '';

if (empty($email) || empty($name)) {
    http_response_code(400);
    echo json_encode(["message" => "Imię i Email są wymagane."]);
    exit;
}

if ($id) {
    // Update
    $stmt = $conn->prepare("UPDATE users SET name=?, email=?, company_name=? WHERE id=?");
    $stmt->bind_param("sssi", $name, $email, $company, $id);
} else {
    // Insert
    $stmt = $conn->prepare("INSERT INTO users (name, email, company_name, role) VALUES (?, ?, ?, 'client')");
    $stmt->bind_param("sss", $name, $email, $company);
}

if ($stmt->execute()) {
    echo json_encode(["message" => "Zapisano pomyślnie."]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Błąd bazy danych: " . $conn->error]);
}

$conn->close();
?>
