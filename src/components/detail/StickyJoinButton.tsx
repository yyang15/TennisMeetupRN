import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { Button } from '../Button';

type JoinState = 'join' | 'loading' | 'joined' | 'full' | 'host';

interface StickyJoinButtonProps {
  state: JoinState;
  onJoin: () => void;
  onLeave: () => void;
  onCancel?: () => void;
  onShare: () => void;
}

export function StickyJoinButton({ state, onJoin, onLeave, onCancel, onShare }: StickyJoinButtonProps) {
  const insets = useSafeAreaInsets();

  if (state === 'host') {
    return (
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.base) }]}>
        <Button
          title="Cancel Session"
          onPress={onCancel ?? (() => {})}
          variant="danger"
          size="lg"
          style={styles.button}
        />
        <Pressable onPress={onShare} style={styles.shareRow}>
          <Ionicons name="share-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.shareText}>Share Session</Text>
        </Pressable>
      </View>
    );
  }

  let title: string;
  let variant: 'primary' | 'secondary' | 'outline' | 'dangerOutline' = 'primary';
  let onPress: () => void;
  let disabled = false;
  let loading = false;

  switch (state) {
    case 'join':
      title = 'Join Session';
      variant = 'primary';
      onPress = onJoin;
      break;
    case 'loading':
      title = 'Join Session';
      variant = 'primary';
      onPress = () => {};
      loading = true;
      break;
    case 'joined':
      title = 'Leave Session';
      variant = 'dangerOutline';
      onPress = onLeave;
      break;
    case 'full':
      title = 'Session Full';
      variant = 'secondary';
      onPress = () => {};
      disabled = true;
      break;
  }

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.base) }]}>
      <Button
        title={title}
        onPress={onPress}
        variant={variant}
        size="lg"
        loading={loading}
        disabled={disabled}
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
