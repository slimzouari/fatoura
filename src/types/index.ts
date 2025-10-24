export interface User {
  name: string;
  address: string;
  email: string;
  telefoon: string;
  iban: string;
  kvk: string;
}

export interface Customer {
  id: string;
  name: string;
  address?: string;
  email: string;
  contractNumber?: string;
  rule: 'omzet' | 'hourly';
  currency: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  billingMonth: number;
  billingYear: number;
  purchaseNumber?: string;
  customerId: string;
  customer?: Customer;
  extra: number;
  total: number;
  linkToPdf?: string;
  status: 'draft' | 'submitted' | 'completed' | 'sent';
  lineItems: InvoiceLineItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  date: Date;
  description?: string;
  
  // For omzet rule
  dailyRevenue?: number;
  compensationPercentage?: number;
  compensationAmount?: number;
  
  // For hourly rule
  duration?: string; // "HH:MM" format
  ratePerHour?: number;
  
  total: number;
}

export interface InvoiceFormData {
  customerId: string;
  billingMonth: number;
  billingYear: number;
  invoiceDate: Date;
  purchaseNumber?: string;
  lineItems: Omit<InvoiceLineItem, 'id' | 'invoiceId' | 'total'>[];
  extra: number;
}

export interface EmailData {
  to: string;
  from: string;
  subject: string;
  body: string;
  pdfPath: string;
}