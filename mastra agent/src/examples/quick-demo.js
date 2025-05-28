// Quick demo for the currency agent
async function quickDemo() {
  console.log('🚀 Currency Exchange Agent Demo\n');
  
  const tests = [
    'Convert 100 USD to EUR',
    'How much is 1000 TRY in USD?',
    'What is the current EUR to GBP exchange rate?',
    'Convert 500 CAD to JPY'
  ];

  for (let i = 0; i < tests.length; i++) {
    const query = tests[i];
    console.log(`💱 Test ${i + 1}: ${query}`);
    
    try {
      const response = await fetch('http://localhost:4111/api/agents/0/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: query
            }
          ]
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Response:', result.text);
      } else {
        console.log('❌ Error:', response.status);
      }
    } catch (error) {
      console.error('❌ Failed:', error.message);
    }
    
    console.log('---\n');
  }
}

quickDemo();
