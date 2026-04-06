import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../theme';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Avatar } from '../Avatar';
import { useAnimatedPress } from '../../hooks/useAnimatedPress';
import { Session } from '../../data/mockSessions';
import { useSessions } from '../../context/SessionContext';
import { formatDate } from '../../data/dateUtils';

interface SessionCardProps {
  session: Session;
  onPress?: () => void;
}

function getTypeColor(type: Session['sessionType']): string {
  return colors.sessionType[type];
}

function getPlayerSummary(session: Session): string {
  if (session.players.length === 0) return 'No players yet';
  const firstName = session.players[0].name.split(' ')[0];
  const others = session.players.length - 1;
  if (others === 0) return firstName;
  return `${firstName} + ${others} ${others === 1 ? 'other' : 'others'}`;
}

export function SessionCard({ session, onPress }: SessionCardProps) {
  const { animatedStyle, handlePressIn, handlePressOut } = useAnimatedPress(0.98);
  const { user } = useSessions();

  const spotsLeft = session.totalSpots - session.players.length;
  const isFull = spotsLeft <= 0;
  const isJoined = user ? session.players.some((p) => p.id === user.id) : false;
  const spotsUrgent = spotsLeft <= 2 && spotsLeft > 0;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Card style={styles.card}>
          <View style={styles.content}>
            {/* Left: Info */}
            <View style={styles.infoSection}>
              {/* Top row: Title + Skill badge */}
              <View style={styles.topRow}>
                <View style={styles.timeBlock}>
                  {session.title ? (
                    <Text style={styles.sessionTitle} numberOfLines={1}>{session.title}</Text>
                  ) : null}
                  <Text style={styles.time}>{formatDate(session.date).toUpperCase()} {session.time}</Text>
                </View>
                <Badge label={session.skillRange} variant="accent" />
              </View>

              {/* Middle: Court + Distance */}
              <View style={styles.middleRow}>
                <View style={styles.courtRow}>
                  <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.courtName} numberOfLines={1}>
                    {session.courtName}
                  </Text>
                </View>
                <Text style={styles.distance}>{session.distance}</Text>
              </View>

              {/* Bottom: Spots + Players + Reliability */}
              <View style={styles.bottomRow}>
                <View style={styles.spotsContainer}>
                  {isFull ? (
                    <Text style={styles.fullText}>Full</Text>
                  ) : (
                    <>
                      <View
                        style={[
                          styles.spotsDot,
                          { backgroundColor: spotsUrgent ? colors.warning : colors.success },
                        ]}
                      />
                      <Text
                        style={[
                          styles.spotsText,
                          spotsUrgent && { color: colors.warning },
                        ]}
                      >
                        {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
                      </Text>
                    </>
                  )}
                </View>

                <View style={styles.hostInfo}>
                  <Text style={styles.playerSummary}>{getPlayerSummary(session)}</Text>
                  <Avatar name={session.hostName} size="sm" />
                </View>
              </View>
            </View>

            {/* Right: Status */}
            <View style={styles.joinSection}>
              <View
                style={[
                  styles.typePip,
                  { backgroundColor: getTypeColor(session.sessionType) },
                ]}
              />
              {isJoined ? (
                <View style={styles.joinedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.accent} />
                  <Text style={styles.joinedText}>Joined</Text>
                </View>
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textTertiary}
                />
              )}
            </View>
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
  },
  content: {
    flexDirection: 'row',
  },
  infoSection: {
    flex: 1,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingRight: spacing.md,
  },
  timeBlock: {
    gap: 2,
    flex: 1,
  },
  sessionTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  time: {
    ...typography.timeLarge,
    color: colors.textPrimary,
  },
  playerSummary: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: spacing.md,
  },
  courtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  courtName: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  distance: {
    ...typography.captionMedium,
    color: colors.accent,
    marginLeft: spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: spacing.md,
  },
  spotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  spotsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  spotsText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  fullText: {
    ...typography.captionMedium,
    color: colors.textTertiary,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  joinSection: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  typePip: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  joinedBadge: {
    alignItems: 'center',
    gap: 2,
  },
  joinedText: {
    ...typography.caption,
    color: colors.accent,
    fontSize: 10,
  },
});
