import React, { useState, useCallback, useEffect } from 'react';
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
import { ContactHostRow } from '../components/detail/ContactHostRow';
import { StickyJoinButton } from '../components/detail/StickyJoinButton';
import { Toast } from '../components/Toast';
import { useSessions } from '../context/SessionContext';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionDetail'>;

export function SessionDetailScreen({ route, navigation }: Props) {
  const { sessionId } = route.params;
  const { getSession, joinSession, leaveSession, cancelSession, isUserJoined, user } = useSessions();
  const session = getSession(sessionId);
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  }, []);

  const joined = isUserJoined(sessionId);
  const isFull = session ? session.players.length >= session.totalSpots : false;
  const isHost = user && session ? session.hostId === user.id : false;

  useEffect(() => {
    if (!session) {
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.replace('Discover');
    }
  }, [session, navigation]);

  const handleJoin = useCallback(async () => {
    setLoading(true);
    try {
      await joinSession(sessionId);
      showToast('Joined session 🎾');
    } finally {
      setLoading(false);
    }
  }, [joinSession, sessionId, showToast]);

  const handleLeave = useCallback(async () => {
    Alert.alert(
      'Leave Session',
      'Are you sure? Your spot may be taken by someone else.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await leaveSession(sessionId);
              showToast('Left session');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [leaveSession, sessionId]);

  const handleCancel = useCallback(() => {
    Alert.alert(
      'Cancel Session',
      'This will remove the session for all participants. Are you sure?',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Cancel Session',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await cancelSession(sessionId);
            } catch {
              // cancelSession already shows error alert
              setLoading(false);
              return;
            }
            setLoading(false);
            if (navigation.canGoBack()) navigation.goBack();
          },
        },
      ]
    );
  }, [cancelSession, sessionId, navigation]);

  const handleShare = useCallback(() => {
    Alert.alert('Share', 'Sharing coming soon!');
  }, []);

  if (!session) return null;

  const buttonState = loading ? 'loading' : isHost ? 'host' : joined ? 'joined' : isFull ? 'full' : 'join';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Toast
        message={toastMessage}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />

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
          title={session.title}
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

        <ContactHostRow
          contactMethod={session.hostContactMethod}
          contactValue={session.hostContactValue}
        />

        <DescriptionBlock description={session.description} />
      </ScrollView>

      <StickyJoinButton
        state={buttonState}
        onJoin={handleJoin}
        onLeave={handleLeave}
        onCancel={handleCancel}
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
