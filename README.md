# Sistema de Producción Segura - Arquitectura de Microservicios

## 📋 Descripción General

Este proyecto implementa una arquitectura de microservicios completa para un sistema de reservas de la Catedral de Mallorca, utilizando Docker Compose para orquestación de contenedores. El sistema incluye múltiples servicios distribuidos con balanceo de carga, aislamiento de red y alta disponibilidad.

## 🏗️ Arquitectura del Sistema

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                             EXTERNAL USERS                              │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        LOAD BALANCER (NGINX)                            │
│                               lb:80                                     │
└─────────────┬─────────────────────────────┬─────────────────────────────┘
              │                             │
              ▼                             ▼
┌─────────────────────────┐     ┌─────────────────────────────────────────┐
│    FRONTEND WEB APPS    │     │          NEXT.JS APPS                   │
│   (PHP/Apache)          │     │      (React/TypeScript)                 │
│                         │     │                                         │
│  ┌─────────┐ ┌─────────┐│     │  ┌─────────┐       ┌─────────┐          │
│  │fe-web-1 │ │fe-web-2 ││     │  │nextjs-1 │       │nextjs-2 │          │
│  │   :80   │ │   :80   ││     │  │ :3000   │       │ :3000   │          │
│  └─────────┘ └─────────┘│     │  └─────────┘       └─────────┘          │
└─────────┬───────────────┘     └─────────────────────────────────────────┘
          │                             │
          └─────────────┬───────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────────────────┐
│                        BACKEND SERVICES                                 │
│                                                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐    │
│  │ pg-     │ │ redis   │ │ rabbit  │ │ task-   │ │ s3 (MinIO)      │    │
│  │ master  │ │ :6379   │ │ mq      │ │ worker  │ │ :9000           │    │
│  │ :5432   │ │         │ │ :5672   │ │         │ │                 │    │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Diagrama de Red

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PUBLIC NET    │    │   FE-BE NET     │    │    BE NET       │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │    lb:80    │ │    │ │  pg-master  │ │    │ │ task-worker │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ fe-web-1:80 │◄┼────┼─┤ redis:6379  │ │    │ │ rabbitmq    │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │                 │
│ │ fe-web-2:80 │◄┼────┼─┤             │ │    │                 │
│ └─────────────┘ │    │ └─────────────┘ │    │                 │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │                 │    │                 │
│ │ nextjs-1    │ │    │                 │    │                 │
│ │ :3000       │ │    │                 │    │                 │
│ └─────────────┘ │    │                 │    │                 │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │                 │    │                 │
│ │ nextjs-2    │ │    │                 │    │                 │
│ │ :3000       │ │    │                 │    │                 │
│ └─────────────┘ │    │                 │    │                 │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │                 │    │                 │
│ │ s3:9000     │ │    │                 │    │                 │
│ └─────────────┘ │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Servicios Implementados

### 1. Balanceador de Carga (LB)
- **Servicio**: `lb`
- **Imagen**: `nginx:stable-alpine`
- **Puerto**: `80`
- **Función**: Único punto de entrada para todo el tráfico externo
- **Rutas**:
  - `/` → Frontend PHP
  - `/nextjs/` → Aplicación Next.js
  - `/_next/` → Assets estáticos de Next.js
  - `/static/` → Almacenamiento de objetos (S3)

### 2. Frontend Web (FE)
- **Servicios**: `fe-web-1`, `fe-web-2`
- **Imagen**: PHP 8.2 + Apache (custom)
- **Puerto interno**: `80`
- **Función**: Aplicación web principal con balanceo de carga

### 3. Aplicación Next.js
- **Servicios**: `nextjs-app-1`, `nextjs-app-2`
- **Tecnología**: Next.js 15.5.6 + TypeScript + Tailwind CSS
- **Puerto interno**: `3000`
- **Función**: Nueva aplicación web para reservas de la Catedral de Mallorca
- **Características**:
  - Soporte multiidioma (Català, Español, English)
  - Interfaz de reserva de tickets
  - Diseño responsive
  - Componentes shadcn/ui

### 4. Base de Datos (BE)
- **Servicio**: `pg-master`
- **Imagen**: `postgres:15-alpine`
- **Puerto**: `5432`
- **Volumen**: `db-pg-master-data`

### 5. Caché (BE)
- **Servicio**: `redis`
- **Imagen**: `redis:7-alpine`
- **Puerto**: `6379`
- **Volumen**: `cache-redis-data`

### 6. Colas de Mensajes (BE)
- **Servicio**: `rabbitmq`
- **Imagen**: `rabbitmq:3.12-management-alpine`
- **Puertos**: `5672` (AMQP), `15672` (Management UI)
- **Volumen**: `queues-rabbit-data`

### 7. Worker de Tareas (BE)
- **Servicio**: `task-worker`
- **Imagen**: PHP 8.2 (custom)
- **Función**: Consumidor de colas RabbitMQ

### 8. Almacenamiento de Objetos (S3)
- **Servicio**: `s3`
- **Imagen**: `minio/minio:latest`
- **Puerto**: `9000`
- **Volumen**: `s3-data`

## 🔒 Seguridad y Aislamiento

### Redes Docker
- **`public-net`**: Servicios expuestos al exterior (LB, FE, Next.js, S3)
- **`fe-be-net`**: Comunicación entre Frontend y Backend
- **`be-net`**: Comunicación interna del Backend

### Variables de Entorno
El sistema utiliza variables de entorno para credenciales seguras:
- `POSTGRES_USER` / `POSTGRES_PASSWORD`
- `REDIS_PASSWORD`
- `RABBITMQ_DEFAULT_USER` / `RABBITMQ_DEFAULT_PASS`
- `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Docker 20.10+
- Docker Compose 2.0+
- Git

### Paso a Paso de Ejecución

#### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd produccionsegura
```

