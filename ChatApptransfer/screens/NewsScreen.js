import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SAMPLE_NEWS = [
  {
    id: '1',
    title: 'Merkez Bankası Faiz Kararı Açıklandı',
    summary: 'TCMB, politika faizini %50 seviyesinde sabit tutma kararı aldı.',
    url: 'https://www.aa.com.tr/tr/ekonomi',
    source: 'Anadolu Ajansı',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 saat önce
    category: 'Ekonomi'
  },
  {
    id: '2',
    title: 'Dolar/TL Kurunda Son Durum',
    summary: 'Amerikan doları Türk lirası karşısında günü 32.45 seviyesinde tamamladı.',
    url: 'https://www.bloomberg.com/europe',
    source: 'Bloomberg',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 saat önce
    category: 'Döviz'
  },
  {
    id: '3',
    title: 'Altın Fiyatlarında Yükseliş Sürüyor',
    summary: 'Ons altın 2.650 dolar seviyesini test ederken, gram altın 2.800 TL\'yi aştı.',
    url: 'https://www.investing.com',
    source: 'Investing.com',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 saat önce
    category: 'Emtia'
  },
  {
    id: '4',
    title: 'Kripto Para Piyasasında Hareketlilik',
    summary: 'Bitcoin 95.000 dolar seviyesini test ederken, Ethereum da yükselişte.',
    url: 'https://www.coindesk.com',
    source: 'CoinDesk',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 saat önce
    category: 'Kripto'
  },
  {
    id: '5',
    title: 'Borsa İstanbul Günü Yükselişle Kapattı',
    summary: 'BIST 100 endeksi %1.2 artışla 10.250 puanın üzerinde kapandı.',
    url: 'https://www.borsaistanbul.com',
    source: 'Borsa İstanbul',
    publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 saat önce
    category: 'Borsa'
  }
];

export default function NewsScreen() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = async () => {
    try {
      // Gerçek API entegrasyonu için placeholder
      // Şimdilik örnek veriler kullanıyoruz
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
      setNews(SAMPLE_NEWS);
    } catch (error) {
      console.error('Error fetching news:', error);
      Alert.alert('Hata', 'Haberler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  const openNewsUrl = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Hata', 'Bu bağlantı açılamıyor.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Bağlantı açılırken bir hata oluştu.');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Ekonomi': '#2196F3',
      'Döviz': '#4CAF50',
      'Emtia': '#FF9800',
      'Kripto': '#9C27B0',
      'Borsa': '#F44336'
    };
    return colors[category] || '#757575';
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes} dakika önce`;
    } else if (diffInHours < 24) {
      return `${diffInHours} saat önce`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} gün önce`;
    }
  };

  const renderNewsCard = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.newsCard}
      onPress={() => openNewsUrl(item.url)}
    >
      <View style={styles.newsHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.timeAgo}>{formatTimeAgo(item.publishedAt)}</Text>
      </View>
      
      <Text style={styles.newsTitle}>{item.title}</Text>
      <Text style={styles.newsSummary}>{item.summary}</Text>
      
      <View style={styles.newsFooter}>
        <Text style={styles.newsSource}>{item.source}</Text>
        <Ionicons name="open-outline" size={16} color="#666" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Haberler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="newspaper" size={24} color="white" />
        <Text style={styles.headerTitle}>Finansal Haberler</Text>
      </View>

      {/* News List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.newsContainer}>
          {news.map(renderNewsCard)}
        </View>
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
    backgroundColor: '#FF5722',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  newsContainer: {
    padding: 16,
  },
  newsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 12,
    color: '#666',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  newsSummary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsSource: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
});
