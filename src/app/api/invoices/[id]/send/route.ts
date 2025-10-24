import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { generateInvoicePDF } from '@/lib/pdf';
import { emailService } from '@/lib/email';
import { pdfStorage } from '@/lib/storage';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params;
    const body = await request.json();
    const { customMessage } = body;
    
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

    // Validate customer email
    if (!customer.email) {
      return NextResponse.json(
        { error: 'Customer email not found' },
        { status: 400 }
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
      lineItems: lineItems.map((item: any) => ({
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

    // Try to get existing PDF from storage first
    let pdfBuffer: Buffer;
    try {
      if (pdfStorage.pdfExists(customer.id, invoiceData.billingYear, invoiceData.invoiceNumber)) {
        pdfBuffer = await pdfStorage.readPDF(customer.id, invoiceData.billingYear, invoiceData.invoiceNumber);
      } else {
        // Generate new PDF
        pdfBuffer = await generateInvoicePDF(invoiceData);
        
        // Save to storage for future use
        try {
          await pdfStorage.savePDF(pdfBuffer, customer.id, invoiceData.billingYear, invoiceData.invoiceNumber);
        } catch (storageError) {
          console.warn('Failed to save PDF to storage:', storageError);
        }
      }
    } catch (error) {
      // If storage fails, generate PDF anyway
      pdfBuffer = await generateInvoicePDF(invoiceData);
    }

    // Prepare email data
    const emailData = {
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceDate: invoiceData.invoiceDate,
      dueDate: invoiceData.dueDate,
      total: invoiceData.total,
      billingYear: invoiceData.billingYear
    };

    // Send email
    await emailService.sendInvoiceEmail(emailData, pdfBuffer, customMessage);

    // Update invoice status to 'sent' if it was 'draft'
    if (invoice.status === 'draft') {
      await db.updateInvoice(invoiceId, { status: 'sent' });
    }

    return NextResponse.json({
      success: true,
      message: 'Factuur succesvol verzonden',
      sentTo: customer.email
    });

  } catch (error) {
    console.error('Error sending invoice:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Failed to send email')) {
        return NextResponse.json(
          { error: 'Email kon niet worden verzonden. Controleer de SMTP configuratie.' },
          { status: 500 }
        );
      }
      if (error.message.includes('PDF generation failed')) {
        return NextResponse.json(
          { error: 'PDF kon niet worden gegenereerd.' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het verzenden van de factuur' },
      { status: 500 }
    );
  }
}