import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DiscoverScreen } from './src/screens/DiscoverScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <DiscoverScreen />
    </SafeAreaProvider>
  );
}
