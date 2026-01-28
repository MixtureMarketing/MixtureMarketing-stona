<?php
// Secure File Download Proxy
require_once '../config.php';
require_once '../auth_check.php'; // Ensures $currentUser is set

if (!isset($_GET['id'])) {
    http_response_code(400);
    exit('Brak ID pliku.');
}

$docId = intval($_GET['id']);
$userId = $currentUser['id'];
$isAdmin = ($currentUser['role'] === 'admin');

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    http_response_code(500);
    exit('DB Error');
}

// Check permissions
// We join projects to check ownership
$query = "
    SELECT d.file_path, d.name, p.user_id 
    FROM documents d
    JOIN projects p ON d.project_id = p.id
    WHERE d.id = ?
";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $docId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    exit('Plik nie istnieje.');
}

$doc = $result->fetch_assoc();

// Security Check
if (!$isAdmin && $doc['user_id'] != $userId) {
    http_response_code(403);
    exit('Brak dostępu do tego pliku.');
}

// Serve File
$filePath = __DIR__ . '/../../' . $doc['file_path']; // Relative to api/portal/

if (!file_exists($filePath)) {
    http_response_code(404);
    exit('Plik fizycznie nie istnieje na serwerze.');
}

header('Content-Description: File Transfer');
header('Content-Type: application/pdf');
header('Content-Disposition: inline; filename="' . basename($doc['name']) . '"');
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');
header('Content-Length: ' . filesize($filePath));
readfile($filePath);
exit;
?>