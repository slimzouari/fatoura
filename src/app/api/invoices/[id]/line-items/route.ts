import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { generateUniqueId } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params;
    const lineItems = await db.getLineItems(invoiceId);

    return NextResponse.json({
      success: true,
      data: lineItems
    });
  } catch (error) {
    console.error('Error getting line items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get line items' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params;
    const body = await request.json();

    // Validate required fields - description is optional and will be auto-generated if missing
    // No required fields for line items as they can be minimal

    // Get invoice and customer details for calculation
    const invoices = await db.getInvoices();
    const invoice = (invoices as any[]).find(inv => inv.id === invoiceId);

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Get customer
    const customers = await db.getCustomers();
    const customer = (customers as any[]).find(c => c.id === invoice.customer_id);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Calculate line item totals based on customer type
    let lineItem: any = {
      id: generateUniqueId(),
      invoice_id: invoiceId,
      date: body.date || new Date().toISOString().split('T')[0],
      description: body.description || 'Factuur regel'
    };

    if (customer.rule === 'hourly') {
      lineItem.duration = body.duration || '0:00';
      lineItem.rate_per_hour = body.rate_per_hour || customer.hourly_rate || 0;
      
      // Calculate total from duration and rate
      const [hours, minutes] = lineItem.duration.split(':').map(Number);
      const totalHours = hours + (minutes / 60);
      lineItem.total = Math.round(totalHours * lineItem.rate_per_hour * 100) / 100;
    } else if (customer.rule === 'omzet') {
      lineItem.daily_revenue = parseFloat(body.daily_revenue || 0);
      
      // Calculate omzet percentage based on amount
      let percentage;
      if (lineItem.daily_revenue < 1000) {
        percentage = 35;
      } else if (lineItem.daily_revenue < 1500) {
        percentage = 40;
      } else {
        percentage = 45;
      }
      
      lineItem.compensation_percentage = percentage;
      lineItem.compensation_amount = Math.round((lineItem.daily_revenue * percentage) / 100 * 100) / 100;
      lineItem.total = lineItem.compensation_amount;
    }

    await db.createLineItem(lineItem);

    // Recalculate invoice totals
    const allLineItems = await db.getLineItems(invoiceId);
    const lineItemsTotal = (allLineItems as any[]).reduce((sum, item) => {
      const itemTotal = parseFloat(item.total) || 0;
      return sum + itemTotal;
    }, 0);

    // Include extra costs in the total
    const finalTotal = lineItemsTotal + parseFloat(invoice.extra || 0);

    await db.updateInvoice(invoiceId, {
      total: finalTotal
    });

    return NextResponse.json({
      success: true,
      data: lineItem
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating line item:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { success: false, error: 'Failed to create line item', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}