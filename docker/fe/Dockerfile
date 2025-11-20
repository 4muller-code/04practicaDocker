# Usamos una imagen base estable y con soporte para Apache
FROM php:8.2-apache

# Instalación de extensiones necesarias:
# pdo_pgsql: Para conectarse a PostgreSQL
# redis: Para la memoria caché
# zip/git: Herramientas comunes para desarrollo
RUN apt-get update \
    && apt-get install -y libpq-dev libzip-dev git \
    && docker-php-ext-install pdo pdo_pgsql pgsql zip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    # Limpiamos para reducir el tamaño de la imagen (Principio de Seguridad por Minimización)
    && rm -rf /var/lib/apt/lists/*

# Copiamos el código de la aplicación
COPY src/fe /var/www/html

# Ajustamos permisos (importante para evitar vulnerabilidades de escritura)
# www-data es el usuario por defecto de Apache
RUN chown -R www-data:www-data /var/www/html

# El puerto 80 ya está expuesto por defecto en la base de imagen Apache
EXPOSE 80
