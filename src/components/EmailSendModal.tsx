'use client';

import { useState } from 'react';

interface EmailSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (customMessage?: string) => Promise<void>;
  customerName: string;
  customerEmail: string;
  invoiceNumber: string;
  total: number;
}

export function EmailSendModal({ 
  isOpen, 
  onClose, 
  onSend, 
  customerName, 
  customerEmail, 
  invoiceNumber,
  total 
}: EmailSendModalProps) {
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handleSend = async () => {
    try {
      setSending(true);
      await onSend(customMessage.trim() || undefined);
      onClose();
      setCustomMessage(''); // Reset for next time
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      onClose();
      setCustomMessage(''); // Reset when closing
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Factuur Verzenden
            </h2>
            
            <button
              onClick={handleClose}
              disabled={sending}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Recipient Info */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Ontvanger
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="font-medium text-gray-900 dark:text-white">{customerName}</p>
                <p className="text-gray-600 dark:text-gray-400">{customerEmail}</p>
              </div>
            </div>

            {/* Invoice Info */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Factuurgegevens
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Factuurnummer:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{invoiceNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Totaalbedrag:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Custom Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Persoonlijk bericht (optioneel)
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Voeg een persoonlijk bericht toe aan de email..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={4}
                disabled={sending}
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Als je dit leeg laat, wordt een standaard bericht gebruikt.
              </p>
            </div>

            {/* Email Preview */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Email voorbeeld
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-sm">
                <div className="mb-2">
                  <strong>Onderwerp:</strong> Factuur {invoiceNumber}
                </div>
                <div className="mb-3">
                  <strong>Aan:</strong> {customerEmail}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <p className="mb-2">Beste {customerName},</p>
                  
                  {customMessage ? (
                    <p className="mb-2 italic">{customMessage}</p>
                  ) : (
                    <p className="mb-2">Hierbij ontvangt u de factuur voor de geleverde diensten.</p>
                  )}
                  
                  <p className="mb-2">
                    <strong>Factuurnummer:</strong> {invoiceNumber}<br />
                    <strong>Totaalbedrag:</strong> {formatCurrency(total)}
                  </p>
                  
                  <p className="mb-2">De factuur is als PDF bijgevoegd bij deze email.</p>
                  
                  <p>Met vriendelijke groet,</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={handleClose}
              disabled={sending}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Annuleren
            </button>
            
            <button
              onClick={handleSend}
              disabled={sending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <span>📧</span>
              )}
              <span>{sending ? 'Verzenden...' : 'Email Verzenden'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}