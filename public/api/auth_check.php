<?php
// Security Middleware
// Usage: require_once 'auth_check.php'; -> sets $currentUser

require_once __DIR__ . '/config.php';

// TOTAL CACHE DISABLE FOR ALL API REQUESTS
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("Expires: Wed, 11 Jan 1984 05:00:00 GMT"); // Date in the past

// Try to find the Authorization header in various places
$authHeader = null;
if (function_exists('getallheaders')) {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
    } elseif (isset($headers['authorization'])) {
        $authHeader = $headers['authorization'];
    }
}

// Fallback to $_SERVER variables if getallheaders() failed or returned nothing
if (!$authHeader) {
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['HTTP_X_AUTH_TOKEN'])) {
        // Support custom header X-Auth-Token
        $authHeader = 'Bearer ' . $_SERVER['HTTP_X_AUTH_TOKEN'];
    }
}

if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(["message" => "Brak tokena autoryzacji."]);
    exit;
}

$token = $matches[1];

$connAuth = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
$stmt = $connAuth->prepare("SELECT id, email, role, name FROM users WHERE session_token = ? AND session_expires > NOW()");
$stmt->bind_param("s", $token);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    http_response_code(401);
    echo json_encode(["message" => "Sesja wygasła. Zaloguj się ponownie."]);
    exit;
}

$currentUser = $res->fetch_assoc();
$connAuth->close();
?>
