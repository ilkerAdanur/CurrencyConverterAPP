import { createTool } from '@mastra/core';
import { z } from 'zod';
import { convertCurrencyViaMcp } from '../mcp/currency-mcp';

// MCP Currency Converter Tool
export const currencyConverterTool = createTool({
  id: 'convert_currency',
  description: 'Convert currency amounts using real-time exchange rates via MCP server',
  inputSchema: z.object({
    amount: z.number().positive().describe('The amount to convert'),
    from_currency: z.string().length(3).describe('Source currency code (e.g., USD, EUR, TRY)'),
    to_currency: z.string().length(3).describe('Target currency code (e.g., USD, EUR, TRY)'),
  }),
  outputSchema: z.object({
    converted_amount: z.number().optional(),
    exchange_rate: z.number().optional(),
    from_currency: z.string().optional(),
    to_currency: z.string().optional(),
    original_amount: z.number().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context, input }) => {
    try {
      // Parameters come in context, not input
      const params = input || context;

      // Call the currency conversion API
      const result = await convertCurrencyViaMcp(
        params.amount,
        params.from_currency,
        params.to_currency
      );

      // Return the result
      return result;
    } catch (error) {
      console.error('Currency conversion error:', error);
      return {
        error: `Currency conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  },
});

export const tools = [currencyConverterTool];
