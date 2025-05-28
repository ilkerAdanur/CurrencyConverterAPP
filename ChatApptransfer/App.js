import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Merhaba! Ben döviz çevirme asistanınızım. Size nasıl yardımcı olabilirim?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');

  const callCurrencyAgent = async (message) => {
    try {
      // Doğrudan agent'a mesaj gönder
      const response = await fetch('http://192.168.43.38:4111/api/agents/0/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: message }]
        }),
      });

      // Önce response text'ini alalım
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, response: ${responseText}`);
      }

      // JSON parse etmeyi deneyelim
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return `Sunucu yanıtı JSON formatında değil. Yanıt: ${responseText.substring(0, 200)}...`;
      }

      if (data.error) {
        return `Hata: ${data.error}`;
      }

      // Agent'ın yanıtını al
      const agentResponse = data.text || data.content || data.message || data.response || '';

      if (agentResponse) {
        return agentResponse;
      }

      return 'Üzgünüm, agenttan bir yanıt alamadım.';
    } catch (error) {
      console.error('Agent API error:', error);

      // Network hatası mı kontrol et
      if (error.message.includes('Network request failed')) {
        return `Ağ bağlantısı hatası: Agent sunucusuna erişilemiyor.\n\nLütfen şunları kontrol edin:\n1. Agent sunucusu çalışıyor mu?\n2. IP adresi doğru mu? (192.168.43.38:4111)\n3. Firewall engelliyor mu?`;
      }

      return `Bağlantı hatası: ${error.message}`;
    }
  };

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage = inputText;
    const newMessage = {
      id: Date.now().toString(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputText('');

    // Yükleniyor mesajı ekle
    const loadingMessage = {
      id: (Date.now() + 1).toString(),
      text: 'Düşünüyorum...',
      sender: 'bot',
      timestamp: new Date(),
      isLoading: true
    };
    setMessages(prevMessages => [...prevMessages, loadingMessage]);

    try {
      // Döviz agent'ını çağır
      const agentResponse = await callCurrencyAgent(userMessage);

      // Yükleniyor mesajını kaldır ve gerçek yanıtı ekle
      setMessages(prevMessages => {
        const filtered = prevMessages.filter(msg => !msg.isLoading);
        return [...filtered, {
          id: (Date.now() + 2).toString(),
          text: agentResponse,
          sender: 'bot',
          timestamp: new Date()
        }];
      });
    } catch (error) {
      // Hata durumunda yükleniyor mesajını kaldır ve hata mesajı ekle
      setMessages(prevMessages => {
        const filtered = prevMessages.filter(msg => !msg.isLoading);
        return [...filtered, {
          id: (Date.now() + 2).toString(),
          text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
          sender: 'bot',
          timestamp: new Date()
        }];
      });
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessage : styles.botMessage,
      item.isLoading && styles.loadingMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.sender === 'user' ? styles.userMessageText : styles.botMessageText,
        item.isLoading && styles.loadingText
      ]}>
        {item.text}
      </Text>
      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💱 Döviz Çevirme Asistanı</Text>
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Örn: 100 dolar kaç TL?"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendMessage}
            disabled={inputText.trim() === ''}
          >
            <Text style={styles.sendButtonText}>Gönder</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 16,
    alignItems: 'center',
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
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginVertical: 4,
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#2196F3',
    alignSelf: 'flex-end',
    marginLeft: '20%',
  },
  botMessage: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    marginRight: '20%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: 'white',
  },
  botMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingMessage: {
    opacity: 0.7,
  },
  loadingText: {
    fontStyle: 'italic',
  },
});
