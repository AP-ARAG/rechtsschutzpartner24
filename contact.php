<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

$allowedOrigins = [
    'https://rechtsschutzpartner24.de',
    'https://www.rechtsschutzpartner24.de',
    'https://vermieterrechtsschutz24.com',
    'https://www.vermieterrechtsschutz24.com',
    'https://tiersafe.de',
    'https://www.tiersafe.de',
    'https://home-5021372330.app-ionos.space',
    'https://home-5021386578.app-ionos.space',
    'https://versicherungsnavigator24.de',
    'https://www.versicherungsnavigator24.de',
    'https://privatkrankenversicherung24.de',
    'https://www.privatkrankenversicherung24.de',
];
$origin = rtrim((string)($_SERVER['HTTP_ORIGIN'] ?? ''), '/');
if ($origin !== '') {
    if (!in_array($origin, $allowedOrigins, true)) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'message' => 'Ungültige Herkunft.']);
        exit;
    }
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Accept, Content-Type');
    header('Vary: Origin');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST, OPTIONS');
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

function clean_text(mixed $value, int $maxLength = 300): string
{
    $text = trim((string)$value);
    $text = str_replace(["\r", "\n", "\0"], ' ', $text);
    return function_exists('mb_substr')
        ? mb_substr($text, 0, $maxLength, 'UTF-8')
        : substr($text, 0, $maxLength);
}

/** @return string[] */
function answer_lines(string $json): array
{
    $decoded = json_decode($json, true);
    if (!is_array($decoded)) {
        return [];
    }

    $lines = [];
    $append = static function (mixed $value, string $label = '') use (&$lines, &$append): void {
        if (count($lines) >= 30) {
            return;
        }
        if (is_array($value)) {
            foreach ($value as $key => $child) {
                $append($child, is_string($key) ? $key : $label);
            }
            return;
        }
        $clean = clean_text($value);
        if ($clean !== '') {
            $lines[] = ($label !== '' ? clean_text($label, 80) . ': ' : '- ') . $clean;
        }
    };
    $append($decoded);
    return $lines;
}

/** @return string[] */
function attribution_lines(): array
{
    $fields = [
        'funnel_id' => ['Formular-ID', 100],
        'utm_source' => ['UTM-Quelle', 200],
        'utm_medium' => ['UTM-Medium', 200],
        'utm_campaign' => ['UTM-Kampagne', 300],
        'utm_term' => ['UTM-Keyword', 300],
        'utm_content' => ['UTM-Inhalt', 300],
        'gclid' => ['Google Click-ID', 300],
        'gbraid' => ['Google GBRAID', 300],
        'wbraid' => ['Google WBRAID', 300],
        'msclkid' => ['Microsoft Click-ID', 300],
        'fbclid' => ['Meta Click-ID', 300],
        'source_url' => ['Einstiegs-/Formularseite', 500],
        'referrer_url' => ['Referrer', 500],
    ];
    $lines = [];
    foreach ($fields as $key => [$label, $maxLength]) {
        $value = clean_value($key, $maxLength);
        if ($value !== '') {
            $lines[] = $label . ': ' . $value;
        }
    }
    return $lines !== [] ? $lines : ['Keine Kampagnenparameter übermittelt'];
}

/** @param array<string, string> $config */
function deliver_lead(array $config, string $recipient, string $replyTo, string $subject, string $message): void
{
    $smtpConfigured = config_value($config, 'MAIL_HOST') !== ''
        && (int)config_value($config, 'MAIL_PORT') > 0
        && config_value($config, 'MAIL_USERNAME') !== ''
        && config_value($config, 'MAIL_PASSWORD') !== ''
        && config_value($config, 'MAIL_FROM_ADDRESS') !== '';

    if ($smtpConfigured) {
        send_via_smtp($config, $recipient, $replyTo, $subject, $message);
        return;
    }

    $headers = implode("\r\n", [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'From: Versicherungsanfragen <info@rechtsschutzpartner24.de>',
        'Reply-To: ' . $replyTo,
    ]);
    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    if (!mail($recipient, $encodedSubject, $message, $headers)) {
        throw new RuntimeException('PHP mail() konnte die Nachricht nicht annehmen.');
    }
}

if (clean_value('website') !== '' || clean_value('_honey') !== '') {
    echo json_encode(['ok' => true]);
    exit;
}

$formType = clean_value('form_type', 40) ?: 'rechtsschutz';
$genericLabels = [
    'navigator' => 'Versicherungsnavigator24',
    'tier' => 'TierSafe',
    'pkv' => 'PrivatKrankenversicherung24',
    'vermieter' => 'Vermieterrechtsschutz24',
];

