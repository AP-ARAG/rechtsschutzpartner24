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

$headers = [
    'From: RechtsschutzPartner24 <info@rechtsschutzpartner24.de>',
    'Reply-To: ' . $data['email'],
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: PHP/' . PHP_VERSION
];

$sent = mail($recipient, $subject, implode("\r\n", $lines), implode("\r\n", $headers));

if (!$sent) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Die Nachricht konnte nicht versendet werden.']);
    exit;
}

echo json_encode(['ok' => true]);
