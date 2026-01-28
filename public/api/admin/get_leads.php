<?php
require_once '../config.php';
header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, X-Admin-Email");

require_once '../config.php';
require_once 'check_admin.php';

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Pobierz leady posortowane od najnowszych
$query = "SELECT * FROM leads ORDER BY created_at DESC";
$result = $conn->query($query);
$leads = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode([
    "leads" => $leads
]);

$conn->close();
?>
