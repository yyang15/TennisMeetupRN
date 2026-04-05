import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, typography } from '../theme';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  name: string;
  size?: AvatarSize;
  imageUrl?: string;
  style?: ViewStyle;
}

const sizeMap: Record<AvatarSize, number> = {
  sm: 28,
  md: 36,
  lg: 48,
};

const fontSizeMap: Record<AvatarSize, number> = {
  sm: 11,
  md: 14,
  lg: 18,
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const hues = ['#4DACFF', '#A6FF4D', '#FFC857', '#C084FC', '#FF6B6B', '#4ECDC4'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hues[Math.abs(hash) % hues.length];
}

export function Avatar({ name, size = 'md', style }: AvatarProps) {
  const dim = sizeMap[size];
  const bgColor = getAvatarColor(name);

  return (
    <View
      style={[
        styles.base,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          backgroundColor: bgColor,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { fontSize: fontSizeMap[size] }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.bg,
    fontWeight: '700',
  },
});
