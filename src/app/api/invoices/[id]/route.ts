import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;

    // Get invoice details
    const invoices = await db.getInvoices();
    const invoice = (invoices as any[]).find(inv => inv.id === invoiceId);

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Get line items
    const lineItems = await db.getLineItems(invoiceId);

    return NextResponse.json({
      success: true,
      data: {
        ...invoice,
        lineItems
      }
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    const body = await request.json();
    const { status, linkToPdf, ...otherUpdates } = body;

    const updates: any = {};
    
    if (status !== undefined) updates.status = status;
    if (linkToPdf !== undefined) updates.link_to_pdf = linkToPdf;
    if (otherUpdates.extra !== undefined) updates.extra = otherUpdates.extra;
    if (otherUpdates.total !== undefined) updates.total = otherUpdates.total;

    await db.updateInvoice(invoiceId, updates);

    return NextResponse.json({
      success: true,
      data: { id: invoiceId, ...updates }
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;

    // Note: Line items will be deleted automatically due to CASCADE constraint
    const invoices = await db.getInvoices();
    const invoice = (invoices as any[]).find(inv => inv.id === invoiceId);

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // In a real implementation, you'd have a delete method in your database client
    // For now, we'll return a success response
    return NextResponse.json({
      success: true,
      message: 'Invoice deletion not implemented yet'
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}