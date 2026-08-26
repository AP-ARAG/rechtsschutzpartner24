<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    echo json_encode(['ok' => false, 'message' => 'Methode nicht erlaubt']);
    exit;
}

function clean_value(string $key, int $maxLength = 300): string
{
    $value = trim((string)($_POST[$key] ?? ''));
    $value = str_replace(["\r", "\n", "\0"], ' ', $value);
    return function_exists('mb_substr')
        ? mb_substr($value, 0, $maxLength, 'UTF-8')
        : substr($value, 0, $maxLength);
}

/**
 * @param array<string, string> $config
 */
function config_value(array $config, string $key): string
{
    $environmentValue = getenv($key);
    if ($environmentValue !== false && $environmentValue !== '') {
        return $environmentValue;
    }

    return trim((string)($config[$key] ?? ''));
}

/**
 * @param resource $socket
 * @param int[] $expectedCodes
 */
function smtp_response($socket, array $expectedCodes): string
{
    $response = '';

    while (($line = fgets($socket, 515)) !== false) {
        $response .= $line;
        if (strlen($line) >= 4 && $line[3] === ' ') {
            break;
        }
    }

    $code = (int)substr($response, 0, 3);
    if (!in_array($code, $expectedCodes, true)) {
        throw new RuntimeException('Unerwartete SMTP-Antwort: ' . trim($response));
    }

    return $response;
}

/**
 * @param resource $socket
 * @param int[] $expectedCodes
 */
function smtp_command($socket, string $command, array $expectedCodes): string
{
    if (fwrite($socket, $command . "\r\n") === false) {
        throw new RuntimeException('SMTP-Befehl konnte nicht gesendet werden.');
    }

    return smtp_response($socket, $expectedCodes);
}

/**
 * @param array<string, string> $config
 */
function send_via_smtp(
    array $config,
    string $recipient,
    string $replyTo,
    string $subject,
    string $message
): void {
    $host = config_value($config, 'MAIL_HOST');
    $port = (int)config_value($config, 'MAIL_PORT');
    $username = config_value($config, 'MAIL_USERNAME');
    $password = config_value($config, 'MAIL_PASSWORD');
    $encryption = strtolower(config_value($config, 'MAIL_ENCRYPTION'));
    $fromAddress = config_value($config, 'MAIL_FROM_ADDRESS');

    if ($host === '' || $port < 1 || $username === '' || $password === '' || $fromAddress === '') {
        throw new RuntimeException('Die SMTP-Konfiguration ist unvollständig.');
    }

    $transport = in_array($encryption, ['ssl', 'smtps'], true) ? 'ssl://' : 'tcp://';
    $socket = @stream_socket_client(
        $transport . $host . ':' . $port,
        $errorNumber,
        $errorMessage,
        15,
        STREAM_CLIENT_CONNECT
    );

    if ($socket === false) {
        throw new RuntimeException('SMTP-Verbindung fehlgeschlagen: ' . $errorNumber . ' ' . $errorMessage);
    }

    try {
        stream_set_timeout($socket, 15);
        smtp_response($socket, [220]);
        smtp_command($socket, 'EHLO rechtsschutzpartner24.de', [250]);

        if (in_array($encryption, ['tls', 'starttls'], true)) {
            smtp_command($socket, 'STARTTLS', [220]);
            if (stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT) !== true) {
                throw new RuntimeException('Die verschlüsselte SMTP-Verbindung konnte nicht aufgebaut werden.');
            }
            smtp_command($socket, 'EHLO rechtsschutzpartner24.de', [250]);
        }

        smtp_command($socket, 'AUTH LOGIN', [334]);
        smtp_command($socket, base64_encode($username), [334]);
        smtp_command($socket, base64_encode($password), [235]);
        smtp_command($socket, 'MAIL FROM:<' . $fromAddress . '>', [250]);
        smtp_command($socket, 'RCPT TO:<' . $recipient . '>', [250, 251]);
        smtp_command($socket, 'DATA', [354]);

        $headers = [
            'From: RechtsschutzPartner24 <' . $fromAddress . '>',
            'Reply-To: ' . $replyTo,
            'To: <' . $recipient . '>',
            'Subject: =?UTF-8?B?' . base64_encode($subject) . '?=',
            'Date: ' . date(DATE_RFC2822),
            'Message-ID: <' . bin2hex(random_bytes(12)) . '@rechtsschutzpartner24.de>',
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit',
            'X-Mailer: RechtsschutzPartner24'
        ];

        $normalizedMessage = str_replace(["\r\n", "\r"], "\n", $message);
        $normalizedMessage = str_replace("\n", "\r\n", $normalizedMessage);
        $normalizedMessage = preg_replace('/(?m)^\./', '..', $normalizedMessage) ?? $normalizedMessage;

        if (fwrite($socket, implode("\r\n", $headers) . "\r\n\r\n" . $normalizedMessage . "\r\n.\r\n") === false) {
            throw new RuntimeException('Die E-Mail-Daten konnten nicht übertragen werden.');
        }

        smtp_response($socket, [250]);
        smtp_command($socket, 'QUIT', [221]);
    } finally {
        fclose($socket);
    }
}

