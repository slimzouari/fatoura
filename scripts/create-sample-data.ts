import { db } from '../src/lib/database';

async function createSampleInvoice() {
  try {
    console.log('📄 Creating sample invoice...');
    
    // Sample invoice data
    const invoiceId = 'inv_' + Date.now();
    const currentDate = new Date();
    const dueDate = new Date(currentDate);
    dueDate.setDate(currentDate.getDate() + 30);
    
    const invoice = {
      id: invoiceId,
      invoiceNumber: 'CUST001-2025-' + (Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0'),
      invoiceDate: currentDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      billingMonth: 10,
      billingYear: 2025,
      purchaseNumber: 'PO-2025-001',
      extra: 50.00,
      total: 1250.00,
      status: 'draft',
      customerId: 'CUST001'
    };
    
    await db.createInvoice(invoice);
    console.log('✅ Sample invoice created:', invoice.invoiceNumber);
    
    // Create sample line items
    const lineItem1 = {
      id: 'li_' + Date.now() + '_1',
      invoiceId: invoiceId,
      date: '2025-10-01',
      dailyRevenue: 1200.00,
      compensationPercentage: 40.00,
      compensationAmount: 480.00,
      duration: null,
      ratePerHour: null,
      total: 480.00
    };
    
    const lineItem2 = {
      id: 'li_' + Date.now() + '_2',
      invoiceId: invoiceId,
      date: '2025-10-15',
      dailyRevenue: 1800.00,
      compensationPercentage: 45.00,
      compensationAmount: 810.00,
      duration: null,
      ratePerHour: null,
      total: 810.00
    };
    
    await db.createLineItem(lineItem1);
    await db.createLineItem(lineItem2);
    console.log('✅ Sample line items created');
    
    // Test retrieval
    const allInvoices = await db.getInvoices();
    console.log(`📊 Total invoices in database: ${(allInvoices as any[]).length}`);
    
    const lineItems = await db.getLineItems(invoiceId);
    console.log(`📋 Line items for invoice: ${(lineItems as any[]).length}`);
    
    console.log('\n🎉 Sample data creation completed!');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    throw error;
  } finally {
    await db.disconnect();
  }
}

// Run sample data creation
createSampleInvoice()
  .then(() => {
    console.log('Sample data creation finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Sample data creation failed:', error);
    process.exit(1);
  });