import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../theme';
import { Badge } from '../Badge';
import { SessionType } from '../../data/mockSessions';

interface InfoBlockProps {
  sessionType: SessionType;
  courtName: string;
  courtAddress: string;
  date: string;
  time: string;
  skillRange: string;
}

const typeLabels: Record<SessionType, string> = {
  singles: 'Singles Match',
  doubles: 'Doubles Match',
  hitting: 'Hitting Session',
  coaching: 'Coaching Session',
};

export function InfoBlock({
  sessionType,
  courtName,
  courtAddress,
  date,
  time,
  skillRange,
}: InfoBlockProps) {
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>{typeLabels[sessionType]}</Text>

      {/* Court */}
      <View style={styles.row}>
        <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
        <View style={styles.rowText}>
          <Text style={styles.primaryText}>{courtName}</Text>
          <Text style={styles.secondaryText}>{courtAddress}</Text>
        </View>
      </View>

      {/* Date & Time */}
      <View style={styles.row}>
        <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
        <View style={styles.rowText}>
          <Text style={styles.primaryText}>
            {date} at {time}
          </Text>
        </View>
      </View>

      {/* Skill Range */}
      <View style={styles.row}>
        <Ionicons name="speedometer-outline" size={18} color={colors.textSecondary} />
        <Badge label={`NTRP ${skillRange}`} variant="accent" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
    gap: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  primaryText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  secondaryText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
