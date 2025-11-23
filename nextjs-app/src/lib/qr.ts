// QR Generation and Validation Utility
// Based on implementation guidelines for alphanumeric sequential QR codes

import { createHash, randomBytes } from 'crypto';

interface QRData {
  ticketId: string;
  orderId: string;
  ticketTypeId: string;
  centerId: string;
  date: string;
  timeSlot: string;
  visitorType: 'adult' | 'child';
  price: number;
  securityHash: string;
}

interface ValidationResult {
  valid: boolean;
  ticketData?: QRData;
  error?: string;
  validationTime: string;
}

class QRGenerator {
  // Generate sequential QR code based on implementation guidelines
  async generateSequentialQR(
    centerId: string,
    ticketTypeId: string,
    orderId: string,
    ticketIndex: number
  ): Promise<string> {
    // In a real implementation, this would:
    // 1. Call the PostgreSQL function generar_qr_ticket()
    // 2. Get the sequential counter atomically
    // 3. Return the formatted QR code

    // For now, simulate the sequential generation
    const prefix = this.getPrefixForCenterAndType(centerId, ticketTypeId);
    const sequentialNumber = await this.getNextSequentialNumber(centerId, ticketTypeId);

    return `${prefix}${sequentialNumber.toString().padStart(6, '0')}`;
  }

  // Generate QR data payload
  generateQRData(
    qrCode: string,
    ticketId: string,
    orderId: string,
    ticketTypeId: string,
    centerId: string,
    date: string,
    timeSlot: string,
    visitorType: 'adult' | 'child',
    price: number
  ): QRData {
    const securityHash = this.generateSecurityHash(qrCode, ticketId, orderId);

    return {
      ticketId,
      orderId,
      ticketTypeId,
      centerId,
      date,
      timeSlot,
      visitorType,
      price,
      securityHash
    };
  }

  // Encode QR data to string format
  encodeQRData(qrData: QRData): string {
    const dataString = JSON.stringify({
      t: qrData.ticketId,
      o: qrData.orderId,
      ty: qrData.ticketTypeId,
      c: qrData.centerId,
      d: qrData.date,
      ts: qrData.timeSlot,
      vt: qrData.visitorType,
      p: qrData.price,
      h: qrData.securityHash
    });

    // In a real implementation, this would be encoded as a QR code
    // For now, return the data string
    return dataString;
  }

  // Decode QR data from string format
  decodeQRData(encodedData: string): QRData | null {
    try {
      const data = JSON.parse(encodedData);

      return {
        ticketId: data.t,
        orderId: data.o,
        ticketTypeId: data.ty,
        centerId: data.c,
        date: data.d,
        timeSlot: data.ts,
        visitorType: data.vt,
        price: data.p,
        securityHash: data.h
      };
    } catch (error) {
      console.error('Error decoding QR data:', error);
      return null;
    }
  }

  // Validate QR code
  async validateQR(
    qrCode: string,
    encodedData: string,
    deviceId?: string
  ): Promise<ValidationResult> {
    const validationTime = new Date().toISOString();

    try {
      // Decode the QR data
      const qrData = this.decodeQRData(encodedData);

      if (!qrData) {
        return {
          valid: false,
          error: 'Invalid QR data format',
          validationTime
        };
      }

      // Verify security hash
      const expectedHash = this.generateSecurityHash(qrCode, qrData.ticketId, qrData.orderId);
      if (qrData.securityHash !== expectedHash) {
        return {
          valid: false,
          error: 'Security hash mismatch',
          validationTime
        };
      }

      // Verify QR code format matches data
      if (!this.verifyQRFormat(qrCode, qrData.centerId, qrData.ticketTypeId)) {
        return {
          valid: false,
          error: 'QR code format mismatch',
          validationTime
        };
      }

      // TODO: In a real implementation, check database for:
      // - Ticket existence and validity
      // - Ticket not already used
      // - Date/time validity
      // - Center access permissions

      // For now, simulate validation
      const isValid = await this.simulateDatabaseValidation(qrData);

      if (!isValid) {
        return {
          valid: false,
          error: 'Ticket validation failed',
          validationTime
        };
      }

      // TODO: Log validation in database
      // await this.logValidation(qrCode, deviceId, true, null);

      return {
        valid: true,
        ticketData: qrData,
        validationTime
      };

    } catch (error) {
      console.error('Error validating QR code:', error);

      // TODO: Log failed validation
      // await this.logValidation(qrCode, deviceId, false, error.message);

      return {
        valid: false,
        error: 'Validation error',
        validationTime
      };
    }
  }

  // Mark ticket as used
  async markTicketAsUsed(ticketId: string, deviceId?: string): Promise<boolean> {
    // TODO: Implement actual database update
    // UPDATE detalle_pedido SET estado_ticket = 'utilizado', fecha_utilizacion = NOW()
    // WHERE id = $1

    console.log(`✅ Ticket ${ticketId} marked as used by device ${deviceId}`);
    return true;
  }

