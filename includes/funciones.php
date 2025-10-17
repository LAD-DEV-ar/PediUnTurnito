<?php

function debug($variable) : string {
    echo "<pre>";
    var_dump($variable);
    echo "</pre>";
    exit;
}

function debugVarios($debugs = []) : array {
    foreach($debugs as $i){
        echo "<pre>";
        var_dump($variable);
        echo "</pre>";
    }
    exit;
}

function start_session_if_needed(): void {
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }
}

function require_login_simple(string $redirect = '/'): void {
    start_session_if_needed();
    if (empty($_SESSION['id']) || empty($_SESSION['login'])) {
        header('Location: ' . $redirect);
        exit;
    }
}

// Escapa / Sanitizar el HTML
function s($html) : string {
    $s = htmlspecialchars($html);
    return $s;
}