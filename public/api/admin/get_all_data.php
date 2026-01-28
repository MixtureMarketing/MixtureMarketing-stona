<?php
require_once '../config.php';
header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, X-Admin-Email");

require_once '../config.php';
require_once 'check_admin.php';

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Pobierz klientów
$clients = $conn->query("SELECT id, name, email, company_name FROM users WHERE role = 'client' ORDER BY created_at DESC")->fetch_all(MYSQLI_ASSOC);

// Pobierz projekty
$projects = $conn->query("
    SELECT p.*, u.name as client_name, u.company_name 
    FROM projects p 
    LEFT JOIN users u ON p.user_id = u.id 
    ORDER BY p.updated_at DESC
")->fetch_all(MYSQLI_ASSOC);

// Pobierz dokumenty i kamienie milowe dla projektów
foreach ($projects as &$project) {
    // Documents
    $docStmt = $conn->prepare("SELECT * FROM documents WHERE project_id = ? ORDER BY created_at DESC");
    $docStmt->bind_param("i", $project['id']);
    $docStmt->execute();
    $project['documents'] = $docStmt->get_result()->fetch_all(MYSQLI_ASSOC);

    // Milestones (NEW)
    $mileStmt = $conn->prepare("SELECT * FROM milestones WHERE project_id = ? ORDER BY due_date ASC, id ASC");
    $mileStmt->bind_param("i", $project['id']);
    $mileStmt->execute();
    $project['milestones'] = $mileStmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

echo json_encode([
    "clients" => $clients,
    "projects" => $projects
]);

$conn->close();
?>
