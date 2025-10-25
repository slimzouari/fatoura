'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { InvoiceForm } from '@/components/InvoiceForm';

// Helper function to format date for HTML date input (YYYY-MM-DD)
const formatDateForInput = (date: any): string => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  return d.toISOString().split('T')[0];
};

interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  zipCode: string;
  city: string;
  rule: 'omzet' | 'hourly';
  ratePerHour?: number;
  currency: string;
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

interface EditInvoiceProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditInvoice({ params }: EditInvoiceProps) {
  const resolvedParams = use(params);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadInvoiceData();
  }, [resolvedParams.id]);

  const loadInvoiceData = async () => {
    try {
      setLoading(true);
      
      // Fetch invoice details
      const invoiceResponse = await fetch(`/api/invoices/${resolvedParams.id}`);
      if (!invoiceResponse.ok) {
        throw new Error('Factuur niet gevonden');
      }
      const invoiceData = await invoiceResponse.json();
      setInvoice(invoiceData);

      // Fetch customer details
      const customersResponse = await fetch('/api/customers');
      if (customersResponse.ok) {
        const customersResult = await customersResponse.json();
        const customers = customersResult.data || customersResult;
        const customerData = customers.find((c: Customer) => c.id === invoiceData.customer_id);
        if (customerData) {
          setCustomer(customerData);
        } else {
          throw new Error('Klant niet gevonden');
        }
      } else {
        throw new Error('Kon klantgegevens niet laden');
      }

      // Fetch line items
      const lineItemsResponse = await fetch(`/api/invoices/${resolvedParams.id}/line-items`);
      if (lineItemsResponse.ok) {
        const lineItemsData = await lineItemsResponse.json();
        setLineItems(lineItemsData.data || []);
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Er is een fout opgetreden');
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Fout</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link
            href="/factuur"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Terug naar facturen
          </Link>
        </div>
      </div>
    );
  }

  if (!invoice || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Factuur niet gevonden</h1>
          <Link
            href="/factuur"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Terug naar facturen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Factuur Bewerken
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Factuur #{invoice.invoice_number} voor {customer.name}
              </p>
            </div>
            <Link
              href={`/factuur/${invoice.id}`}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              ← Terug naar details
            </Link>
          </div>
        </div>

        {/* Check if invoice can be edited */}
        {invoice.status !== 'draft' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Factuur is niet bewerkbaar
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>
                    Deze factuur heeft de status '{invoice.status}' en kan niet meer bewerkt worden. 
                    Alleen facturen met status 'draft' kunnen bewerkt worden.
                  </p>
                  <p className="mt-2">
                    Je kunt wel een nieuwe factuur aanmaken op basis van deze gegevens.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {invoice.status === 'draft' ? 'Factuur Bewerken' : 'Nieuwe Factuur op Basis van Deze Gegevens'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {invoice.status === 'draft' 
                  ? 'Bewerk de factuurgegevens en sla op als concept of dien in.'
                  : 'Deze factuur kan niet meer bewerkt worden, maar je kunt een nieuwe factuur aanmaken met deze gegevens als uitgangspunt.'
                }
              </p>
              
              {/* Current Invoice Summary */}
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Huidige Factuur Gegevens:</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Factuur nummer:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{invoice.invoice_number}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Inkoop nummer:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{invoice.purchase_number || 'Geen'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Totaal:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">€{parseFloat(invoice.total?.toString() || '0').toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <InvoiceForm 
              customer={customer} 
              billingMonth={invoice.billing_month} 
              billingYear={invoice.billing_year}
              existingInvoice={{
                id: invoice.id,
                invoiceNumber: invoice.invoice_number,
                invoiceDate: formatDateForInput(invoice.invoice_date),
                purchaseNumber: invoice.purchase_number || '',
                extra: parseFloat(invoice.extra?.toString() || '0'),
                lineItems: lineItems.map(item => ({
                  ...item,
                  date: formatDateForInput(item.date)
                }))
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}