'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PDFPreviewModal } from '@/components/PDFPreviewModal';
import { EmailSendModal } from '@/components/EmailSendModal';

// Helper function to generate invoice HTML (same as in PDF generation)
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
    <div style="font-family: 'Helvetica', 'Arial', sans-serif; font-size: 14px; line-height: 1.6; color: #333; background: white; padding: 20px; max-width: 800px; margin: 0 auto;">
      <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; margin-bottom: 20px; border-radius: 5px; color: #92400e; text-align: center; font-weight: bold;">
        🔍 VOORBEELD - Dit is een voorbeeldweergave van de factuur
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #2563eb;">
        <div>
          <h1 style="color: #2563eb; font-size: 32px; font-weight: bold; margin: 0 0 5px 0;">FACTUUR</h1>
        </div>
        <div style="text-align: right;">
          <h2 style="color: #374151; font-size: 24px; margin: 0 0 10px 0;">${data.invoiceNumber}</h2>
          <div>Factuurdatum: ${formatDate(data.invoiceDate)}</div>
          <div>Vervaldatum: ${formatDate(data.dueDate)}</div>
        </div>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div style="flex: 1; margin-right: 40px;">
          <div style="font-weight: bold; font-size: 16px; color: #374151; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Facturatie gegevens</div>
          <div style="line-height: 1.8;">
            <strong>${customer.name}</strong><br>
            ${customer.address || ''}<br>
            ${customer.email || ''}
          </div>
        </div>
        
        <div style="flex: 1;">
          <div style="font-weight: bold; font-size: 16px; color: #374151; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Factuur gegevens</div>
          <div style="line-height: 1.8;">
            <strong>Periode:</strong> ${data.billingMonth}/${data.billingYear}<br>
            ${data.purchaseNumber ? `<strong>Inkoop nummer:</strong> ${data.purchaseNumber}<br>` : ''}
            <strong>Betalingstermijn:</strong> 30 dagen
          </div>
        </div>
      </div>
      
      <div style="margin: 30px 0;">
        <div style="font-weight: bold; font-size: 16px; color: #374151; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Factuurregels</div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr>
              <th style="background-color: #f8fafc; border: 1px solid #e5e7eb; padding: 12px; text-align: left; font-weight: bold; color: #374151;">Datum</th>
              ${customer.rule === 'hourly' 
                ? '<th style="background-color: #f8fafc; border: 1px solid #e5e7eb; padding: 12px; text-align: left; font-weight: bold; color: #374151;">Beschrijving</th><th style="background-color: #f8fafc; border: 1px solid #e5e7eb; padding: 12px; text-align: left; font-weight: bold; color: #374151;">Duur</th><th style="background-color: #f8fafc; border: 1px solid #e5e7eb; padding: 12px; text-align: left; font-weight: bold; color: #374151;">Tarief</th>' 
                : '<th style="background-color: #f8fafc; border: 1px solid #e5e7eb; padding: 12px; text-align: left; font-weight: bold; color: #374151;">Dag omzet</th><th style="background-color: #f8fafc; border: 1px solid #e5e7eb; padding: 12px; text-align: left; font-weight: bold; color: #374151;">Percentage</th><th style="background-color: #f8fafc; border: 1px solid #e5e7eb; padding: 12px; text-align: left; font-weight: bold; color: #374151;">Vergoeding</th>'
              }
              <th style="background-color: #f8fafc; border: 1px solid #e5e7eb; padding: 12px; text-align: right; font-weight: bold; color: #374151;">Bedrag</th>
            </tr>
          </thead>
          <tbody>
            ${lineItems.map((item: any, index: number) => `
              <tr style="${index % 2 === 1 ? 'background-color: #f9fafb;' : ''}">
                <td style="border: 1px solid #e5e7eb; padding: 10px 12px; vertical-align: top;">${formatDate(item.date)}</td>
                ${customer.rule === 'hourly' 
                  ? `<td style="border: 1px solid #e5e7eb; padding: 10px 12px; vertical-align: top;">${item.description || ''}</td><td style="border: 1px solid #e5e7eb; padding: 10px 12px; vertical-align: top;">${item.duration || ''}</td><td style="border: 1px solid #e5e7eb; padding: 10px 12px; vertical-align: top;">${formatCurrency(item.rate_per_hour || 0)}</td>`
                  : `<td style="border: 1px solid #e5e7eb; padding: 10px 12px; vertical-align: top;">${formatCurrency(item.daily_revenue || 0)}</td><td style="border: 1px solid #e5e7eb; padding: 10px 12px; vertical-align: top;">${item.compensation_percentage || 0}%</td><td style="border: 1px solid #e5e7eb; padding: 10px 12px; vertical-align: top;">${formatCurrency(item.compensation_amount || 0)}</td>`
                }
                <td style="border: 1px solid #e5e7eb; padding: 10px 12px; vertical-align: top; text-align: right;">${formatCurrency(item.total || 0)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div style="margin-top: 30px; text-align: right;">
        <table style="margin-left: auto; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 15px; border-bottom: 1px solid #e5e7eb; font-weight: bold; text-align: right; color: #374151;">Subtotaal:</td>
            <td style="padding: 8px 15px; border-bottom: 1px solid #e5e7eb; text-align: right; min-width: 100px;">${formatCurrency(subtotal)}</td>
          </tr>
          ${data.extra > 0 ? `
          <tr>
            <td style="padding: 8px 15px; border-bottom: 1px solid #e5e7eb; font-weight: bold; text-align: right; color: #374151;">Bonus:</td>
            <td style="padding: 8px 15px; border-bottom: 1px solid #e5e7eb; text-align: right; min-width: 100px;">${formatCurrency(data.extra)}</td>
          </tr>` : ''}
          <tr>
            <td style="border-top: 2px solid #374151; border-bottom: 2px solid #374151; font-weight: bold; font-size: 16px; padding: 12px 15px; text-align: right; color: #374151;">Totaal:</td>
            <td style="border-top: 2px solid #374151; border-bottom: 2px solid #374151; font-weight: bold; font-size: 16px; padding: 12px 15px; text-align: right; min-width: 100px;">${formatCurrency(data.total)}</td>
          </tr>
        </table>
      </div>
      
      <div style="margin-top: 30px; padding: 15px; background-color: #f0f9ff; border-left: 4px solid #2563eb;">
        <h4 style="color: #1e40af; margin: 0 0 10px 0;">Betalingsinformatie</h4>
        <p style="margin: 0;">Gelieve het factuurbedrag binnen ${formatDate(data.dueDate)} over te maken.</p>
      </div>
    </div>
  `;
}

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  billing_month: number;
  billing_year: number;
  purchase_number?: string;
  extra: number;
  total: number;
  status: string;
  customer_id: string;
  customer_name: string;
  created_at: string;
}

