<?php
// Secure Admin Check Middleware
// Usage: require_once 'check_admin.php';

require_once '../auth_check.php'; // sets $currentUser

if (!$currentUser || $currentUser['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["message" => "Brak uprawnień administratora."]);
    exit;
}
?>