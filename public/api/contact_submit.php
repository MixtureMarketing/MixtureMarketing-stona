<?php
require_once 'config.php';
header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'config.php';
require_once 'templates/email_template.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

// --- Helper Functions ---

function logError($message) {
    $logFile = __DIR__ . '/logs/error.log';
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] $message" . PHP_EOL;
    file_put_contents($logFile, $logEntry, FILE_APPEND);
}

function sanitizeInput($data) {
    if (is_array($data)) {
        foreach ($data as $key => $value) {
            $data[$key] = sanitizeInput($value);
        }
    } elseif (is_object($data)) {
        foreach ($data as $key => $value) {
            $data->$key = sanitizeInput($value);
        }
    } elseif (is_string($data)) {
        $data = strip_tags(trim($data));
    }
    return $data;
}

// Sanitize incoming data
$data = sanitizeInput($data);

// --- 0. ZABEZPIECZENIE PRZED SPAMEM (HONEYPOT) ---
if (isset($data->website_verify) && !empty($data->website_verify)) {
    // To jest bot, pole jest ukryte dla ludzi
    http_response_code(200); // Udajemy sukces, żeby bot nie próbował inaczej
    echo json_encode(["status" => "success", "message" => "Ochrona antyspamowa"]);
    exit();
}

// Obsługa GET dla pobierania leada (parametry w URL, nie w body)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'get_lead' && isset($_GET['id'])) {
    $action = 'get_lead';
    $leadId = filter_var($_GET['id'], FILTER_SANITIZE_STRING); // Sanitize GET param
} else {
    $action = $data->action ?? null;
}

function verifyRecaptcha($token) {
    $secret = RECAPTCHA_SECRET;
    
    // Akceptuj tokeny obejścia dla zaufanych operacji i testów lokalnych
    if ($token === 'local_bypass' || $token === 'existing_lead_verified') {
        return true;
    }

    // Jeśli klucz jest placeholderem, pozwól na testy
    if ($secret === '6Ld_pL0qAAAAAF_secret_placeholder') {
        return true; 
    }

    $url = "https://www.google.com/recaptcha/api/siteverify";
    
    $response = file_get_contents($url . "?secret=" . $secret . "&response=" . $token);
    $result = json_decode($response);
    
    // Zwracamy wynik (success i score dla v3)
    return $result->success && $result->score >= 0.5;
}

if (!$action) {
    http_response_code(400);
    echo json_encode(["message" => "Brak akcji.", "version" => "v6-resume"]);
    exit();
}

function sendEmail($to, $subject, $bodyHtml) {
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USER;
        $mail->Password   = SMTP_PASS;
        $mail->SMTPSecure = SMTP_SECURE;
        $mail->Port       = SMTP_PORT;
        $mail->CharSet    = 'UTF-8';
        $mail->XMailer    = ' '; // Suppress X-Mailer header
        $mail->setFrom(SMTP_USER, 'Mixture Marketing');
        $mail->addAddress($to);
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $bodyHtml;
        $mail->send();
        return true;
    } catch (Exception $e) {
        logError("Mail Error: " . $e->getMessage());
        return false;
    }
}

