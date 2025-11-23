const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const Redis = require('ioredis');
const amqp = require('amqplib');
const axios = require('axios');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Configuración de conexiones (solo variables de entorno)
const dbConfig = {
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST || 'pg-master',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'main_db'
};

const redisConfig = {
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
};

const rabbitmqConfig = {
  hostname: process.env.RABBITMQ_HOST || 'rabbitmq',
  port: process.env.RABBITMQ_PORT || 5672,
  username: process.env.RABBITMQ_USER,
  password: process.env.RABBITMQ_PASS
};

// Endpoint de estado de servicios
app.get('/api/admin/status', async (req, res) => {
  try {
    const services = {};

    // PostgreSQL
    try {
      const client = new Client(dbConfig);
      await client.connect();
      const result = await client.query('SELECT NOW() as time, version() as version');
      await client.end();
      services.postgresql = {
        status: 'online',
        timestamp: result.rows[0].time,
        version: result.rows[0].version
      };
    } catch (error) {
      services.postgresql = {
        status: 'offline',
        error: error.message
      };
    }

    // Redis
    try {
      const redis = new Redis(redisConfig);
      await redis.ping();
      const info = await redis.info();
      await redis.quit();
      services.redis = {
        status: 'online',
        info: 'Redis funcionando correctamente'
      };
    } catch (error) {
      services.redis = {
        status: 'offline',
        error: error.message
      };
    }

    // RabbitMQ
    try {
      const connection = await amqp.connect({
        protocol: 'amqp',
        hostname: rabbitmqConfig.hostname,
        port: rabbitmqConfig.port,
        username: rabbitmqConfig.username,
        password: rabbitmqConfig.password
      });
      const channel = await connection.createChannel();
      await channel.close();
      await connection.close();
      services.rabbitmq = {
        status: 'online',
        info: 'RabbitMQ funcionando correctamente'
      };
    } catch (error) {
      services.rabbitmq = {
        status: 'offline',
        error: error.message
      };
    }

    // MinIO S3
    try {
      const response = await axios.get('http://s3:9000/minio/health/live', {
        timeout: 5000
      });
      services.minio = {
        status: 'online',
        info: 'MinIO funcionando correctamente'
      };
    } catch (error) {
      services.minio = {
        status: 'offline',
        error: error.message
      };
    }

    // Next.js Apps
    try {
      const response = await axios.get('http://lb:80/api/health', {
        timeout: 5000
      });
      services.nextjs = {
        status: 'online',
        info: response.data
      };
    } catch (error) {
      services.nextjs = {
        status: 'offline',
        error: error.message
      };
    }

    res.json({
      timestamp: new Date().toISOString(),
      services
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al verificar servicios',
      message: error.message
    });
  }
});

// Endpoint de estadísticas del sistema
app.get('/api/admin/stats', async (req, res) => {
  try {
    const stats = {};

    // Estadísticas de PostgreSQL
    try {
      const client = new Client(dbConfig);
      await client.connect();

      const ticketsCount = await client.query('SELECT COUNT(*) FROM detalle_pedido');
      const ordersCount = await client.query('SELECT COUNT(*) FROM pedido');
      const validationsCount = await client.query('SELECT COUNT(*) FROM log_validacion');

      await client.end();

      stats.database = {
        total_tickets: parseInt(ticketsCount.rows[0].count),
        total_orders: parseInt(ordersCount.rows[0].count),
        total_validations: parseInt(validationsCount.rows[0].count)
      };
    } catch (error) {
      stats.database = { error: error.message };
    }

    // Estadísticas de Redis
    try {
      const redis = new Redis(redisConfig);
      const info = await redis.info();
      await redis.quit();

      const lines = info.split('\n');
      const redisStats = {};
      lines.forEach(line => {
        const [key, value] = line.split(':');
        if (key && value) {
          redisStats[key.trim()] = value.trim();
        }
      });

      stats.redis = redisStats;
    } catch (error) {
      stats.redis = { error: error.message };
    }

    res.json({
      timestamp: new Date().toISOString(),
      stats
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener estadísticas',
      message: error.message
    });
  }
});

// Endpoint para reiniciar servicios
app.post('/api/admin/restart/:service', async (req, res) => {
  const { service } = req.params;

  try {
    // Aquí iría la lógica para reiniciar servicios específicos
    // Por ahora, simulamos el reinicio
    res.json({
      message: `Servicio ${service} reiniciado exitosamente`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: `Error al reiniciar ${service}`,
      message: error.message
    });
  }
});

// Endpoint para logs del sistema
app.get('/api/admin/logs', async (req, res) => {
  try {
    // Aquí iría la lógica para obtener logs de los servicios
    // Por ahora, retornamos logs simulados
    res.json({
      logs: [
        {
          timestamp: new Date().toISOString(),
          service: 'admin-backend',
          level: 'INFO',
          message: 'Backend administrador iniciado correctamente'
        },
        {
          timestamp: new Date().toISOString(),
          service: 'system',
          level: 'INFO',
          message: 'Todos los servicios están siendo monitoreados'
        }
      ]
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener logs',
      message: error.message
    });
  }
});

// Health check del backend administrador
app.get('/api/admin/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'admin-backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend Administrador ejecutándose en puerto ${PORT}`);
  console.log(`📊 Panel de administración disponible en: http://localhost:${PORT}/api/admin/status`);
});