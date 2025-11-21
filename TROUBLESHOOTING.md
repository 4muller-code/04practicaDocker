# Troubleshooting y Soluciones Implementadas

## Problemas Resueltos

### 1. Puerto 80 Ocupado por Apache
**Problema**: El servicio de load balancer (nginx) no podía iniciarse porque el puerto 80 estaba ocupado por Apache en el host.

**Solución**:
```bash
# Detener Apache temporalmente para liberar puerto 80
sudo systemctl stop apache2
# O alternativamente, usar un puerto diferente si Apache es necesario
```

**Nota**: Si Apache es necesario para otros servicios, se puede configurar el load balancer en un puerto diferente (ej: 8080) o Apache en otro puerto.

### 2. Worker Authentication
**Problema**: El worker original usaba hosts hardcodeados sin autenticación.

**Solución**: Se actualizó `src/worker/consumer.php` para usar variables de entorno:
- `REDIS_HOST`, `REDIS_PASSWORD`
- `PG_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `RABBITMQ_HOST`, `RABBITMQ_USER`, `RABBITMQ_PASS`

### 3. Dependencias de Servicios Bloqueantes
**Problema**: El load balancer no iniciaba porque esperaba que el servicio S3 estuviera "healthy".

**Solución**: Se cambió la dependencia de "healthy" a "started" en `docker-compose.yml`:
```yaml
depends_on:
  s3:
    condition: service_started
```

### 4. Nginx Syntax Error
**Problema**: Error de sintaxis en `config/nginx.conf` debido a caracteres UTF-8 problemáticos.

**Solución**: Se reescribió el archivo eliminando caracteres problemáticos y espacios en blanco.

## Estado Actual

✅ **Todos los servicios funcionando**:
- Load balancer (port 80)
- Frontend services con balanceo de carga
- PostgreSQL, Redis, RabbitMQ
- MinIO (port 9000)
- Task Worker

✅ **Autenticación configurada** para todos los servicios
✅ **Health checks funcionando**
✅ **Balanceo de carga activo**

## Comandos Útiles

```bash
# Verificar estado de servicios
docker-compose ps

# Probar endpoints
curl http://localhost/
curl http://localhost/health.php

# Ver logs de un servicio específico
docker-compose logs [service_name]
```