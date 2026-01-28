<?php
require_once '../config.php';
header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token");

require_once '../config.php';
require_once 'check_admin.php';

$data = json_decode(file_get_contents("php://input"), true);
$docId = $data['id'] ?? null;

if (!$docId) {
    http_response_code(400);
    exit;
}

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// 1. Get file path
$stmt = $conn->prepare("SELECT file_path FROM documents WHERE id = ?");
$stmt->bind_param("i", $docId);
$stmt->execute();
$res = $stmt->get_result();
$doc = $res->fetch_assoc();

if ($doc) {
    $fullPath = __DIR__ . '/../../' . $doc['file_path'];
    if (file_exists($fullPath)) {
        unlink($fullPath);
    }

    // 2. Delete from DB
    $del = $conn->prepare("DELETE FROM documents WHERE id = ?");
    $del->bind_param("i", $docId);
    $del->execute();

    echo json_encode(["message" => "Dokument usunięty."]);
} else {
    http_response_code(404);
}

$conn->close();
?>