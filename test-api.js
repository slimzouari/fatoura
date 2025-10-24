#!/usr/bin/env node

const https = require('http');

async function testAPI() {
  console.log('Testing Fatoura API endpoints...\n');

  try {
    // Test the test endpoint
    const response = await fetch('http://localhost:3000/api/test');
    const data = await response.json();
    
    console.log('✅ API Test Endpoint:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n');

    // Test customers endpoint
    console.log('Testing /api/customers...');
    const customersResponse = await fetch('http://localhost:3000/api/customers');
    const customersData = await customersResponse.json();
    
    console.log('✅ Customers API:');
    console.log(JSON.stringify(customersData, null, 2));
    console.log('\n');

    // Test invoices endpoint
    console.log('Testing /api/invoices...');
    const invoicesResponse = await fetch('http://localhost:3000/api/invoices');
    const invoicesData = await invoicesResponse.json();
    
    console.log('✅ Invoices API:');
    console.log(JSON.stringify(invoicesData, null, 2));
    console.log('\n');

  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
  }
}

testAPI();