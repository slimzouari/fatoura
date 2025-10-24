'use client';

interface Customer {
  id: string;
  name: string;
  rule: 'omzet' | 'hourly';
  email?: string;
  address?: string;
}

interface CustomerSelectionModalProps {
  customers: Customer[];
  onSelect: (customerId: string) => void;
  onClose: () => void;
}

export function CustomerSelectionModal({
  customers,
  onSelect,
  onClose
}: CustomerSelectionModalProps) {
  const getRuleLabel = (rule: string) => {
    return rule === 'omzet' ? 'Omzet compensatie' : 'Uurloon';
  };

  const getRuleIcon = (rule: string) => {
    return rule === 'omzet' ? '💰' : '⏰';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Nieuwe factuur maken - Stap 1 van 2
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <span className="sr-only">Sluiten</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Kies een klant om een nieuwe factuur voor te maken
          </p>
        </div>

        {/* Customer List */}
        <div className="overflow-y-auto max-h-80">
          {customers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">👥</div>
              <p className="text-gray-600 dark:text-gray-400">
                Geen klanten beschikbaar
              </p>
            </div>
          ) : (
            <div className="p-2">
              {customers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => onSelect(customer.id)}
                  className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {customer.name}
                        </h3>
                        <span className="text-lg">
                          {getRuleIcon(customer.rule)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {getRuleLabel(customer.rule)}
                      </p>
                      {customer.email && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {customer.email}
                        </p>
                      )}
                    </div>
                    <div className="text-gray-400">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Volgende →
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Annuleren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}