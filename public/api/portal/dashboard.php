<?php
require_once '../config.php';
header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once '../config.php';
require_once '../auth_check.php'; // sets $currentUser

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed"]);
    exit;
}

$userId = $currentUser['id'];

// 2. Pobierz projekty
$projStmt = $conn->prepare("SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC");
$projStmt->bind_param("i", $userId);
$projStmt->execute();
$projects = $projStmt->get_result()->fetch_all(MYSQLI_ASSOC);

// 3. Pobierz dokumenty i kamienie milowe dla każdego projektu
foreach ($projects as &$project) {
    // Documents
    $docStmt = $conn->prepare("SELECT id, name, file_path, type, subtype, created_at FROM documents WHERE project_id = ? ORDER BY created_at DESC");
    $docStmt->bind_param("i", $project['id']);
    $docStmt->execute();
    $project['documents'] = $docStmt->get_result()->fetch_all(MYSQLI_ASSOC);

    // Milestones (NEW)
    $mileStmt = $conn->prepare("SELECT * FROM milestones WHERE project_id = ? ORDER BY due_date ASC, id ASC");
    $mileStmt->bind_param("i", $project['id']);
    $mileStmt->execute();
    $project['milestones'] = $mileStmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

http_response_code(200);
echo json_encode([
    "projects" => $projects
]);

$conn->close();
?>
