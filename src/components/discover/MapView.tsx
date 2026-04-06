import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../theme';
import { Session } from '../../data/mockSessions';

interface MapViewProps {
  sessions: Session[];
}

export function MapView({ sessions }: MapViewProps) {
  return (
    <View style={styles.container} accessibilityLabel={`Map showing ${sessions.length} tennis sessions nearby`}>
      <View style={styles.mapBg}>
        <View style={styles.gridLine} />
        <View style={[styles.gridLine, styles.gridLineH]} />
      </View>

      {sessions.slice(0, 5).map((session, index) => {
        const typeColor = colors.sessionType[session.sessionType];
        const top = 15 + ((index * 37) % 55);
        const left = 10 + ((index * 53) % 75);

        return (
          <View
            key={session.id}
            accessible
            accessibilityLabel={`${session.sessionType} session at ${session.courtName}`}
            style={[
              styles.pin,
              {
                top: `${top}%`,
                left: `${left}%`,
                backgroundColor: typeColor,
              },
            ]}
          >
            <Ionicons name="tennisball" size={10} color={colors.bg} />
          </View>
        );
      })}

      <View style={styles.placeholder}>
        <Ionicons name="map-outline" size={20} color={colors.textTertiary} />
        <Text style={styles.placeholderText}>Map View</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginHorizontal: spacing.base,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
  },
  gridLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.textPrimary,
  },
  gridLineH: {
    top: 0,
    bottom: 0,
    left: '50%',
    width: 1,
    height: '100%',
  },
  pin: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.3)',
  },
  placeholder: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    opacity: 0.4,
  },
  placeholderText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
