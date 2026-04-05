import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ListRenderItem,
  RefreshControl,
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
import { FilterOption, Session } from '../data/mockSessions';
import { useSessions } from '../context/SessionContext';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Discover'>;

function ItemSeparator() {
  return <View style={styles.separator} />;
}

export function DiscoverScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { sortedSessions, refreshSessions, user } = useSessions();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshSessions();
    } finally {
      setRefreshing(false);
    }
  }, [refreshSessions]);

  const filteredSessions = useMemo(() => {
    if (activeFilter === 'All') return sortedSessions;
    if (activeFilter === 'Mine') {
      return sortedSessions.filter((s) =>
        user ? s.players.some((p) => p.id === user.id) || s.hostId === user.id : false
      );
    }
    return sortedSessions.filter(
      (s) => s.sessionType === activeFilter.toLowerCase()
    );
  }, [activeFilter, sortedSessions, user]);

  const handleCardPress = useCallback(
    (session: Session) => {
      navigation.navigate('SessionDetail', { sessionId: session.id });
    },
    [navigation]
  );

  const handleCreateSession = useCallback(() => {
    navigation.navigate('CreateSession');
  }, [navigation]);

  const renderSessionCard: ListRenderItem<Session> = useCallback(
    ({ item }) => (
      <View style={styles.cardWrapper}>
        <SessionCard
          session={item}
          onPress={() => handleCardPress(item)}
        />
      </View>
    ),
    [handleCardPress]
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
          <Text style={styles.sectionTitle}>
            {activeFilter === 'Mine' ? 'My Sessions' : 'Nearby Sessions'}
          </Text>
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
        <Text style={styles.emptyTitle}>
          {activeFilter === 'Mine' ? 'No sessions yet' : 'No sessions found'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {activeFilter === 'Mine'
            ? 'Join or create a session to see it here'
            : 'Try changing filters or create your own session'}
        </Text>
      </View>
    ),
    [activeFilter]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      <TopBar location={user?.location ?? 'Seattle, WA'} notificationCount={0} />

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
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
  listContent: {},
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
