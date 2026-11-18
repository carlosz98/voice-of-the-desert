<?php
/* ============================================================
 *  write-help.php: "Ayúdame a escribir", Felipe's writing helper.
 *
 *  POST write-help.php
 *    { kind: "news", notes: "escribe que ... porque ...",
 *      about: { title, source } (optional: the news he picked), lang: "es" }
 *    → { title, summary, take }        (the fields depend on kind, see FIELDS)
 *
 *  It sends his notes to Google's Gemini (free tier) and gets back a
 *  draft for the form. NOTHING is published here: the draft goes into
 *  the form, Felipe reads it, changes what he wants, and publishes.
 *
 *  Settings (on Cloud Run, never in the code):
 *    GEMINI_API_KEY  → the free key from aistudio.google.com (required)
 *    GEMINI_MODEL    → which model (default gemini-2.5-flash)
 * ============================================================ */
require __DIR__ . '/_db.php';
require __DIR__ . '/_web.php';

if (method() !== 'POST') fail('Method not allowed', 405);
only_felipe();

/* what each form needs back, and a few words on each for the AI */
const FIELDS = [
    'news'    => ['title' => 'a short, clear headline', 'summary' => 'one or two sentences saying what happened', 'take' => "Felipe's opinion, in first person, warm and plain, like he talks on the radio"],
    'article' => ['title' => 'a short, clear title', 'summary' => 'one or two sentences on what the article is about', 'body' => 'the article, in short paragraphs separated by a blank line'],
    'video'   => ['title' => 'a short title for the video', 'description' => 'two or three sentences on what the video shows', 'note' => "Felipe's note, in first person, on why he shares it"],
    'episode' => ['summary' => 'two or three sentences on what the episode is about', 'note' => "Felipe's note, in first person, to his listeners"],
    'verse'   => ['reflection' => "Felipe's short reflection on the verse, in first person, warm and humble"],
    'note'    => ['text' => 'a short note from Felipe to his readers, in first person'],
];

$key = getenv('GEMINI_API_KEY');
if (!$key) fail("The writing helper isn't connected yet. (It needs its free Google key.)", 503);

$data = input();
$kind = $data['kind'] ?? '';
if (!isset(FIELDS[$kind])) fail('Unknown kind');
$notes = trim((string) ($data['notes'] ?? ''));
if (mb_strlen($notes) < 5) fail('Write a few words first: what happened and what you think.');
$notes = mb_substr($notes, 0, 3000);
$lang = ($data['lang'] ?? 'es') === 'en' ? 'English' : 'Spanish (Mexico)';

// the news he picked from the search (only its headline and newspaper)
$about = '';
if (!empty($data['about']['title'])) {
    $about = "\nThe news story this is about:\n  Headline: " . mb_substr(plain($data['about']['title']), 0, 300)
           . "\n  Newspaper: " . mb_substr(plain($data['about']['source'] ?? ''), 0, 100);
}
if (!empty($data['about']['reference'])) {
    $about = "\nThe verse: " . mb_substr(plain($data['about']['reference']), 0, 60) . ' "' . mb_substr(plain($data['about']['text'] ?? ''), 0, 600) . '"';
}

$fields = '';
foreach (FIELDS[$kind] as $name => $what) $fields .= "  \"$name\": $what\n";

/* The rules for the AI. The most important one: no made-up facts. */
$rules = <<<TXT
You help Felipe Lerma write for his website "La Voz del Desierto" (Chihuahua, Mexico).
Felipe gives you rough notes. Turn them into clean, simple writing in his voice:
warm, respectful, plain words, short sentences, like a neighbor talking on the radio.

Strict rules:
- Use ONLY the facts in Felipe's notes and in the news headline. Never add facts,
  numbers, dates, names, places or quotes that are not there.
- If something important is missing, write it as [brackets] for Felipe to fill in,
  e.g. [fecha] or [nombre de la ciudad].
- Keep Felipe's opinion as HIS opinion. Don't change what he believes, and don't add
  opinions he didn't give. Don't preach or exaggerate.
- No insults, no hate, nothing violent or vulgar.
- Write in $lang.
Answer ONLY with a JSON object with these keys:
$fields
TXT;

$body = json_encode([
    'systemInstruction' => ['parts' => [['text' => $rules]]],
    'contents' => [['role' => 'user', 'parts' => [['text' => "Felipe's notes:\n$notes\n$about"]]]],
    'generationConfig' => ['responseMimeType' => 'application/json', 'temperature' => 0.4, 'maxOutputTokens' => 2048],
], JSON_UNESCAPED_UNICODE);

// GEMINI_URL can point somewhere else for the tests
$base = rtrim(getenv('GEMINI_URL') ?: 'https://generativelanguage.googleapis.com/v1beta/models', '/');
$model = preg_replace('/[^a-z0-9.\-]/', '', getenv('GEMINI_MODEL') ?: 'gemini-2.5-flash');
$answer = web_get("$base/$model:generateContent", ['Content-Type: application/json', "x-goog-api-key: $key"], $body, 30);

if (!$answer) fail("The writing helper isn't answering right now. Try again in a minute.", 502);
if ($answer['status'] === 429) fail("The writing helper is resting (free limit). Try again in a minute.", 429);
if ($answer['status'] !== 200) fail("The writing helper isn't answering right now. Try again in a minute.", 502);

$reply = json_decode($answer['body'], true);
$text = $reply['candidates'][0]['content']['parts'][0]['text'] ?? '';
$draft = json_decode(preg_replace('/^```(?:json)?\s*|\s*```$/', '', trim($text)), true);
if (!is_array($draft)) fail("The writing helper didn't understand. Try writing your notes another way.", 502);

// keep only the fields this form has, as plain text
$out = [];
foreach (array_keys(FIELDS[$kind]) as $name) {
    $out[$name] = trim(strip_tags((string) ($draft[$name] ?? '')));
}
send($out);
