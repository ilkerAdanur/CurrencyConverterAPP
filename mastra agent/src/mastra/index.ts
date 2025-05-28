
import { Mastra } from '@mastra/core';
import { LibSQLStore } from '@mastra/libsql';
import { currencyAgent } from './agents/currency-agent';
import { currencyMcpClient } from './mcp/currency-mcp';
import { tools } from './tools';

// Initialize storage
const storage = new LibSQLStore({
  url: ':memory:', // Use in-memory database for development
  // For production, you can use a file-based database:
  // url: 'file:./mastra.db'
});

export const mastra = new Mastra({
  agents: [currencyAgent],
  tools,
  mcpClients: [currencyMcpClient],
  storage,
});