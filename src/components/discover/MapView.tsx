import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, spacing, radius } from '../../theme';
import { Session } from '../../data/mockSessions';
import { COURT_COORDINATES } from '../../data/courtCoordinates';

interface MapViewProps {
  sessions: Session[];
  userLat?: number | null;
  userLon?: number | null;
}

const TYPE_COLORS: Record<string, string> = {
  singles: colors.sessionType.singles,
  doubles: colors.sessionType.doubles,
  hitting: colors.sessionType.hitting,
  coaching: colors.sessionType.coaching,
};

export function MapView({ sessions, userLat, userLon }: MapViewProps) {
  const html = useMemo(() => {
    const markers: { lat: number; lon: number; color: string; name: string; type: string; time: string }[] = [];
    const seen = new Set<string>();

    for (const s of sessions) {
      const coords = COURT_COORDINATES[s.courtName];
      if (!coords || seen.has(s.courtName)) continue;
      seen.add(s.courtName);
      markers.push({
        lat: coords[0],
        lon: coords[1],
        color: TYPE_COLORS[s.sessionType] ?? colors.accent,
        name: s.courtName,
        type: s.sessionType,
        time: s.time,
      });
    }

    const center = userLat && userLon
      ? `[${userLat}, ${userLon}]`
      : markers.length > 0
      ? `[${markers.reduce((a, m) => a + m.lat, 0) / markers.length}, ${markers.reduce((a, m) => a + m.lon, 0) / markers.length}]`
      : '[47.6362, -122.3121]';

    const markerJs = markers.map((m) => `
      L.circleMarker([${m.lat}, ${m.lon}], {
        radius: 8,
        fillColor: '${m.color}',
        color: '#000',
        weight: 1,
        opacity: 0.6,
        fillOpacity: 0.9
      }).addTo(map).bindPopup('<b>${m.name.replace(/'/g, "\\'")}</b><br>${m.type} · ${m.time}');
    `).join('\n');

    return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
  <style>
    * { margin: 0; padding: 0; }
    #map { width: 100%; height: 100vh; }
    .leaflet-control-attribution { display: none !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      center: ${center},
      zoom: ${markers.length > 1 ? 12 : 13},
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);
    ${markerJs}
  <\/script>
</body>
</html>`;
  }, [sessions]);

  return (
    <WebView
      style={styles.map}
      source={{ html }}
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      javaScriptEnabled
      originWhitelist={['*']}
      accessibilityLabel="Map showing tennis sessions"
    />
  );
}

const styles = StyleSheet.create({
  map: {
    height: 160,
    borderRadius: radius.md,
    marginHorizontal: spacing.base,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
});
