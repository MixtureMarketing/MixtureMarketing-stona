<?php
// public/api/audit/debug.php
require_once 'audit_config.php';
require_once 'classes/RedisCache.php';

header("Content-Type: application/json");

$report = [
    'php_version' => PHP_VERSION,
    'backend_key_status' => (GOOGLE_BACKEND_KEY && GOOGLE_BACKEND_KEY !== 'TWOJ_KLUCZ_B_TUTAJ') ? 'LOADED' : 'MISSING',
    'redis' => [
        'extension_loaded' => class_exists('Redis'),
        'connection' => 'Testing...',
        'socket' => REDIS_HOST
    ],
    'google_api_connectivity' => 'Testing...'
];

// 1. Test Redisa
if ($report['redis']['extension_loaded']) {
    $cache = new AuditCache();
    // Próbujemy zapisać i odczytać coś prostego
    $cache->set('debug_test', 'working', 60);
    $val = $cache->get('debug_test');
    $report['redis']['connection'] = ($val === 'working') ? 'SUCCESS (Socket working)' : 'FAILED (Check socket path or permissions)';
} else {
    $report['redis']['connection'] = 'FAILED (Redis extension not installed in PHP)';
}

// 2. Test Google Connectivity (Klucz B)
if ($report['backend_key_status'] === 'LOADED') {
    $testUrl = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://google.com&key=" . GOOGLE_BACKEND_KEY . "&strategy=mobile";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $testUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        $report['google_api_connectivity'] = 'SUCCESS (Google API accepted your key)';
    } else {
        $data = json_decode($response, true);
        $report['google_api_connectivity'] = 'FAILED (HTTP ' . $httpCode . ') - ' . ($data['error']['message'] ?? 'Unknown error');
    }
} else {
    $report['google_api_connectivity'] = 'SKIPPED (No key provided)';
}

echo json_encode($report, JSON_PRETTY_PRINT);
?>