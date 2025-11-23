-- PostgreSQL Schema for Ticket Sales System
-- Based on the implementation guidelines

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ticket Types Table
CREATE TABLE IF NOT EXISTS tipo_entrada (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio_base DECIMAL(10,2) NOT NULL,
    precio_nino DECIMAL(10,2),
    capacidad_maxima INTEGER,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Centers/Venues Table
CREATE TABLE IF NOT EXISTS centro (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT,
    capacidad_maxima INTEGER,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ticket Sequential Counter Table
CREATE TABLE IF NOT EXISTS ticket_secuencial (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    centro_id UUID NOT NULL REFERENCES centro(id),
    tipo_entrada_id UUID NOT NULL REFERENCES tipo_entrada(id),
    prefijo VARCHAR(10) NOT NULL,
    contador_actual INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(centro_id, tipo_entrada_id)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS pedido (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_pedido VARCHAR(50) UNIQUE NOT NULL,
    tipo_pedido VARCHAR(50) NOT NULL CHECK (tipo_pedido IN ('VENTA_PUBLICA', 'COMPRA_CUPO', 'TPV')),
    cliente_email VARCHAR(255),
    cliente_nombre VARCHAR(255),
    total_amount DECIMAL(10,2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'cancelado', 'completado')),
    session_tpv_id VARCHAR(100),
    caja_id VARCHAR(100),
    dispositivo_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Details Table
CREATE TABLE IF NOT EXISTS detalle_pedido (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID NOT NULL REFERENCES pedido(id),
    tipo_entrada_id UUID NOT NULL REFERENCES tipo_entrada(id),
    centro_id UUID NOT NULL REFERENCES centro(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    fecha_visita DATE NOT NULL,
    hora_visita TIME NOT NULL,
    qr_ticket VARCHAR(100) UNIQUE NOT NULL,
    estado_ticket VARCHAR(50) DEFAULT 'valido' CHECK (estado_ticket IN ('valido', 'utilizado', 'cancelado')),
    fecha_utilizacion TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wholesalers Table
CREATE TABLE IF NOT EXISTS usuario_mayorista (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_empresa VARCHAR(255) NOT NULL,
    contacto_email VARCHAR(255) NOT NULL,
    contacto_telefono VARCHAR(50),
    limite_alarmas INTEGER DEFAULT 50,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wholesaler Quotas Table
CREATE TABLE IF NOT EXISTS cupo_mayorista (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mayorista_id UUID NOT NULL REFERENCES usuario_mayorista(id),
    tipo_entrada_id UUID NOT NULL REFERENCES tipo_entrada(id),
    cupo_comprado INTEGER NOT NULL,
    cupo_consumido INTEGER DEFAULT 0,
    fecha_compra DATE NOT NULL,
    fecha_expiracion DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mayorista_id, tipo_entrada_id)
);

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS ticket_soporte (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_ticket VARCHAR(50) UNIQUE NOT NULL,
    mayorista_id UUID NOT NULL REFERENCES usuario_mayorista(id),
    asunto VARCHAR(500) NOT NULL,
    mensaje TEXT NOT NULL,
    estado VARCHAR(50) DEFAULT 'NUEVO' CHECK (estado IN ('NUEVO', 'EN_PROCESO', 'RESUELTO', 'CERRADO')),
    prioridad VARCHAR(20) DEFAULT 'medium' CHECK (prioridad IN ('low', 'medium', 'high', 'critical')),
    llm_clasificacion JSONB,
    llm_resumen TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS factura (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_factura VARCHAR(50) UNIQUE NOT NULL,
    pedido_id UUID REFERENCES pedido(id),
    mayorista_id UUID REFERENCES usuario_mayorista(id),
    total_amount DECIMAL(10,2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'generada', 'enviada', 'pagada')),
    codigo_verifactu VARCHAR(100),
    pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Devices Table
CREATE TABLE IF NOT EXISTS dispositivo_cobro (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('redsys', 'paytef', 'cash')),
    configuracion JSONB NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Validation Logs Table
CREATE TABLE IF NOT EXISTS log_validacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qr_ticket VARCHAR(100) NOT NULL,
    dispositivo_id VARCHAR(100),
    resultado_validacion BOOLEAN NOT NULL,
    mensaje_error TEXT,
    fecha_validacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_detalle_pedido_qr_ticket ON detalle_pedido(qr_ticket);
CREATE INDEX IF NOT EXISTS idx_detalle_pedido_estado ON detalle_pedido(estado_ticket);
CREATE INDEX IF NOT EXISTS idx_pedido_tipo ON pedido(tipo_pedido);
CREATE INDEX IF NOT EXISTS idx_pedido_estado ON pedido(estado);
CREATE INDEX IF NOT EXISTS idx_cupo_mayorista_mayorista ON cupo_mayorista(mayorista_id);
CREATE INDEX IF NOT EXISTS idx_ticket_soporte_estado ON ticket_soporte(estado);
CREATE INDEX IF NOT EXISTS idx_log_validacion_qr ON log_validacion(qr_ticket);

-- Insert sample data
INSERT INTO tipo_entrada (nombre, descripcion, precio_base, precio_nino, capacidad_maxima) VALUES
('Entrada General', 'Acceso general a la catedral', 15.00, 10.50, 1000),
('Entrada Premium', 'Acceso con audioguía incluida', 25.00, 17.50, 500),
('Entrada VIP', 'Acceso prioritario y visita guiada', 50.00, 35.00, 100);

INSERT INTO centro (nombre, direccion, capacidad_maxima) VALUES
('Catedral Principal', 'Plaza de la Seu, s/n, 07001 Palma', 2000),
('Museo de Arte Sacro', 'Plaza de la Seu, s/n, 07001 Palma', 500);

INSERT INTO ticket_secuencial (centro_id, tipo_entrada_id, prefijo, contador_actual) VALUES
((SELECT id FROM centro WHERE nombre = 'Catedral Principal'), (SELECT id FROM tipo_entrada WHERE nombre = 'Entrada General'), 'CATH-GEN-', 1000),
((SELECT id FROM centro WHERE nombre = 'Catedral Principal'), (SELECT id FROM tipo_entrada WHERE nombre = 'Entrada Premium'), 'CATH-PRE-', 500),
((SELECT id FROM centro WHERE nombre = 'Catedral Principal'), (SELECT id FROM tipo_entrada WHERE nombre = 'Entrada VIP'), 'CATH-VIP-', 100);

INSERT INTO usuario_mayorista (nombre_empresa, contacto_email, contacto_telefono, limite_alarmas) VALUES
('Tour Operator España', 'info@tourespana.com', '+34 971 123 456', 100),
('Agencia Viajes Mallorca', 'ventas@agenciaviajes.com', '+34 971 654 321', 50);

-- Function to generate sequential QR codes
CREATE OR REPLACE FUNCTION generar_qr_ticket(
    p_centro_id UUID,
    p_tipo_entrada_id UUID
) RETURNS VARCHAR(100) AS $$
DECLARE
    v_prefijo VARCHAR(10);
    v_contador INTEGER;
    v_qr_ticket VARCHAR(100);
BEGIN
    -- Get and increment counter atomically
    UPDATE ticket_secuencial
    SET contador_actual = contador_actual + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE centro_id = p_centro_id
      AND tipo_entrada_id = p_tipo_entrada_id
    RETURNING prefijo, contador_actual INTO v_prefijo, v_contador;

    -- Generate QR ticket
    v_qr_ticket := v_prefijo || LPAD(v_contador::TEXT, 6, '0');

    RETURN v_qr_ticket;
END;
$$ LANGUAGE plpgsql;