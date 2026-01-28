<?php
require_once '../config.php';

// Allow CORS for development and production
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$auditId = isset($_GET['auditId']) ? intval($_GET['auditId']) : null;

if (!$auditId) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Brak identyfikatora audytu."]);
    exit();
}

try {
    $dsn = "mysql:host=" . DB_AUDIT_HOST . ";dbname=" . DB_AUDIT_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_AUDIT_USER, DB_AUDIT_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // 1. Pobierz dane audytu
    $stmt = $pdo->prepare("SELECT audit_data, audit_score, website, name, place_id, email FROM leads WHERE id = :id");
    $stmt->execute([':id' => $auditId]);
    $result = $stmt->fetch();

    if (!$result) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Audyt nie został odnaleziony."]);
        exit();
    }

    // 2. Zaktualizuj licznik wyświetleń
    $updateStmt = $pdo->prepare("UPDATE leads SET report_views = report_views + 1, last_viewed_at = NOW() WHERE id = :id");
    $updateStmt->execute([':id' => $auditId]);

    // 3. Zwróć dane
    $auditData = json_decode($result['audit_data'], true);
    
    // Jeśli audit_data nie jest poprawnym JSONem, zwróć błąd
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Błąd dekodowania danych audytu."]);
        exit();
    }

    // --- NORMALIZACJA DANYCH DLA FRONTENDU ---
    if (isset($auditData['client'])) {
        // 1. Obsługa podwójnego zagnieżdżenia metrics (v6.1-deep)
        if (isset($auditData['client']['metrics']['metrics'])) {
            $innerMetrics = $auditData['client']['metrics']['metrics'];
            if (isset($innerMetrics['lcp_value'])) $auditData['client']['metrics']['lcp_value'] = $innerMetrics['lcp_value'];
            if (isset($innerMetrics['cls_value'])) $auditData['client']['metrics']['cls_value'] = $innerMetrics['cls_value'];
            // Próba mapowania starszych kluczy jeśli są w środku
            if (!isset($auditData['client']['metrics']['lcp_value']) && isset($innerMetrics['lcp'])) {
                $auditData['client']['metrics']['lcp_value'] = $innerMetrics['lcp'];
            }
        }

        // 2. Mapowanie metrics (lcp -> lcp_value) dla starszych wersji
        if (isset($auditData['client']['metrics'])) {
            if (!isset($auditData['client']['metrics']['lcp_value']) && isset($auditData['client']['metrics']['lcp'])) {
                $auditData['client']['metrics']['lcp_value'] = $auditData['client']['metrics']['lcp'];
            }
            if (!isset($auditData['client']['metrics']['cls_value']) && isset($auditData['client']['metrics']['cls'])) {
                $auditData['client']['metrics']['cls_value'] = $auditData['client']['metrics']['cls'];
            }
            
            // 3. Obsługa punktacji Best Practices (Lighthouse używa best-practices)
            if (isset($auditData['client']['metrics']['scores'])) {
                $s = &$auditData['client']['metrics']['scores'];
                if (isset($s['best-practices']) && (!isset($s['best_practices']) || $s['best_practices'] == 0)) {
                    $s['best_practices'] = $s['best-practices'];
                }
            }
        }

        // 4. Mapowanie reputation (reviews -> reviews_count)
        if (isset($auditData['client']['reputation'])) {
            if (!isset($auditData['client']['reputation']['reviews_count']) && isset($auditData['client']['reputation']['reviews'])) {
                $auditData['client']['reputation']['reviews_count'] = $auditData['client']['reputation']['reviews'];
            }
        }
    }

    echo json_encode([
        "status" => "success",
        "data" => $auditData,
        "meta" => [
            "audit_id" => $auditId,
            "score" => $result['audit_score'],
            "website" => $result['website'],
            "name" => $result['name'],
            "place_id" => $result['place_id'],
            "email" => $result['email']
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Błąd bazy danych: " . $e->getMessage()]);
}
?>
