import fs from 'fs';
import path from 'path';

interface InvoiceFileInfo {
  customerId: string;
  year: number;
  invoiceNumber: string;
}

export class PDFStorageManager {
  private baseStoragePath: string;

  constructor() {
    this.baseStoragePath = path.join(process.cwd(), 'storage', 'factuur');
  }

  /**
   * Generate the storage path for an invoice PDF
   */
  getInvoiceStoragePath(customerId: string, year: number): string {
    return path.join(this.baseStoragePath, year.toString(), customerId);
  }

  /**
   * Generate the full file path for an invoice PDF
   */
  getInvoiceFilePath(customerId: string, year: number, invoiceNumber: string): string {
    const storagePath = this.getInvoiceStoragePath(customerId, year);
    return path.join(storagePath, `${invoiceNumber}.pdf`);
  }

  /**
   * Ensure the directory structure exists for storing the PDF
   */
  ensureDirectoryExists(customerId: string, year: number): void {
    const storagePath = this.getInvoiceStoragePath(customerId, year);
    
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
  }

  /**
   * Save PDF buffer to storage
   */
  async savePDF(
    pdfBuffer: Buffer, 
    customerId: string, 
    year: number, 
    invoiceNumber: string
  ): Promise<string> {
    try {
      // Ensure directory exists
      this.ensureDirectoryExists(customerId, year);
      
      // Get file path
      const filePath = this.getInvoiceFilePath(customerId, year, invoiceNumber);
      
      // Write file
      await fs.promises.writeFile(filePath, pdfBuffer);
      
      return filePath;
    } catch (error) {
      throw new Error(`Failed to save PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if PDF file exists
   */
  pdfExists(customerId: string, year: number, invoiceNumber: string): boolean {
    const filePath = this.getInvoiceFilePath(customerId, year, invoiceNumber);
    return fs.existsSync(filePath);
  }

  /**
   * Read PDF file from storage
   */
  async readPDF(customerId: string, year: number, invoiceNumber: string): Promise<Buffer> {
    const filePath = this.getInvoiceFilePath(customerId, year, invoiceNumber);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('PDF file not found');
    }
    
    return fs.promises.readFile(filePath);
  }

  /**
   * Delete PDF file from storage
   */
  async deletePDF(customerId: string, year: number, invoiceNumber: string): Promise<void> {
    const filePath = this.getInvoiceFilePath(customerId, year, invoiceNumber);
    
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  /**
   * List all PDF files for a customer in a specific year
   */
  async listCustomerPDFs(customerId: string, year: number): Promise<string[]> {
    const storagePath = this.getInvoiceStoragePath(customerId, year);
    
    if (!fs.existsSync(storagePath)) {
      return [];
    }
    
    const files = await fs.promises.readdir(storagePath);
    return files.filter(file => file.endsWith('.pdf'));
  }

  /**
   * Get file stats for a PDF
   */
  async getPDFStats(customerId: string, year: number, invoiceNumber: string) {
    const filePath = this.getInvoiceFilePath(customerId, year, invoiceNumber);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const stats = await fs.promises.stat(filePath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      path: filePath
    };
  }
}

// Export singleton instance
export const pdfStorage = new PDFStorageManager();