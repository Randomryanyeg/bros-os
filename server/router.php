<?php
// Simple router to handle API and other requests
$request = $_SERVER['REQUEST_URI'];
$root = __DIR__;

// Serve static files directly if they exist
$file = $root . $request;
if (file_exists($file) && !is_dir($file)) {
    // Basic fix for MIME types
    $ext = pathinfo($file, PATHINFO_EXTENSION);
    if ($ext === 'js') header('Content-Type: application/javascript');
    if ($ext === 'css') header('Content-Type: text/css');
    readfile($file);
    exit;
}

// Basic routing logic
if (strpos($request, '/api/') === 0) {
    // Route to API handler
    require_once $root . '/api/index.php';
} else {
    // Default to main application
    require_once $root . '/index.php';
}
