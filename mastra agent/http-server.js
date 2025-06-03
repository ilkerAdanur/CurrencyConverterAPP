import express from 'express';
import cors from 'cors';
import https from 'https';

// Basit döviz çevirme fonksiyonu (sabit kurlar ile)
async function convertCurrency(amount, fromCurrency, toCurrency) {
  try {
    // Sabit döviz kurları (gerçek zamanlı API yerine)
    const exchangeRates = {
      'USD': { 'TRY': 32.50, 'EUR': 0.92, 'GBP': 0.79 },
      'EUR': { 'TRY': 35.30, 'USD': 1.09, 'GBP': 0.86 },
      'TRY': { 'USD': 0.031, 'EUR': 0.028, 'GBP': 0.024 },
      'GBP': { 'USD': 1.27, 'EUR': 1.16, 'TRY': 41.25 }
    };

    const fromCur = fromCurrency.toUpperCase();
    const toCur = toCurrency.toUpperCase();

    if (fromCur === toCur) {
      return {
        converted_amount: amount,
        exchange_rate: 1,
        from_currency: fromCur,
        to_currency: toCur,
        original_amount: amount,
      };
    }

    const rate = exchangeRates[fromCur]?.[toCur];

    if (!rate) {
      throw new Error(`Exchange rate not found for ${fromCur} to ${toCur}`);
    }

    const convertedAmount = amount * rate;

    return {
      converted_amount: convertedAmount,
      exchange_rate: rate,
      from_currency: fromCur,
      to_currency: toCur,
      original_amount: amount,
    };
  } catch (error) {
    console.error('Currency conversion error:', error);
    throw new Error(`Failed to convert currency: ${error.message}`);
  }
}

console.log('Starting currency server...');

const app = express();
const PORT = 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Currency conversion endpoint
app.post('/tools/0/convert_currency', async (req, res) => {
  try {
    const { amount, from_currency, to_currency } = req.body;

    console.log(`Converting ${amount} ${from_currency} to ${to_currency}`);

    if (!amount || !from_currency || !to_currency) {
      return res.status(400).json({
        error: 'Missing required parameters: amount, from_currency, to_currency'
      });
    }

    // Use the currency conversion function
    const result = await convertCurrency(amount, from_currency, to_currency);

    console.log('Conversion result:', result);

    res.json(result);

  } catch (error) {
    console.error('Currency conversion error:', error);
    res.status(500).json({
      error: 'Döviz çevirme hatası: ' + (error.message || 'Bilinmeyen hata'),
      success: false
    });
  }
});

// Chat endpoint for general conversation
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Received message:', message);

    // Simple response for now - in real implementation, this would use Mastra agent
    res.json({
      response: `Merhaba! Döviz çevirme konusunda size yardımcı olabilirim. Örneğin: "100 dolar kaç TL?" şeklinde sorabilirsiniz.`,
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
  res.json({
    status: 'OK',
    message: 'Mastra Currency Agent Server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
try {
  app.listen(PORT, () => {
    console.log(`🚀 Mastra Currency Agent Server running on http://localhost:${PORT}`);
    console.log(`💱 Currency endpoint: http://localhost:${PORT}/tools/0/convert_currency`);
    console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
    console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
  });
} catch (error) {
  console.error('Server start error:', error);
}
