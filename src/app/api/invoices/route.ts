import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { generateInvoiceNumber, calculateDueDate, generateUniqueId } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');

    const invoices = await db.getInvoices();
    let filteredInvoices = invoices as any[];

    // Apply filters
    if (status) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.status === status);
    }
    if (customerId) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.customer_id === customerId);
    }

    return NextResponse.json({
      success: true,
      data: filteredInvoices
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, billingMonth, billingYear, invoiceDate, purchaseNumber, lineItems, extra = 0 } = body;

    // Validate required fields
    if (!customerId || !billingMonth || !billingYear || !invoiceDate || !lineItems?.length) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate invoice details
    const invoiceId = generateUniqueId();
    const invoiceNumber = generateInvoiceNumber(customerId, billingYear, billingMonth);
    const dueDate = calculateDueDate(new Date(invoiceDate));

    // Calculate total from line items
    let lineItemsTotal = 0;
    const processedLineItems = [];

    for (const item of lineItems) {
      const lineItemId = generateUniqueId();
      let total = 0;

      // Calculate total based on item type
      if (item.dailyRevenue) {
        // Omzet calculation
        const { percentage, amount } = calculateOmzetCompensation(item.dailyRevenue);
        total = amount;
        
        processedLineItems.push({
          id: lineItemId,
          invoiceId: invoiceId,
          date: item.date,
          description: item.description || null,
          dailyRevenue: item.dailyRevenue,
          compensationPercentage: percentage,
          compensationAmount: amount,
          duration: null,
          ratePerHour: null,
          total: total
        });
      } else if (item.duration && item.ratePerHour) {
        // Hourly calculation
        const [hours, minutes] = item.duration.split(':').map(Number);
        const totalHours = hours + (minutes / 60);
        total = Math.round(totalHours * item.ratePerHour * 100) / 100;
        
        processedLineItems.push({
          id: lineItemId,
          invoiceId: invoiceId,
          date: item.date,
          description: item.description || null,
          dailyRevenue: null,
          compensationPercentage: null,
          compensationAmount: null,
          duration: item.duration,
          ratePerHour: item.ratePerHour,
          total: total
        });
      }

      lineItemsTotal += total;
    }

    const finalTotal = lineItemsTotal + (extra || 0);

    // Create invoice
    const invoice = {
      id: invoiceId,
      invoiceNumber,
      invoiceDate: new Date(invoiceDate).toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      billingMonth,
      billingYear,
      purchaseNumber: purchaseNumber || null,
      extra: extra || 0,
      total: finalTotal,
      status: 'draft',
      customerId
    };

    await db.createInvoice(invoice);

    // Create line items
    for (const lineItem of processedLineItems) {
      await db.createLineItem(lineItem);
    }

    return NextResponse.json({
      success: true,
      data: { 
        ...invoice, 
        lineItems: processedLineItems 
      }
    });

  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

function calculateOmzetCompensation(dailyRevenue: number): { percentage: number; amount: number } {
  let percentage: number;
  
  if (dailyRevenue < 1000) {
    percentage = 35;
  } else if (dailyRevenue < 1500) {
    percentage = 40;
  } else {
    percentage = 45;
  }
  
  const amount = (dailyRevenue * percentage) / 100;
  
  return {
    percentage,
    amount: Math.round(amount * 100) / 100
  };
}