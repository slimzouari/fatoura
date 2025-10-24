import mysql from 'mysql2/promise';

class DatabaseClient {
  private connection: mysql.Connection | null = null;

  async connect() {
    if (this.connection) return this.connection;
    
    this.connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'password',
      database: 'fatoura'
    });
    
    return this.connection;
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }

  async createTables() {
    const conn = await this.connect();
    
    // Create customers table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        email VARCHAR(255) NOT NULL,
        contract_number VARCHAR(100),
        rule ENUM('omzet', 'hourly') NOT NULL,
        currency VARCHAR(10) DEFAULT 'EUR'
      )
    `);

    // Create invoices table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(50) PRIMARY KEY,
        invoice_number VARCHAR(100) UNIQUE NOT NULL,
        invoice_date DATE NOT NULL,
        due_date DATE NOT NULL,
        billing_month INT NOT NULL,
        billing_year INT NOT NULL,
        purchase_number VARCHAR(100),
        extra DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        link_to_pdf VARCHAR(500),
        status ENUM('draft', 'submitted', 'completed', 'sent') DEFAULT 'draft',
        customer_id VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )
    `);

    // Create invoice_line_items table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS invoice_line_items (
        id VARCHAR(50) PRIMARY KEY,
        invoice_id VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        description TEXT,
        daily_revenue DECIMAL(10,2),
        compensation_percentage DECIMAL(5,2),
        compensation_amount DECIMAL(10,2),
        duration VARCHAR(10),
        rate_per_hour DECIMAL(10,2),
        total DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Database tables created successfully');
  }

  // Customer operations
  async getCustomers() {
    const conn = await this.connect();
    const [rows] = await conn.execute('SELECT * FROM customers');
    return rows;
  }

  async createCustomer(customer: any) {
    const conn = await this.connect();
    await conn.execute(
      'INSERT INTO customers (id, name, address, email, contract_number, rule, currency) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [customer.id, customer.name, customer.address, customer.email, customer.contractNumber, customer.rule, customer.currency]
    );
  }

  // Invoice operations
  async getInvoices() {
    const conn = await this.connect();
    const [rows] = await conn.execute(`
      SELECT i.*, c.name as customer_name 
      FROM invoices i 
      JOIN customers c ON i.customer_id = c.id 
      ORDER BY i.created_at DESC
    `);
    return rows;
  }

  async getInvoiceById(id: string) {
    const conn = await this.connect();
    const [rows] = await conn.execute(`
      SELECT i.*, c.name as customer_name 
      FROM invoices i 
      JOIN customers c ON i.customer_id = c.id 
      WHERE i.id = ?
    `, [id]);
    const invoices = rows as any[];
    return invoices.length > 0 ? invoices[0] : null;
  }

  async createInvoice(invoice: any) {
    const conn = await this.connect();
    
    // Check if invoice number exists and find next available number
    let baseInvoiceNumber = invoice.invoiceNumber;
    let finalInvoiceNumber = baseInvoiceNumber;
    let counter = 1;
    
    while (true) {
      try {
        // Try to check if this invoice number exists
        const [existingRows] = await conn.execute(
          'SELECT id FROM invoices WHERE invoice_number = ?',
          [finalInvoiceNumber]
        );
        
        if ((existingRows as any[]).length === 0) {
          // Invoice number doesn't exist, we can use it
          break;
        } else {
          // Invoice number exists, try the next one
          finalInvoiceNumber = `${baseInvoiceNumber}-${counter}`;
          counter++;
        }
      } catch (error) {
        // If there's an error checking, just try to insert anyway
        break;
      }
    }
    
    await conn.execute(
      `INSERT INTO invoices 
       (id, invoice_number, invoice_date, due_date, billing_month, billing_year, 
        purchase_number, extra, total, status, customer_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoice.id, finalInvoiceNumber, invoice.invoiceDate, invoice.dueDate,
        invoice.billingMonth, invoice.billingYear, invoice.purchaseNumber,
        invoice.extra, invoice.total, invoice.status, invoice.customerId
      ]
    );
    
    // Return the final invoice number used
    return { ...invoice, invoiceNumber: finalInvoiceNumber };
  }

  async updateInvoice(id: string, updates: any) {
    const conn = await this.connect();
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    await conn.execute(
      `UPDATE invoices SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
  }

  // Line item operations
  async createLineItem(lineItem: any) {
    const conn = await this.connect();
    await conn.execute(
      `INSERT INTO invoice_line_items 
       (id, invoice_id, date, description, daily_revenue, compensation_percentage, 
        compensation_amount, duration, rate_per_hour, total) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lineItem.id, 
        lineItem.invoice_id, 
        lineItem.date, 
        lineItem.description || null,
        lineItem.daily_revenue || null, 
        lineItem.compensation_percentage || null, 
        lineItem.compensation_amount || null,
        lineItem.duration || null, 
        lineItem.rate_per_hour || null, 
        lineItem.total
      ]
    );
  }

  async getLineItems(invoiceId: string) {
    const conn = await this.connect();
    const [rows] = await conn.execute(
      'SELECT * FROM invoice_line_items WHERE invoice_id = ? ORDER BY date',
      [invoiceId]
    );
    return rows;
  }

  async getLineItemsByInvoiceId(invoiceId: string) {
    return this.getLineItems(invoiceId);
  }

  async getLineItem(lineItemId: string) {
    const conn = await this.connect();
    const [rows] = await conn.execute(
      'SELECT * FROM invoice_line_items WHERE id = ?',
      [lineItemId]
    );
    return (rows as any[])[0] || null;
  }

  async updateLineItem(lineItemId: string, updates: any) {
    const conn = await this.connect();
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    await conn.execute(
      `UPDATE invoice_line_items SET ${setClause} WHERE id = ?`,
      [...values, lineItemId]
    );
  }

  async deleteLineItem(lineItemId: string) {
    const conn = await this.connect();
    await conn.execute(
      'DELETE FROM invoice_line_items WHERE id = ?',
      [lineItemId]
    );
  }

  async deleteInvoice(invoiceId: string) {
    const conn = await this.connect();
    // Line items will be deleted automatically due to ON DELETE CASCADE
    await conn.execute(
      'DELETE FROM invoices WHERE id = ?',
      [invoiceId]
    );
  }
}

export const db = new DatabaseClient();