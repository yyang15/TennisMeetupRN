export type SessionType = 'singles' | 'doubles' | 'hitting' | 'coaching';

export type CostType =
  | { kind: 'free' }
  | { kind: 'split'; total: number; perPlayer: number }
  | { kind: 'paid'; rate: string };

export interface Player {
  id: string;
  name: string;
}

export type ContactMethod = 'phone' | 'wechat' | 'whatsapp';

export interface Session {
  id: string;
  hostId: string;
  title: string;
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
  hostContactMethod?: ContactMethod;
  hostContactValue?: string;
}

export const filterOptions = ['All', 'Mine', 'Singles', 'Doubles', 'Hitting', 'Coaching'] as const;
export type FilterOption = (typeof filterOptions)[number];
