<?php
// Simulación de un consumidor de cola de RabbitMQ
// En producción se usaría la librería php-amqplib y un bucle while(true)

$redis_host = 'redis';
$db_host = 'pg-master';

echo "--- Task Worker Iniciado ---\n";
echo "Escuchando tareas en RabbitMQ...\n\n";

// Bucle infinito para simular el worker
while (true) {
    $timestamp = date('Y-m-d H:i:s');
    
    // 1. Simular la extracción de una tarea de la cola
    echo "[$timestamp] [INFO] Buscando nueva tarea en la cola...\n";
    
    // 2. Simular la conexión a la base de datos (PG Master)
    // El worker debe acceder a la DB para actualizar el estado del pedido
    echo "[$timestamp] [DB] Conectando a PostgreSQL (Master) en $db_host...\n";

    // 3. Simular la conexión a la caché (Redis)
    echo "[$timestamp] [CACHE] Conectando a Redis en $redis_host...\n";
    
    // 4. Simular la consulta al servicio Legacy (LA)
    // En producción se usaría cURL o Guzzle para http://la-tomcat:8080/api/check
    echo "[$timestamp] [LEGACY] Consultando servicio Legacy (la-tomcat)...\n";

    // 5. Simular procesamiento de la tarea
    $task_id = rand(1000, 9999);
    echo "[$timestamp] [SUCCESS] Tarea #$task_id procesada y actualizada en PostgreSQL.\n";
    
    // Pausa para evitar el consumo excesivo de CPU y simular el polling
    sleep(5); 
}
?>
