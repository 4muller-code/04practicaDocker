<?php

header('Content-Type: application/json');

// --- 1. Variables de Entorno y Credenciales ---
// Las credenciales de la base de datos y Redis se obtienen de las variables de entorno
// que Docker Compose pasa al contenedor fe-web-1 (y fe-web-2).

// PostgreSQL
$PG_HOST = getenv('PG_HOST') ?: 'pg-master';
$PG_PORT = getenv('PG_PORT') ?: '5432';
$PG_DB = getenv('POSTGRES_DB') ?: 'main_db';
$PG_USER = getenv('POSTGRES_USER') ?: 'user_prod';
$PG_PASSWORD = getenv('POSTGRES_PASSWORD') ?: 'default_password';

// Redis
$REDIS_HOST = getenv('REDIS_HOST') ?: 'redis';
$REDIS_PORT = getenv('REDIS_PORT') ?: '6379';
$REDIS_PASSWORD = getenv('REDIS_PASSWORD') ?: '';

$status = [
    'application' => [
        'name' => 'Front-end Load Balanced Service',
        'status' => 'OK',
        'timestamp' => date('Y-m-d H:i:s'),
        'server_info' => gethostname(),
    ],
    'services' => [],
];

$errors = [];

// --- 2. Health Check de PostgreSQL ---
try {
    $dsn = "pgsql:host=$PG_HOST;port=$PG_PORT;dbname=$PG_DB";
    $pdo = new PDO($dsn, $PG_USER, $PG_PASSWORD, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

    // Ejecutar una consulta simple para verificar la conexión
    $result = $pdo->query('SELECT 1');
    if ($result && $result->fetchColumn() === 1) {
        $status['services']['postgres'] = ['status' => 'OK', 'details' => 'Database connection successful.'];
    } else {
        throw new \Exception('Basic SELECT failed.');
    }
} catch (Exception $e) {
    $status['services']['postgres'] = ['status' => 'FAIL', 'details' => $e->getMessage()];
    $errors[] = 'PostgreSQL check failed.';
}

// --- 3. Health Check de Redis ---
try {
    // La clase Redis requiere la extensión 'redis' instalada en el Dockerfile de PHP.
    $redis = new Redis();
    if ($redis->connect($REDIS_HOST, $REDIS_PORT)) {
        // Autenticar con Redis usando la contraseña
        $redis->auth($REDIS_PASSWORD);
        // Ejecutar un comando simple para verificar la conexión
        $redis->ping();
        $status['services']['redis'] = ['status' => 'OK', 'details' => 'Redis connection successful.'];
    } else {
        throw new \Exception('Connection failed to Redis host/port.');
    }
} catch (Exception $e) {
    $status['services']['redis'] = ['status' => 'FAIL', 'details' => $e->getMessage()];
    $errors[] = 'Redis check failed.';
}

// --- 4. Determinar Estado Final y Respuesta HTTP ---
if (!empty($errors)) {
    // Si hay errores en algún servicio crítico, el estado general es FAIL y HTTP 500
    http_response_code(500);
    $status['application']['status'] = 'FAIL';
    $status['application']['errors'] = $errors;
} else {
    // Si todos los servicios están OK, el estado general es OK y HTTP 200
    http_response_code(200);
}

// 5. Devolver el JSON del estado
echo json_encode($status, JSON_PRETTY_PRINT);
exit;