import { getCustomers, getUser } from '@/lib/utils';
import { db } from '@/lib/database';

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Create tables first
    await db.createTables();
    console.log('✅ Database tables created');
    
    // Load and insert customers from config
    const customers = await getCustomers();
    console.log(`📋 Found ${customers.length} customers in config`);
    
    for (const customer of customers) {
      try {
        await db.createCustomer({
          id: customer.id,
          name: customer.name,
          address: customer.address || null,
          email: customer.email,
          contractNumber: customer.contractNumber || null,
          rule: customer.rule,
          currency: customer.currency
        });
        console.log(`✅ Added customer: ${customer.name} (${customer.id})`);
      } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  Customer ${customer.id} already exists, skipping`);
        } else {
          console.error(`❌ Error adding customer ${customer.id}:`, error.message);
        }
      }
    }
    
    // Verify user config
    const user = await getUser();
    if (user) {
      console.log(`👤 User configured: ${user.name}`);
    } else {
      console.log('⚠️  No user configuration found');
    }
    
    console.log('🎉 Database seeding completed!');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Export for use as a standalone script
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding finished, closing connection...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}