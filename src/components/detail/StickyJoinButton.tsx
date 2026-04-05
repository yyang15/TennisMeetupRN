import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import { Button } from '../Button';

type JoinState = 'default' | 'loading' | 'joined';

interface StickyJoinButtonProps {
  state: JoinState;
  onJoin: () => void;
  onShare: () => void;
}

export function StickyJoinButton({ state, onJoin, onShare }: StickyJoinButtonProps) {
  const insets = useSafeAreaInsets();

  const buttonTitle =
    state === 'joined' ? 'Joined \u2713' : 'Join Session';

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.base) }]}>
      <Button
        title={buttonTitle}
        onPress={onJoin}
        variant={state === 'joined' ? 'secondary' : 'primary'}
        size="lg"
        loading={state === 'loading'}
        disabled={state === 'joined'}
        style={styles.button}
      />

      <Pressable onPress={onShare} style={styles.shareRow}>
        <Ionicons name="share-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.shareText}>Share Session</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    width: '100%',
  },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingTop: spacing.md,
  },
  shareText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
});
