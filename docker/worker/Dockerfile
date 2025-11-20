# Usa una imagen base de PHP CLI
FROM php:8.2-cli

# Instala extensiones de PHP necesarias (ej. para RabbitMQ y PostgreSQL)
RUN apt-get update && \
    apt-get install -y libpq-dev librabbitmq-dev && \
    docker-php-ext-install pdo pdo_pgsql && \
    # Instala la extensión AMQP (para RabbitMQ)
    pecl install amqp && \
    docker-php-ext-enable amqp && \
    # Limpia
    rm -rf /var/lib/apt/lists/*

# Establece el directorio de trabajo para el script
WORKDIR /app

# Copia el script del consumidor
COPY src/worker/consumer.php /app/consumer.php

# Comando para ejecutar el worker de forma continua
CMD ["php", "consumer.php"]