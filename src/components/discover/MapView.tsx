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
      {/* Placeholder map background */}
      <View style={styles.mapBg}>
        <View style={styles.gridLine} />
        <View style={[styles.gridLine, styles.gridLineH]} />
      </View>

      {/* Session pins */}
      {sessions.map((session, index) => {
        const typeColor = colors.sessionType[session.sessionType];
        const top = 20 + ((index * 37) % 60);
        const left = 15 + ((index * 53) % 70);

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

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.sessionType.singles }]} />
          <Text style={styles.legendText}>Singles</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.sessionType.doubles }]} />
          <Text style={styles.legendText}>Doubles</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.sessionType.hitting }]} />
          <Text style={styles.legendText}>Hitting</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.sessionType.coaching }]} />
          <Text style={styles.legendText}>Coaching</Text>
        </View>
      </View>

      {/* Map placeholder text */}
      <View style={styles.placeholder}>
        <Ionicons name="map-outline" size={20} color={colors.textTertiary} />
        <Text style={styles.placeholderText}>Map View</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 180,
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
  legend: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: 'rgba(14, 17, 22, 0.8)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
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
