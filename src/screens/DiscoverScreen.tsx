import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ListRenderItem,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, typography } from '../theme';
import { TopBar } from '../components/discover/TopBar';
import { FilterChips } from '../components/discover/FilterChips';
import { SessionCard } from '../components/discover/SessionCard';
import { MapView } from '../components/discover/MapView';
import { FloatingActionButton } from '../components/discover/FloatingActionButton';
import {
  mockSessions,
  FilterOption,
  Session,
} from '../data/mockSessions';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Discover'>;

function ItemSeparator() {
  return <View style={styles.separator} />;
}

export function DiscoverScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');

  const filteredSessions = useMemo(() => {
    if (activeFilter === 'All') return mockSessions;
    return mockSessions.filter(
      (s) => s.sessionType === activeFilter.toLowerCase()
    );
  }, [activeFilter]);

  const handleCardPress = useCallback(
    (session: Session) => {
      navigation.navigate('SessionDetail', { sessionId: session.id });
    },
    [navigation]
  );

  const handleJoin = useCallback((id: string) => {
    const session = mockSessions.find((s) => s.id === id);
    if (session) {
      Alert.alert(
        'Join Session',
        `Join ${session.sessionType} at ${session.courtName} at ${session.time}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Join', style: 'default' },
        ]
      );
    }
  }, []);

  const handleCreateSession = useCallback(() => {
    Alert.alert('Create Session', 'Session creation coming soon!');
  }, []);

  const renderSessionCard: ListRenderItem<Session> = useCallback(
    ({ item }) => (
      <View style={styles.cardWrapper}>
        <SessionCard
          session={item}
          onJoin={handleJoin}
          onPress={() => handleCardPress(item)}
        />
      </View>
    ),
    [handleJoin, handleCardPress]
  );

  const keyExtractor = useCallback((item: Session) => item.id, []);

  const ListHeader = useMemo(
    () => (
      <>
        <MapView sessions={filteredSessions} />

        <View style={styles.filterSection}>
          <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Sessions</Text>
          <Text style={styles.sectionCount}>{filteredSessions.length} available</Text>
        </View>
      </>
    ),
    [filteredSessions, activeFilter]
  );

  const ListEmpty = useMemo(
    () => (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🎾</Text>
        <Text style={styles.emptyTitle}>No sessions found</Text>
        <Text style={styles.emptySubtitle}>
          Try changing filters or create your own session
        </Text>
      </View>
    ),
    []
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      <TopBar location="Seattle, WA" notificationCount={3} />

      <FlatList
        data={filteredSessions}
        renderItem={renderSessionCard}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        ItemSeparatorComponent={ItemSeparator}
        showsVerticalScrollIndicator={false}
      />

      <FloatingActionButton onPress={handleCreateSession} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  listContent: {
    // paddingBottom set dynamically above
  },
  filterSection: {
    paddingVertical: spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  sectionCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  separator: {
    height: spacing.sm,
    marginHorizontal: spacing.base,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxxl,
    gap: spacing.sm,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  cardWrapper: {
    paddingHorizontal: spacing.base,
  },
});
