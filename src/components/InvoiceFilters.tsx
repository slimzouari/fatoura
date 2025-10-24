'use client';

interface Customer {
  id: string;
  name: string;
  rule: 'omzet' | 'hourly';
}

interface InvoiceFiltersProps {
  statusFilter: string;
  customerFilter: string;
  customers: Customer[];
  onStatusChange: (status: string) => void;
  onCustomerChange: (customerId: string) => void;
}

export function InvoiceFilters({
  statusFilter,
  customerFilter,
  customers,
  onStatusChange,
  onCustomerChange
}: InvoiceFiltersProps) {
  const statusOptions = [
    { value: 'all', label: 'Alle statussen' },
    { value: 'draft', label: 'Concept' },
    { value: 'submitted', label: 'Ingediend' },
    { value: 'completed', label: 'Voltooid' },
    { value: 'sent', label: 'Verzonden' }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Status Filter */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Status
        </label>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Customer Filter */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Klant
        </label>
        <select
          value={customerFilter}
          onChange={(e) => onCustomerChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Alle klanten</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>

      {/* Search/Clear Filters */}
      {(statusFilter !== 'all' || customerFilter !== 'all') && (
        <div className="flex items-end">
          <button
            onClick={() => {
              onStatusChange('all');
              onCustomerChange('all');
            }}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white underline"
          >
            Filters wissen
          </button>
        </div>
      )}
    </div>
  );
}