'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { InvoiceForm } from '@/components/InvoiceForm';

interface Customer {
  id: string;
  name: string;
  address?: string;
  email: string;
  rule: 'omzet' | 'hourly';
  currency: string;
}

function NieuweFactuurContent() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get('klant');
  const month = searchParams.get('maand');
  const year = searchParams.get('jaar');
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId || !month || !year) {
      setError('Ontbrekende parameters. Ga terug naar de factuurlijst en probeer opnieuw.');
      setLoading(false);
      return;
    }

    loadCustomer();
  }, [customerId, month, year]);

  const loadCustomer = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      
      if (data.success) {
        const foundCustomer = data.data.find((c: Customer) => c.id === customerId);
        if (foundCustomer) {
          setCustomer(foundCustomer);
        } else {
          setError('Klant niet gevonden');
        }
      } else {
        setError('Fout bij laden van klantgegevens');
      }
    } catch (err) {
      setError('Fout bij laden van klantgegevens');
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (monthNum: string) => {
    const months = [
      'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
      'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
    ];
    return months[parseInt(monthNum) - 1] || monthNum;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-300">Laden...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 dark:bg-red-900 dark:border-red-700">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
            Fout bij laden van factuur
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            ← Terug naar factuurlijst
          </Link>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Klant niet gevonden</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Nieuwe Factuur
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Maak een nieuwe factuur voor {customer.name} - {getMonthName(month!)} {year}
          </p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          ← Terug
        </Link>
      </div>

      {/* Customer Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">
          Klantgegevens
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800 dark:text-blue-200">Naam:</span>
            <span className="ml-2 text-blue-700 dark:text-blue-300">{customer.name}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800 dark:text-blue-200">ID:</span>
            <span className="ml-2 text-blue-700 dark:text-blue-300">{customer.id}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800 dark:text-blue-200">Email:</span>
            <span className="ml-2 text-blue-700 dark:text-blue-300">{customer.email}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800 dark:text-blue-200">Factureringsregel:</span>
            <span className="ml-2 text-blue-700 dark:text-blue-300">
              {customer.rule === 'omzet' ? 'Omzet compensatie' : 'Uurloon'}
            </span>
          </div>
          {customer.address && (
            <div className="md:col-span-2">
              <span className="font-medium text-blue-800 dark:text-blue-200">Adres:</span>
              <span className="ml-2 text-blue-700 dark:text-blue-300">{customer.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Form */}
      <InvoiceForm
        customer={customer}
        billingMonth={parseInt(month!)}
        billingYear={parseInt(year!)}
      />
    </div>
  );
}

export default function NieuweFactuurPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-300">Laden...</span>
      </div>
    }>
      <NieuweFactuurContent />
    </Suspense>
  );
}