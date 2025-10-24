import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { generateInvoicePDF } from '@/lib/pdf';
import { pdfStorage } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params;
    
    // Get invoice data
    const invoice = await db.getInvoiceById(invoiceId);
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Get customer data
    const customersResult = await db.getCustomers();
    const customers = customersResult as any[];
    const customer = customers.find((c: any) => c.id === invoice.customer_id);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get line items
    const lineItemsResult = await db.getLineItemsByInvoiceId(invoiceId);
    const lineItems = lineItemsResult as any[];

    // Prepare data for PDF generation
    const invoiceData = {
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      invoiceDate: invoice.invoice_date,
      dueDate: invoice.due_date,
      billingMonth: invoice.billing_month,
      billingYear: invoice.billing_year,
      purchaseNumber: invoice.purchase_number,
      extra: invoice.extra,
      total: invoice.total,
      status: invoice.status,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        address: customer.address,
        zipCode: customer.zipCode,
        city: customer.city,
        rule: customer.rule,
        ratePerHour: customer.ratePerHour
      },
      lineItems: lineItems.map(item => ({
        id: item.id,
        date: item.date,
        description: item.description,
        dailyRevenue: item.daily_revenue,
        compensationPercentage: item.compensation_percentage,
        compensationAmount: item.compensation_amount,
        duration: item.duration,
        ratePerHour: item.rate_per_hour,
        total: item.total
      }))
    };

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData);

    // Save PDF to storage
    try {
      await pdfStorage.savePDF(
        pdfBuffer, 
        customer.id, 
        invoiceData.billingYear, 
        invoiceData.invoiceNumber
      );
    } catch (storageError) {
      console.warn('Failed to save PDF to storage:', storageError);
      // Continue anyway - we can still serve the PDF
    }

    // Return PDF with proper headers
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="factuur-${invoice.invoice_number}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}