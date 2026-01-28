<?php
require_once '../config.php';
header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token");

require_once '../config.php';
require_once 'check_admin.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

$projectId = $_POST['project_id'] ?? null;
$docName = $_POST['name'] ?? '';
$docType = $_POST['type'] ?? 'document'; // 'invoice' or 'document'
$docSubtype = $_POST['subtype'] ?? 'other'; // 'contract', 'nda', etc.

if (!$projectId || empty($docName) || !isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(["message" => "Brak wymaganych danych."]);
    exit;
}

// 1. Prepare Upload Directory
$uploadDir = __DIR__ . '/../../uploads/docs/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// 2. Handle File
$file = $_FILES['file'];
$fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if ($fileExt !== 'pdf') {
    http_response_code(400);
    echo json_encode(["message" => "Dozwolone są tylko pliki PDF."]);
    exit;
}

// Security: Randomize filename
$newFileName = bin2hex(random_bytes(16)) . '.pdf';
$targetPath = $uploadDir . $newFileName;
$dbPath = 'uploads/docs/' . $newFileName;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    // 3. Save to DB
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    $stmt = $conn->prepare("INSERT INTO documents (project_id, name, file_path, type, subtype) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("issss", $projectId, $docName, $dbPath, $docType, $docSubtype);

    if ($stmt->execute()) {
        echo json_encode(["message" => "Plik został wgrany pomyślnie."]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Błąd zapisu w bazie danych."]);
    }
    $conn->close();
} else {
    http_response_code(500);
    echo json_encode(["message" => "Błąd podczas przesyłania pliku na serwer."]);
}
?>