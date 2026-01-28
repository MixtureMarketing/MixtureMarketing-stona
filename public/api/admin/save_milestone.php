<?php
require_once '../config.php';
header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token");

require_once '../config.php';
require_once 'check_admin.php';

$data = json_decode(file_get_contents("php://input"), true);
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

$id = $data['id'] ?? null;
$projectId = $data['project_id'] ?? null;
$title = $data['title'] ?? '';
$description = $data['description'] ?? '';
$dueDate = $data['due_date'] ?? null;
$status = $data['status'] ?? 'pending';

if (!$projectId || empty($title)) {
    http_response_code(400);
    echo json_encode(["message" => "Brak wymaganych danych."]);
    exit;
}

if ($id) {
    $stmt = $conn->prepare("UPDATE milestones SET title=?, description=?, due_date=?, status=? WHERE id=?");
    $stmt->bind_param("ssssi", $title, $description, $dueDate, $status, $id);
} else {
    $stmt = $conn->prepare("INSERT INTO milestones (project_id, title, description, due_date, status) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("issss", $projectId, $title, $description, $dueDate, $status);
}

if ($stmt->execute()) {
    echo json_encode(["message" => "Kamień milowy zapisany."]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Błąd bazy."]);
}

$conn->close();
?>