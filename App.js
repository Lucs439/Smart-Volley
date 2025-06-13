import React from 'react';
import { View } from 'react-native';
import WelcomeScreen from './src/screens/onboarding/WelcomeScreen';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <WelcomeScreen />
    </View>
  );
} 