interface LineItem {
  id: string;
  date: string;
  description?: string;
  daily_revenue?: number;
  compensation_percentage?: number;
  compensation_amount?: number;
  duration?: string;
  rate_per_hour?: number;
  total: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  zipCode: string;
  city: string;
  rule: 'omzet' | 'hourly';
  ratePerHour?: number;
}

interface InvoiceDetailsProps {
  params: Promise<{
    id: string;
  }>;
}

export default function InvoiceDetails({ params }: InvoiceDetailsProps) {
  const resolvedParams = use(params);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchInvoiceDetails();
  }, [resolvedParams.id]);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch invoice details
      const invoiceResponse = await fetch(`/api/invoices/${resolvedParams.id}`);
      if (!invoiceResponse.ok) {
        throw new Error('Factuur niet gevonden');
      }
      const invoiceData = await invoiceResponse.json();
      setInvoice(invoiceData);

      // Fetch line items
      const lineItemsResponse = await fetch(`/api/invoices/${resolvedParams.id}/line-items`);
      if (lineItemsResponse.ok) {
        const lineItemsResult = await lineItemsResponse.json();
        const lineItemsData = lineItemsResult.data || lineItemsResult; // Handle both formats
        setLineItems(Array.isArray(lineItemsData) ? lineItemsData : []);
      } else {
        console.error('Failed to fetch line items:', lineItemsResponse.status, lineItemsResponse.statusText);
        setLineItems([]);
      }

      // Fetch customer details
      const customersResponse = await fetch('/api/customers');
      if (customersResponse.ok) {
        const customersResult = await customersResponse.json();
        const customers = customersResult.data || customersResult; // Handle both formats
        const customerData = customers.find((c: Customer) => c.id === invoiceData.customer_id);
        setCustomer(customerData || null);
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Er is een fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPreview = () => {
    setShowPreviewModal(true);
  };

  const handleViewPDF = () => {
    setShowPdfModal(true);
  };

  const handleSendEmail = () => {
    setShowEmailModal(true);
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'submitted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'sent': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Concept';
      case 'submitted': return 'Ingediend';
      case 'completed': return 'Voltooid';
      case 'sent': return 'Verzonden';
      case 'paid': return 'Betaald';
      case 'overdue': return 'Achterstallig';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Factuur laden...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Factuur niet gevonden'}</p>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Terug naar overzicht
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = Array.isArray(lineItems) ? lineItems.reduce((sum, item) => sum + (item.total || 0), 0) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
              <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-200">
                Overzicht
              </Link>
              <span>›</span>
              <span>Factuur {invoice.invoice_number}</span>
            </nav>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Factuur {invoice.invoice_number}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
              {getStatusText(invoice.status)}
            </span>
            
            {/* Voorbeeld bekijken - visible for all statuses */}
            <button
              onClick={handleViewPreview}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <span>🔍</span>
              <span>Voorbeeld bekijken</span>
            </button>
            
            {/* PDF Bekijken - visible for all statuses except 'draft' */}
            {invoice.status !== 'draft' && (
              <button
                onClick={handleViewPDF}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <span>📄</span>
                <span>PDF Bekijken</span>
              </button>
            )}
            
            {/* Email Verzenden - only visible for 'submitted' status */}
            {invoice.status === 'submitted' && (
              <button
                onClick={handleSendEmail}
                disabled={!customer?.email}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                <span>📧</span>
                <span>Email Verzenden</span>
              </button>
            )}
            
            <Link
              href={`/factuur/${invoice.id}/bewerken`}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              ✏️ Bewerken
            </Link>
          </div>
        </div>

        {/* Invoice Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Invoice Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Factuurgegevens
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Factuurnummer:</span>
                <span className="font-medium text-gray-900 dark:text-white">{invoice.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Factuurdatum:</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatDate(invoice.invoice_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Vervaldatum:</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatDate(invoice.due_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Maandfacturatie:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(invoice.billing_year, invoice.billing_month - 1).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              {invoice.purchase_number && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Purchase nummer:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{invoice.purchase_number}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Aangemaakt:</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatDate(invoice.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          {customer && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Klantgegevens
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Naam:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{customer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Adres:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{customer.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Postcode & Plaats:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{customer.zipCode} {customer.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Facturatieregel:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {customer.rule === 'omzet' ? 'Omzet compensatie' : 'Uurloon'}
                  </span>
                </div>
                {customer.rule === 'hourly' && customer.ratePerHour && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Uurtarief:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(customer.ratePerHour)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Line Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Factuurregels
          </h3>
          
          {!Array.isArray(lineItems) || lineItems.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Geen factuurregels gevonden
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Datum</th>
                    {customer?.rule === 'hourly' ? (
                      <>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Beschrijving</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Duur</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Tarief</th>
                      </>
                    ) : (
                      <>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Dag omzet</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Percentage</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Vergoeding</th>
                      </>
                    )}
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Totaal</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{formatDate(item.date)}</td>
                      {customer?.rule === 'hourly' ? (
                        <>
                          <td className="py-3 px-4 text-gray-900 dark:text-white">{item.description || '-'}</td>
                          <td className="py-3 px-4 text-gray-900 dark:text-white">{item.duration || '-'}</td>
                          <td className="py-3 px-4 text-gray-900 dark:text-white">{formatCurrency(item.rate_per_hour || 0)}</td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-4 text-gray-900 dark:text-white">{formatCurrency(item.daily_revenue || 0)}</td>
                          <td className="py-3 px-4 text-gray-900 dark:text-white">{item.compensation_percentage || 0}%</td>
                          <td className="py-3 px-4 text-gray-900 dark:text-white">{formatCurrency(item.compensation_amount || 0)}</td>
                        </>
                      )}
                      <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Totalen
          </h3>
          
          <div className="space-y-2 max-w-md ml-auto">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Subtotaal:</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
            </div>
            {parseFloat(invoice.extra?.toString() || '0') > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Bonus:</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(parseFloat(invoice.extra?.toString() || '0'))}</span>
              </div>
            )}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
              <div className="flex justify-between">
                <span className="text-lg font-medium text-gray-900 dark:text-white">Totaal:</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPdfModal && invoice && (
        <PDFPreviewModal
          isOpen={showPdfModal}
          invoiceId={invoice.id}
          invoiceNumber={invoice.invoice_number}
          onClose={() => setShowPdfModal(false)}
        />
      )}

      {showEmailModal && invoice && customer && (
        <EmailSendModal
          isOpen={showEmailModal}
          customerName={customer.name}
          customerEmail={customer.email}
          invoiceNumber={invoice.invoice_number}
          total={invoice.total}
          onClose={() => setShowEmailModal(false)}
          onSend={async (customMessage) => {
            try {
              const response = await fetch(`/api/invoices/${invoice.id}/send`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  customMessage: customMessage || null
                }),
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Email kon niet worden verzonden');
              }

              await fetchInvoiceDetails(); // Refresh to update status
            } catch (error) {
              throw error; // Re-throw to let modal handle the error
            }
          }}
        />
      )}

      {/* Preview Modal */}
      {showPreviewModal && invoice && (
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
                Factuur Voorbeeld - {invoice.invoice_number}
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
                    invoiceNumber: invoice.invoice_number,
                    invoiceDate: invoice.invoice_date,
                    dueDate: invoice.due_date,
                    billingMonth: invoice.billing_month,
                    billingYear: invoice.billing_year,
                    purchaseNumber: invoice.purchase_number || '',
                    extra: parseFloat(invoice.extra?.toString() || '0'),
                    total: parseFloat(invoice.total?.toString() || '0'),
                    customer: customer || {
                      name: invoice.customer_name,
                      address: '',
                      email: '',
                      rule: 'omzet'
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