'use client';

import { useState } from 'react';

// Import the same HTML generator used for PDF generation
function generateInvoiceHTML(data: any): string {
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
  const subtotal = Array.isArray(lineItems) ? lineItems.reduce((sum: number, item: any) => sum + (item.total || 0), 0) : 0;
  
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
          padding: 20px;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #2563eb;
        }
        
        .logo-section h1 {
          color: #2563eb;
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .invoice-details {
          text-align: right;
        }
        
        .invoice-details h2 {
          color: #374151;
          font-size: 24px;
          margin-bottom: 10px;
        }
        
        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        
        .customer-info, .invoice-info {
          flex: 1;
        }
        
        .customer-info {
          margin-right: 40px;
        }
        
        .section-title {
          font-weight: bold;
          font-size: 16px;
          color: #374151;
          margin-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 5px;
        }
        
        .customer-details, .invoice-details-content {
          line-height: 1.8;
        }
        
        .line-items {
          margin: 30px 0;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .items-table th {
          background-color: #f8fafc;
          border: 1px solid #e5e7eb;
          padding: 12px;
          text-align: left;
          font-weight: bold;
          color: #374151;
        }
        
        .items-table td {
          border: 1px solid #e5e7eb;
          padding: 10px 12px;
          vertical-align: top;
        }
        
        .items-table tr:nth-child(even) {
          background-color: #f9fafb;
        }
        
        .totals {
          margin-top: 30px;
          text-align: right;
        }
        
        .totals-table {
          margin-left: auto;
          border-collapse: collapse;
        }
        
        .totals-table td {
          padding: 8px 15px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .totals-table .label {
          font-weight: bold;
          text-align: right;
          color: #374151;
        }
        
        .totals-table .amount {
          text-align: right;
          min-width: 100px;
        }
        
        .total-row td {
          border-top: 2px solid #374151;
          border-bottom: 2px solid #374151;
          font-weight: bold;
          font-size: 16px;
          padding: 12px 15px;
        }
        
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        
        .payment-info {
          margin-top: 30px;
          padding: 15px;
          background-color: #f0f9ff;
          border-left: 4px solid #2563eb;
        }
        
        .payment-info h4 {
          color: #1e40af;
          margin-bottom: 10px;
        }
        
        .preview-notice {
          background: #fef3c7;
          border: 1px solid #fbbf24;
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 5px;
          color: #92400e;
          text-align: center;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="preview-notice">
          🔍 VOORBEELD - Dit is een voorbeeldweergave van de factuur
        </div>
        
        <div class="header">
          <div class="logo-section">
            <h1>FACTUUR</h1>
          </div>
          <div class="invoice-details">
            <h2>${data.invoiceNumber}</h2>
            <div>Factuurdatum: ${formatDate(data.invoiceDate)}</div>
            <div>Vervaldatum: ${formatDate(data.dueDate)}</div>
          </div>
        </div>
        
        <div class="info-section">
          <div class="customer-info">
            <div class="section-title">Facturatie gegevens</div>
            <div class="customer-details">
              <strong>${customer.name}</strong><br>
              ${customer.address || ''}<br>
              ${customer.zipCode || ''} ${customer.city || ''}<br>
              ${customer.email}
            </div>
          </div>
          
          <div class="invoice-info">
            <div class="section-title">Factuur gegevens</div>
            <div class="invoice-details-content">
              <strong>Periode:</strong> ${data.billingMonth}/${data.billingYear}<br>
              ${data.purchaseNumber ? `<strong>Inkoop nummer:</strong> ${data.purchaseNumber}<br>` : ''}
              <strong>Betalingstermijn:</strong> 30 dagen
            </div>
          </div>
        </div>
        
        <div class="line-items">
          <div class="section-title">Factuurregels</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Datum</th>
                ${customer.rule === 'hourly' 
                  ? '<th>Beschrijving</th><th>Duur</th><th>Tarief</th>' 
                  : '<th>Dag omzet</th><th>Percentage</th><th>Vergoeding</th>'
                }
                <th style="text-align: right;">Bedrag</th>
              </tr>
            </thead>
            <tbody>
              ${lineItems.map((item: any) => `
                <tr>
                  <td>${formatDate(item.date)}</td>
                  ${customer.rule === 'hourly' 
                    ? `<td>${item.description || ''}</td><td>${item.duration || ''}</td><td>${formatCurrency(item.ratePerHour || 0)}</td>`
                    : `<td>${formatCurrency(item.dailyRevenue || 0)}</td><td>${item.compensationPercentage || 0}%</td><td>${formatCurrency(item.compensationAmount || 0)}</td>`
                  }
                  <td style="text-align: right;">${formatCurrency(item.total || 0)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="totals">
          <table class="totals-table">
            <tr>
              <td class="label">Subtotaal:</td>
              <td class="amount">${formatCurrency(subtotal)}</td>
            </tr>
            ${data.extra > 0 ? `
            <tr>
              <td class="label">Bonus:</td>
              <td class="amount">${formatCurrency(data.extra)}</td>
            </tr>` : ''}
            <tr class="total-row">
              <td class="label">Totaal:</td>
              <td class="amount">${formatCurrency(data.total)}</td>
            </tr>
          </table>
        </div>
        
        <div class="payment-info">
          <h4>Betalingsinformatie</h4>
          <p>Gelieve het factuurbedrag binnen ${formatDate(data.dueDate)} over te maken.</p>
        </div>
        
        <div class="footer">
          <p>Gegenereerd op ${formatDate(new Date().toISOString())}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

interface InvoiceFormProps {
  customer: {
    id: string;
    name: string;
    address?: string;
    email: string;
    rule: 'omzet' | 'hourly';
    currency: string;
  };
  billingMonth: number;
  billingYear: number;
  existingInvoice?: {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    purchaseNumber: string;
    extra: number;
    lineItems: LineItem[];
  };
}

interface LineItem {
  id: string;
  date: string;
  description?: string;
  // Omzet fields
  daily_revenue?: number;
  compensation_percentage?: number;
  compensation_amount?: number;
  // Hourly fields
  duration?: string;
  rate_per_hour?: number;
  total: number;
}

export function InvoiceForm({ customer, billingMonth, billingYear, existingInvoice }: InvoiceFormProps) {
  // Generate invoice number (CUSTOMER_ID-YYYY-MM)
  const generateInvoiceNumber = () => {
    const monthStr = billingMonth.toString().padStart(2, '0');
    return `${customer.id}-${billingYear}-${monthStr}`;
  };

  const [invoiceNumber, setInvoiceNumber] = useState(existingInvoice?.invoiceNumber || generateInvoiceNumber());
  const [invoiceDate, setInvoiceDate] = useState(existingInvoice?.invoiceDate || new Date().toISOString().split('T')[0]);
  const [purchaseNumber, setPurchaseNumber] = useState(existingInvoice?.purchaseNumber || '');
  const [purchaseNumberEnabled, setPurchaseNumberEnabled] = useState(!!existingInvoice?.purchaseNumber);
  const [extra, setExtra] = useState(existingInvoice?.extra || 0);
  const [lineItems, setLineItems] = useState<LineItem[]>(existingInvoice?.lineItems || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Calculate due date (invoice date + 30 days)
  const calculateDueDate = (invoiceDate: string) => {
    const date = new Date(invoiceDate);
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };

  const dueDate = calculateDueDate(invoiceDate);

    // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + parseFloat(item.total?.toString() || '0'), 0);
  const totalAmount = subtotal + parseFloat(extra?.toString() || '0');

  const addLineItem = () => {
    const newItem: LineItem = {
      id: `temp_${Date.now()}`,
      date: invoiceDate,
      total: 0
    };

    if (customer.rule === 'hourly') {
      newItem.description = '';
      newItem.duration = '0:00';
      newItem.rate_per_hour = 127; // Default rate from requirements
    } else {
      newItem.daily_revenue = 0;
      newItem.compensation_percentage = 35; // Default to lowest tier
      newItem.compensation_amount = 0;
    }

    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, ...updates };
        
        // Recalculate totals based on customer rule
        if (customer.rule === 'omzet' && updatedItem.daily_revenue !== undefined) {
          // Calculate percentage based on daily revenue
          let percentage = 35;
          if (updatedItem.daily_revenue >= 1500) {
            percentage = 45;
          } else if (updatedItem.daily_revenue >= 1000) {
            percentage = 40;
          }
          
          updatedItem.compensation_percentage = percentage;
          updatedItem.compensation_amount = (updatedItem.daily_revenue * percentage) / 100;
          updatedItem.total = updatedItem.compensation_amount;
        } else if (customer.rule === 'hourly' && updatedItem.duration && updatedItem.rate_per_hour) {
          // Calculate total from duration and rate
          const [hours, minutes] = updatedItem.duration.split(':').map(Number);
          const totalHours = hours + (minutes / 60);
          updatedItem.total = totalHours * updatedItem.rate_per_hour;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const handleSaveDraft = async () => {
    if (lineItems.length === 0) {
      alert('Voeg minimaal één factuurregel toe voordat je opslaat.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create invoice via API
      const invoiceData = {
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        due_date: dueDate,
        billing_month: billingMonth,
        billing_year: billingYear,
        purchase_number: purchaseNumberEnabled ? purchaseNumber : null,
        extra: extra,
        total: totalAmount,
        status: 'draft',
        customer_id: customer.id
      };

      const invoiceResponse = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      const invoiceResult = await invoiceResponse.json();

      if (invoiceResult.success) {
        const invoiceId = invoiceResult.data.id;

        // Create line items
        for (const item of lineItems) {
          const lineItemData = {
            date: item.date,
            description: item.description || 'Factuur regel', // Ensure description is never null
            daily_revenue: item.daily_revenue || null,
            compensation_percentage: item.compensation_percentage || null,
            compensation_amount: item.compensation_amount || null,
            duration: item.duration || null,
            rate_per_hour: item.rate_per_hour || null,
          };

          const lineItemResponse = await fetch(`/api/invoices/${invoiceId}/line-items`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(lineItemData),
          });

          const lineItemResult = await lineItemResponse.json();
          if (!lineItemResult.success) {
            console.error('Error creating line item:', lineItemResult.error);
            alert('Fout bij opslaan van factuur regel: ' + lineItemResult.error);
            return; // Stop processing if any line item fails
          }
        }

        // Navigate back to list
        window.location.href = '/';
      } else {
        console.error('Error creating invoice:', invoiceResult.error);
        alert('Fout bij opslaan van factuur: ' + invoiceResult.error);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Fout bij opslaan van factuur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = async () => {
    if (lineItems.length === 0) {
      alert('Voeg minimaal één factuurregel toe voordat je een voorbeeld bekijkt.');
      return;
    }

    setShowPreviewModal(true);
  };

  const getMonthName = (month: number) => {
    const months = [
      'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
      'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
    ];
    return months[month - 1];
  };

  return (
    <div className="space-y-6">
      {/* Invoice Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Factuurgegevens
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Factuurnummer
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Maandfacturatie
            </label>
            <input
              type="text"
              value={`${getMonthName(billingMonth)} ${billingYear}`}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Factuurdatum
            </label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vervaldatum
            </label>
            <input
              type="date"
              value={dueDate}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Automatisch berekend (factuurdatum + 30 dagen)
            </p>
          </div>
          
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                id="enablePurchaseNumber"
                checked={purchaseNumberEnabled}
                onChange={(e) => setPurchaseNumberEnabled(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="enablePurchaseNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Purchase nummer toevoegen
              </label>
            </div>
            <input
              type="text"
              value={purchaseNumber}
              onChange={(e) => setPurchaseNumber(e.target.value)}
              disabled={!purchaseNumberEnabled}
              placeholder="Purchase nummer (optioneel)"
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                purchaseNumberEnabled 
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white' 
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Line Items Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Factuurregels
          </h3>
          <button
            onClick={addLineItem}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Regel toevoegen</span>
          </button>
        </div>

        {lineItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Geen factuurregels toegevoegd. Klik op "Regel toevoegen" om te beginnen.
          </div>
        ) : (
          <div className="space-y-4">
            {lineItems.map((item, index) => (
              <div key={item.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Regel {index + 1}
                  </span>
                  <button
                    onClick={() => removeLineItem(item.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                  >
                    🗑️ Verwijderen
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Datum
                    </label>
                    <input
                      type="date"
                      value={item.date}
                      onChange={(e) => updateLineItem(item.id, { date: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {customer.rule === 'hourly' ? (
                    <>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Beschrijving
                        </label>
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                          placeholder="Beschrijving van het werk"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Duur (uu:mm)
                        </label>
                        <input
                          type="text"
                          value={item.duration || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Only allow digits and colon
                            const filtered = value.replace(/[^0-9:]/g, '');
                            
                            // Enforce HH:MM format
                            if (filtered.length <= 5) {
                              // Auto-add colon after 2 digits
                              if (filtered.length === 2 && !filtered.includes(':')) {
                                updateLineItem(item.id, { duration: filtered + ':' });
                              } else if (filtered.match(/^\d{1,2}:\d{0,2}$/) || filtered.match(/^\d{0,2}$/)) {
                                // Allow partial valid formats during typing
                                updateLineItem(item.id, { duration: filtered });
                              }
                            }
                          }}
                          onBlur={(e) => {
                            // Validate and fix format on blur
                            const value = e.target.value;
                            const match = value.match(/^(\d{1,2}):(\d{1,2})$/);
                            if (match) {
                              const hours = match[1].padStart(2, '0');
                              const minutes = Math.min(parseInt(match[2]), 59).toString().padStart(2, '0');
                              updateLineItem(item.id, { duration: `${hours}:${minutes}` });
                            } else if (value && !value.includes(':')) {
                              // If only numbers, treat as hours
                              const hours = Math.min(parseInt(value) || 0, 99).toString().padStart(2, '0');
                              updateLineItem(item.id, { duration: `${hours}:00` });
                            }
                          }}
                          placeholder="08:00"
                          maxLength={5}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Tarief (€/uur)
                        </label>
                        <input
                          type="number"
                          value={item.rate_per_hour || ''}
                          onChange={(e) => updateLineItem(item.id, { rate_per_hour: parseFloat(e.target.value) || 0 })}
                          step="0.01"
                          min="0"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Totaal (€)
                        </label>
                        <input
                          type="text"
                          value={`€${parseFloat(item.total?.toString() || '0').toFixed(2)}`}
                          disabled
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Dag omzet (€) *
                        </label>
                        <input
                          type="number"
                          value={item.daily_revenue || ''}
                          onChange={(e) => updateLineItem(item.id, { daily_revenue: parseFloat(e.target.value) || 0 })}
                          step="0.01"
                          min="0"
                          required
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Percentage
                        </label>
                        <input
                          type="text"
                          value={`${item.compensation_percentage || 0}%`}
                          disabled
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Vergoeding (€)
                        </label>
                        <input
                          type="text"
                          value={`€${parseFloat(item.compensation_amount?.toString() || '0').toFixed(2)}`}
                          disabled
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoice Totals */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Totalen
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bonus (€)
            </label>
            <input
              type="number"
              value={extra || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setExtra(value);
              }}
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotaal:</span>
              <span className="text-gray-900 dark:text-white">€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Bonus:</span>
              <span className="text-gray-900 dark:text-white">€{extra.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-gray-900 dark:text-white">Totaal:</span>
              <span className="text-gray-900 dark:text-white">€{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleSaveDraft}
          disabled={isSubmitting}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Opslaan...' : 'Concept opslaan'}
        </button>
        
        <button
          onClick={handlePreview}
          disabled={lineItems.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Voorbeeld bekijken
        </button>
      </div>
      
      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Background overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowPreviewModal(false)}
          ></div>
          
          {/* Modal content */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                Factuur Voorbeeld - {invoiceNumber}
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div 
                dangerouslySetInnerHTML={{
                  __html: generateInvoiceHTML({
                    invoiceNumber,
                    invoiceDate,
                    dueDate,
                    billingMonth,
                    billingYear,
                    purchaseNumber: purchaseNumberEnabled ? purchaseNumber : '',
                    extra: parseFloat(extra?.toString() || '0'),
                    total: totalAmount,
                    customer: {
                      ...customer,
                      address: customer.address || '',
                      zipCode: '',
                      city: ''
                    },
                    lineItems: lineItems.map(item => ({
                      ...item,
                      date: item.date,
                      daily_revenue: item.daily_revenue,
                      compensation_percentage: item.compensation_percentage,
                      compensation_amount: item.compensation_amount,
                      rate_per_hour: item.rate_per_hour,
                      total: parseFloat(item.total?.toString() || '0')
                    }))
                  })
                }}
              />
            </div>
            
            {/* Footer */}
            <div className="flex justify-end p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}