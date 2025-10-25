import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, lineItemId: string }> }
) {
  try {
    const { id: invoiceId, lineItemId } = await params;

    const lineItem = await db.getLineItem(lineItemId);

    if (!lineItem || (lineItem as any).invoice_id !== invoiceId) {
      return NextResponse.json(
        { success: false, error: 'Line item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: lineItem
    });
  } catch (error) {
    console.error('Error getting line item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get line item' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, lineItemId: string }> }
) {
  try {
    const { id: invoiceId, lineItemId } = await params;
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['description'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

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
    let updatedLineItem: any = {
      description: body.description
    };

    if (customer.rule === 'hourly') {
      updatedLineItem.duration = body.duration || '0:00';
      updatedLineItem.rate_per_hour = body.rate_per_hour || customer.hourly_rate || 0;
      
      // Calculate total from duration and rate
      const [hours, minutes] = updatedLineItem.duration.split(':').map(Number);
      const totalHours = hours + (minutes / 60);
      updatedLineItem.total = Math.round(totalHours * updatedLineItem.rate_per_hour * 100) / 100;
    } else if (customer.rule === 'omzet') {
      updatedLineItem.daily_revenue = parseFloat(body.daily_revenue || 0);
      
      // Calculate omzet percentage based on amount
      let percentage;
      if (updatedLineItem.daily_revenue < 1000) {
        percentage = 35;
      } else if (updatedLineItem.daily_revenue < 1500) {
        percentage = 40;
      } else {
        percentage = 45;
      }
      
      updatedLineItem.compensation_percentage = percentage;
      updatedLineItem.compensation_amount = Math.round((updatedLineItem.daily_revenue * percentage) / 100 * 100) / 100;
      updatedLineItem.total = updatedLineItem.compensation_amount;
    }

    await db.updateLineItem(lineItemId, updatedLineItem);

    // Recalculate invoice totals
    const allLineItems = await db.getLineItems(invoiceId);
    const totalAmount = (allLineItems as any[]).reduce((sum, item) => sum + item.total, 0);

    await db.updateInvoice(invoiceId, {
      total: totalAmount
    });

    // Get updated line item
    const updated = await db.getLineItem(lineItemId);

    return NextResponse.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Error updating line item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update line item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, lineItemId: string }> }
) {
  try {
    const { id: invoiceId, lineItemId } = await params;

    // Check if line item exists and belongs to this invoice
    const lineItem = await db.getLineItem(lineItemId);

    if (!lineItem || (lineItem as any).invoice_id !== invoiceId) {
      return NextResponse.json(
        { success: false, error: 'Line item not found' },
        { status: 404 }
      );
    }

    await db.deleteLineItem(lineItemId);

    // Recalculate invoice totals
    const allLineItems = await db.getLineItems(invoiceId);
    const totalAmount = (allLineItems as any[]).reduce((sum, item) => sum + item.total, 0);

    await db.updateInvoice(invoiceId, {
      total: totalAmount
    });

    return NextResponse.json({
      success: true,
      message: 'Line item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting line item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete line item' },
      { status: 500 }
    );
  }
}