# Usamos la imagen base de PHP con Apache
FROM php:8.2-apache

# Instalamos dependencias de sistema y extensiones de PHP
RUN apt-get update \
    && apt-get install -y libpq-dev libzip-dev git librabbitmq-dev \
    && docker-php-ext-install pdo pdo_pgsql pgsql zip \
    && pecl install redis \
    && pecl install amqp \
    && docker-php-ext-enable redis amqp \
    && rm -rf /var/lib/apt/lists/*

# Copiamos el código de la aplicación
# La ruta 'src/fe' es relativa a la raíz del repositorio (el contexto de construcción)
COPY src/fe /var/www/html

# Ajustamos permisos (importante para evitar vulnerabilidades de escritura)
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Configuraciones adicionales de Apache o PHP pueden ir aquí

CMD ["apache2-foreground"]