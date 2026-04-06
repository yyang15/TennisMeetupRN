import * as Location from 'expo-location';

export interface NearbyCourt {
  name: string;
  address: string;
  distance: number;
}

export async function findNearbyCourts(): Promise<NearbyCourt[]> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const { latitude, longitude } = location.coords;

  const query = `
    [out:json][timeout:10];
    (
      node["sport"="tennis"](around:8000,${latitude},${longitude});
      way["sport"="tennis"](around:8000,${latitude},${longitude});
    );
    out center body;
  `;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) throw new Error('Failed to search for courts');

  const data = await response.json();

  // Parse raw elements with coordinates
  const rawCourts: { lat: number; lon: number; name?: string }[] = [];
  for (const el of data.elements ?? []) {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (!lat || !lon) continue;
    rawCourts.push({ lat, lon, name: el.tags?.name });
  }

  // Group courts within ~200m of each other into clusters
  const clusters = clusterByProximity(rawCourts, 0.002);

  // For each cluster, reverse-geocode the center to get a real address
  const results: NearbyCourt[] = [];
  const geocodeLimit = Math.min(clusters.length, 10);

  for (let i = 0; i < geocodeLimit; i++) {
    const cluster = clusters[i];
    const dist = haversine(latitude, longitude, cluster.lat, cluster.lon);

    // Use the OSM name if one exists in the cluster, otherwise reverse-geocode
    let name = cluster.name || '';
    let address = '';

    try {
      const [geo] = await Location.reverseGeocodeAsync({
        latitude: cluster.lat,
        longitude: cluster.lon,
      });
      if (geo) {
        address = [geo.streetNumber, geo.street, geo.city].filter(Boolean).join(' ');
        if (!name) {
          // Build a useful name from the address
          name = geo.name && geo.name !== geo.street
            ? geo.name
            : [geo.street, geo.city].filter(Boolean).join(', ') || 'Tennis Court';
        }
      }
    } catch {
      // Reverse geocode failed, use fallback
    }

    if (!name) name = 'Tennis Court';

    // Add court count if cluster has multiple
    const courtLabel = cluster.count > 1
      ? `${name} (${cluster.count} courts)`
      : name;

    results.push({ name: courtLabel, address, distance: dist });
  }

  return results.sort((a, b) => a.distance - b.distance);
}

interface Cluster {
  lat: number;
  lon: number;
  name?: string;
  count: number;
}

/** Group nearby points (within `threshold` degrees ~200m) into single locations */
function clusterByProximity(
  points: { lat: number; lon: number; name?: string }[],
  threshold: number
): Cluster[] {
  const used = new Set<number>();
  const clusters: Cluster[] = [];

  for (let i = 0; i < points.length; i++) {
    if (used.has(i)) continue;
    used.add(i);

    const cluster: Cluster = {
      lat: points[i].lat,
      lon: points[i].lon,
      name: points[i].name,
      count: 1,
    };

    for (let j = i + 1; j < points.length; j++) {
      if (used.has(j)) continue;
      const dLat = Math.abs(points[j].lat - cluster.lat);
      const dLon = Math.abs(points[j].lon - cluster.lon);
      if (dLat < threshold && dLon < threshold) {
        used.add(j);
        cluster.count++;
        // Prefer a named entry
        if (!cluster.name && points[j].name) {
          cluster.name = points[j].name;
        }
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