  // Generate batch of QR codes for an order
  async generateBatchQRCodes(
    centerId: string,
    ticketTypeId: string,
    orderId: string,
    quantity: number
  ): Promise<{ qrCode: string; ticketId: string; encodedData: string }[]> {
    const qrCodes = [];

    for (let i = 0; i < quantity; i++) {
      const qrCode = await this.generateSequentialQR(centerId, ticketTypeId, orderId, i + 1);
      const ticketId = `${orderId}-T${i + 1}`;

      // Generate QR data (in a real app, this would include actual ticket details)
      const qrData = this.generateQRData(
        qrCode,
        ticketId,
        orderId,
        ticketTypeId,
        centerId,
        '2024-01-01', // Actual date would come from order
        '10:00', // Actual time would come from order
        'adult', // Actual type would come from order
        15.00 // Actual price would come from ticket type
      );

      const encodedData = this.encodeQRData(qrData);

      qrCodes.push({
        qrCode,
        ticketId,
        encodedData
      });
    }

    return qrCodes;
  }

  // Private helper methods

  private getPrefixForCenterAndType(centerId: string, ticketTypeId: string): string {
    // In a real implementation, this would query the database
    // For now, use mock prefixes
    const centerPrefixes: Record<string, string> = {
      'center-1': 'CATH',
      'center-2': 'MUS'
    };

    const typeSuffixes: Record<string, string> = {
      'type-1': '-GEN-',
      'type-2': '-PRE-',
      'type-3': '-VIP-'
    };

    return `${centerPrefixes[centerId] || 'DEF'}${typeSuffixes[ticketTypeId] || '-TKT-'}`;
  }

  private async getNextSequentialNumber(centerId: string, ticketTypeId: string): Promise<number> {
    // In a real implementation, this would:
    // 1. Call the PostgreSQL function generar_qr_ticket()
    // 2. Return the incremented counter
    // For now, simulate with a random number
    return Math.floor(Math.random() * 1000000) + 1000;
  }

  private generateSecurityHash(qrCode: string, ticketId: string, orderId: string): string {
    const secret = process.env.QR_SECRET_KEY || 'default-secret-key';
    const data = `${qrCode}:${ticketId}:${orderId}:${secret}`;
    return createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  private verifyQRFormat(qrCode: string, centerId: string, ticketTypeId: string): boolean {
    const expectedPrefix = this.getPrefixForCenterAndType(centerId, ticketTypeId);
    return qrCode.startsWith(expectedPrefix);
  }

  private async simulateDatabaseValidation(qrData: QRData): Promise<boolean> {
    // Simulate database checks
    // In a real implementation, this would query:
    // - Check if ticket exists and is valid
    // - Check if ticket is not used
    // - Check date/time validity
    // - Check center access

    // For now, return true for valid-looking tickets
    return qrData.ticketId.startsWith('ORD-') || qrData.ticketId.startsWith('TPV-');
  }

  private async logValidation(
    qrCode: string,
    deviceId: string | undefined,
    success: boolean,
    errorMessage: string | null
  ): Promise<void> {
    // TODO: Implement actual database logging
    // INSERT INTO log_validacion (qr_ticket, dispositivo_id, resultado_validacion, mensaje_error)
    console.log(`📝 Validation log: ${qrCode} - ${success ? 'SUCCESS' : 'FAILED'} - Device: ${deviceId}`);
  }
}

// Create a singleton instance
export const qrGenerator = new QRGenerator();

// Utility functions for common operations
export const qrUtils = {
  // Generate QR codes for an order
  async generateOrderQRCodes(
    centerId: string,
    ticketTypeId: string,
    orderId: string,
    quantity: number
  ) {
    return qrGenerator.generateBatchQRCodes(centerId, ticketTypeId, orderId, quantity);
  },

  // Validate a QR code
  async validateQRCode(qrCode: string, encodedData: string, deviceId?: string) {
    return qrGenerator.validateQR(qrCode, encodedData, deviceId);
  },

  // Mark ticket as used
  async useTicket(ticketId: string, deviceId?: string) {
    return qrGenerator.markTicketAsUsed(ticketId, deviceId);
  },

  // Generate QR data for display
  generateDisplayQRData(ticketData: any): string {
    const qrData = qrGenerator.generateQRData(
      ticketData.qrCode,
      ticketData.ticketId,
      ticketData.orderId,
      ticketData.ticketTypeId,
      ticketData.centerId,
      ticketData.date,
      ticketData.timeSlot,
      ticketData.visitorType,
      ticketData.price
    );

    return qrGenerator.encodeQRData(qrData);
  }
};