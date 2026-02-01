<?php
require_once 'db.php';

// Endpoint RUM (Real User Metrics) - musi być ultra-szybki
// Nie używamy sesji, auth ani zbędnych bibliotek

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

// Pobierz dane (sendBeacon wysyła JSON jako text/plain lub application/json)
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['name']) || !isset($data['value'])) {
    http_response_code(400);
    exit;
}

// Prosta detekcja urządzenia
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
$isMobile = preg_match('/(android|iphone|ipad)/i', $userAgent);
$deviceType = $isMobile ? 'mobile' : 'desktop';

try {
    $pdo = get_db_connection();
    
    $stmt = $pdo->prepare("INSERT INTO performance_metrics (metric_name, metric_value, page_url, user_agent, device_type) VALUES (?, ?, ?, ?, ?)");
    
    // Skracamy URL do ścieżki
    $url = $data['url'] ?? '';
    $path = parse_url($url, PHP_URL_PATH) ?? $url;

    $stmt->execute([
        substr($data['name'], 0, 10), // np. "LCP"
        (float)$data['value'],         // np. 1200.5
        substr($path, 0, 255),
        substr($userAgent, 0, 255),
        $deviceType
    ]);

    http_response_code(201); // Created

} catch (Exception $e) {
    // RUM nie powinien nigdy rzucać błędów widocznych dla usera.
    // Jeśli baza nie działa (np. na localhoście), po prostu zwracamy sukces (200),
    // żeby nie spamować konsoli błędami 500.
    // error_log($e->getMessage()); 
    http_response_code(200); 
}
?>
