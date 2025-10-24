'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InvoiceFilters } from './InvoiceFilters';
import { CustomerSelectionModal } from './CustomerSelectionModal';
import { MonthYearSelectionModal } from './MonthYearSelectionModal';

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total: number;
  status: 'draft' | 'submitted' | 'completed' | 'sent';
  customer_name: string;
  customer_id: string;
}

interface Customer {
  id: string;
  name: string;
  rule: 'omzet' | 'hourly';
}

export function InvoiceList() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showMonthYearModal, setShowMonthYearModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [invoices, statusFilter, customerFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load invoices and customers in parallel
      const [invoicesResponse, customersResponse] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/customers')
      ]);

      if (!invoicesResponse.ok || !customersResponse.ok) {
        throw new Error('Failed to load data');
      }

      const invoicesData = await invoicesResponse.json();
      const customersData = await customersResponse.json();

      if (invoicesData.success) {
        setInvoices(invoicesData.data);
      }
      if (customersData.success) {
        setCustomers(customersData.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = invoices;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    if (customerFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.customer_id === customerFilter);
    }

    setFilteredInvoices(filtered);
  };

  const handleCreateInvoice = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setShowCustomerModal(false);
      setShowMonthYearModal(true);
    }
  };

  const handleMonthYearSelect = (month: number, year: number) => {
    setShowMonthYearModal(false);
    const customerId = selectedCustomer?.id;
    setSelectedCustomer(null);
    
    // Navigate to invoice creation page with parameters
    if (customerId) {
      router.push(`/factuur/nieuw?klant=${customerId}&maand=${month}&jaar=${year}`);
    }
  };

  const handleBackToCustomerSelection = () => {
    setShowMonthYearModal(false);
    setShowCustomerModal(true);
    setSelectedCustomer(null);
  };

  const handleCloseModals = () => {
    setShowCustomerModal(false);
    setShowMonthYearModal(false);
    setSelectedCustomer(null);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      sent: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };

    const statusLabels = {
      draft: 'Concept',
      submitted: 'Ingediend',
      completed: 'Voltooid',
      sent: 'Verzonden'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles]}`}>
        {statusLabels[status as keyof typeof statusLabels]}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-300">Facturen laden...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900 dark:border-red-700">
        <p className="text-red-800 dark:text-red-200">Fout bij laden van facturen: {error}</p>
        <button 
          onClick={loadData}
          className="mt-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 underline"
        >
          Opnieuw proberen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <InvoiceFilters
          statusFilter={statusFilter}
          customerFilter={customerFilter}
          customers={customers}
          onStatusChange={setStatusFilter}
          onCustomerChange={setCustomerFilter}
        />
        
        <button
          onClick={() => setShowCustomerModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Nieuwe Factuur</span>
        </button>
      </div>

      {/* Invoice Grid */}
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Geen facturen gevonden
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {invoices.length === 0 
              ? 'Begin met het maken van je eerste factuur.' 
              : 'Pas je filters aan om meer resultaten te zien.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {invoice.invoice_number}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {invoice.customer_name}
                  </p>
                </div>
                {getStatusBadge(invoice.status)}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Datum:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(invoice.invoice_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Vervaldatum:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(invoice.due_date)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-600 dark:text-gray-400">Totaal:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(invoice.total)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Selection Modal */}
      {showCustomerModal && (
        <CustomerSelectionModal
          customers={customers}
          onSelect={handleCreateInvoice}
          onClose={handleCloseModals}
        />
      )}

      {/* Month/Year Selection Modal */}
      {showMonthYearModal && selectedCustomer && (
        <MonthYearSelectionModal
          selectedCustomer={selectedCustomer}
          onSelect={handleMonthYearSelect}
          onBack={handleBackToCustomerSelection}
          onClose={handleCloseModals}
        />
      )}
    </div>
  );
}