if (clean_value('website') !== '') {
    echo json_encode(['ok' => true]);
    exit;
}

$requiredFields = [
    'berufsstatus', 'familienstand', 'bereiche', 'vorname', 'nachname',
    'plz', 'ort', 'strasse', 'hausnummer', 'geburtsdatum', 'email', 'telefon'
];

$data = [];
foreach ($requiredFields as $field) {
    $data[$field] = clean_value($field);
    if ($data[$field] === '') {
        http_response_code(422);
        echo json_encode(['ok' => false, 'message' => 'Bitte füllen Sie alle Pflichtfelder aus.']);
        exit;
    }
}

if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Bitte geben Sie eine gültige E-Mail-Adresse an.']);
    exit;
}

if (!preg_match('/^[0-9+()\/ .-]{6,30}$/', $data['telefon'])) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Bitte geben Sie eine gültige Telefonnummer an.']);
    exit;
}

if (!preg_match('/^[0-9]{5}$/', $data['plz'])) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Bitte geben Sie eine gültige Postleitzahl an.']);
    exit;
}

$birthDate = DateTimeImmutable::createFromFormat('!Y-m-d', $data['geburtsdatum']);
if (!$birthDate || $birthDate->format('Y-m-d') !== $data['geburtsdatum'] || $birthDate >= new DateTimeImmutable('today')) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Bitte geben Sie ein gültiges Geburtsdatum an.']);
    exit;
}

if (clean_value('datenschutz_einwilligung', 10) !== 'ja') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Bitte bestätigen Sie die Datenschutzerklärung.']);
    exit;
}

$recipient = 'info@rechtsschutzpartner24.de';
$subject = 'Neue Rechtsschutz-Anfrage über rechtsschutzpartner24.de';
$lines = [
    'Neue unverbindliche Angebotsanfrage',
    '------------------------------------',
    '',
    'Berufsstatus: ' . $data['berufsstatus'],
    'Familienstand: ' . $data['familienstand'],
    'Gewünschte Bereiche: ' . $data['bereiche'],
    '',
    'Name: ' . $data['vorname'] . ' ' . $data['nachname'],
    'Anschrift: ' . $data['strasse'] . ' ' . $data['hausnummer'],
    'Ort: ' . $data['plz'] . ' ' . $data['ort'],
    'Geburtsdatum: ' . $birthDate->format('d.m.Y'),
    '',
    'E-Mail: ' . $data['email'],
    'Telefon: ' . $data['telefon'],
    '',
    'Datenschutzeinwilligung: erteilt',
    'Eingegangen am: ' . (new DateTimeImmutable('now', new DateTimeZone('Europe/Berlin')))->format('d.m.Y H:i') . ' Uhr'
];

$configPath = __DIR__ . '/.env';
$config = is_readable($configPath)
    ? (parse_ini_file($configPath, false, INI_SCANNER_RAW) ?: [])
    : [];

try {
    send_via_smtp($config, $recipient, $data['email'], $subject, implode("\r\n", $lines));
} catch (Throwable $error) {
    error_log('Kontaktformular: ' . $error->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Die Nachricht konnte nicht versendet werden.']);
    exit;
}

echo json_encode(['ok' => true]);
