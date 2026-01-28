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
$user_id = $data['user_id'] ?? null;
$name = $data['name'] ?? '';
$type = $data['type'] ?? 'web';
$status = $data['status'] ?? 'pending';
$progress = $data['progress'] ?? 0;
$budget = $data['budget'] ?? '';
$drive_link = $data['drive_link'] ?? '';
$next_milestone = $data['next_milestone'] ?? '';
$next_milestone_date = $data['next_milestone_date'] ?? null;

if (empty($name) || empty($user_id)) {
    http_response_code(400);
    echo json_encode(["message" => "Nazwa projektu i Klient są wymagane."]);
    exit;
}

// Obsługa pustej daty
if (empty($next_milestone_date)) $next_milestone_date = null;

if ($id) {
    // Update
    $stmt = $conn->prepare("UPDATE projects SET user_id=?, name=?, type=?, status=?, progress=?, budget=?, drive_link=?, next_milestone=?, next_milestone_date=? WHERE id=?");
    $stmt->bind_param("isssissssi", $user_id, $name, $type, $status, $progress, $budget, $drive_link, $next_milestone, $next_milestone_date, $id);
} else {
    // Insert
    $stmt = $conn->prepare("INSERT INTO projects (user_id, name, type, status, progress, budget, drive_link, next_milestone, next_milestone_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isssissss", $user_id, $name, $type, $status, $progress, $budget, $drive_link, $next_milestone, $next_milestone_date);
}

if ($stmt->execute()) {
    echo json_encode(["message" => "Projekt zapisany."]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Błąd: " . $conn->error]);
}

$conn->close();
?>
