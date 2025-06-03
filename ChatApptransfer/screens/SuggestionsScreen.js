import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SAMPLE_SUGGESTIONS = [
  {
    id: '1',
    title: 'USD/TRY Alım Önerisi',
    description: 'Dolar/TL paritesi 32.20 seviyesinden alım yapılabilir. Hedef: 33.50',
    type: 'AI Önerisi',
    author: 'Döviz Asistanı',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    likes: 15,
    category: 'Döviz',
    risk: 'Orta'
  },
  {
    id: '2',
    title: 'Altın Yatırım Fırsatı',
    description: 'Gram altın 2.750 TL seviyesinden alım yapılabilir. Uzun vadeli yatırım önerisi.',
    type: 'Kullanıcı Önerisi',
    author: 'YatırımcıAli',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    likes: 8,
    category: 'Emtia',
    risk: 'Düşük'
  },
  {
    id: '3',
    title: 'EUR/USD Paritesi',
    description: 'Euro/Dolar paritesi 1.05 seviyesinden satış yapılabilir. Kısa vadeli işlem.',
    type: 'AI Önerisi',
    author: 'Döviz Asistanı',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    likes: 12,
    category: 'Döviz',
    risk: 'Yüksek'
  }
];

const EXAMPLE_SUGGESTIONS = [
  '100 dolar almalı mıyım?',
  'Altın fiyatları düşer mi?',
  'Euro yatırımı nasıl?',
  'Bitcoin alım zamanı mı?',
  'Hangi dövizi önerirsin?'
];

export default function SuggestionsScreen() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSuggestion, setNewSuggestion] = useState('');

  const fetchSuggestions = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuggestions(SAMPLE_SUGGESTIONS);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      Alert.alert('Hata', 'Öneriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSuggestions();
  };

  const askAI = async (question) => {
    try {
      const response = await fetch('http://192.168.43.38:4111/api/agents/0/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `${question} Kısa öneri ver.`
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

        const aiResponse = data.text || data.content || data.message || '';
        
        if (aiResponse) {
          const newSuggestion = {
            id: Date.now().toString(),
            title: question,
            description: aiResponse,
            type: 'AI Önerisi',
            author: 'Döviz Asistanı',
            createdAt: new Date(),
            likes: 0,
            category: 'AI',
            risk: 'Değişken'
          };

          setSuggestions(prev => [newSuggestion, ...prev]);
          Alert.alert('Başarılı', 'AI önerisi eklendi!');
        }
      }
    } catch (error) {
      console.error('Error asking AI:', error);
      Alert.alert('Hata', 'AI önerisi alınırken bir hata oluştu.');
    }
  };

  const addUserSuggestion = () => {
    if (newSuggestion.trim()) {
      const suggestion = {
        id: Date.now().toString(),
        title: newSuggestion.trim(),
        description: 'Kullanıcı önerisi - detaylar için chat\'e sorun.',
        type: 'Kullanıcı Önerisi',
        author: 'Sen',
        createdAt: new Date(),
        likes: 0,
        category: 'Genel',
        risk: 'Bilinmiyor'
      };

      setSuggestions(prev => [suggestion, ...prev]);
      setNewSuggestion('');
      setModalVisible(false);
      Alert.alert('Başarılı', 'Öneriniz eklendi!');
    }
  };

  const getRiskColor = (risk) => {
    const colors = {
      'Düşük': '#4CAF50',
      'Orta': '#FF9800',
      'Yüksek': '#F44336',
      'Değişken': '#9C27B0',
      'Bilinmiyor': '#757575'
    };
    return colors[risk] || '#757575';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Döviz': '#2196F3',
      'Emtia': '#FF9800',
      'AI': '#9C27B0',
      'Genel': '#757575'
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

  const renderSuggestionCard = (item) => (
    <View key={item.id} style={styles.suggestionCard}>
      <View style={styles.suggestionHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.typeBadge, { 
            backgroundColor: item.type === 'AI Önerisi' ? '#9C27B0' : '#4CAF50' 
          }]}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
        <Text style={styles.timeAgo}>{formatTimeAgo(item.createdAt)}</Text>
      </View>
      
      <Text style={styles.suggestionTitle}>{item.title}</Text>
      <Text style={styles.suggestionDescription}>{item.description}</Text>
      
      <View style={styles.suggestionFooter}>
        <View style={styles.footerLeft}>
          <Text style={styles.author}>@{item.author}</Text>
          <View style={[styles.riskBadge, { backgroundColor: getRiskColor(item.risk) + '20' }]}>
            <Text style={[styles.riskText, { color: getRiskColor(item.risk) }]}>
              Risk: {item.risk}
            </Text>
          </View>
        </View>
        <View style={styles.likesContainer}>
          <Ionicons name="heart-outline" size={16} color="#666" />
          <Text style={styles.likesText}>{item.likes}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
        <Text style={styles.loadingText}>Öneriler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="bulb" size={24} color="white" />
        <Text style={styles.headerTitle}>Yatırım Önerileri</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.actionButtonText}>Öneri Ekle</Text>
        </TouchableOpacity>
      </View>

      {/* Example Questions */}
      <View style={styles.examplesContainer}>
        <Text style={styles.examplesTitle}>AI'ya Sor:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {EXAMPLE_SUGGESTIONS.map((example, index) => (
            <TouchableOpacity
              key={index}
              style={styles.exampleChip}
              onPress={() => askAI(example)}
            >
              <Text style={styles.exampleText}>{example}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Suggestions List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.suggestionsContainer}>
          {suggestions.map(renderSuggestionCard)}
        </View>
      </ScrollView>

      {/* Add Suggestion Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Öneri Ekle</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Önerinizi yazın..."
              value={newSuggestion}
              onChangeText={setNewSuggestion}
              multiline
              maxLength={200}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={addUserSuggestion}
              >
                <Text style={styles.addButtonText}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#9C27B0',
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
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  examplesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  exampleChip: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  exampleText: {
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  suggestionsContainer: {
    padding: 16,
  },
  suggestionCard: {
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
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  typeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 12,
    color: '#666',
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  suggestionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  author: {
    fontSize: 12,
    color: '#999',
    marginRight: 12,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riskText: {
    fontSize: 10,
    fontWeight: '600',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#9C27B0',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
