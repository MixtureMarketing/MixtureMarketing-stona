<?php
/**
 * CRON SCRIPT: Smart Chat Notifications
 * Run this script via CRON every 15-30 minutes.
 * It sends summary emails for unread messages older than 1 hour.
 */

// Use absolute paths for CRON safety
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/PHPMailer/Exception.php';
require_once __DIR__ . '/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) die("DB Connection failed");

echo "Starting smart notifications check...\n";

// 1. FIND UNREAD MESSAGES FOR CLIENTS (sent by Admin)
$sqlClients = "
    SELECT m.user_id, u.email, u.name, COUNT(*) as msg_count
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.sender_type = 'admin' 
      AND m.is_read = 0 
      AND m.notification_sent = 0
      AND m.created_at < NOW() - INTERVAL 1 HOUR
    GROUP BY m.user_id
";

$resClients = $conn->query($sqlClients);
while ($row = $resClients->fetch_assoc()) {
    echo "Notifying client: {$row['email']} ({$row['msg_count']} messages)\n";
    
    $mail = new PHPMailer(true);
    try {
        setupMailer($mail);
        $mail->addAddress($row['email']);
        $mail->Subject = "Nowe wiadomosci w Panelu Mixture Marketing";
        $mail->Body    = "
            <p>Czesc {$row['name']},</p>
            <p>Masz <strong>{$row['msg_count']}</strong> nieprzeczytanych wiadomosci od naszego zespolu.</p>
            <p>Wiadomosci czekaja na Twoja odpowiedz od ponad godziny.</p>
            <br>
            <a href='https://mixturemarketing.pl/portal' style='background:#3F3D91; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;'>Przejdz do Panelu Klienta</a>
        ";
        $mail->send();
        
        // Mark as sent
        $conn->query("UPDATE messages SET notification_sent = 1 WHERE user_id = {$row['user_id']} AND sender_type = 'admin'");
    } catch (Exception $e) { echo "Mailer Error: " . $mail->ErrorInfo . "\n"; }
}

// 2. FIND UNREAD MESSAGES FOR ADMIN (sent by Clients)
$sqlAdmin = "
    SELECT COUNT(*) as msg_count, COUNT(DISTINCT user_id) as client_count
    FROM messages
    WHERE sender_type = 'client' 
      AND is_read = 0 
      AND notification_sent = 0
      AND created_at < NOW() - INTERVAL 1 HOUR
";

$resAdmin = $conn->query($sqlAdmin);
$adminData = $resAdmin->fetch_assoc();

if ($adminData['msg_count'] > 0) {
    echo "Notifying admin: {$adminData['msg_count']} messages from {$adminData['client_count']} clients\n";
    
    $mail = new PHPMailer(true);
    try {
        setupMailer($mail);
        $mail->addAddress(NOTIFY_EMAIL);
        $mail->Subject = "UWAGA: Nieobsluzone wiadomosci w Portalu";
        $mail->Body    = "
            <p>Masz <strong>{$adminData['msg_count']}</strong> nieprzeczytanych wiadomosci od <strong>{$adminData['client_count']}</strong> klientów.</p>
            <p>Najstarsze wiadomosci czekaja na odpowiedz od ponad godziny.</p>
            <br>
            <a href='https://mixturemarketing.pl/portal/admin' style='background:#E1306C; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;'>Przejdz do Panelu Admina</a>
        ";
        $mail->send();
        
        // Mark as sent
        $conn->query("UPDATE messages SET notification_sent = 1 WHERE sender_type = 'client'");
    } catch (Exception $e) { echo "Mailer Error: " . $mail->ErrorInfo . "\n"; }
}

function setupMailer($mail) {
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = SMTP_SECURE;
    $mail->Port       = SMTP_PORT;
    $mail->CharSet    = 'UTF-8';
    $mail->isHTML(true);
    $mail->setFrom(SMTP_USER, 'Mixture Support');
}

$conn->close();
echo "Done.\n";
?>