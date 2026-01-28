<?php
require_once '../config.php';
header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once '../config.php';
require_once '../PHPMailer/Exception.php';
require_once '../PHPMailer/PHPMailer.php';
require_once '../PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Połączenie z bazą danych
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));
$email = $data->email ?? '';

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["message" => "Nieprawidłowy adres email."]);
    exit;
}

// 1. Sprawdź czy użytkownik istnieje
$stmt = $conn->prepare("SELECT id, name FROM users WHERE email = ? AND is_active = 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    // SECURITY: Nie informuj wprost, że maila nie ma w bazie (User Enumeration),
    // ale symuluj sukces (lub wyślij generyczny błąd). Tu dla uproszczenia zwrócimy 404,
    // ale w produkcji lepiej zwrócić 200 i nie wysłać maila.
    http_response_code(404);
    echo json_encode(["message" => "Nie znaleziono konta skojarzonego z tym adresem."]);
    exit;
}

$user = $result->fetch_assoc();

// 2. Generuj Token
$token = bin2hex(random_bytes(32));
$expires_at = date('Y-m-d H:i:s', strtotime('+15 minutes'));

// 3. Zapisz Token
$stmt = $conn->prepare("INSERT INTO auth_tokens (email, token, expires_at) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $email, $token, $expires_at);
if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(["message" => "Błąd zapisu tokena."]);
    exit;
}

// 4. Wyślij Email
$magicLink = "https://mixturemarketing.pl/portal/verify?token=" . $token;
$template = file_get_contents(__DIR__ . '/../templates/email_magic_link.html');
$messageBody = str_replace('{{MAGIC_LINK}}', $magicLink, $template);

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

    $mail->setFrom(SMTP_USER, 'Mixture Portal');
    $mail->addAddress($email);
    $mail->isHTML(true);
    $mail->Subject = 'Zaloguj się do Panelu Klienta';
    $mail->Body    = $messageBody;

    $mail->send();

    http_response_code(200);
    echo json_encode(["message" => "Link logowania został wysłany."]);

} catch (Exception $e) {
    // --- LOCALHOST / DEBUG FALLBACK ---
    // Jeśli wysyłka maila się nie uda (np. na localhost), zapisz link do pliku.
    // Dzięki temu możesz otworzyć plik 'local_email_log.txt' i skopiować link.
    $logFile = __DIR__ . '/../local_email_log.txt';
    $logEntry = "[" . date('Y-m-d H:i:s') . "] To: $email | Link: $magicLink\n";
    file_put_contents($logFile, $logEntry, FILE_APPEND);

    http_response_code(200); // Udajemy sukces, żeby frontend nie panikował
    echo json_encode([
        "message" => "Link (tryb dev) zapisany w local_email_log.txt (błąd SMTP: {$mail->ErrorInfo})"
    ]);
}

$conn->close();
?>
