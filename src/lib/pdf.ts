import puppeteer from 'puppeteer';

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  billingMonth: number;
  billingYear: number;
  purchaseNumber?: string;
  extra: number;
  total: number;
  status: string;
  customer: {
    id: string;
    name: string;
    email: string;
    address: string;
    zipCode: string;
    city: string;
    rule: 'omzet' | 'hourly';
    ratePerHour?: number;
  };
  lineItems: Array<{
    id: string;
    date: string;
    description?: string;
    dailyRevenue?: number;
    compensationPercentage?: number;
    compensationAmount?: number;
    duration?: string;
    ratePerHour?: number;
    total: number;
  }>;
}

export async function generateInvoicePDF(invoiceData: InvoiceData): Promise<Buffer> {
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set page format for A4
    await page.setViewport({ width: 1200, height: 1600 });
    
    // Generate HTML content
    const htmlContent = generateInvoiceHTML(invoiceData);
    
    // Set content and wait for load
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm'
      }
    });

    return Buffer.from(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function generateInvoiceHTML(data: InvoiceData): string {
  const { customer, lineItems } = data;
  
  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };
  
  // Calculate subtotal
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  
  return `
    <!DOCTYPE html>
    <html lang="nl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Factuur ${data.invoiceNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #333;
          background: white;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          margin-bottom: 40px;
        }
        
        .invoice-title {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        
        .invoice-number {
          font-size: 16px;
          color: #666;
          margin-bottom: 30px;
        }
        
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        
        .invoice-details, .customer-details {
          flex: 1;
        }
        
        .customer-details {
          margin-left: 40px;
        }
        
        .section-title {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 10px;
          color: #374151;
        }
        
        .detail-line {
          margin-bottom: 5px;
        }
        
        .line-items {
          margin: 40px 0;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .items-table th,
        .items-table td {
          padding: 12px 8px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .items-table th {
          background-color: #f9fafb;
          font-weight: bold;
          color: #374151;
        }
        
        .items-table td.amount {
          text-align: right;
          font-weight: 500;
        }
        
        .totals {
          margin-top: 40px;
          border-top: 2px solid #e5e7eb;
          padding-top: 20px;
        }
        
        .totals-table {
          width: 100%;
          max-width: 300px;
          margin-left: auto;
        }
        
        .totals-table td {
          padding: 8px 0;
          border: none;
        }
        
        .totals-table .total-label {
          text-align: right;
          padding-right: 20px;
          color: #666;
        }
        
        .totals-table .total-amount {
          text-align: right;
          font-weight: 500;
        }
        
        .final-total {
          border-top: 1px solid #e5e7eb;
          padding-top: 8px;
          font-weight: bold;
          font-size: 16px;
        }
        
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
        
        @media print {
          body {
            -webkit-print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="invoice-title">FACTUUR</h1>
          <div class="invoice-number">Factuurnummer: ${data.invoiceNumber}</div>
        </div>
        
        <div class="invoice-info">
          <div class="invoice-details">
            <div class="section-title">Factuurgegevens</div>
            <div class="detail-line"><strong>Factuurdatum:</strong> ${formatDate(data.invoiceDate)}</div>
            <div class="detail-line"><strong>Vervaldatum:</strong> ${formatDate(data.dueDate)}</div>
            <div class="detail-line"><strong>Maandfacturatie:</strong> ${new Date(data.billingYear, data.billingMonth - 1).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}</div>
            ${data.purchaseNumber ? `<div class="detail-line"><strong>Purchase nummer:</strong> ${data.purchaseNumber}</div>` : ''}
            <div class="detail-line"><strong>Status:</strong> ${data.status === 'draft' ? 'Concept' : data.status}</div>
          </div>
          
          <div class="customer-details">
            <div class="section-title">Factuuradres</div>
            <div class="detail-line"><strong>${customer.name}</strong></div>
            <div class="detail-line">${customer.address}</div>
            <div class="detail-line">${customer.zipCode} ${customer.city}</div>
            <div class="detail-line">${customer.email}</div>
          </div>
        </div>
        
        <div class="line-items">
          <div class="section-title">Factuurregels</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Datum</th>
                ${customer.rule === 'hourly' ? '<th>Beschrijving</th><th>Duur</th><th>Tarief</th>' : '<th>Dag omzet</th><th>Percentage</th><th>Vergoeding</th>'}
                <th style="text-align: right;">Totaal</th>
              </tr>
            </thead>
            <tbody>
              ${lineItems.map(item => `
                <tr>
                  <td>${formatDate(item.date)}</td>
                  ${customer.rule === 'hourly' 
                    ? `<td>${item.description || ''}</td>
                       <td>${item.duration || ''}</td>
                       <td>${formatCurrency(item.ratePerHour || 0)}</td>`
                    : `<td>${formatCurrency(item.dailyRevenue || 0)}</td>
                       <td>${item.compensationPercentage || 0}%</td>
                       <td>${formatCurrency(item.compensationAmount || 0)}</td>`
                  }
                  <td class="amount">${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="totals">
          <table class="totals-table">
            <tr>
              <td class="total-label">Subtotaal:</td>
              <td class="total-amount">${formatCurrency(subtotal)}</td>
            </tr>
            ${data.extra > 0 ? `
              <tr>
                <td class="total-label">Extra kosten:</td>
                <td class="total-amount">${formatCurrency(data.extra)}</td>
              </tr>
            ` : ''}
            <tr class="final-total">
              <td class="total-label">Totaal:</td>
              <td class="total-amount">${formatCurrency(data.total)}</td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          <p>Bedankt voor uw opdracht!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}