if ($formType !== 'rechtsschutz') {
    if (!array_key_exists($formType, $genericLabels)) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'message' => 'Unbekanntes Formular.']);
        exit;
    }
    if (clean_value('datenschutz_bestaetigt', 10) !== 'ja') {
        http_response_code(422);
        echo json_encode(['ok' => false, 'message' => 'Bitte bestätigen Sie die Kenntnisnahme der Datenschutzerklärung.']);
        exit;
    }
    if (clean_value('erstinformation_digital', 10) !== 'ja') {
        http_response_code(422);
        echo json_encode(['ok' => false, 'message' => 'Bitte stimmen Sie der digitalen Bereitstellung der Erstinformation zu.']);
        exit;
    }

    $name = clean_value('name', 120);
    $email = clean_value('email', 254);
    $phone = clean_value('phone', 50);
    if (strlen($name) < 2 || $email === '' || $phone === '') {
        http_response_code(422);
        echo json_encode(['ok' => false, 'message' => 'Bitte geben Sie Name, E-Mail-Adresse und Telefonnummer vollständig an.']);
        exit;
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'message' => 'Bitte geben Sie eine gültige E-Mail-Adresse an.']);
        exit;
    }
    if (!preg_match('/^[0-9+()\/ .-]{6,30}$/', $phone)) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'message' => 'Bitte geben Sie eine gültige Telefonnummer an.']);
        exit;
    }

    $details = answer_lines((string)($_POST['answers_json'] ?? ''));
    $sourceUrl = clean_value('source_url', 500);
    $attribution = attribution_lines();
    $lines = [
        'Neue unverbindliche Beratungsanfrage',
        '------------------------------------',
        '',
        'Quelle: ' . $genericLabels[$formType],
        'Name: ' . $name,
        'E-Mail: ' . $email,
        'Telefon: ' . $phone,
        '',
        'Funnel-Angaben:',
        ...($details !== [] ? $details : ['Keine Auswahl übermittelt']),
        '',
        'Tracking / Attribution:',
        ...$attribution,
        '',
        'Datenschutzerklärung: Kenntnisnahme bestätigt',
        'Erstinformation: digitaler Bereitstellung ausdrücklich zugestimmt',
        'Seite: ' . ($sourceUrl !== '' ? $sourceUrl : clean_text($_SERVER['HTTP_REFERER'] ?? 'Nicht verfügbar', 500)),
        'Eingegangen am: ' . (new DateTimeImmutable('now', new DateTimeZone('Europe/Berlin')))->format('d.m.Y H:i') . ' Uhr',
    ];
    $configPath = __DIR__ . '/.env';
    $config = is_readable($configPath) ? (parse_ini_file($configPath, false, INI_SCANNER_RAW) ?: []) : [];
    $recipient = $formType === 'vermieter'
        ? 'info@rechtsschutzpartner24.de'
        : 'leads.ap.arag@gmail.com';
    try {
        deliver_lead($config, $recipient, $email, 'Neue Anfrage über ' . $genericLabels[$formType], implode("\r\n", $lines));
    } catch (Throwable $error) {
        error_log('Kontaktformular: ' . $error->getMessage());
        http_response_code(500);
        echo json_encode(['ok' => false, 'message' => 'Die Nachricht konnte nicht versendet werden.']);
        exit;
    }
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
$latestAdultBirthDate = new DateTimeImmutable('-18 years');
if (!$birthDate || $birthDate->format('Y-m-d') !== $data['geburtsdatum'] || $birthDate > $latestAdultBirthDate) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Das Formular kann nur von volljährigen Personen verwendet werden. Bitte prüfen Sie Ihr Geburtsdatum.']);
    exit;
}

if (clean_value('datenschutz_bestaetigt', 10) !== 'ja') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Bitte bestätigen Sie die Kenntnisnahme der Datenschutzerklärung.']);
    exit;
}

if (clean_value('erstinformation_digital', 10) !== 'ja') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Bitte stimmen Sie der digitalen Bereitstellung der Erstinformation zu.']);
    exit;
}

$recipient = 'leads.ap.arag@gmail.com';
$subject = 'Neue Rechtsschutz-Anfrage über rechtsschutzpartner24.de';
$attribution = attribution_lines();
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
    'Tracking / Attribution:',
    ...$attribution,
    '',
    'Datenschutzerklärung: Kenntnisnahme bestätigt',
    'Erstinformation: digitaler Bereitstellung ausdrücklich zugestimmt',
    'Eingegangen am: ' . (new DateTimeImmutable('now', new DateTimeZone('Europe/Berlin')))->format('d.m.Y H:i') . ' Uhr'
];

$configPath = __DIR__ . '/.env';
$config = is_readable($configPath)
    ? (parse_ini_file($configPath, false, INI_SCANNER_RAW) ?: [])
    : [];

try {
    deliver_lead($config, $recipient, $data['email'], $subject, implode("\r\n", $lines));
} catch (Throwable $error) {
    error_log('Kontaktformular: ' . $error->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Die Nachricht konnte nicht versendet werden.']);
    exit;
}

echo json_encode(['ok' => true]);
