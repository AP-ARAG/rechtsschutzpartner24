<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

// Offline only: extract pure helpers without including the endpoint, .env or any mail function.
$sourcePath = $argv[1] ?? 'contact.php';
$source = file_get_contents($sourcePath);
if ($source === false) {
    throw new RuntimeException('Source file missing');
}
function check(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}
function helper_code(string $source, string $name): string
{
    $start = strpos($source, 'function ' . $name . '(');
    if ($start === false) {
        throw new RuntimeException('Helper missing: ' . $name);
    }
    $tokens = token_get_all('<?php ' . substr($source, $start));
    $code = '';
    $depth = 0;
    $started = false;
    foreach ($tokens as $token) {
        if (is_array($token) && $token[0] === T_OPEN_TAG) {
            continue;
        }
        $text = is_array($token) ? $token[1] : $token;
        $code .= $text;
        if (!is_array($token) && $text === '{') {
            $started = true;
            $depth++;
        } elseif (!is_array($token) && $text === '}') {
            $depth--;
            if ($started && $depth === 0) {
                return $code;
            }
        }
    }
    throw new RuntimeException('Unclosed helper: ' . $name);
}
$names = ['minimized_url', 'smtp_response'];
if (str_contains($source, 'function attribution_lines(')) {
    $names[] = 'clean_value';
    $names[] = 'attribution_lines';
}
$code = "namespace SourceUnderTest; use \\RuntimeException;\n";
foreach ($names as $name) {
    $code .= helper_code($source, $name) . "\n";
}
eval($code);
$cases = [
    ['https://example.invalid/angebot?gclid=entfernen#privat', true, 'https://example.invalid/angebot'],
    ['https://person:pass@example.invalid/pfad?token=entfernen', true, 'https://example.invalid/pfad'],
    ['https://referrer.invalid/personen/privat?token=entfernen#privat', false, 'https://referrer.invalid'],
    ['http://example.invalid:8080/pfad?q=entfernen', true, 'http://example.invalid:8080/pfad'],
    ['javascript:ungueltig', true, ''],
    ['keine URL', true, ''],
    ['', false, ''],
];
foreach ($cases as [$input, $includePath, $expected]) {
    check(\SourceUnderTest\minimized_url($input, $includePath) === $expected, 'URL minimization failed');
}
if (function_exists('SourceUnderTest\\attribution_lines')) {
    $_POST = [
        'funnel_id' => 'synthetischer-check',
        'utm_source' => 'newsletter',
        'source_url' => 'https://example.invalid/angebot?gclid=NICHTSENDEN#privat',
        'referrer_url' => 'https://referrer.invalid/private-person?token=NICHTSENDEN',
        'gclid' => 'NICHTSENDEN', 'gbraid' => 'NICHTSENDEN', 'wbraid' => 'NICHTSENDEN',
        'msclkid' => 'NICHTSENDEN', 'fbclid' => 'NICHTSENDEN',
    ];
    $lines = implode("\n", \SourceUnderTest\attribution_lines());
    check(!str_contains($lines, 'NICHTSENDEN'), 'Click ID or query leaked into email metadata');
    check(!str_contains($lines, 'private-person'), 'Referrer path leaked into email metadata');
    check(str_contains($lines, 'newsletter'), 'Existing UTM attribution lost');
    check(str_contains($lines, 'https://example.invalid/angebot'), 'Source path lost');
}
$socket = fopen('php://memory', 'r+');
check($socket !== false, 'Memory stream unavailable');
fwrite($socket, "550 5.1.1 synthetisch@example.invalid provider-internal-detail\r\n");
rewind($socket);
try {
    \SourceUnderTest\smtp_response($socket, [250]);
    throw new RuntimeException('Expected SMTP exception missing');
} catch (RuntimeException $error) {
    check($error->getCode() === 550, 'SMTP status code missing');
    check(!str_contains($error->getMessage(), '@'), 'SMTP recipient leaked');
    check(!str_contains($error->getMessage(), 'provider-internal-detail'), 'Raw SMTP response leaked');
} finally {
    fclose($socket);
}
check(!str_contains($source, '$error->getMessage()'), 'Raw exception message still logged');
echo json_encode(['url_cases' => count($cases), 'smtp_memory_stream' => 'pass', 'network_or_mail_calls' => 0], JSON_THROW_ON_ERROR) . PHP_EOL;
