import { Customer, User } from '@/types';
import fs from 'fs/promises';
import path from 'path';

const CONFIG_DIR = path.join(process.cwd(), 'config');
const STORAGE_DIR = path.join(process.cwd(), 'storage', 'factuur');

export async function getCustomers(): Promise<Customer[]> {
  try {
    const customersPath = path.join(CONFIG_DIR, 'customers.json');
    const data = await fs.readFile(customersPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading customers config:', error);
    return [];
  }
}

export async function getUser(): Promise<User | null> {
  try {
    const userPath = path.join(CONFIG_DIR, 'user.json');
    const data = await fs.readFile(userPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading user config:', error);
    return null;
  }
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const customers = await getCustomers();
  return customers.find(customer => customer.id === id) || null;
}

export async function ensurePdfDirectory(customerId: string, year: number): Promise<string> {
  const dirPath = path.join(STORAGE_DIR, year.toString(), customerId);
  await fs.mkdir(dirPath, { recursive: true });
  return dirPath;
}

export function generateInvoiceNumber(customerId: string, year: number, month: number): string {
  const monthStr = month.toString().padStart(2, '0');
  return `${customerId}-${year}-${monthStr}`;
}

export function calculateDueDate(invoiceDate: Date): Date {
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + 30);
  return dueDate;
}

export function calculateOmzetCompensation(dailyRevenue: number): {
  percentage: number;
  amount: number;
} {
  let percentage: number;
  
  if (dailyRevenue < 1000) {
    percentage = 35;
  } else if (dailyRevenue < 1500) {
    percentage = 40;
  } else {
    percentage = 45;
  }
  
  const amount = (dailyRevenue * percentage) / 100;
  
  return {
    percentage,
    amount: Math.round(amount * 100) / 100 // Round to 2 decimal places
  };
}

export function calculateHourlyTotal(duration: string, ratePerHour: number): number {
  const [hours, minutes] = duration.split(':').map(Number);
  const totalHours = hours + (minutes / 60);
  return Math.round(totalHours * ratePerHour * 100) / 100; // Round to 2 decimal places
}

export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}