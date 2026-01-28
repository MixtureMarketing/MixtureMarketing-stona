<?php
// Error reporting disabled in production
error_reporting(0);
ini_set('display_errors', 0);

require_once 'config.php';
header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once 'config.php';
require_once 'PHPMailer/Exception.php';
require_once 'PHPMailer/PHPMailer.php';
require_once 'PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // 1. Odbierz dane
    $email = $_POST['email'] ?? '';
    $data = isset($_POST['data']) ? json_decode($_POST['data'], true) : [];
    
    // Walidacja
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["message" => "Nieprawidłowy adres email."]);
        exit;
    }

    // Walidacja pliku PDF
    if (!isset($_FILES['pdf']) || $_FILES['pdf']['error'] != UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(["message" => "Błąd przesyłania pliku PDF."]);
        exit;
    }

    $pdfPath = $_FILES['pdf']['tmp_name'];
    $pdfName = $_FILES['pdf']['name'];
    
    // Strict MIME check
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    if ($finfo->file($pdfPath) !== 'application/pdf') {
        http_response_code(400);
        echo json_encode(["message" => "Niedozwolony format pliku. Wymagany PDF."]);
        exit;
    }

    // 2. Przygotuj treść wiadomości
    $selections = $data['selections'] ?? [];
    $result = $data['result'] ?? [];
    
    $projectMap = [
        'landingPage' => 'Landing Page',
        'corporate' => 'Strona Firmowa',
        'ecommerce' => 'Sklep Internetowy',
        'webApp' => 'Aplikacja Webowa / SaaS'
    ];
    
    $designMap = [
        'template' => 'Minimalistyczny',
        'custom' => 'Custom Standard',
        'premium' => 'Premium'
    ];

    $featureMap = [
        'cms' => 'System CMS',
        'blog' => 'Moduł Bloga',
        'i18n' => 'Wielojęzyczność',
        'integrations' => 'Integracje API',
        'payments' => 'Płatności Online',
        'auth' => 'Konta Użytkowników',
        'filtering' => 'Zaawansowane Filtrowanie',
        'copywriting' => 'Copywriting',
        'seo' => 'Pakiet SEO',
        'social' => 'Social Media Setup'
    ];

    $projectType = $projectMap[$selections['projectType']] ?? $selections['projectType'];
    $designLevel = $designMap[$selections['designLevel']] ?? $selections['designLevel'];
    $priceRange = number_format($result['minPrice'], 0, '.', ' ') . ' - ' . number_format($result['maxPrice'], 0, '.', ' ');
    $timeRange = "{$result['minTime']} - {$result['maxTime']}";
    
    // Combine features and marketing, then map to readable names
    $allExtras = array_merge($selections['features'] ?? [], $selections['marketing'] ?? []);
    $readableExtras = array_map(function($key) use ($featureMap) {
        return $featureMap[$key] ?? $key;
    }, $allExtras);
    
    $featuresList = !empty($readableExtras) ? implode(', ', $readableExtras) : 'Brak dodatkowych opcji';

    // Load Template
    $template = file_get_contents(__DIR__ . '/templates/email_calculator.html');
    
    // Replace Placeholders
    $messageBody = str_replace(
        ['{{PRICE_RANGE}}', '{{TIME_RANGE}}', '{{PROJECT_TYPE}}', '{{DESIGN_LEVEL}}', '{{FEATURES}}'],
        [$priceRange, $timeRange, $projectType, $designLevel, $featuresList],
        $template
    );

    // 3. Wyślij Email do Klienta (z załącznikiem)
    $mail = new PHPMailer(true);
    try {
        // Serwer SMTP
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USER;
        $mail->Password   = SMTP_PASS;
        $mail->SMTPSecure = SMTP_SECURE;
        $mail->Port       = SMTP_PORT;
        $mail->CharSet    = 'UTF-8';

        // Odbiorca
        $mail->setFrom(SMTP_USER, 'Mixture Marketing');
        $mail->addAddress($email);
        $mail->addReplyTo(NOTIFY_EMAIL, 'Mixture Marketing');

        // Załącznik
        $mail->addAttachment($pdfPath, $pdfName);

        // Treść
        $mail->isHTML(true);
        $mail->Subject = 'Twoja Wycena Projektu - Mixture Marketing';
        $mail->Body    = $messageBody;

        $mail->send();

        // 4. Wyślij Powiadomienie do Admina (bez załącznika, tylko info)
        $adminMail = new PHPMailer(true);
        $adminMail->isSMTP();
        $adminMail->Host       = SMTP_HOST;
        $adminMail->SMTPAuth   = true;
        $adminMail->Username   = SMTP_USER;
        $adminMail->Password   = SMTP_PASS;
        $adminMail->SMTPSecure = SMTP_SECURE;
        $adminMail->Port       = SMTP_PORT;
        $adminMail->CharSet    = 'UTF-8';

        $adminMail->setFrom(SMTP_USER, 'Kalkulator Wycen');
        $adminMail->addAddress(NOTIFY_EMAIL);
        
        $adminBody = "
        <h2>Nowy Lead z Kalkulatora</h2>
        <p><strong>Email:</strong> $email</p>
        <p><strong>Projekt:</strong> $projectType ($designLevel)</p>
        <p><strong>Budżet:</strong> $priceRange</p>
        <p><strong>Funkcje:</strong> " . implode(', ', $selections['features'] ?? []) . "</p>
        ";

        $adminMail->isHTML(true);
        $adminMail->Subject = "Nowy Lead (Kalkulator): $email";
        $adminMail->Body    = $adminBody;
        
        $adminMail->send();

        // 5. ZAPISZ DO BAZY SQL (Kluczowa poprawka)
        try {
            $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
            if (!$conn->connect_error) {
                $serviceType = "Kalkulator: " . $projectType;
                $stmt = $conn->prepare("INSERT INTO leads (email, name, service_type, message, budget, source, status) VALUES (?, ?, ?, ?, ?, 'calculator', 'new')");
                $anon = "Klient z Kalkulatora";
                $featuresStr = "Funkcje: " . $featuresList;
                $stmt->bind_param("sssss", $email, $anon, $serviceType, $featuresStr, $priceRange);
                $stmt->execute();
                $conn->close();
            }
        } catch (Exception $e) {
            // Ignorujemy błąd zapisu do bazy, jeśli mail poszedł (lepsze to niż błąd 500)
        }

        http_response_code(200);
        echo json_encode(["message" => "Wycena wysłana pomyślnie."]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "Błąd wysyłania wiadomości: {$mail->ErrorInfo}"]);
    }

} else {
    http_response_code(405);
    echo json_encode(["message" => "Metoda niedozwolona."]);
}
?>
