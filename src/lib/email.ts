import nodemailer from 'nodemailer';
import { pdfStorage } from './storage';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface InvoiceEmailData {
  customerId: string;
  customerName: string;
  customerEmail: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  total: number;
  billingYear: number;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Default configuration - can be overridden via environment variables
    const emailConfig: EmailConfig = {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    };

    this.transporter = nodemailer.createTransport(emailConfig);
  }

  /**
   * Send invoice email with PDF attachment
   */
  async sendInvoiceEmail(
    invoiceData: InvoiceEmailData,
    pdfBuffer: Buffer,
    customMessage?: string
  ): Promise<void> {
    try {
      // Format currency
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('nl-NL', {
          style: 'currency',
          currency: 'EUR'
        }).format(amount);
      };

      // Format dates
      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('nl-NL', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      };

      // Generate email content
      const subject = `Factuur ${invoiceData.invoiceNumber}`;
      const htmlContent = this.generateInvoiceEmailHTML(invoiceData, customMessage);
      const textContent = this.generateInvoiceEmailText(invoiceData, customMessage);

      // Email configuration
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: invoiceData.customerEmail,
        subject: subject,
        text: textContent,
        html: htmlContent,
        attachments: [
          {
            filename: `factuur-${invoiceData.invoiceNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      };

      // Send email
      await this.transporter.sendMail(mailOptions);

    } catch (error) {
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate HTML email template
   */
  private generateInvoiceEmailHTML(data: InvoiceEmailData, customMessage?: string): string {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount);
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('nl-NL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    return `
      <!DOCTYPE html>
      <html lang="nl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Factuur ${data.invoiceNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #2563eb;
            color: white;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
          }
          .content {
            background-color: #f9fafb;
            padding: 20px;
            border: 1px solid #e5e7eb;
          }
          .invoice-details {
            background-color: white;
            padding: 15px;
            margin: 20px 0;
            border-left: 4px solid #2563eb;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #666;
          }
          .total {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Factuur ${data.invoiceNumber}</h1>
        </div>
        
        <div class="content">
          <p>Beste ${data.customerName},</p>
          
          ${customMessage ? `<p>${customMessage}</p>` : `
            <p>Hierbij ontvangt u de factuur voor de geleverde diensten.</p>
          `}
          
          <div class="invoice-details">
            <h3>Factuurgegevens</h3>
            <p><strong>Factuurnummer:</strong> ${data.invoiceNumber}</p>
            <p><strong>Factuurdatum:</strong> ${formatDate(data.invoiceDate)}</p>
            <p><strong>Vervaldatum:</strong> ${formatDate(data.dueDate)}</p>
            <p class="total"><strong>Totaalbedrag:</strong> ${formatCurrency(data.total)}</p>
          </div>
          
          <p>De factuur is als PDF bijgevoegd bij deze email.</p>
          
          <p>Voor vragen kunt u contact met ons opnemen.</p>
          
          <p>Met vriendelijke groet,</p>
        </div>
        
        <div class="footer">
          <p><small>Deze email is automatisch gegenereerd door het facturatiesysteem.</small></p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate plain text email template
   */
  private generateInvoiceEmailText(data: InvoiceEmailData, customMessage?: string): string {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount);
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('nl-NL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    return `
Factuur ${data.invoiceNumber}

Beste ${data.customerName},

${customMessage || 'Hierbij ontvangt u de factuur voor de geleverde diensten.'}

Factuurgegevens:
- Factuurnummer: ${data.invoiceNumber}
- Factuurdatum: ${formatDate(data.invoiceDate)}
- Vervaldatum: ${formatDate(data.dueDate)}
- Totaalbedrag: ${formatCurrency(data.total)}

De factuur is als PDF bijgevoegd bij deze email.

Voor vragen kunt u contact met ons opnemen.

Met vriendelijke groet,

---
Deze email is automatisch gegenereerd door het facturatiesysteem.
    `.trim();
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email configuration test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();