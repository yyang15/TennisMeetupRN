import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { useAnimatedPress } from '../../hooks/useAnimatedPress';
import { Session } from '../../data/mockSessions';

interface SessionCardProps {
  session: Session;
  onJoin: (id: string) => void;
}

function getReliabilityColor(score: number): string {
  if (score >= 90) return colors.reliability.high;
  if (score >= 70) return colors.reliability.medium;
  return colors.reliability.low;
}

function getTypeColor(type: Session['sessionType']): string {
  return colors.sessionType[type];
}

export function SessionCard({ session, onJoin }: SessionCardProps) {
  const { animatedStyle, handlePressIn, handlePressOut } = useAnimatedPress(0.98);

  const reliabilityColor = getReliabilityColor(session.reliabilityScore);
  const spotsUrgent = session.spotsLeft <= 2;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Card style={styles.card}>
          <View style={styles.content}>
            {/* Left: Info */}
            <View style={styles.infoSection}>
              {/* Top row: Time + Skill badge */}
              <View style={styles.topRow}>
                <View style={styles.timeBlock}>
                  <Text style={styles.time}>{session.time}</Text>
                  <Text style={styles.date}>{session.date}</Text>
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

              {/* Bottom: Spots + Host + Reliability */}
              <View style={styles.bottomRow}>
                <View style={styles.spotsContainer}>
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
                    {session.spotsLeft} {session.spotsLeft === 1 ? 'spot' : 'spots'} left
                  </Text>
                </View>

                <View style={styles.hostInfo}>
                  <Avatar name={session.hostName} size="sm" />
                  <View style={styles.reliabilityContainer}>
                    {session.reliabilityScore < 70 && (
                      <Ionicons name="warning" size={12} color={colors.danger} />
                    )}
                    <Text style={[styles.reliability, { color: reliabilityColor }]}>
                      {session.reliabilityScore}%
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Right: Join button */}
            <View style={styles.joinSection}>
              <View
                style={[
                  styles.typePip,
                  { backgroundColor: getTypeColor(session.sessionType) },
                ]}
              />
              <Button
                title="JOIN"
                onPress={() => onJoin(session.id)}
                size="sm"
                style={styles.joinButton}
              />
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
  },
  time: {
    ...typography.timeLarge,
    color: colors.textPrimary,
  },
  date: {
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
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reliabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  reliability: {
    ...typography.captionMedium,
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
  joinButton: {
    minWidth: 64,
  },
});
