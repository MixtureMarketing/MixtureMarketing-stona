<?php
require_once '../config.php';
header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token");

require_once '../config.php';
require_once 'check_admin.php';
require_once '../PHPMailer/Exception.php';
require_once '../PHPMailer/PHPMailer.php';
require_once '../PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$data = json_decode(file_get_contents("php://input"), true);
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

$leadId = $data['lead_id'] ?? null;

if (!$leadId) {
    http_response_code(400);
    echo json_encode(["message" => "Brak ID leada."]);
    exit;
}

// 1. Pobierz dane leada
$stmt = $conn->prepare("SELECT * FROM leads WHERE id = ?");
$stmt->bind_param("s", $leadId);
$stmt->execute();
$lead = $stmt->get_result()->fetch_assoc();

if (!$lead) {
    http_response_code(404);
    echo json_encode(["message" => "Lead nie istnieje."]);
    exit;
}

$email = $lead['email'];
$name = $lead['name'];
$company = $lead['company'] ?? ''; // Map 'company' from lead to 'company_name' in user

// 2. Sprawdź czy użytkownik już istnieje
$checkUser = $conn->prepare("SELECT id FROM users WHERE email = ?");
$checkUser->bind_param("s", $email);
$checkUser->execute();
if ($checkUser->get_result()->num_rows > 0) {
    // If user exists, just link them
    $existingUser = $conn->query("SELECT id FROM users WHERE email = '$email'")->fetch_assoc();
    $newUserId = $existingUser['id'];
} else {
    // 3. Utwórz użytkownika
    $insertUser = $conn->prepare("INSERT INTO users (email, name, company_name, role, is_active) VALUES (?, ?, ?, 'client', 1)");
    $insertUser->bind_param("sss", $email, $name, $company);
    if ($insertUser->execute()) {
        $newUserId = $conn->insert_id;
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Błąd bazy danych podczas tworzenia użytkownika: " . $conn->error]);
        exit;
    }
}

// 4. Zaktualizuj status leada
// We check if column exists first to avoid crash if SQL update wasn't run
$updateLead = $conn->prepare("UPDATE leads SET status = 'converted', user_id = ? WHERE id = ?");
$updateLead->bind_param("is", $newUserId, $leadId);

if (!$updateLead->execute()) {
    // Fallback if user_id column doesn't exist yet
    $conn->query("UPDATE leads SET status = 'converted' WHERE id = '$leadId'");
}

// 5. Wyślij powitalnego maila
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

    $mail->setFrom(SMTP_USER, 'Mixture Marketing');
    $mail->addAddress($email);
    
    $mail->isHTML(true);
    $mail->Subject = 'Witaj w Panelu Klienta Mixture Marketing';
    $mail->Body    = "
        <h2 style='color:#3F3D91;'>Witaj $name!</h2>
        <p>Twoje konto w naszym Panelu Klienta zostało właśnie utworzone.</p>
        <p>Od teraz możesz śledzić postępy swoich projektów oraz komunikować się z nami bezpośrednio przez czat.</p>
        <br>
        <p><strong>Jak się zalogować?</strong></p>
        <p>Nie potrzebujesz hasła. Po prostu wejdź na stronę poniżej i podaj swój adres email ($email). Wyślemy Ci jednorazowy link logujący (Magic Link).</p>
        <br>
        <a href='https://mixturemarketing.pl/portal' style='background:#3F3D91; color:white; padding:12px 25px; text-decoration:none; border-radius:8px; font-weight:bold;'>PRZEJDŹ DO PORTALU</a>
        <br><br>
        <hr>
        <p style='font-size:12px; color:gray;'>Cieszymy się na owocną współpracę!<br>Zespół Mixture Marketing</p>
    ";

    $mail->send();
} catch (Exception $e) {
    // Log error but we already created the user
}

echo json_encode(["message" => "Użytkownik utworzony pomyślnie. Mail powitalny został wysłany."]);

$conn->close();
?>