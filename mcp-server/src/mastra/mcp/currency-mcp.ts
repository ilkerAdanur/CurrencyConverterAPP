import { MCPClient } from '@mastra/mcp';

// MCP Client configuration for currency conversion
export const currencyMcpClient = new MCPClient({
  servers: {
    'currency-converter': {
      url: 'https://server.smithery.ai/@ilkerAdanur/mcp-server-second-demo',
    }
  }
});

// Function to call the currency conversion API directly
export async function convertCurrencyViaMcp(
  amount: number,
  fromCurrency: string,
  toCurrency: string
) {
  try {
    console.log(`Converting ${amount} ${fromCurrency} to ${toCurrency}`);

    // Use exchangerate-api.com directly for now
    const apiUrl = `https://api.exchangerate-api.com/v4/latest/${fromCurrency.toUpperCase()}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`);
    }

    const data = await response.json();
    const rate = data.rates[toCurrency.toUpperCase()];

    if (!rate) {
      throw new Error(`Exchange rate not found for ${toCurrency}`);
    }

    const convertedAmount = amount * rate;

    return {
      converted_amount: convertedAmount,
      exchange_rate: rate,
      from_currency: fromCurrency.toUpperCase(),
      to_currency: toCurrency.toUpperCase(),
      original_amount: amount,
    };
  } catch (error) {
    console.error('Currency conversion error:', error);
    throw new Error(`Failed to convert currency: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
