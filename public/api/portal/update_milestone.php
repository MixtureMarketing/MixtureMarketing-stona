<?php
require_once '../config.php';
header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token");

require_once '../config.php';
require_once '../auth_check.php';

$data = json_decode(file_get_contents("php://input"), true);
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

$id = $data['id'] ?? null;
$status = $data['status'] ?? ''; // 'accepted' or 'corrections'
$feedback = $data['feedback'] ?? '';

if (!$id || !in_array($status, ['accepted', 'corrections'])) {
    http_response_code(400);
    exit;
}

// Sprawdź czy to projekt tego klienta (bezpieczeństwo)
$check = $conn->prepare("SELECT m.id FROM milestones m JOIN projects p ON m.project_id = p.id WHERE m.id = ? AND p.user_id = ?");
$check->bind_param("ii", $id, $currentUser['id']);
$check->execute();
if ($check->get_result()->num_rows === 0) {
    http_response_code(403);
    exit;
}

$stmt = $conn->prepare("UPDATE milestones SET status=?, feedback=? WHERE id=?");
$stmt->bind_param("ssi", $status, $feedback, $id);

if ($stmt->execute()) {
    echo json_encode(["message" => "Status zaktualizowany."]);
} else {
    http_response_code(500);
}

$conn->close();
?>