<?php
// Configuración de la conexión a servicios (Variables de Entorno seguras)
$db_host = 'pg-master'; // Nombre del servicio en Docker Compose
$db_name = 'main_db';
$db_user = (string) getenv('POSTGRES_USER'); // Se lee del entorno y se asegura como string
$db_pass = (string) getenv('POSTGRES_PASSWORD'); // Se lee del entorno y se asegura como string
$redis_host = 'redis';
$rabbitmq_host = 'rabbitmq';

// --- Funciones de Conexión (Mínimas para prueba) ---

function test_db_connection($host, $db, $user, $pass) {
    try {
        $pdo = new PDO("pgsql:host=$host;dbname=$db", $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return "POSTGRES: Conexión OK a $host.";
    } catch (PDOException $e) {
        return "POSTGRES: Fallo de Conexión a $host. ERROR: " . $e->getMessage();
    }
}

function test_redis_connection($host) {
    // Nota: Para RabbitMQ y Redis necesitaríamos instalar las extensiones adecuadas
    // La imagen Dockerfile ya incluye el soporte para Redis.
    try {
        $redis = new Redis();
        $redis->connect($host, 6379);
        $redis->set('test_key', time());
        $redis->expire('test_key', 60);
        return "REDIS: Conexión OK a $host (Valor de prueba guardado).";
    } catch (Exception $e) {
        return "REDIS: Fallo de Conexión a $host. ERROR: " . $e->getMessage();
    }
}

// --- Lógica del Front-end ---

// 1. Verificar conexiones de la red fe-be-net
$db_status = test_db_connection($db_host, $db_name, $db_user, $db_pass);
$redis_status = test_redis_connection($redis_host);

// 2. Simulación de Recepción de Pedido
$order_id = uniqid('ORD_');
$message = "Pedido $order_id recibido y encolado en RabbitMQ.";

// En un entorno real, aquí se inyectaría el código para RabbitMQ:
// publish_to_rabbitmq("process_order", json_encode(['order_id' => $order_id, 'timestamp' => time()]));
$rabbitmq_status = "RABBITMQ: Simulación de encolado de tarea '$order_id'.";


?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Sistema de Comandas Asíncrono</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f9; padding: 20px; }
        .container { max-width: 800px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        h1 { color: #333; }
        .status-box { margin-top: 20px; padding: 15px; border-left: 5px solid #4CAF50; background-color: #e6ffe6; }
        .error-box { border-left: 5px solid #f44336; background-color: #ffe6e6; }
        pre { background: #eee; padding: 10px; border-radius: 4px; overflow-x: auto; }
        .service-check { margin-top: 10px; padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>✅ Sistema de Comandas Asíncrono (Front-end)</h1>
        <p>Esta página simula la recepción de una comanda y la encola para procesamiento asíncrono.</p>

        <div class="status-box">
            <h2>Estatus de la Comanda</h2>
            <p><strong><?php echo htmlspecialchars($message); ?></strong></p>
            <p><strong>Servidor actual:</strong> <?php echo gethostname(); ?></p>
        </div>

        <h2>Verificación de Conexiones Internas (`fe-be-net`)</h2>
        <div class="service-check">
            <strong>Base de Datos (PostgreSQL Master):</strong> <?php echo strpos($db_status, 'Fallo') !== false ? '<span style="color:red;">' . htmlspecialchars($db_status) . '</span>' : '<span style="color:green;">' . htmlspecialchars($db_status) . '</span>'; ?>
        </div>
        <div class="service-check">
            <strong>Memoria Caché (Redis):</strong> <?php echo strpos($redis_status, 'Fallo') !== false ? '<span style="color:red;">' . htmlspecialchars($redis_status) . '</span>' : '<span style="color:green;">' . htmlspecialchars($redis_status) . '</span>'; ?>
        </div>
        <div class="service-check">
            <strong>Cola de Mensajes (RabbitMQ):</strong> <span style="color:orange;"><?php echo htmlspecialchars($rabbitmq_status); ?></span>
        </div>
        
        <p style="margin-top: 30px; font-size: 0.8em;">*El Task Worker se encargará de consumir esta tarea de la cola.</p>

        <h2>Información del Entorno</h2>
        <pre><?php phpinfo(INFO_GENERAL); ?></pre>
    </div>
</body>
</html>
