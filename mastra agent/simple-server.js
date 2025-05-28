const http = require('http');
const url = require('url');

console.log('Starting simple currency server...');

// Basit döviz çevirme fonksiyonu
function convertCurrency(amount, fromCurrency, toCurrency) {
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
}

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  
  if (req.method === 'POST' && parsedUrl.pathname === '/tools/0/convert_currency') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { amount, from_currency, to_currency } = data;
        
        console.log(`Converting ${amount} ${from_currency} to ${to_currency}`);
        
        if (!amount || !from_currency || !to_currency) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing required parameters' }));
          return;
        }
        
        const result = convertCurrency(amount, from_currency, to_currency);
        
        console.log('Conversion result:', result);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        
      } catch (error) {
        console.error('Conversion error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else if (req.method === 'GET' && parsedUrl.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'OK', 
      message: 'Currency Agent Server is running',
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = 3003;
server.listen(PORT, () => {
  console.log(`🚀 Currency Agent Server running on http://localhost:${PORT}`);
  console.log(`💱 Currency endpoint: http://localhost:${PORT}/tools/0/convert_currency`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});