try {
    $dsn = "mysql:host=" . DB_HOST . ";charset=utf8";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    $pdo->exec("USE `" . DB_NAME . "`");

    // --- 1. POBIERANIE LEADA (Dla wznowienia) ---
    if ($action === 'get_lead') {
        if (empty($leadId)) {
            http_response_code(400);
            echo json_encode(["message" => "Brak ID leada"]);
            exit();
        }

        $stmt = $pdo->prepare("SELECT * FROM leads WHERE id = :id");
        $stmt->execute([':id' => $leadId]);
        $lead = $stmt->fetch();

        if ($lead) {
            // Dekodujemy details
            $details = json_decode($lead['details'] ?? '{}');
            // Łączymy w jeden obiekt
            $responseLead = [
                'id' => $lead['id'],
                'name' => $lead['name'],
                'email' => $lead['email'],
                'phone' => $lead['phone'],
                'service_interest' => $lead['service_type'],
                'website' => $lead['website'],
                'budget' => $lead['budget'],
                'message' => $lead['message'],
            ];
            
            if ($details && is_object($details)) {
                foreach ($details as $k => $v) {
                    $responseLead[$k] = $v;
                }
            }
            
            echo json_encode(["status" => "success", "lead" => $responseLead]);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Lead nie znaleziony"]);
        }
    }

    // --- 2. TWORZENIE (CREATE) ---
    elseif ($action === 'create' && isset($data->lead)) {
        $lead = $data->lead;
        $uuid = $lead->id;
        $token = $lead->recaptcha_token ?? null;

        // Weryfikacja reCAPTCHA
        if (!$token || !verifyRecaptcha($token)) {
            logError("ReCAPTCHA verification failed for lead: $uuid");
            http_response_code(403);
            echo json_encode(["message" => "Weryfikacja antyspamowa nie powiodła się. Spróbuj odświeżyć stronę."]);
            exit();
        }

        // Sprawdź czy już istnieje (zabezpieczenie przed duplikatami przy wznowieniu)
        $stmtCheck = $pdo->prepare("SELECT id FROM leads WHERE id = :id");
        $stmtCheck->execute([':id' => $uuid]);
        if ($stmtCheck->fetch()) {
            echo json_encode(["status" => "success", "id" => $uuid, "message" => "Lead już istnieje, pomijam insert"]);
            exit();
        }

        $stmt = $pdo->prepare("INSERT INTO leads (id, name, email, phone, service_type, source_url, current_step, created_at) VALUES (:id, :name, :email, :phone, :service, :source, 1, NOW())");
        $stmt->execute([
            ':id' => $uuid,
            ':name' => $lead->name,
            ':email' => $lead->email,
            ':phone' => $lead->phone ?? null,
            ':service' => $lead->service_interest ?? null,
            ':source' => $data->source_url ?? null
        ]);

        echo json_encode(["status" => "success", "id" => $uuid]);
    }

    // --- 3. AKTUALIZACJA (UPDATE) ---
    elseif ($action === 'update' && isset($data->id) && isset($data->details)) {
        $id = $data->id;
        $details = $data->details;
        $step = $data->step ?? null;
        
        $name = $details->name ?? null;
        // ... (rest of fields)
        $email = $details->email ?? null;
        $phone = $details->phone ?? null;
        $website = $details->website ?? null;
        $budget = $details->budget ?? null;
        $message = $details->message ?? null;
        $packageName = $details->package_name ?? null;
        
        // ... (json details)
        $dynamicDetails = clone $details;
        unset(
            $dynamicDetails->id,
            $dynamicDetails->name, 
            $dynamicDetails->email, 
            $dynamicDetails->phone, 
            $dynamicDetails->website, 
            $dynamicDetails->budget, 
            $dynamicDetails->message,
            $dynamicDetails->package_name,
            $dynamicDetails->recaptcha_token,
            $dynamicDetails->website_verify,
            $dynamicDetails->privacy
        );
        $jsonDetails = json_encode($dynamicDetails);

        $stmt = $pdo->prepare("UPDATE leads SET 
            name = COALESCE(:name, name), 
            email = COALESCE(:email, email), 
            phone = COALESCE(:phone, phone), 
            service_type = COALESCE(:service_type, service_type), 
            package_name = COALESCE(:package_name, package_name),
            website = :website, 
            budget = :budget, 
            message = :message, 
            details = :details,
            current_step = COALESCE(:step, current_step) 
            WHERE id = :id");
        $stmt->execute([
            ':name' => $name,
            ':email' => $email,
            ':phone' => $phone,
            ':service_type' => $details->service_type ?? null,
            ':package_name' => $packageName,
            ':website' => $website,
            ':budget' => $budget,
            ':message' => $message,
            ':details' => $jsonDetails,
            ':step' => $step,
            ':id' => $id
        ]);

        echo json_encode(["status" => "success"]);
    }

    // --- 4. POWIADOMIENIA (MAIL) ---
    elseif ($action === 'send_notification' && isset($data->id) && isset($data->type)) {
        // ... (Existing logic for send_notification is unchanged, using sendEmail helper)
        $id = $data->id;
        $type = $data->type;

        $stmt = $pdo->prepare("SELECT * FROM leads WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $lead = $stmt->fetch();

        if (!$lead) throw new Exception("Lead not found");

        $name = $lead['name'];
        $email = $lead['email'];
        $firstName = explode(' ', $name)[0];
        
        // --- BUDOWANIE TABELI DANYCH ---
        $dataTable = "<table style='width: 100%; border-collapse: separate; border-spacing: 0; margin: 25px 0; border: 1px solid #eee; border-radius: 8px; overflow: hidden;'>";
        
        // Podstawowe pola
        $fields = [
            'Imię i nazwisko' => $name,
            'Email' => "<a href='mailto:$email' style='color:#61B6DE;text-decoration:none;'>$email</a>",
            'Telefon' => $lead['phone'] ? "<a href='tel:{$lead['phone']}' style='color:#61B6DE;text-decoration:none;'>{$lead['phone']}</a>" : '-',
            'Usługa' => ucfirst($lead['service_interest'] ?? 'Ogólne'),
            'Budżet' => $lead['budget'],
            'Strona WWW' => $lead['website'] ? "<a href='{$lead['website']}' target='_blank'>{$lead['website']}</a>" : '-',
            'Wiadomość' => nl2br(htmlspecialchars($lead['message'] ?? ''))
        ];
        
        // Pola dynamiczne
        $details = json_decode($lead['details'] ?? '{}', true);
        if ($details) {
            $labelMap = [
                'goal' => 'Cel projektu',
                'assets' => 'Materiały',
                'traffic' => 'Źródło ruchu',
                'scope' => 'Skala asortymentu',
                'integrations' => 'Integracje',
                'history' => 'Status projektu',
                'area' => 'Zasięg',
                'tech' => 'Zarządzanie treścią',
                'appStage' => 'Etap projektu',
                'process' => 'Główny proces',
                'features' => 'Funkcje specjalne',
                'auditScope' => 'Zasięg audytu',
                'copywriting' => 'Copywriting',
                'trafficSource' => 'Główne źródło ruchu',
                'productCount' => 'Liczba produktów',
                'platform' => 'Technologia',
                'pageCount' => 'Liczba podstron',
                'languages' => 'Wersje językowe',
                'appPlatform' => 'Platforma docelowa',
                'campaignGoal' => 'Główny cel kampanii'
            ];

            $excludedKeys = ['id', 'name', 'email', 'phone', 'website', 'budget', 'message', 'privacy', 'recaptcha_token', 'website_verify', 'service_interest', 'source_url'];
            foreach ($details as $key => $val) {
                if (is_string($val) && !empty($val) && !in_array($key, $excludedKeys)) {
                    // Tłumaczenie kluczy
                    $label = $labelMap[$key] ?? ucfirst(preg_replace('/(?<!^)[A-Z]/', ' $0', $key));
                    $fields[$label] = htmlspecialchars($val);
                }
            }
        }

        $i = 0;
        foreach ($fields as $label => $value) {
            if (!empty($value) && $value !== '-') {
                $bg = $i % 2 == 0 ? '#fafafa' : '#ffffff';
                $dataTable .= "
                <tr style='background-color: $bg;'>
                    <td style='padding: 12px 15px; font-weight: 600; color: #555; width: 35%; border-bottom: 1px solid #eee;'>$label</td>
                    <td style='padding: 12px 15px; color: #222; border-bottom: 1px solid #eee;'>$value</td>
                </tr>";
                $i++;
            }
        }
        $dataTable .= "</table>";

        // --- PASEK POSTĘPU (TABELA - BULLETPROOF) ---
        // Ustalamy postęp na podstawie typu powiadomienia
        $progress = 0;
        $col1Color = '#CBD5E1'; // Gray
        $col2Color = '#CBD5E1';
        $col3Color = '#CBD5E1';

        if ($type === 'abandoned_step_1') {
            $progress = 33;
            $col1Color = '#61B6DE'; // Blue
        }
        if ($type === 'abandoned_step_2') {
            $progress = 66;
            $col1Color = '#61B6DE';
            $col2Color = '#61B6DE';
        }
        if ($type === 'success') {
            $progress = 100;
            $col1Color = '#61B6DE';
            $col2Color = '#61B6DE';
            $col3Color = '#61B6DE';
        }

        $progressBar = "
            <table border='0' cellpadding='0' cellspacing='0' width='100%' style='margin: 25px 0 35px 0;'>
                <tr>
                    <td align='left' width='33%' style='font-size: 10px; font-weight: 700; color: $col1Color; text-transform: uppercase; padding-bottom: 8px; font-family: Helvetica, Arial, sans-serif;'>1. Kontakt</td>
                    <td align='center' width='33%' style='font-size: 10px; font-weight: 700; color: $col2Color; text-transform: uppercase; padding-bottom: 8px; font-family: Helvetica, Arial, sans-serif;'>2. Szczegóły</td>
                    <td align='right' width='33%' style='font-size: 10px; font-weight: 700; color: $col3Color; text-transform: uppercase; padding-bottom: 8px; font-family: Helvetica, Arial, sans-serif;'>3. Cel</td>
                </tr>
                <tr>
                    <td colspan='3' height='6' style='background-color: #F1F5F9; border-radius: 3px; overflow: hidden; vertical-align: top;'>
                        <table border='0' cellpadding='0' cellspacing='0' width='$progress%' height='6'>
                            <tr>
                                <td bgcolor='#61B6DE' height='6' style='line-height: 0px; font-size: 0px;'>&nbsp;</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        ";

        // --- WYSYŁKA ---

        // 1. PORZUCENIE (ABANDONED)
        if (strpos($type, 'abandoned') !== false) {
            $isStep1 = ($type === 'abandoned_step_1');
            $sentColumn = $isStep1 ? 'email_abandoned_1_sent' : 'email_abandoned_2_sent';
            
            // Sprawdź, czy kolumna istnieje i czy już wysłano ten typ maila
            if (isset($lead[$sentColumn]) && $lead[$sentColumn] == 1) {
                echo json_encode(["status" => "success", "message" => "Mail już wysłany wcześniej, pomijam duplikat."]);
                exit();
            }

            $nextStep = $isStep1 ? 2 : 3;
            $ctaLink = "https://mixturemarketing.pl/?resume_lead=" . urlencode($id) . "&step=" . $nextStep;
            
            // Do Klienta
            $subject = "$firstName, dokończmy Twoją wycenę";
            $content = "
                <p style='font-size: 18px; font-weight: 600; color: #213261; margin-bottom: 15px;'>Cześć $firstName,</p>
                <p>Zauważyliśmy, że przerwałeś wypełnianie formularza w sprawie projektu. Twoje dane są u nas bezpieczne – zapisaliśmy postęp prac.</p>
                
                $progressBar
                
                <p>Możesz wrócić do formularza dokładnie tam, gdzie skończyłeś:</p>
                
                <br>
                <div style='background-color: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 12px; padding: 25px; margin-bottom: 25px;'>
                    <p style='margin: 0 0 15px 0; font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 1px;'>Twoje zapisane odpowiedzi:</p>
                    $dataTable
                </div>

                <div style='background-color: #E0EFFF; border-radius: 12px; padding: 20px; margin-bottom: 25px;'>
                    <p style='margin: 0; font-size: 14px; color: #3F3D91;'><strong>💡 Tip:</strong> Nawet jeśli nie zdążysz uzupełnić szczegółów, nasz konsultant skontaktuje się z Tobą wkrótce, aby pomóc w doprecyzowaniu wyceny.</p>
                </div>

                <p style='text-align: center; margin-bottom: 30px;'>
                    <a href='https://calendar.app.google/atVivbU6qaL7KXPXA' target='_blank' style='color: #61B6DE; font-weight: bold; text-decoration: underline;'>Wolisz od razu umówić rozmowę? Kliknij tutaj.</a>
                </p>
            ";
            $html = getEmailTemplate($subject, $content, $ctaLink, "DOKOŃCZ ZGŁOSZENIE");
            
            if (sendEmail($email, $subject, $html)) {
                // Zaznacz w bazie, że wysłano (tylko jeśli kolumna istnieje)
                try {
                    $pdo->prepare("UPDATE leads SET $sentColumn = 1 WHERE id = :id")->execute([':id' => $id]);
                } catch (Exception $e) {
                    // Ignoruj błąd jeśli kolumna nie istnieje
                }
            }

            // Do Admina (Tylko jeśli to pierwszy raz!)
            $adminSubject = "⚠️ Niedokończone zgłoszenie: $name";
            $adminContent = "
                <div style='background: #fff8e1; border: 1px solid #ffe0b2; padding: 15px; border-radius: 8px; margin-bottom: 20px; color: #f57c00;'>
                    <strong>Klient przerwał wypełnianie formularza.</strong><br>
                    Etap: " . ($nextStep - 1) . "/3
                </div>
                <p>To co zdążył wpisać:</p>
                $dataTable
                <br>
                <p><a href='mailto:$email'>Wyślij ręcznego maila ($email)</a></p>
            ";
            $adminHtml = getEmailTemplate($adminSubject, $adminContent, null, null, true);
            sendEmail(NOTIFY_EMAIL, $adminSubject, $adminHtml);
        }
        
        // 2. SUKCES (SUCCESS)
        elseif ($type === 'success') {
            
            // Do Klienta
            $clientSubject = "Dziękujemy za zgłoszenie - Mixture Marketing";
            $clientContent = "
                <p>Cześć $firstName,</p>
                <p>Dziękujemy za zaufanie. Twój brief trafił bezpiecznie do naszego zespołu.</p>
                $progressBar
                <p>Przeanalizujemy Twoje zgłoszenie i wrócimy z propozycją terminu rozmowy w ciągu 24h.</p>
                <br>
                <h3>Twoje dane:</h3>
                $dataTable
            ";
            $calendarLink = "https://calendar.app.google/udxBxEXf78nonaEh6";
            
            $clientHtml = getEmailTemplate($clientSubject, $clientContent, $calendarLink, "UMÓW ROZMOWĘ WIDEO");
            sendEmail($email, $clientSubject, $clientHtml);

            // Do Admina
            $adminSubject = "🔔 Nowy Lead: $name ({$lead['service_interest']})";
            $adminContent = "
                <div style='background: #e8f5e9; border: 1px solid #c8e6c9; padding: 15px; border-radius: 8px; margin-bottom: 20px; color: #2e7d32;'>
                    <strong>Nowe, kompletne zgłoszenie ze strony WWW</strong>
                </div>
                $progressBar
                $dataTable
                <p style='text-align: center; margin-top: 20px;'>
                    <a href='mailto:$email' style='color: #61B6DE; font-weight: bold;'>Odpowiedz bezpośrednio ($email)</a>
                </p>
            ";
            
            $adminHtml = getEmailTemplate($adminSubject, $adminContent, null, null, true);
            sendEmail(NOTIFY_EMAIL, $adminSubject, $adminHtml);
        }

        echo json_encode(["status" => "success", "version" => "v6-resume"]);
    }

} catch (Exception $e) {
    logError("Critical Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "message" => "Wystąpił błąd serwera. Spróbuj ponownie później.",
        "version" => "v6-resume"
    ]);
}
?>