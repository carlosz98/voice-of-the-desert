<?php
/* ============================================================
 *  _web.php: asks other websites for something (shared helper).
 *  Used by Felipe's tools: news-search.php, music-search.php,
 *  video-info.php and write-help.php.
 *
 *  Safety:
 *    - every address is built by OUR code (never one typed by a user),
 *      so nobody can make our server visit a site of their choosing
 *    - short timeout, and big answers are refused
 *    - only http/https
 * ============================================================ */

const WEB_MAX_BYTES = 2_000_000; // 2 MB is plenty for a list of results

/* GET (or POST when $body is given). Returns ['status' => 200, 'body' => '...']
 * or null when the other site can't be reached. */
function web_get(string $url, array $headers = [], ?string $body = null, int $timeout = 10): ?array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS      => 3,
        CURLOPT_PROTOCOLS_STR  => 'https,http',
        CURLOPT_REDIR_PROTOCOLS_STR => 'https',
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT        => $timeout,
        CURLOPT_HTTPHEADER     => array_merge(['User-Agent: LaVozDelDesierto/1.0'], $headers),
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    $answer = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    if ($answer === false || strlen($answer) > WEB_MAX_BYTES) return null;
    return ['status' => $status, 'body' => $answer];
}

/* the search words Felipe typed: trimmed, at most 100 letters */
function search_words(): string
{
    $q = trim((string) ($_GET['q'] ?? ''));
    if ($q === '') fail('Write what you want to search for.');
    return mb_substr($q, 0, 100);
}

/* text from another site → plain text (no HTML, no extra spaces) */
function plain(?string $s): string
{
    return trim(preg_replace('/\s+/u', ' ', html_entity_decode(strip_tags((string) $s), ENT_QUOTES | ENT_HTML5, 'UTF-8')));
}
