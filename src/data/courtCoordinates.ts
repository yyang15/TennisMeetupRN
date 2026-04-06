/** Known Seattle tennis court coordinates */
export const COURT_COORDINATES: Record<string, [number, number]> = {
  'Green Lake Tennis Courts': [47.6801, -122.3298],
  'Green Lake tennis court': [47.6801, -122.3298],
  'Volunteer Park Courts': [47.6305, -122.3158],
  'Bobby Morris Playfield': [47.6171, -122.3204],
  'Amy Yee Tennis Center': [47.5900, -122.3106],
  'Lower Woodland Courts': [47.6655, -122.3440],
  'Magnuson Park Courts': [47.6817, -122.2582],
  'Rainier Beach Playfield': [47.5109, -122.2689],
};

/** Haversine distance in miles */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
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

/** Get distance string for a court name from a given position */
export function getCourtDistance(
  courtName: string,
  userLat: number | null,
  userLon: number | null
): string {
  if (userLat === null || userLon === null) return '';
  const coords = COURT_COORDINATES[courtName];
  if (!coords) return '';
  const dist = haversineDistance(userLat, userLon, coords[0], coords[1]);
  return dist < 0.1 ? '<0.1 mi' : `${dist.toFixed(1)} mi`;
}
