import { db } from '../src/lib/database';
import fs from 'fs/promises';
import path from 'path';

interface Customer {
  id: string;
  name: string;
  address?: string;
  email: string;
  contractNumber?: string;
  rule: 'omzet' | 'hourly';
  currency: string;
}

async function getCustomers(): Promise<Customer[]> {
  try {
    const customersPath = path.join(process.cwd(), 'config', 'customers.json');
    const data = await fs.readFile(customersPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading customers config:', error);
    return [];
  }
}

async function initializeDatabase() {
  try {
    console.log('🌱 Starting database initialization...');
    
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
    
    // Test database operations
    console.log('\n🧪 Testing database operations...');
    const allCustomers = await db.getCustomers();
    console.log(`📊 Total customers in database: ${(allCustomers as any[]).length}`);
    
    const allInvoices = await db.getInvoices();
    console.log(`📄 Total invoices in database: ${(allInvoices as any[]).length}`);
    
    console.log('\n🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await db.disconnect();
  }
}

// Run initialization
initializeDatabase()
  .then(() => {
    console.log('Database initialization finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });