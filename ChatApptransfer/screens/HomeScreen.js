import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const POPULAR_CURRENCIES = [
  { code: 'USD', name: 'Amerikan Doları', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'İngiliz Sterlini', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japon Yeni', flag: '🇯🇵' },
  { code: 'CAD', name: 'Kanada Doları', flag: '🇨🇦' },
  { code: 'AUD', name: 'Avustralya Doları', flag: '🇦🇺' }
];

export default function HomeScreen({ navigation }) {
  const [exchangeRates, setExchangeRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchExchangeRates = async () => {
    try {
      const rates = {};

      // MCP Agent üzerinden gerçek zamanlı kurları al
      for (const currency of POPULAR_CURRENCIES) {
        try {
          // Agent'a kısa döviz kuru sorgusu gönder (token tasarrufu için)
          const response = await fetch('http://192.168.43.38:4111/api/agents/0/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [{
                role: 'user',
                content: `${currency.code} to TRY rate?`
              }]
            }),
          });

          if (response.ok) {
            const responseText = await response.text();
            let data;
            try {
              data = JSON.parse(responseText);
            } catch {
              data = { text: responseText };
            }

            const agentResponse = data.text || data.content || data.message || '';

            // Agent yanıtından sayısal değeri çıkar
            const rateMatch = agentResponse.match(/[\d,]+\.?\d*/);
            const rate = rateMatch ? parseFloat(rateMatch[0].replace(',', '')) : null;

            if (rate && rate > 0) {
              // Önceki kur ile karşılaştır
              const previousRate = exchangeRates[currency.code]?.rate;
              let change = 'neutral';
              let changePercent = '0.00';

              if (previousRate) {
                const diff = rate - previousRate;
                const percent = (diff / previousRate) * 100;
                change = diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral';
                changePercent = Math.abs(percent).toFixed(2);
              }

              rates[currency.code] = {
                rate: rate,
                change: change,
                changePercent: changePercent
              };
            } else {
              throw new Error('Invalid rate from agent');
            }
          }
        } catch (error) {
          console.log(`Error fetching ${currency.code}:`, error);
          // Fallback to static rates if API fails
          const staticRates = {
            'USD': 32.50, 'EUR': 35.30, 'GBP': 41.25,
            'JPY': 0.22, 'CAD': 24.15, 'AUD': 21.80
          };
          rates[currency.code] = {
            rate: staticRates[currency.code] || 1,
            change: 'neutral',
            changePercent: '0.00'
          };
        }
      }

      setExchangeRates(rates);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      Alert.alert('Hata', 'Döviz kurları alınırken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExchangeRates();

    // 30 saniyede bir otomatik güncelleme
    const interval = setInterval(() => {
      fetchExchangeRates();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchExchangeRates();
  };

  const renderCurrencyCard = (currency) => {
    const rate = exchangeRates[currency.code];
    if (!rate) return null;

    const changeColor = rate.change === 'up' ? '#4CAF50' : 
                       rate.change === 'down' ? '#F44336' : '#757575';
    const changeIcon = rate.change === 'up' ? 'trending-up' : 
                       rate.change === 'down' ? 'trending-down' : 'remove';

    return (
      <View key={currency.code} style={styles.currencyCard}>
        <View style={styles.currencyHeader}>
          <Text style={styles.currencyFlag}>{currency.flag}</Text>
          <View style={styles.currencyInfo}>
            <Text style={styles.currencyCode}>{currency.code}</Text>
            <Text style={styles.currencyName}>{currency.name}</Text>
          </View>
        </View>
        
        <View style={styles.rateInfo}>
          <Text style={styles.rateValue}>₺{rate.rate.toFixed(2)}</Text>
          <View style={[styles.changeContainer, { backgroundColor: changeColor + '20' }]}>
            <Ionicons name={changeIcon} size={16} color={changeColor} />
            <Text style={[styles.changeText, { color: changeColor }]}>
              {rate.changePercent}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Döviz kurları yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💱 Döviz Kurları</Text>
        <Text style={styles.headerSubtitle}>Anlık Kurlar</Text>
      </View>

      {/* Currency Rates */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.ratesContainer}>
          {POPULAR_CURRENCIES.map(renderCurrencyCard)}
        </View>

        {/* Last Updated */}
        {lastUpdated && (
          <Text style={styles.lastUpdated}>
            Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR', {
              timeZone: 'Europe/Istanbul',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })} (TR)
          </Text>
        )}


      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  ratesContainer: {
    padding: 16,
  },
  currencyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  currencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencyFlag: {
    fontSize: 32,
    marginRight: 12,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  currencyName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  rateInfo: {
    alignItems: 'flex-end',
  },
  rateValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  lastUpdated: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 16,
    marginBottom: 20,
  },

});
