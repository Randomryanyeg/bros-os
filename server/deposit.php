<?php
/**
 * deposit.php
 * Handles money deposit logic for the platform.
 */

header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

// Read incoming JSON or Form Data
$input = json_decode(file_get_contents('php://input'), true);

$amount = isset($input['amount']) ? floatval($input['amount']) : (isset($_POST['amount']) ? floatval($_POST['amount']) : 0);
$account = isset($input['account']) ? $input['account'] : (isset($_POST['account']) ? $_POST['account'] : '');
$type = isset($input['type']) ? $input['type'] : (isset($_POST['type']) ? $_POST['type'] : 'deposit');

if ($amount <= 0 || empty($account)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid deposit amount or missing account mapping']);
    exit;
}

// Process the deposit and save to the respective account history (mocked implementation)
$response = [
    'success' => true,
    'message' => 'Deposit successful',
    'data' => [
        'amount' => $amount,
        'account' => $account,
        'type' => $type,
        'timestamp' => time(),
        'reference' => strtoupper(uniqid('DEP-'))
    ]
];

echo json_encode($response);
?>