#### 2. Configurar Variables de Entorno
Crear archivo `.env` en la raíz del proyecto con las credenciales necesarias:
```bash
# Base de Datos PostgreSQL
POSTGRES_USER=tu_usuario
POSTGRES_PASSWORD=tu_contraseña_segura

# Redis Cache
REDIS_PASSWORD=tu_contraseña_redis

# RabbitMQ
RABBITMQ_DEFAULT_USER=tu_usuario
RABBITMQ_DEFAULT_PASS=tu_contraseña_rabbitmq

# MinIO S3
MINIO_ROOT_USER=tu_usuario_minio
MINIO_ROOT_PASSWORD=tu_contraseña_minio
```

#### 3. Construir y Ejecutar los Servicios
```bash
# Construir todas las imágenes
docker-compose build

# Ejecutar en segundo plano
docker-compose up -d
```

#### 4. Verificar Estado de los Servicios
```bash
# Ver estado de todos los contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Verificar health checks
docker ps --format "table {{.Names}}\t{{.Status}}"
```

#### 5. Acceder a las Aplicaciones

**Frontend PHP**:
```bash
curl http://localhost/
# o abrir en navegador: http://localhost
```

**Aplicación Next.js**:
```bash
curl http://localhost/nextjs/
# o abrir en navegador: http://localhost/nextjs
```

**MinIO Management**:
```bash
# Abrir en navegador: http://localhost:9000
# Usar credenciales configuradas en .env
```

**RabbitMQ Management**:
```bash
# Abrir en navegador: http://localhost:15672
# Usar credenciales configuradas en .env
```

## 🧪 Health Checks y Monitoreo

### Endpoints de Salud
- **LB**: `http://localhost/health.php`
- **FE**: `http://localhost/health.php`
- **Next.js**: `http://localhost:3000/api/health`
- **PostgreSQL**: `pg_isready`
- **RabbitMQ**: `rabbitmq-diagnostics check_port_connectivity`
- **MinIO**: `http://localhost:9000/minio/health/live`

### Comandos de Verificación
```bash
# Verificar todos los servicios
docker-compose ps

# Ver logs específicos
docker-compose logs lb

# Verificar conectividad de red
docker network ls
```

## 🔧 Mantenimiento y Troubleshooting

### Comandos Útiles

**Reiniciar servicios específicos**:
```bash
docker-compose restart nextjs-app-1 nextjs-app-2
```

**Reconstruir y actualizar**:
```bash
docker-compose up -d --build
```

**Ver uso de recursos**:
```bash
docker stats
```

**Backup de volúmenes**:
```bash
docker run --rm -v produccionsegura_db-pg-master-data:/source -v $(pwd):/backup alpine tar czf /backup/pg-backup-$(date +%Y%m%d).tar.gz -C /source .
```

### Troubleshooting Común

**Puerto 80 en uso**:
```bash
# Ver qué proceso usa el puerto 80
ss -tulpn | grep :80

# Detener servicio conflictivo si es necesario
systemctl stop apache2  # ejemplo
```

**Problemas de red**:
```bash
# Verificar redes Docker
docker network ls

# Inspeccionar red específica
docker network inspect produccionsegura_public-net
```

**Assets estáticos no cargan**:
- Verificar configuración nginx en `config/nginx.conf`
- Confirmar que la ruta `/_next/` esté correctamente configurada

## 📊 Estructura de Archivos

```
produccionsegura/
├── docker-compose.yml          # Orquestación de servicios
├── config/
│   └── nginx.conf             # Configuración del load balancer
├── docker/
│   ├── fe/
│   │   └── Dockerfile         # Imagen PHP/Apache
│   ├── worker/
│   │   └── Dockerfile         # Imagen Task Worker
│   └── nextjs/
│       └── Dockerfile         # Imagen Next.js
├── nextjs-app/                # Aplicación Next.js completa
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx       # Página principal
│   │   │   ├── layout.tsx     # Layout de la aplicación
│   │   │   └── api/health/    # Endpoint de salud
│   │   └── components/ui/     # Componentes shadcn/ui
│   ├── package.json
│   └── tailwind.config.ts
├── .env                       # Variables de entorno (crear)
└── README.md                  # Esta documentación
```

## 🔄 Flujo de Datos

1. **Cliente** → **LB (nginx)** → Routing basado en path
2. **LB** → **FE Web** (PHP) o **Next.js** según la ruta
3. **FE Web** → **PostgreSQL** (lectura/escritura)
4. **FE Web** → **Redis** (caché)
5. **FE Web** → **RabbitMQ** (encolar tareas)
6. **Task Worker** → **RabbitMQ** (consumir tareas)
7. **Task Worker** → **PostgreSQL** (procesar datos)
8. **Assets estáticos** → **MinIO S3**

## 📈 Escalabilidad

- **Horizontal**: Agregar más instancias de FE Web y Next.js
- **Vertical**: Aumentar recursos de contenedores
- **Base de datos**: Implementar réplicas de lectura
- **Caché**: Configurar cluster Redis
- **Colas**: Escalar workers según demanda

## 🛡️ Consideraciones de Seguridad

- Aislamiento de redes por capas
- Credenciales mediante variables de entorno
- Health checks automatizados
- Volúmenes persistentes con datos sensibles
- Único punto de entrada (LB) con nginx

---

## 📞 Soporte

Para problemas técnicos:
1. Verificar logs: `docker-compose logs [servicio]`
2. Revisar health checks
3. Verificar configuración de red
4. Consultar esta documentación

**Estado actual**: ✅ Sistema funcionando correctamente con Next.js integrado