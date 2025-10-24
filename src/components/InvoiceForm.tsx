'use client';

import { useState } from 'react';

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

export function InvoiceForm({ customer, billingMonth, billingYear }: InvoiceFormProps) {
  // Generate invoice number (CUSTOMER_ID-YYYY-MM)
  const generateInvoiceNumber = () => {
    const monthStr = billingMonth.toString().padStart(2, '0');
    return `${customer.id}-${billingYear}-${monthStr}`;
  };

  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaseNumber, setPurchaseNumber] = useState('');
  const [purchaseNumberEnabled, setPurchaseNumberEnabled] = useState(false);
  const [extra, setExtra] = useState(0);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate due date (invoice date + 30 days)
  const calculateDueDate = (invoiceDate: string) => {
    const date = new Date(invoiceDate);
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };

  const dueDate = calculateDueDate(invoiceDate);

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const totalAmount = subtotal + extra;

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
            description: item.description || null,
            daily_revenue: item.daily_revenue || null,
            compensation_percentage: item.compensation_percentage || null,
            compensation_amount: item.compensation_amount || null,
            duration: item.duration || null,
            rate_per_hour: item.rate_per_hour || null,
          };

          await fetch(`/api/invoices/${invoiceId}/line-items`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(lineItemData),
          });
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

  const handlePreview = () => {
    // TODO: Generate PDF preview
    console.log('Opening preview...', {
      invoiceNumber,
      totalAmount,
      lineItems
    });
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
                          value={`€${item.total.toFixed(2)}`}
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
                          value={`€${(item.compensation_amount || 0).toFixed(2)}`}
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
              Extra kosten (€)
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
              <span className="text-gray-600 dark:text-gray-400">Extra kosten:</span>
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
    </div>
  );
}