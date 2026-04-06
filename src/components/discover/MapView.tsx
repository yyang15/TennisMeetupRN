import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import RNMapView, { Marker } from 'react-native-maps';
import { colors, spacing, radius } from '../../theme';
import { Session } from '../../data/mockSessions';

interface MapViewProps {
  sessions: Session[];
}

const COURT_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  'Green Lake Tennis Courts': { latitude: 47.6801, longitude: -122.3298 },
  'Volunteer Park Courts': { latitude: 47.6305, longitude: -122.3158 },
  'Bobby Morris Playfield': { latitude: 47.6171, longitude: -122.3204 },
  'Amy Yee Tennis Center': { latitude: 47.5900, longitude: -122.3106 },
  'Lower Woodland Courts': { latitude: 47.6655, longitude: -122.3440 },
  'Magnuson Park Courts': { latitude: 47.6817, longitude: -122.2582 },
  'Rainier Beach Playfield': { latitude: 47.5109, longitude: -122.2689 },
};

const SEATTLE_CENTER = { latitude: 47.6362, longitude: -122.3121 };

const SESSION_TYPE_COLORS: Record<string, string> = {
  singles: colors.sessionType.singles,
  doubles: colors.sessionType.doubles,
  hitting: colors.sessionType.hitting,
  coaching: colors.sessionType.coaching,
};

export function MapView({ sessions }: MapViewProps) {
  const markers = useMemo(() => {
    const seen = new Set<string>();
    return sessions
      .map((s) => {
        const coords = COURT_COORDINATES[s.courtName];
        if (!coords || seen.has(s.courtName)) return null;
        seen.add(s.courtName);
        return { ...s, coords };
      })
      .filter(Boolean) as (Session & { coords: { latitude: number; longitude: number } })[];
  }, [sessions]);

  const region = useMemo(() => {
    if (markers.length === 0) return { ...SEATTLE_CENTER, latitudeDelta: 0.12, longitudeDelta: 0.12 };
    const lats = markers.map((m) => m.coords.latitude);
    const lons = markers.map((m) => m.coords.longitude);
    const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const midLon = (Math.min(...lons) + Math.max(...lons)) / 2;
    const deltaLat = Math.max(0.05, (Math.max(...lats) - Math.min(...lats)) * 1.5);
    const deltaLon = Math.max(0.05, (Math.max(...lons) - Math.min(...lons)) * 1.5);
    return { latitude: midLat, longitude: midLon, latitudeDelta: deltaLat, longitudeDelta: deltaLon };
  }, [markers]);

  return (
    <RNMapView
      style={styles.map}
      initialRegion={region}
      scrollEnabled={false}
      zoomEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
      userInterfaceStyle="dark"
      accessibilityLabel={`Map showing ${markers.length} tennis courts`}
    >
      {markers.map((m) => (
        <Marker
          key={m.id}
          coordinate={m.coords}
          title={m.courtName}
          description={`${m.sessionType} · ${m.time}`}
          pinColor={SESSION_TYPE_COLORS[m.sessionType] ?? colors.accent}
        />
      ))}
    </RNMapView>
  );
}

const styles = StyleSheet.create({
  map: {
    height: 160,
    borderRadius: radius.md,
    marginHorizontal: spacing.base,
    overflow: 'hidden',
  },
});
