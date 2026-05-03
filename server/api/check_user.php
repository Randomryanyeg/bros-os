<?php
header('Content-Type: application/json');

// Error handling helper
function sendError($message, $code = 500) {
    error_log("PHP ERROR: " . $message);
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

set_exception_handler(function($e) {
    sendError($e->getMessage());
});

$username = $_GET['username'] ?? null;

if (!$username) {
    sendError('Missing username', 400);
}

// Simulation of DB check
// In a real application, connect to DB and execute query
try {
    if ($username === 'admin' || $username === 'user1') {
        echo json_encode(['success' => true, 'exists' => true]);
    } else {
        echo json_encode(['success' => true, 'exists' => false]);
    }
} catch (Exception $e) {
    sendError('Error checking user: ' . $e->getMessage());
}
