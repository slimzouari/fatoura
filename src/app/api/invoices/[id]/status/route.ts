import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['draft', 'submitted', 'completed', 'sent'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Get current invoice
    const invoices = await db.getInvoices();
    const invoice = (invoices as any[]).find(inv => inv.id === invoiceId);

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Validate status transitions
    const currentStatus = invoice.status;
    const isValidTransition = validateStatusTransition(currentStatus, status);

    if (!isValidTransition) {
      return NextResponse.json(
        { success: false, error: `Cannot change status from ${currentStatus} to ${status}` },
        { status: 400 }
      );
    }

    // Special handling for status changes
    const updates: any = { status };

    // If changing back to draft, remove PDF link
    if (status === 'draft' && currentStatus !== 'draft') {
      updates.link_to_pdf = null;
    }

    await db.updateInvoice(invoiceId, updates);

    return NextResponse.json({
      success: true,
      data: {
        id: invoiceId,
        previousStatus: currentStatus,
        newStatus: status,
        updates
      }
    });
  } catch (error) {
    console.error('Error updating invoice status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update invoice status' },
      { status: 500 }
    );
  }
}

function validateStatusTransition(currentStatus: string, newStatus: string): boolean {
  const transitions: Record<string, string[]> = {
    'draft': ['submitted'],
    'submitted': ['draft', 'completed', 'sent'],
    'completed': [], // Final state
    'sent': [] // Final state
  };

  return transitions[currentStatus]?.includes(newStatus) || false;
}