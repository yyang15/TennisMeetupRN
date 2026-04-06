import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Avatar } from '../Avatar';

interface HostRowProps {
  hostName: string;
}

export function HostRow({ hostName }: HostRowProps) {
  return (
    <View style={styles.container}>
      <Avatar name={hostName} size="lg" />

      <View style={styles.info}>
        <Text style={styles.name}>{hostName}</Text>
        <Text style={styles.label}>Host</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
