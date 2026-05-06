import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../theme';
import { DotBadge } from '../Badge';

interface TopBarProps {
  location: string;
  notificationCount: number;
  onBellPress?: () => void;
  onProfilePress?: () => void;
}

export function TopBar({ location, notificationCount, onBellPress, onProfilePress }: TopBarProps) {
  return (
    <View style={styles.container}>
      {/* Left: Location pill */}
      <Pressable style={styles.locationPill}>
        <Text style={styles.locationIcon}>📍</Text>
        <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">{location}</Text>
        <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
      </Pressable>

      {/* Center: Title */}
      <Text style={styles.title}>Discover</Text>

      {/* Right: Profile + Notification */}
      <View style={styles.rightIcons}>
        <Pressable style={styles.iconButton} onPress={onProfilePress} accessibilityLabel="Profile" accessibilityRole="button">
          <Ionicons name="person-circle-outline" size={24} color={colors.textPrimary} />
        </Pressable>
        <Pressable style={styles.iconButton} onPress={onBellPress} accessibilityLabel={`Notifications, ${notificationCount} new`} accessibilityRole="button">
          <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
          <DotBadge count={notificationCount} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    gap: spacing.xs,
    flex: 1,
    maxWidth: 150,
  },
  locationIcon: {
    fontSize: 14,
  },
  locationText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '500',
    flexShrink: 1,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
    justifyContent: 'flex-end',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
