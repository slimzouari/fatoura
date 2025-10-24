import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getCustomers } from '@/lib/utils';

export async function GET() {
  try {
    // Get customers from both database and config file
    const [dbCustomers, configCustomers] = await Promise.all([
      db.getCustomers(),
      getCustomers()
    ]);

    // Use config as source of truth, add any missing to database
    for (const configCustomer of configCustomers) {
      const existsInDb = (dbCustomers as any[]).find(db => db.id === configCustomer.id);
      if (!existsInDb) {
        await db.createCustomer({
          id: configCustomer.id,
          name: configCustomer.name,
          address: configCustomer.address || null,
          email: configCustomer.email,
          contractNumber: configCustomer.contractNumber || null,
          rule: configCustomer.rule,
          currency: configCustomer.currency
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: configCustomers
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}