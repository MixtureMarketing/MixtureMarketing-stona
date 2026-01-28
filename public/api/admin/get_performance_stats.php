<?php
require_once '../db.php';

header('Content-Type: application/json');

// Weryfikacja tokenu (tylko admin)
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);

if (!$token) {
    // Fallback dla X-Auth-Token
    $token = $headers['X-Auth-Token'] ?? '';
}

if (!$token) {
    http_response_code(401);
    echo JSON_encode(['error' => 'Brak autoryzacji']);
    exit;
}

try {
    $pdo = get_db_connection();

    // 1. Weryfikacja sesji
    $stmt = $pdo->prepare("SELECT user_id, role FROM sessions WHERE session_token = ? AND expires_at > NOW()");
    $stmt->execute([$token]);
    $session = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$session || $session['role'] !== 'admin') {
        http_response_code(403);
        echo JSON_encode(['error' => 'Brak uprawnień']);
        exit;
    }

    // 2. Pobierz średnie wartości (LCP, CLS, INP, TTFB)
    $statsQuery = "
        SELECT 
            metric_name, 
            AVG(metric_value) as avg_value, 
            COUNT(*) as count,
            device_type
        FROM performance_metrics 
        WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY) -- Ostatnie 7 dni
        GROUP BY metric_name, device_type
    ";
    $statsStmt = $pdo->query($statsQuery);
    $averages = $statsStmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Pobierz ostatnie 50 wpisów (Logi)
    $logsQuery = "
        SELECT metric_name, metric_value, page_url, device_type, created_at 
        FROM performance_metrics 
        ORDER BY created_at DESC 
        LIMIT 50
    ";
    $logsStmt = $pdo->query($logsQuery);
    $logs = $logsStmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. Transformacja danych dla Frontendu
    $dashboardData = [
        'lcp' => ['desktop' => 0, 'mobile' => 0],
        'cls' => ['desktop' => 0, 'mobile' => 0],
        'inp' => ['desktop' => 0, 'mobile' => 0],
        'ttfb' => ['desktop' => 0, 'mobile' => 0],
        'sample_size' => 0
    ];

    foreach ($averages as $row) {
        $metric = strtolower($row['metric_name']);
        $device = $row['device_type'] ?: 'desktop';
        if (isset($dashboardData[$metric])) {
            $dashboardData[$metric][$device] = round($row['avg_value'], 2); // 2 miejsca po przecinku
        }
        $dashboardData['sample_size'] += $row['count'];
    }

    // Korekta CLS (mnożymy razy 1000 dla czytelności lub zostawiamy float?) 
    // Google podaje CLS jako float (np. 0.05). Zostawiamy float.

    echo JSON_encode([
        'summary' => $dashboardData,
        'logs' => $logs
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo JSON_encode(['error' => 'Błąd bazy danych: ' . $e->getMessage()]);
}
?>
