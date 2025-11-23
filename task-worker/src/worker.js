// Node.js Task Worker for Ticket System
// Handles heavy processing tasks asynchronously

const amqp = require('amqplib');
const { Pool } = require('pg');
const axios = require('axios');

class TaskWorker {
  constructor() {
    this.rabbitmqUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}:5672`;

    this.pgPool = new Pool({
      host: 'pg-master',
      port: 5432,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: 'main_db'
    });

    this.taskHandlers = {
      'GENERAR_FACTURA_VERIFACTU': this.handleInvoiceGeneration.bind(this),
      'ENVIAR_ALERTA_MAYORISTA': this.handleWholesalerAlert.bind(this),
      'CLASIFICAR_TICKET_LLM': this.handleTicketClassification.bind(this),
      'GENERAR_PDF_TICKET': this.handleTicketPDFGeneration.bind(this),
      'PROCESAR_PAGO_TPV': this.handleTPVPayment.bind(this)
    };
  }

  async connect() {
    try {
      this.connection = await amqp.connect(this.rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      // Ensure queue exists
      await this.channel.assertQueue('task_queue', { durable: true });

      console.log('✅ Task Worker connected to RabbitMQ');

    } catch (error) {
      console.error('❌ Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async start() {
    await this.connect();

    console.log('🚀 Task Worker started. Waiting for tasks...');

    this.channel.consume('task_queue', async (msg) => {
      if (msg !== null) {
        try {
          const task = JSON.parse(msg.content.toString());
          console.log(`📨 Received task: ${task.taskType}`, task);

          await this.processTask(task);

          // Acknowledge the message
          this.channel.ack(msg);
          console.log(`✅ Task ${task.taskType} processed successfully`);

        } catch (error) {
          console.error(`❌ Error processing task:`, error);

          // Handle retry logic
          const retryCount = (msg.properties.headers?.retryCount || 0) + 1;

          if (retryCount < 3) {
            // Requeue with exponential backoff
            const delay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
            console.log(`🔄 Retrying task in ${delay}ms (attempt ${retryCount})`);

            this.channel.nack(msg, false, false);
            setTimeout(() => {
              this.channel.sendToQueue('task_queue', msg.content, {
                persistent: true,
                headers: { retryCount }
              });
            }, delay);
          } else {
            // Max retries reached, move to dead letter queue
            console.log('💀 Max retries reached, moving to DLQ');
            this.channel.nack(msg, false, false);
          }
        }
      }
    }, { noAck: false });
  }

  async processTask(task) {
    const handler = this.taskHandlers[task.taskType];

    if (!handler) {
      throw new Error(`Unknown task type: ${task.taskType}`);
    }

    await handler(task.data);
  }

  // Task Handlers

  async handleInvoiceGeneration(data) {
    const { orderId } = data;

    console.log(`📄 Generating invoice for order: ${orderId}`);

    // TODO: Implement actual Verifactu API integration
    // For now, simulate invoice generation

    // Generate invoice number
    const invoiceNumber = `FACT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    // Update database
    const client = await this.pgPool.connect();
    try {
      await client.query('BEGIN');

      // Insert invoice record
      await client.query(`
        INSERT INTO factura (numero_factura, pedido_id, total_amount, estado, codigo_verifactu)
        VALUES ($1, $2, $3, $4, $5)
      `, [invoiceNumber, orderId, 0, 'generada', `VERIFACTU-${Date.now()}`]);

      // Update order status
      await client.query(`
        UPDATE pedido SET estado = 'completado' WHERE id = $1
      `, [orderId]);

      await client.query('COMMIT');

      console.log(`✅ Invoice ${invoiceNumber} generated successfully`);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async handleWholesalerAlert(data) {
    const { wholesalerId, reason, alertType } = data;

    console.log(`🚨 Sending alert to wholesaler: ${wholesalerId} - ${reason}`);

    // TODO: Implement actual email/SMS notification
    // For now, log the alert

    const client = await this.pgPool.connect();
    try {
      const result = await client.query(
        'SELECT nombre_empresa, contacto_email FROM usuario_mayorista WHERE id = $1',
        [wholesalerId]
      );

      if (result.rows.length > 0) {
        const wholesaler = result.rows[0];
        console.log(`📧 Would send alert to: ${wholesaler.contacto_email}`);
        console.log(`📝 Alert content: Low stock alert for ${wholesaler.nombre_empresa} - ${reason}`);
      }

    } finally {
      client.release();
    }
  }

  async handleTicketClassification(data) {
    const { ticketId, message, classificationContext } = data;

    console.log(`🤖 Classifying support ticket: ${ticketId}`);

    // TODO: Implement actual LLM integration (Claude with MCP protocol)
    // For now, simulate classification

    const classification = {
      category: this.classifyCategory(message),
      priority: this.classifyPriority(message),
      summary: this.generateSummary(message),
      suggestedResponse: this.generateSuggestedResponse(message)
    };

    // Update database with classification
    const client = await this.pgPool.connect();
    try {
      await client.query(`
        UPDATE ticket_soporte
        SET llm_clasificacion = $1, llm_resumen = $2, estado = 'EN_PROCESO'
        WHERE numero_ticket = $3
      `, [classification, classification.summary, ticketId]);

      console.log(`✅ Ticket ${ticketId} classified successfully`);

    } finally {
      client.release();
    }
  }

  async handleTicketPDFGeneration(data) {
    const { ticketIds, format, includeQR } = data;

    console.log(`📄 Generating PDF for tickets: ${ticketIds.join(', ')}`);

    // TODO: Implement actual PDF generation
    // For now, simulate PDF generation

    console.log(`✅ PDF generated for ${ticketIds.length} tickets`);
  }

  async handleTPVPayment(data) {
    const { orderId, paymentData, paymentGateway } = data;

    console.log(`💳 Processing TPV payment for order: ${orderId}`);

    // TODO: Implement actual payment gateway integration (Redsys/Paytef)
    // For now, simulate payment processing

    const paymentResult = {
      success: true,
      transactionId: `TXN-${Date.now()}`,
      amount: paymentData.amount,
      gateway: paymentGateway
    };

    // Update order status
    const client = await this.pgPool.connect();
    try {
      await client.query(`
        UPDATE pedido SET estado = 'pagado' WHERE id = $1
      `, [orderId]);

      console.log(`✅ Payment processed successfully for order: ${orderId}`);

    } finally {
      client.release();
    }
  }

  // Helper methods for ticket classification
  classifyCategory(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('quota') || lowerMessage.includes('cupo')) {
      return 'quota_management';
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('pago')) {
      return 'payment_issues';
    } else if (lowerMessage.includes('ticket') || lowerMessage.includes('entrada')) {
      return 'ticket_issues';
    } else if (lowerMessage.includes('technical') || lowerMessage.includes('tecnico')) {
      return 'technical_support';
    } else {
      return 'general_inquiry';
    }
  }

  classifyPriority(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('urgent') || lowerMessage.includes('urgente')) {
      return 'high';
    } else if (lowerMessage.includes('error') || lowerMessage.includes('failed')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  generateSummary(message) {
    return `Summary: ${message.substring(0, 100)}...`;
  }

  generateSuggestedResponse(message) {
    return 'Thank you for your inquiry. Our team will review your request and respond shortly.';
  }

  async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    if (this.pgPool) await this.pgPool.end();
    console.log('🔌 Task Worker closed');
  }
}

// Start the worker
const worker = new TaskWorker();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  await worker.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  await worker.close();
  process.exit(0);
});

// Start the worker
worker.start().catch(console.error);