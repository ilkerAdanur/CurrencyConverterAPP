// Simple test for the currency agent
async function testCurrencyAgent() {
  try {
    console.log('🚀 Testing Currency Exchange Agent...\n');

    // First, let's list available agents
    console.log('📋 Listing available agents...');
    const agentsResponse = await fetch('http://localhost:4111/api/agents');
    const agents = await agentsResponse.json();
    console.log('Available agents:', Object.keys(agents));

    // Test API endpoint
    const response = await fetch('http://localhost:4111/api/agents/0/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Convert 1000 TRY to USD'
          }
        ]
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Agent Response:', result);
    } else {
      console.log('❌ Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCurrencyAgent();
