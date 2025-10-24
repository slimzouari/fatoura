import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
  try {
    // Test database connection
    await db.connect();
    
    // Get counts of each entity
    const customers = await db.getCustomers();
    const invoices = await db.getInvoices();
    
    // Get sample line items from first invoice if exists
    let lineItemsCount = 0;
    if ((invoices as any[]).length > 0) {
      const firstInvoiceId = (invoices as any[])[0].id;
      const lineItems = await db.getLineItems(firstInvoiceId);
      lineItemsCount = (lineItems as any[]).length;
    }

    return NextResponse.json({
      success: true,
      message: 'API is working correctly',
      data: {
        database_connected: true,
        customers_count: (customers as any[]).length,
        invoices_count: (invoices as any[]).length,
        sample_line_items_count: lineItemsCount
      },
      endpoints: {
        customers: '/api/customers',
        invoices: '/api/invoices',
        individual_invoice: '/api/invoices/[id]',
        invoice_status: '/api/invoices/[id]/status',
        line_items: '/api/invoices/[id]/line-items',
        individual_line_item: '/api/invoices/[id]/line-items/[lineItemId]'
      }
    });
  } catch (error) {
    console.error('API test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'API test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}