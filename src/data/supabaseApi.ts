import { supabase } from './supabase';
import type { Session, Player, ContactMethod, CostType, SessionType } from './mockSessions';

// ---- DB Row Types ----

interface DbUser {
  id: string;
  name: string;
  skill_level: string;
  location: string;
  contact_method: string;
  contact_value: string;
  created_at: string;
}

interface DbSession {
  id: string;
  host_id: string;
  title: string;
  session_type: string;
  date: string;
  time: string;
  skill_range: string;
  court_name: string;
  court_address: string;
  distance: string;
  total_spots: number;
  description: string;
  cost: CostType;
  created_at: string;
  // Joined from users table
  host: DbUser | null;
  // Joined from session_participants + users
  session_participants: { user_id: string; users: DbUser }[];
}

// ---- User Operations ----

export interface CreateUserInput {
  name: string;
  skill_level: string;
  location: string;
  contact_method: ContactMethod;
  contact_value: string;
}

export async function createUser(input: CreateUserInput): Promise<DbUser> {
  const { data, error } = await supabase
    .from('users')
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(`Failed to create user: ${error.message}`);
  return data;
}

export async function fetchUser(userId: string): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // PGRST116 = row not found — genuine "no user"
    if (error.code === 'PGRST116') return null;
    // Any other error (network, etc.) should propagate
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
  return data;
}

// ---- Session Operations ----

export async function fetchSessions(): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      host:users!host_id(*),
      session_participants(
        user_id,
        users(*)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch sessions: ${error.message}`);
  return (data as unknown as DbSession[]).map(transformSession);
}

export interface CreateSessionInput {
  host_id: string;
  title: string;
  session_type: SessionType;
  date: string;
  time: string;
  skill_range: string;
  court_name: string;
  court_address: string;
  total_spots: number;
  description: string;
}

export async function createSession(input: CreateSessionInput): Promise<void> {
  // Insert session
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert(input)
    .select()
    .single();

  if (sessionError) throw new Error(`Failed to create session: ${sessionError.message}`);

  // Add host as first participant
  const { error: participantError } = await supabase
    .from('session_participants')
    .insert({ session_id: session.id, user_id: input.host_id });

  if (participantError) throw new Error(`Failed to add host as participant: ${participantError.message}`);
}

export async function joinSession(sessionId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('session_participants')
    .insert({ session_id: sessionId, user_id: userId });

  if (error) {
    // Unique constraint violation means already joined
    if (error.code === '23505') return;
    throw new Error(`Failed to join session: ${error.message}`);
  }
}

export async function leaveSession(sessionId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('session_participants')
    .delete()
    .eq('session_id', sessionId)
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to leave session: ${error.message}`);
}

export async function deleteSession(sessionId: string): Promise<void> {
  // session_participants will be cascade-deleted due to ON DELETE CASCADE
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId);

  if (error) throw new Error(`Failed to delete session: ${error.message}`);
}

// ---- Transform DB → UI Model ----

function transformSession(row: DbSession): Session {
  const host = row.host;
  const players: Player[] = (row.session_participants ?? []).map((p) => ({
    id: p.user_id,
    name: p.users?.name ?? 'Unknown',
  }));

  return {
    id: row.id,
    hostId: row.host_id,
    title: row.title || '',
    time: row.time,
    date: row.date,
    sessionType: row.session_type as SessionType,
    skillRange: row.skill_range,
    courtName: row.court_name,
    courtAddress: row.court_address,
    distance: row.distance ?? '',
    spotsLeft: Math.max(0, row.total_spots - players.length),
    totalSpots: row.total_spots,
    hostName: host?.name ?? 'Unknown',
    reliabilityScore: 95, // MVP default
    description: row.description,
    cost: row.cost ?? { kind: 'free' as const },
    players,
    hostContactMethod: (host?.contact_method as ContactMethod) ?? undefined,
    hostContactValue: host?.contact_value ?? undefined,
  };
}
