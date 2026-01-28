<?php
require_once '../config.php';
header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, X-Admin-Email");

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
$clientEmail = $data['email'] ?? '';
$subject = $data['subject'] ?? 'Odpowiedź na Twoje zapytanie - Mixture Marketing';
$message = $data['message'] ?? '';

if (empty($clientEmail) || empty($message)) {
    http_response_code(400);
    echo json_encode(["message" => "Brak adresu email lub treści wiadomości."]);
    exit;
}

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
    $mail->addAddress($clientEmail);
    $mail->addReplyTo(NOTIFY_EMAIL);

    $mail->isHTML(true);
    $mail->Subject = $subject;
    // Simple HTML wrap for admin reply
    $mail->Body    = nl2br($message) . "<br><br><hr><p style='font-size:12px; color:gray;'>Wiadomość wysłana z Panelu Administracyjnego Mixture Marketing.</p>";

    $mail->send();

    // Aktualizuj status leada
    if ($leadId) {
        $stmt = $conn->prepare("UPDATE leads SET status = 'contacted' WHERE id = ?");
        $stmt->bind_param("i", $leadId);
        $stmt->execute();
    }

    echo json_encode(["message" => "Wiadomość wysłana pomyślnie."]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Błąd wysyłania: {$mail->ErrorInfo}"]);
}

$conn->close();
?>
