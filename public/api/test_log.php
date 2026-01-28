<?php
header("Content-Type: text/plain");

$targetFile = __DIR__ . '/local_email_log.txt';
echo "Test zapisu logów do: $targetFile\n\n";

if (file_exists($targetFile)) {
    echo "Plik już istnieje. Sprawdzam uprawnienia...\n";
    if (is_writable($targetFile)) {
        echo "Plik jest zapisywalny.\n";
    } else {
        echo "BŁĄD: Brak uprawnień do zapisu w pliku.\n";
    }
} else {
    echo "Plik nie istnieje. Próba utworzenia...\n";
    $res = file_put_contents($targetFile, "Test logu: " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);
    if ($res === false) {
        echo "BŁĄD: Nie udało się utworzyć pliku. Sprawdź uprawnienia katalogu: " . __DIR__ . "\n";
        echo "Użytkownik PHP: " . get_current_user() . " (uid: " . getmyuid() . ")\n";
    } else {
        echo "SUKCES: Plik utworzony pomyślnie. Wgraj teraz send_magic_link.php i testuj logowanie.\n";
    }
}
?>
