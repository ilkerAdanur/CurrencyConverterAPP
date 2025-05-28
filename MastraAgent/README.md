# Currency Exchange Agent with MCP Integration

Bu proje, Mastra framework kullanarak Model Context Protocol (MCP) ile entegre edilmiş bir döviz çevirme ajanı içerir. Agent, gerçek zamanlı döviz kurları kullanarak para birimi dönüşümleri yapabilir.

## Özellikler

- 🌍 **Gerçek Zamanlı Döviz Kurları**: MCP sunucusu üzerinden canlı döviz kurlarına erişim
- 💱 **Çoklu Para Birimi Desteği**: USD, EUR, TRY, GBP, JPY ve daha fazlası
- 🤖 **Akıllı Agent**: Doğal dil ile etkileşim kurabilir
- 🔧 **MCP Entegrasyonu**: Model Context Protocol ile güvenli ve verimli veri alışverişi
- 📊 **Detaylı Sonuçlar**: Dönüştürülen miktar, döviz kuru ve açıklamalar

## Kurulum

1. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **Ortam değişkenlerini ayarlayın:**
   `.env` dosyasında OpenAI API anahtarınızı kontrol edin:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   ```

## Kullanım

### Agent ile Etkileşim

Currency Exchange Agent ile doğal dil kullanarak etkileşim kurabilirsiniz:

```typescript
import { mastra } from './src/mastra';

const agent = mastra.getAgent('Currency Exchange Agent');

const result = await agent.generate([
  {
    role: 'user',
    content: '100 USD kaç TL eder?'
  }
]);

console.log(result.text);
```

### Örnek Sorgular

- "100 USD to EUR"
- "1000 TL kaç dolar eder?"
- "What's the current EUR to GBP exchange rate?"
- "Convert 500 CAD to JPY"
- "50 İngiliz Sterlini kaç Türk Lirası?"

### Demo Çalıştırma

Örnek kullanımları görmek için demo dosyasını çalıştırın:

```bash
npx tsx src/examples/currency-demo.ts
```

## MCP Server Detayları

Bu proje aşağıdaki MCP sunucusunu kullanır:
- **URL**: `https://server.smithery.ai/@ilkerAdanur/mcp-server-second-demo`
- **Tool**: `convert_currency`
- **API**: exchangerate-api.com

### Desteklenen Para Birimleri

- USD (US Dollar)
- EUR (Euro)
- TRY (Turkish Lira)
- GBP (British Pound)
- JPY (Japanese Yen)
- CAD (Canadian Dollar)
- AUD (Australian Dollar)
- CHF (Swiss Franc)
- CNY (Chinese Yuan)
- Ve daha fazlası...

## Proje Yapısı

```
src/
├── mastra/
│   ├── agents/
│   │   └── currency-agent.ts    # Döviz çevirme ajanı
│   ├── tools/
│   │   └── index.ts             # MCP entegre araçlar
│   ├── mcp/
│   │   └── currency-mcp.ts      # MCP sunucu konfigürasyonu
│   └── index.ts                 # Ana Mastra konfigürasyonu
├── examples/
│   └── currency-demo.ts         # Kullanım örnekleri
└── ...
```

## API Referansı

### Currency Converter Tool

```typescript
{
  id: 'convert_currency',
  inputSchema: {
    amount: number,           // Dönüştürülecek miktar
    from_currency: string,    // Kaynak para birimi (3 harf, örn: USD)
    to_currency: string       // Hedef para birimi (3 harf, örn: EUR)
  },
  outputSchema: {
    converted_amount?: number,    // Dönüştürülen miktar
    exchange_rate?: number,       // Kullanılan döviz kuru
    from_currency?: string,       // Kaynak para birimi
    to_currency?: string,         // Hedef para birimi
    original_amount?: number,     // Orijinal miktar
    error?: string               // Hata mesajı (varsa)
  }
}
```

## Geliştirme

### Yeni Para Birimi Desteği Ekleme

MCP sunucusu otomatik olarak desteklenen para birimlerini belirler. Yeni para birimleri için ISO 4217 standart kodlarını kullanın.

### Hata Ayıklama

Hata ayıklama için konsol loglarını kontrol edin:

```bash
npm run dev
```

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Destek

Sorularınız için issue açabilir veya dokümentasyonu inceleyebilirsiniz.
