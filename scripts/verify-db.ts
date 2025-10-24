import { db } from '../src/lib/database';

async function verifyDatabase() {
  try {
    console.log('🔍 Verifying database setup...\n');
    
    // Check customers
    const customers = await db.getCustomers() as any[];
    console.log('👥 CUSTOMERS:');
    customers.forEach(customer => {
      console.log(`   ${customer.id}: ${customer.name} (${customer.rule})`);
    });
    console.log(`   Total: ${customers.length}\n`);
    
    // Check invoices
    const invoices = await db.getInvoices() as any[];
    console.log('📄 INVOICES:');
    for (const invoice of invoices) {
      console.log(`   ${invoice.invoice_number}: ${invoice.customer_name} - €${invoice.total} (${invoice.status})`);
      
      // Get line items for this invoice
      const lineItems = await db.getLineItems(invoice.id) as any[];
      console.log(`      Line items: ${lineItems.length}`);
      lineItems.forEach((item, index) => {
        if (item.daily_revenue) {
          console.log(`        ${index + 1}. ${item.date}: €${item.daily_revenue} (${item.compensation_percentage}%) = €${item.total}`);
        } else {
          console.log(`        ${index + 1}. ${item.date}: ${item.duration} @ €${item.rate_per_hour}/hr = €${item.total}`);
        }
      });
    }
    console.log(`   Total: ${invoices.length}\n`);
    
    console.log('✅ Database verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    throw error;
  } finally {
    await db.disconnect();
  }
}

// Run verification
verifyDatabase()
  .then(() => {
    console.log('Database verification finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database verification failed:', error);
    process.exit(1);
  });