export type SessionType = 'singles' | 'doubles' | 'hitting' | 'coaching';

export type CostType =
  | { kind: 'free' }
  | { kind: 'split'; total: number; perPlayer: number }
  | { kind: 'paid'; rate: string };

export interface Player {
  id: string;
  name: string;
}

export interface Session {
  id: string;
  time: string;
  date: string;
  sessionType: SessionType;
  skillRange: string;
  courtName: string;
  courtAddress: string;
  distance: string;
  spotsLeft: number;
  totalSpots: number;
  hostName: string;
  reliabilityScore: number;
  description: string;
  cost: CostType;
  players: Player[];
}

export const mockSessions: Session[] = [
  {
    id: '1',
    time: '6:30 PM',
    date: 'Today',
    sessionType: 'doubles',
    skillRange: '3.5–4.0',
    courtName: 'Green Lake Tennis Courts',
    courtAddress: '7201 E Green Lake Dr N, Seattle, WA 98115',
    distance: '0.8 mi',
    spotsLeft: 2,
    totalSpots: 4,
    hostName: 'Marcus Chen',
    reliabilityScore: 96,
    description:
      'Looking for two more players for a competitive doubles match. Bring your own racket and water. Courts are well-lit for evening play. We usually play best of 3 sets with no-ad scoring to keep things moving. All skill levels within the range are welcome!',
    cost: { kind: 'split', total: 20, perPlayer: 5 },
    players: [
      { id: 'p1', name: 'Marcus Chen' },
      { id: 'p2', name: 'Lisa Wang' },
    ],
  },
  {
    id: '2',
    time: '7:00 PM',
    date: 'Today',
    sessionType: 'singles',
    skillRange: '4.0–4.5',
    courtName: 'Volunteer Park Courts',
    courtAddress: '1247 15th Ave E, Seattle, WA 98112',
    distance: '1.2 mi',
    spotsLeft: 1,
    totalSpots: 2,
    hostName: 'Sarah Kim',
    reliabilityScore: 92,
    description:
      'Competitive singles practice. Looking for someone who can rally consistently and likes to work on specific shots. I focus on serve and return games.',
    cost: { kind: 'free' },
    players: [{ id: 'p3', name: 'Sarah Kim' }],
  },
  {
    id: '3',
    time: '8:00 AM',
    date: 'Tomorrow',
    sessionType: 'hitting',
    skillRange: '3.0–3.5',
    courtName: 'Bobby Morris Playfield',
    courtAddress: '1600 11th Ave, Seattle, WA 98122',
    distance: '2.4 mi',
    spotsLeft: 1,
    totalSpots: 2,
    hostName: 'Jake Wilson',
    reliabilityScore: 78,
    description:
      'Casual hitting session. Just looking to get some rallies in before work. No scoring, just practice and fun.',
    cost: { kind: 'free' },
    players: [{ id: 'p4', name: 'Jake Wilson' }],
  },
  {
    id: '4',
    time: '10:00 AM',
    date: 'Tomorrow',
    sessionType: 'coaching',
    skillRange: '2.5–3.5',
    courtName: 'Amy Yee Tennis Center',
    courtAddress: '2000 Martin Luther King Jr Way S, Seattle, WA 98144',
    distance: '3.1 mi',
    spotsLeft: 4,
    totalSpots: 6,
    hostName: 'Coach Rivera',
    reliabilityScore: 99,
    description:
      'Group coaching session focused on net play and volleys. All equipment provided. Session includes warm-up drills, technique instruction, and match play scenarios. Perfect for intermediate players looking to improve their net game.',
    cost: { kind: 'paid', rate: '$40/hr' },
    players: [
      { id: 'p5', name: 'Coach Rivera' },
      { id: 'p6', name: 'Emma Johnson' },
    ],
  },
  {
    id: '5',
    time: '5:00 PM',
    date: 'Tomorrow',
    sessionType: 'doubles',
    skillRange: '3.5–4.0',
    courtName: 'Lower Woodland Courts',
    courtAddress: '1000 N 50th St, Seattle, WA 98103',
    distance: '1.8 mi',
    spotsLeft: 3,
    totalSpots: 4,
    hostName: 'David Park',
    reliabilityScore: 65,
    description: 'Friendly doubles. Just looking for people to play with after work.',
    cost: { kind: 'split', total: 16, perPlayer: 4 },
    players: [{ id: 'p7', name: 'David Park' }],
  },
  {
    id: '6',
    time: '6:00 PM',
    date: 'Tomorrow',
    sessionType: 'singles',
    skillRange: '4.5+',
    courtName: 'Magnuson Park Courts',
    courtAddress: '7400 Sand Point Way NE, Seattle, WA 98115',
    distance: '4.2 mi',
    spotsLeft: 1,
    totalSpots: 2,
    hostName: 'Alex Tanaka',
    reliabilityScore: 88,
    description:
      'High-level singles match. USTA rated 4.5+. Looking for someone who can keep up with fast-paced rallies and aggressive play. Let\'s compete!',
    cost: { kind: 'free' },
    players: [{ id: 'p8', name: 'Alex Tanaka' }],
  },
];

export const filterOptions = ['All', 'Singles', 'Doubles', 'Hitting', 'Coaching'] as const;
export type FilterOption = (typeof filterOptions)[number];
