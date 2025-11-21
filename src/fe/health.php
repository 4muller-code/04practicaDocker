<?php
// Health check simple que no depende de servicios externos
header('Content-Type: application/json');

$status = [
    'application' => [
        'name' => 'Front-end Load Balanced Service',
        'status' => 'OK',
        'timestamp' => date('Y-m-d H:i:s'),
        'server_info' => gethostname(),
    ],
    'services' => [
        'php' => ['status' => 'OK', 'details' => 'PHP is running'],
        'apache' => ['status' => 'OK', 'details' => 'Apache is responding']
    ]
];

// Devolver estado OK siempre que PHP esté funcionando
http_response_code(200);
echo json_encode($status, JSON_PRETTY_PRINT);
exit;
?>