import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  Text,
  ListRenderItem,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

export function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>();

  const filteredSessions = useMemo(() => {
    if (activeFilter === 'All') return mockSessions;
    return mockSessions.filter(
      (s) => s.sessionType === activeFilter.toLowerCase()
    );
  }, [activeFilter]);

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
        <SessionCard session={item} onJoin={handleJoin} />
      </View>
    ),
    [handleJoin]
  );

  const keyExtractor = useCallback((item: Session) => item.id, []);

  const ListHeader = useMemo(
    () => (
      <>
        {/* Map */}
        <MapView sessions={filteredSessions} selectedSessionId={selectedSessionId} />

        {/* Filter chips */}
        <View style={styles.filterSection}>
          <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </View>

        {/* Section header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Sessions</Text>
          <Text style={styles.sectionCount}>{filteredSessions.length} available</Text>
        </View>
      </>
    ),
    [filteredSessions, selectedSessionId, activeFilter]
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
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    paddingBottom: 100,
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
