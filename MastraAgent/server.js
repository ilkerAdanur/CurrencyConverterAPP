import express from 'express';
import cors from 'cors';
import { mastra } from './src/mastra/index.ts';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Received message:', message);

    // Get the currency agent
    const agent = mastra.getAgent('Currency Exchange Agent');
    
    if (!agent) {
      return res.status(500).json({ error: 'Agent not found' });
    }

    // Generate response using the agent
    const response = await agent.generate(message);
    
    console.log('Agent response:', response);

    res.json({ 
      response: response.text || response.content || 'Üzgünüm, bir yanıt oluşturamadım.',
      success: true 
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'),
      success: false 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Currency Agent Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Currency Agent Server running on http://localhost:${PORT}`);
  console.log(`📱 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});
