// MinIO S3 Utility for Static Asset Storage
// Based on implementation guidelines - for invoices, PDFs, and static assets

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

class S3Storage {
  private s3Client: S3Client | null = null;
  private bucketName = 'ticket-system';

  constructor() {
    // In production, this would connect to the actual MinIO instance
    if (process.env.NODE_ENV === 'production') {
      this.s3Client = new S3Client({
        endpoint: `http://${process.env.MINIO_HOST || 's3'}:9000`,
        region: 'us-east-1',
        credentials: {
          accessKeyId: process.env.MINIO_ROOT_USER || 'minioadmin',
          secretAccessKey: process.env.MINIO_ROOT_PASSWORD || 'minioadmin'
        },
        forcePathStyle: true // Required for MinIO
      });
    }
  }

  // Upload file to S3
  async uploadFile(
    key: string,
    fileBuffer: Buffer,
    contentType: string = 'application/octet-stream',
    metadata: Record<string, string> = {}
  ): Promise<string> {
    if (!this.s3Client) {
      // Mock implementation for development
      console.log(`[S3 Mock] UPLOAD ${key} (${fileBuffer.length} bytes)`);
      return `mock://${this.bucketName}/${key}`;
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        Metadata: metadata
      });

      await this.s3Client.send(command);
      return key;

    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file');
    }
  }

  // Generate presigned URL for file access
  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.s3Client) {
      // Mock implementation for development
      return `mock://${this.bucketName}/${key}`;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });

    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  // Download file from S3
  async downloadFile(key: string): Promise<Buffer | null> {
    if (!this.s3Client) {
      // Mock implementation for development
      console.log(`[S3 Mock] DOWNLOAD ${key}`);
      return Buffer.from('mock-file-content');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      const response = await this.s3Client.send(command);
      return Buffer.from(await response.Body!.transformToByteArray());

    } catch (error) {
      console.error('Error downloading file from S3:', error);
      return null;
    }
  }

  // Delete file from S3
  async deleteFile(key: string): Promise<boolean> {
    if (!this.s3Client) {
      // Mock implementation for development
      console.log(`[S3 Mock] DELETE ${key}`);
      return true;
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      await this.s3Client.send(command);
      return true;

    } catch (error) {
      console.error('Error deleting file from S3:', error);
      return false;
    }
  }

  // List files in a prefix
  async listFiles(prefix: string = ''): Promise<string[]> {
    if (!this.s3Client) {
      // Mock implementation for development
      console.log(`[S3 Mock] LIST ${prefix}`);
      return [`${prefix}file1.pdf`, `${prefix}file2.pdf`];
    }

    try {
      const command = new ListObjectsCommand({
        Bucket: this.bucketName,
        Prefix: prefix
      });

      const response = await this.s3Client.send(command);
      return response.Contents?.map(obj => obj.Key!) || [];

    } catch (error) {
      console.error('Error listing files from S3:', error);
      return [];
    }
  }

  // Specific file type operations

  // Upload invoice PDF
  async uploadInvoicePDF(invoiceId: string, pdfBuffer: Buffer): Promise<string> {
    const key = `invoices/${invoiceId}.pdf`;
    return this.uploadFile(key, pdfBuffer, 'application/pdf', {
      'invoice-id': invoiceId,
      'document-type': 'invoice'
    });
  }

  // Get invoice PDF URL
  async getInvoicePDFUrl(invoiceId: string): Promise<string> {
    const key = `invoices/${invoiceId}.pdf`;
    return this.getPresignedUrl(key, 3600); // 1 hour expiration
  }

  // Upload ticket PDF
  async uploadTicketPDF(ticketId: string, pdfBuffer: Buffer): Promise<string> {
    const key = `tickets/${ticketId}.pdf`;
    return this.uploadFile(key, pdfBuffer, 'application/pdf', {
      'ticket-id': ticketId,
      'document-type': 'ticket'
    });
  }

  // Get ticket PDF URL
  async getTicketPDFUrl(ticketId: string): Promise<string> {
    const key = `tickets/${ticketId}.pdf`;
    return this.getPresignedUrl(key, 86400); // 24 hours expiration
  }

  // Upload static asset (images, documents)
  async uploadStaticAsset(
    filename: string,
    fileBuffer: Buffer,
    contentType: string
  ): Promise<string> {
    const key = `static/${filename}`;
    return this.uploadFile(key, fileBuffer, contentType, {
      'asset-type': 'static'
    });
  }

  // Get static asset URL
  async getStaticAssetUrl(filename: string): Promise<string> {
    const key = `static/${filename}`;
    return this.getPresignedUrl(key, 86400); // 24 hours expiration
  }

  // Upload support ticket attachment
  async uploadSupportAttachment(
    ticketId: string,
    filename: string,
    fileBuffer: Buffer,
    contentType: string
  ): Promise<string> {
    const key = `support/${ticketId}/${filename}`;
    return this.uploadFile(key, fileBuffer, contentType, {
      'ticket-id': ticketId,
      'attachment-type': 'support'
    });
  }

  // Get support attachment URL
  async getSupportAttachmentUrl(ticketId: string, filename: string): Promise<string> {
    const key = `support/${ticketId}/${filename}`;
    return this.getPresignedUrl(key, 3600); // 1 hour expiration
  }
}

// Create a singleton instance
export const s3Storage = new S3Storage();

// Utility functions for common operations
export const fileStorage = {
  // Invoice operations
  async storeInvoice(invoiceId: string, pdfBuffer: Buffer): Promise<string> {
    return s3Storage.uploadInvoicePDF(invoiceId, pdfBuffer);
  },

  async getInvoiceUrl(invoiceId: string): Promise<string> {
    return s3Storage.getInvoicePDFUrl(invoiceId);
  },

  // Ticket operations
  async storeTicket(ticketId: string, pdfBuffer: Buffer): Promise<string> {
    return s3Storage.uploadTicketPDF(ticketId, pdfBuffer);
  },

  async getTicketUrl(ticketId: string): Promise<string> {
    return s3Storage.getTicketPDFUrl(ticketId);
  },

  // Static assets
  async storeStaticAsset(filename: string, fileBuffer: Buffer, contentType: string): Promise<string> {
    return s3Storage.uploadStaticAsset(filename, fileBuffer, contentType);
  },

  async getStaticAssetUrl(filename: string): Promise<string> {
    return s3Storage.getStaticAssetUrl(filename);
  },

  // Support attachments
  async storeSupportAttachment(ticketId: string, filename: string, fileBuffer: Buffer, contentType: string): Promise<string> {
    return s3Storage.uploadSupportAttachment(ticketId, filename, fileBuffer, contentType);
  },

  async getSupportAttachmentUrl(ticketId: string, filename: string): Promise<string> {
    return s3Storage.getSupportAttachmentUrl(ticketId, filename);
  }
};