import { mastra } from '../mastra';

async function runCurrencyDemo() {
  console.log('🚀 Starting Currency Exchange Agent Demo...\n');

  try {
    // Get the currency agent
    const agent = mastra.getAgent('Currency Exchange Agent');

    if (!agent) {
      throw new Error('Currency Exchange Agent not found');
    }

    // Example 1: Convert USD to EUR
    console.log('💱 Example 1: Converting 100 USD to EUR');
    const result1 = await agent.generate([
      {
        role: 'user',
        content: 'Convert 100 USD to EUR'
      }
    ]);
    console.log('Response:', result1.text);
    console.log('---\n');

    // Example 2: Convert TRY to USD
    console.log('💱 Example 2: Converting 1000 TRY to USD');
    const result2 = await agent.generate([
      {
        role: 'user',
        content: 'How much is 1000 Turkish Lira in US Dollars?'
      }
    ]);
    console.log('Response:', result2.text);
    console.log('---\n');

    // Example 3: Get exchange rate
    console.log('💱 Example 3: Getting EUR to GBP exchange rate');
    const result3 = await agent.generate([
      {
        role: 'user',
        content: 'What is the current exchange rate from EUR to GBP?'
      }
    ]);
    console.log('Response:', result3.text);
    console.log('---\n');

    // Example 4: Multiple currency conversion
    console.log('💱 Example 4: Converting 500 CAD to JPY');
    const result4 = await agent.generate([
      {
        role: 'user',
        content: 'Convert 500 Canadian Dollars to Japanese Yen'
      }
    ]);
    console.log('Response:', result4.text);

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo
runCurrencyDemo();

export { runCurrencyDemo };
