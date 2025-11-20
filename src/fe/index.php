<?php
// Archivo de sanidad para health check
// Este archivo debe existir para que el balanceador de carga funcione

header('Content-Type: text/plain');
echo "✅ Sistema de Comandas Asíncrono - Health Check OK\n";
echo "Servidor: " . gethostname() . "\n";
echo "Timestamp: " . date('Y-m-d H:i:s') . "\n";
echo "Status: 200 OK\n";

// Verificar conexiones básicas si es necesario
$db_status = "N/A";
$redis_status = "N/A";

try {
    // Intentar conexión a PostgreSQL
    $pdo = new PDO("pgsql:host=pg-master;dbname=main_db", getenv('POSTGRES_USER'), getenv('POSTGRES_PASSWORD'));
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db_status = "✅ PostgreSQL: Conexión OK";
} catch (PDOException $e) {
    $db_status = "❌ PostgreSQL: " . $e->getMessage();
}

try {
    // Intentar conexión a Redis
    $redis = new Redis();
    $redis->connect('redis', 6379);
    $redis->set('health_check', time());
    $redis_status = "✅ Redis: Conexión OK";
} catch (Exception $e) {
    $redis_status = "❌ Redis: " . $e->getMessage();
}

echo "\n--- Verificación de Servicios ---\n";
echo $db_status . "\n";
echo $redis_status . "\n";
?>