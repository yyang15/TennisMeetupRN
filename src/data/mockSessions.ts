export type SessionType = 'singles' | 'doubles' | 'hitting' | 'coaching';

export interface Session {
  id: string;
  time: string;
  date: string;
  sessionType: SessionType;
  skillRange: string;
  courtName: string;
  distance: string;
  spotsLeft: number;
  totalSpots: number;
  hostName: string;
  reliabilityScore: number;
}

export const mockSessions: Session[] = [
  {
    id: '1',
    time: '6:30 PM',
    date: 'Today',
    sessionType: 'doubles',
    skillRange: '3.5–4.0',
    courtName: 'Green Lake Tennis Courts',
    distance: '0.8 mi',
    spotsLeft: 2,
    totalSpots: 4,
    hostName: 'Marcus Chen',
    reliabilityScore: 96,
  },
  {
    id: '2',
    time: '7:00 PM',
    date: 'Today',
    sessionType: 'singles',
    skillRange: '4.0–4.5',
    courtName: 'Volunteer Park Courts',
    distance: '1.2 mi',
    spotsLeft: 1,
    totalSpots: 2,
    hostName: 'Sarah Kim',
    reliabilityScore: 92,
  },
  {
    id: '3',
    time: '8:00 AM',
    date: 'Tomorrow',
    sessionType: 'hitting',
    skillRange: '3.0–3.5',
    courtName: 'Bobby Morris Playfield',
    distance: '2.4 mi',
    spotsLeft: 1,
    totalSpots: 2,
    hostName: 'Jake Wilson',
    reliabilityScore: 78,
  },
  {
    id: '4',
    time: '10:00 AM',
    date: 'Tomorrow',
    sessionType: 'coaching',
    skillRange: '2.5–3.5',
    courtName: 'Amy Yee Tennis Center',
    distance: '3.1 mi',
    spotsLeft: 4,
    totalSpots: 6,
    hostName: 'Coach Rivera',
    reliabilityScore: 99,
  },
  {
    id: '5',
    time: '5:00 PM',
    date: 'Tomorrow',
    sessionType: 'doubles',
    skillRange: '3.5–4.0',
    courtName: 'Lower Woodland Courts',
    distance: '1.8 mi',
    spotsLeft: 3,
    totalSpots: 4,
    hostName: 'David Park',
    reliabilityScore: 65,
  },
  {
    id: '6',
    time: '6:00 PM',
    date: 'Tomorrow',
    sessionType: 'singles',
    skillRange: '4.5+',
    courtName: 'Magnuson Park Courts',
    distance: '4.2 mi',
    spotsLeft: 1,
    totalSpots: 2,
    hostName: 'Alex Tanaka',
    reliabilityScore: 88,
  },
];

export const filterOptions = ['All', 'Singles', 'Doubles', 'Hitting', 'Coaching'] as const;
export type FilterOption = (typeof filterOptions)[number];
