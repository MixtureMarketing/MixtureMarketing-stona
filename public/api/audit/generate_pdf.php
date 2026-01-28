<?php
// public/api/audit/generate_pdf.php (Renamed logically to send_report.php but kept for frontend compatibility)
require_once 'audit_config.php';
require_once '../PHPMailer/Exception.php';
require_once '../PHPMailer/PHPMailer.php';
require_once '../PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

$input = json_decode(file_get_contents("php://input"), true);
$data = $input['data'] ?? null;
$clientEmail = $input['email'] ?? '';

if (!$data || !$clientEmail) {
    echo json_encode(['status' => 'error', 'message' => 'Missing data']);
    exit;
}

$client = $data['client'];
$score = $client['total_score'];
$url = $client['url'];

// --- 1. GENERATE CLIENT HTML EMAIL ---
function generateClientEmail($data, $score, $url) {
    $c = $data['client'];
    
    // Status Color Logic
    $color = ($score >= 80) ? '#22c55e' : (($score >= 50) ? '#eab308' : '#ef4444');
    $statusText = ($score >= 80) ? 'Stan Wzorowy' : (($score >= 50) ? 'Stan Ostrzegawczy' : 'Stan Krytyczny');
    
    // Error List Generation
    $errorListHtml = '';
    $errMap = [
        'NO_SSL' => ['icon' => '🔒', 'title' => 'Brak SSL', 'desc' => 'Strona oznaczona jako niebezpieczna.'],
        'SLOW_LCP' => ['icon' => '🐢', 'title' => 'Wolny Serwer', 'desc' => 'Czas ładowania powyżej 4s odstrasza klientów.'],
        'NO_MOBILE' => ['icon' => '📱', 'title' => 'Brak Wersji Mobile', 'desc' => 'Strona nieczytelna na telefonach.'],
        'NO_ANALYTICS' => ['icon' => '📉', 'title' => 'Brak Analityki', 'desc' => 'Nie wiesz, skąd masz klientów.'],
        'NO_PIXEL' => ['icon' => '👻', 'title' => 'Brak Pixela FB', 'desc' => 'Nie możesz robić remarketingu.'],
        'BAD_A11Y' => ['icon' => '🚫', 'title' => 'Niedostępność', 'desc' => 'Problemy dla osób niepełnosprawnych.'],
        'NO_OG' => ['icon' => '🔗', 'title' => 'Brzydkie Linki', 'desc' => 'Brak zdjęcia przy udostępnianiu na FB/LinkedIn.'],
        'NO_ALTS' => ['icon' => '🖼️', 'title' => 'Ślepe Obrazki', 'desc' => 'Brak opisów ALT dla Google.'],
        'BAD_H1' => ['icon' => '📑', 'title' => 'Chaos w Nagłówkach', 'desc' => 'Zła struktura H1/H2.'],
        'THIN_CONTENT' => ['icon' => '📄', 'title' => 'Mało Treści', 'desc' => 'Strona wygląda na pustą dla Google.'],
    ];

    foreach ($c['audit_results'] as $key => $isError) {
        if ($isError && isset($errMap[$key])) {
            $e = $errMap[$key];
            $errorListHtml .= "
            <div style='background-color: #fff; padding: 15px; border-radius: 12px; margin-bottom: 10px; border-left: 4px solid #ef4444; box-shadow: 0 2px 4px rgba(0,0,0,0.05);'>
                <div style='font-weight: bold; color: #1e293b; display: flex; align-items: center; gap: 8px;'>
                    <span style='font-size: 18px;'>{$e['icon']}</span> {$e['title']}
                </div>
                <div style='font-size: 13px; color: #64748b; margin-top: 4px;'>{$e['desc']}</div>
            </div>";
        }
    }

    if (empty($errorListHtml)) {
        $errorListHtml = "<div style='text-align:center; padding: 20px; color: #22c55e;'>🎉 Nie wykryto krytycznych błędów!</div>";
    }

    // Template
    return "
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden; }
            .header { background-color: #1e293b; padding: 40px 20px; text-align: center; color: white; }
            .score-circle { width: 100px; height: 100px; border-radius: 50%; background: white; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 900; color: {$color}; border: 6px solid {$color}; line-height: 100px; text-align: center; }
            .content { padding: 30px 20px; }
            .btn { display: inline-block; background-color: #2563eb; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <div style='font-size: 12px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.8; margin-bottom: 10px;'>Raport Audytu 360™</div>
                <h1 style='margin: 0; font-size: 24px;'>Twój Wynik Cyfrowy</h1>
            </div>
            <div class='content'>
                <div class='score-circle'>{$score}</div>
                <div style='text-align: center; font-size: 18px; font-weight: bold; color: #1e293b; margin-bottom: 30px;'>{$statusText}</div>
                
                <p style='color: #475569; line-height: 1.6;'>
                    Przeanalizowaliśmy stronę <strong>{$url}</strong> pod kątem wydajności, SEO i bezpieczeństwa. 
                    Oto lista elementów, które wymagają Twojej uwagi, abyś przestał tracić klientów.
                </p>

                <h3 style='color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 30px;'>🚨 Lista Priorytetowa</h3>
                {$errorListHtml}

                <div style='background-color: #eff6ff; padding: 20px; border-radius: 12px; margin-top: 30px; text-align: center;'>
                    <h3 style='color: #1d4ed8; margin-top: 0;'>Co dalej?</h3>
                    <p style='color: #3b82f6; font-size: 14px; margin-bottom: 20px;'>Masz gotową listę błędów. Możemy je naprawić za Ciebie.</p>
                    <a href='https://mixturemarketing.pl/kontakt?ref=audit_email' class='btn'>Umów Darmową Konsultację ➔</a>
                </div>
            </div>
            <div class='footer'>
                Mixture Marketing © 2026<br>
                Software House & Agencja 360°
            </div>
        </div>
    </body>
    </html>
    ";
}

// --- 2. GENERATE ADMIN NOTIFICATION ---
function generateAdminEmail($data, $email, $score) {
    $c = $data['client'];
    $priority = ($score < 40) ? "🔴 HOT LEAD (Wynik: $score)" : (($score < 70) ? "🟡 WARM LEAD" : "🟢 COLD LEAD");
    $isEcommerce = !empty($c['tech']['is_ecommerce']) ? "🛒 E-COMMERCE" : "📄 Strona Wizytówka";
    
    return "
    <h2>$priority</h2>
    <h3>$isEcommerce</h3>
    <p><strong>URL:</strong> <a href='{$c['url']}'>{$c['url']}</a></p>
    <p><strong>Email Klienta:</strong> <a href='mailto:$email'>$email</a></p>
    <hr>
    <p><strong>Wyniki:</strong></p>
    <ul>
        <li>LCP: {$c['metrics']['lcp_value']}s</li>
        <li>H1 Count: {$c['content']['h1_count']}</li>
        <li>Brak ALT: {$c['content']['images_no_alt']}</li>
        <li>Opinie: {$c['reputation']['reviews_count']}</li>
    </ul>
    <p><strong>Technologie:</strong> " . implode(', ', $c['tech']['cms'] ?? []) . "</p>
    ";
}

// --- 3. SEND EMAILS ---
set_time_limit(60); // Increase timeout for SMTP

$mail = new PHPMailer(true);

try {
    // Shared Config
    $mail->isSMTP();
    $mail->Host       = defined('SMTP_HOST') ? SMTP_HOST : 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = defined('SMTP_USER') ? SMTP_USER : 'audit@mixturemarketing.pl';
    $mail->Password   = defined('SMTP_PASS') ? SMTP_PASS : ''; 
    $mail->SMTPSecure = defined('SMTP_SECURE') ? SMTP_SECURE : PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = defined('SMTP_PORT') ? SMTP_PORT : 465;
    $mail->CharSet    = 'UTF-8';

    // 1. Send to Client
    $mail->setFrom($mail->Username, 'Mixture Audit 360');
    $mail->addAddress($clientEmail);
    $mail->isHTML(true);
    $mail->Subject = "Twój Wynik Audytu 360: {$score}/100 - " . parse_url($url, PHP_URL_HOST);
    $mail->Body    = generateClientEmail($data, $score, $url);
    $mail->send();

    // 2. Send to Admin (Clear recipients for next mail)
    $mail->clearAddresses();
    $mail->addAddress('kontakt@mixturemarketing.pl'); // Your notification email
    $mail->Subject = "[LEAD] $priority - " . parse_url($url, PHP_URL_HOST);
    $mail->Body    = generateAdminEmail($data, $clientEmail, $score);
    $mail->send();

    echo json_encode(['status' => 'success', 'message' => 'Reports sent successfully']);

} catch (Exception $e) {
    // Log error but don't show specific details to public
    error_log("Mailer Error: {$mail->ErrorInfo}");
    echo json_encode(['status' => 'error', 'message' => 'Wystąpił błąd podczas wysyłania raportu. Spróbuj ponownie.']);
}
?>