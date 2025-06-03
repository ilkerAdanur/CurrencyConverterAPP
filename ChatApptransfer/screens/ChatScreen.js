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
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
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

      try {
        const data = JSON.parse(responseText);
        console.log('Parsed data:', data);
        
        // Farklı response formatlarını kontrol et
        if (data.text) {
          return data.text;
        } else if (data.content) {
          return data.content;
        } else if (data.response) {
          return data.response;
        } else if (data.message) {
          return data.message;
        } else if (typeof data === 'string') {
          return data;
        } else {
          console.log('Unexpected response format:', data);
          return 'Yanıt alındı ancak format beklenmedik.';
        }
      } catch (parseError) {
        console.log('JSON parse error, treating as plain text:', parseError);
        return responseText || 'Boş yanıt alındı.';
      }

    } catch (error) {
      console.error('Agent call error:', error);
      throw new Error(`Agent çağrısı başarısız: ${error.message}`);
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
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="chatbubbles" size={24} color="white" />
        <Text style={styles.headerTitle}>Döviz Asistanı</Text>
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
            style={[styles.sendButton, inputText.trim() === '' && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={inputText.trim() === ''}
          >
            <Ionicons name="send" size={20} color="white" />
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
    backgroundColor: '#4CAF50',
    padding: 16,
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
    backgroundColor: '#4CAF50',
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
  loadingMessage: {
    backgroundColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  botMessageText: {
    color: '#333',
  },
  loadingText: {
    fontStyle: 'italic',
    color: '#666',
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
    marginTop: 4,
    alignSelf: 'flex-end',
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
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});
