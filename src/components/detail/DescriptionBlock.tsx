import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, LayoutChangeEvent } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface DescriptionBlockProps {
  description: string;
}

const MAX_LINES = 3;
const LINE_HEIGHT = 22;

export function DescriptionBlock({ description }: DescriptionBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const measured = useRef(false);

  // Measure unclamped height on first layout, then clamp if needed
  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      if (measured.current) return;
      measured.current = true;
      const { height } = e.nativeEvent.layout;
      if (height > LINE_HEIGHT * MAX_LINES + 2) {
        setNeedsTruncation(true);
      }
    },
    []
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>About this session</Text>

      {/* Render unclamped until measured, then apply numberOfLines */}
      <Text
        style={styles.description}
        numberOfLines={needsTruncation && !expanded ? MAX_LINES : undefined}
        onLayout={onLayout}
      >
        {description}
      </Text>

      {needsTruncation && (
        <Pressable onPress={() => setExpanded((prev) => !prev)}>
          <Text style={styles.toggle}>
            {expanded ? 'Show less' : 'Show more'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: LINE_HEIGHT,
  },
  toggle: {
    ...typography.captionMedium,
    color: colors.accent,
    paddingTop: spacing.xs,
  },
});
