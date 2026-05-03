<?php
// API entry point

$request = $_SERVER['REQUEST_URI'];

// Basic auth routing
if (strpos($request, '/api/auth/login.php') !== false) {
    require_once __DIR__ . '/auth/login.php';
    exit;
}

if (strpos($request, '/api/check_user.php') !== false) {
    require_once __DIR__ . '/check_user.php';
    exit;
}

echo json_encode(["status" => "API working"]);
