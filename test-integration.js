// Test script for Apps Script integration
// Run with: node test-integration.js

const testIntegration = async () => {
  console.log('🧪 Testing Apps Script Integration...\n');

  // Test 1: Check environment variables
  console.log('1️⃣ Checking environment variables...');
  const gasUrl = process.env.GAS_URL;
  const gasKey = process.env.GAS_KEY;
  
  if (!gasUrl || gasUrl.includes('YOUR_SCRIPT_ID_HERE') || gasUrl.includes('YOUR_ACTUAL_SCRIPT_ID')) {
    console.log('❌ GAS_URL not configured. Please set your Apps Script URL in .env.local');
    return;
  }
  
  if (!gasKey) {
    console.log('❌ GAS_KEY not configured. Please set your API key in .env.local');
    return;
  }
  
  console.log('✅ Environment variables configured');
  console.log(`   GAS_URL: ${gasUrl}`);
  console.log(`   GAS_KEY: ${gasKey.substring(0, 10)}...\n`);

  // Test 2: Test Apps Script directly
  console.log('2️⃣ Testing Apps Script directly...');
  try {
    const response = await fetch(`${gasUrl}?key=${gasKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'Test scenario: Increase total ARR by $1M'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Apps Script responded successfully');
    console.log(`   Run ID: ${data.run_id}`);
    console.log(`   ARR Before: $${data.arr_before?.toLocaleString()}`);
    console.log(`   ARR After: $${data.arr_after?.toLocaleString()}`);
    console.log(`   ARR Delta: $${data.arr_delta?.toLocaleString()}\n`);

    // Test 3: Fetch VW deltas
    console.log('3️⃣ Testing VW deltas fetch...');
    const deltasResponse = await fetch(`${gasUrl}?resource=vw_deltas&run_id=${data.run_id}&key=${gasKey}`);
    
    if (deltasResponse.ok) {
      const deltasData = await deltasResponse.json();
      console.log('✅ VW deltas fetched successfully');
      console.log(`   Found ${deltasData.rows?.length || 0} delta records\n`);
    } else {
      console.log('⚠️  VW deltas fetch failed (this might be expected if no data exists)\n');
    }

    // Test 4: Test Next.js API
    console.log('4️⃣ Testing Next.js API...');
    const nextResponse = await fetch('http://localhost:3001/api/run-scenario', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'Test via Next.js: Increase total ARR by $2M'
      })
    });

    if (nextResponse.ok) {
      const nextData = await nextResponse.json();
      console.log('✅ Next.js API working correctly');
      console.log(`   Run ID: ${nextData.run_id}`);
      console.log(`   ARR Delta: $${nextData.arr_delta?.toLocaleString()}\n`);
    } else {
      const error = await nextResponse.text();
      console.log('❌ Next.js API failed:', error);
    }

    console.log('🎉 Integration test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start your Next.js dev server: npm run dev');
    console.log('2. Go to http://localhost:3001');
    console.log('3. Navigate to the Scenarios tab');
    console.log('4. Click "Run Scenario" and test with real prompts!');

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure your Apps Script is deployed as a web app');
    console.log('2. Check that the API key matches in both places');
    console.log('3. Verify the web app URL is correct');
    console.log('4. Ensure your Apps Script has the required functions');
  }
};

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testIntegration();
