<?php
// Simulación de un consumidor de cola de RabbitMQ
// En producción se usaría la librería php-amqplib y un bucle while(true)

// Variables de entorno para autenticación
$redis_host = getenv('REDIS_HOST') ?: 'redis';
$redis_password = getenv('REDIS_PASSWORD') ?: '';
$db_host = getenv('PG_HOST') ?: 'pg-master';
$db_user = getenv('POSTGRES_USER') ?: 'user_prod';
$db_password = getenv('POSTGRES_PASSWORD') ?: '';
$rabbitmq_host = getenv('RABBITMQ_HOST') ?: 'rabbitmq';
$rabbitmq_user = getenv('RABBITMQ_USER') ?: 'rabbituser';
$rabbitmq_pass = getenv('RABBITMQ_PASS') ?: '';

echo "--- Task Worker Iniciado ---\n";
echo "Escuchando tareas en RabbitMQ...\n\n";

// Bucle infinito para simular el worker
while (true) {
    $timestamp = date('Y-m-d H:i:s');

    // 1. Simular la extracción de una tarea de la cola
    echo "[$timestamp] [INFO] Buscando nueva tarea en la cola...\n";

    // 2. Simular la conexión a la base de datos (PG Master)
    // El worker debe acceder a la DB para actualizar el estado del pedido
    echo "[$timestamp] [DB] Conectando a PostgreSQL (Master) en $db_host con usuario $db_user...\n";

    // 3. Simular la conexión a la caché (Redis)
    echo "[$timestamp] [CACHE] Conectando a Redis en $redis_host con autenticación...\n";

    // 4. Simular la conexión a RabbitMQ
    echo "[$timestamp] [QUEUE] Conectando a RabbitMQ en $rabbitmq_host con usuario $rabbitmq_user...\n";

    // 5. Simular procesamiento de la tarea
    $task_id = (string) rand(1000, 9999);
    echo "[$timestamp] [SUCCESS] Tarea #$task_id procesada y actualizada en PostgreSQL.\n";

    // Pausa para evitar el consumo excesivo de CPU y simular el polling
    $sleep_time = 5;
    sleep($sleep_time);
}
?>
