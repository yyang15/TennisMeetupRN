import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider, useSessions } from './src/context/SessionContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme';

function AppContent() {
  const { isReady } = useSessions();

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <AppContent />
      </SessionProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
