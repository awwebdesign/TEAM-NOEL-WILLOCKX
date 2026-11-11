<?php
/**
 * Team Noel-Willockx: contactformulier mailer
 * -------------------------------------------------------------
 * Ontvangt de POST van het contactformulier en stuurt een mail.
 * Antwoordt met JSON zodat de site inline een bevestiging toont.
 *
 * INSTELLEN (2 regels hieronder):
 *   $RECIPIENT : waar de aanvragen toekomen.
 *   $FROM      : een adres op het EIGEN domein van de site, zodat
 *                de host namens dat domein mag verzenden (SPF/DKIM).
 */

header('Content-Type: application/json; charset=utf-8');

/* ---------------- config ---------------- */
$RECIPIENT = 'info@teamnoelwillockx.be';      // TODO: echt adres
$FROM      = 'no-reply@teamnoelwillockx.be';  // TODO: echt domein
$FROM_NAME = 'Team Noel-Willockx';
/* ---------------------------------------- */

function out($ok, $msg, $code = 200) {
    http_response_code($code);
    echo json_encode(['success' => $ok, 'message' => $msg]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    out(false, 'Ongeldige aanvraag.', 405);
}

// Honeypot: bots vullen het verborgen "company"-veld in.
if (!empty($_POST['company'])) {
    out(true, 'Bericht verstuurd. We antwoorden binnen twee werkdagen.');
}

$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$phone   = trim($_POST['phone'] ?? '');
$subject = trim($_POST['subject'] ?? 'Andere vraag');
$pigeon  = trim($_POST['pigeon'] ?? '');
$message = trim($_POST['message'] ?? '');
$consent = (($_POST['consent'] ?? '') === 'ja');

if ($name === '' || $message === '') {
    out(false, 'Vul je naam en bericht in.', 422);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    out(false, 'Vul een geldig e-mailadres in.', 422);
}
if (!$consent) {
    out(false, 'Vink het akkoord aan om te versturen.', 422);
}

// Voorkom header-injectie: geen nieuwe regels in kopvelden.
$strip   = function ($s) { return str_replace(["\r", "\n"], ' ', $s); };
$name    = $strip($name);
$email   = $strip($email);
$phone   = $strip($phone);
$subject = $strip($subject);
$pigeon  = $strip($pigeon);

$mailSubject = "{$subject}" . ($pigeon !== '' ? ": {$pigeon}" : '') . " ({$name})";
$body =
    "Nieuw bericht via de website\n\n" .
    "Naam:      {$name}\n" .
    "E-mail:    {$email}\n" .
    "Telefoon:  " . ($phone !== '' ? $phone : '-') . "\n" .
    "Onderwerp: {$subject}\n" .
    "Duif:      " . ($pigeon !== '' ? $pigeon : '-') . "\n\n" .
    "Bericht:\n{$message}\n";

$headers  = "From: {$FROM_NAME} <{$FROM}>\r\n";
$headers .= "Reply-To: {$name} <{$email}>\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

$encodedSubject = '=?UTF-8?B?' . base64_encode($mailSubject) . '?=';

if (@mail($RECIPIENT, $encodedSubject, $body, $headers)) {
    out(true, 'Bericht verstuurd. We antwoorden binnen twee werkdagen.');
}

out(false, 'Het bericht is niet verstuurd.', 500);
