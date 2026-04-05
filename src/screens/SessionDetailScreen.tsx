import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Alert, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing } from '../theme';
import { HeaderImage } from '../components/detail/HeaderImage';
import { InfoBlock } from '../components/detail/InfoBlock';
import { HostRow } from '../components/detail/HostRow';
import { PlayerAvatarList } from '../components/detail/PlayerAvatarList';
import { CostRow } from '../components/detail/CostRow';
import { DescriptionBlock } from '../components/detail/DescriptionBlock';
import { StickyJoinButton } from '../components/detail/StickyJoinButton';
import { mockSessions } from '../data/mockSessions';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionDetail'>;
type JoinState = 'default' | 'loading' | 'joined';

export function SessionDetailScreen({ route, navigation }: Props) {
  const { sessionId } = route.params;
  const session = mockSessions.find((s) => s.id === sessionId);
  const insets = useSafeAreaInsets();
  const [joinState, setJoinState] = useState<JoinState>('default');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Navigate back if session not found
  useEffect(() => {
    if (!session) navigation.goBack();
  }, [session, navigation]);

  // Reset join state if session changes
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setJoinState('default');
  }, [sessionId]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleJoin = useCallback(() => {
    if (joinState !== 'default') return;
    setJoinState('loading');
    timerRef.current = setTimeout(() => {
      setJoinState('joined');
      timerRef.current = null;
    }, 1200);
  }, [joinState]);

  const handleShare = useCallback(() => {
    Alert.alert('Share', 'Sharing coming soon!');
  }, []);

  if (!session) return null;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Pressable
        onPress={() => navigation.goBack()}
        style={[styles.backButton, { top: insets.top + spacing.sm }]}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
      </Pressable>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HeaderImage
          sessionType={session.sessionType}
          distance={session.distance}
        />

        <InfoBlock
          sessionType={session.sessionType}
          courtName={session.courtName}
          courtAddress={session.courtAddress}
          date={session.date}
          time={session.time}
          skillRange={session.skillRange}
        />

        <HostRow
          hostName={session.hostName}
          reliabilityScore={session.reliabilityScore}
        />

        <PlayerAvatarList
          players={session.players}
          totalSpots={session.totalSpots}
        />

        <CostRow cost={session.cost} />

        <DescriptionBlock description={session.description} />
      </ScrollView>

      <StickyJoinButton
        state={joinState}
        onJoin={handleJoin}
        onShare={handleShare}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  backButton: {
    position: 'absolute',
    left: spacing.base,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(14, 17, 22, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
