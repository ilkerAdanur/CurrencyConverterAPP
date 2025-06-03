import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import NewsScreen from './screens/NewsScreen';
import SuggestionsScreen from './screens/SuggestionsScreen';
import ChatScreen from './screens/ChatScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Ana Sayfa') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Haberler') {
              iconName = focused ? 'newspaper' : 'newspaper-outline';
            } else if (route.name === 'Öneriler') {
              iconName = focused ? 'bulb' : 'bulb-outline';
            } else if (route.name === 'Chat') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
          tabBarStyle: {
            paddingBottom: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        })}
      >
        <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
        <Tab.Screen name="Haberler" component={NewsScreen} />
        <Tab.Screen name="Öneriler" component={SuggestionsScreen} />
        <Tab.Screen name="Chat" component={ChatScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
