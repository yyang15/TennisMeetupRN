import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { Session, Player, ContactMethod } from '../data/mockSessions';
import { saveUserId, loadUserId } from '../data/storage';
import * as api from '../data/supabaseApi';

export interface CurrentUser {
  id: string;
  name: string;
  skillLevel: string;
  reliabilityScore: number;
  location: string;
  contactMethod: ContactMethod;
  contactValue: string;
}

/** Sort sessions: joined first, then not-joined */
function sortSessionsForUser(sessions: Session[], userId: string): Session[] {
  const joined: Session[] = [];
  const notJoined: Session[] = [];
  for (const s of sessions) {
    if (s.players.some((p) => p.id === userId)) {
      joined.push(s);
    } else {
      notJoined.push(s);
    }
  }
  return [...joined, ...notJoined];
}

interface SessionContextValue {
  user: CurrentUser | null;
  setUser: (user: CurrentUser) => void;
  sessions: Session[];
  addSession: (input: api.CreateSessionInput) => Promise<void>;
  getSession: (id: string) => Session | undefined;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: (sessionId: string) => Promise<void>;
  cancelSession: (sessionId: string) => Promise<void>;
  sortedSessions: Session[];
  isUserJoined: (sessionId: string) => boolean;
  isReady: boolean;
  refreshSessions: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<CurrentUser | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isReady, setIsReady] = useState(false);

  const refreshSessions = useCallback(async () => {
    try {
      const data = await api.fetchSessions();
      setSessions(data);
    } catch (e) {
      console.warn('Failed to fetch sessions:', e);
    }
  }, []);

  // Hydrate on mount: load user ID from AsyncStorage, fetch user from Supabase, fetch sessions
  useEffect(() => {
    (async () => {
      try {
        const storedUserId = await loadUserId();
        if (storedUserId) {
          const dbUser = await api.fetchUser(storedUserId);
          if (dbUser) {
            setUserState({
              id: dbUser.id,
              name: dbUser.name,
              skillLevel: dbUser.skill_level,
              reliabilityScore: 95,
              location: dbUser.location,
              contactMethod: dbUser.contact_method as ContactMethod,
              contactValue: dbUser.contact_value,
            });
          }
        }
        await refreshSessions();
      } catch {
        // Fall through with empty state
      } finally {
        setIsReady(true);
      }
    })();
  }, [refreshSessions]);

  const setUser = useCallback((u: CurrentUser) => {
    setUserState(u);
    saveUserId(u.id).catch(() => {});
  }, []);

  const addSession = useCallback(async (input: api.CreateSessionInput) => {
    await api.createSession(input);
    await refreshSessions();
  }, [refreshSessions]);

  const getSession = useCallback(
    (id: string) => sessions.find((s) => s.id === id),
    [sessions]
  );

  const joinSession = useCallback(async (sessionId: string) => {
    if (!user) return;
    // Optimistic: check locally first
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;
    if (session.players.some((p) => p.id === user.id)) return;
    if (session.players.length >= session.totalSpots) return;

    try {
      await api.joinSession(sessionId, user.id);
      await refreshSessions();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to join session');
    }
  }, [user, sessions, refreshSessions]);

  const leaveSession = useCallback(async (sessionId: string) => {
    if (!user) return;
    // Block host from leaving
    const session = sessions.find((s) => s.id === sessionId);
    if (session && session.hostId === user.id) {
      Alert.alert('Cannot Leave', 'You are the host of this session.');
      return;
    }
    try {
      await api.leaveSession(sessionId, user.id);
      await refreshSessions();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to leave session');
    }
  }, [user, sessions, refreshSessions]);

  const cancelSession = useCallback(async (sessionId: string) => {
    if (!user) return;
    const session = sessions.find((s) => s.id === sessionId);
    if (!session || session.hostId !== user.id) {
      Alert.alert('Error', 'Only the host can cancel this session.');
      throw new Error('Not the host');
    }
    try {
      await api.deleteSession(sessionId);
      await refreshSessions();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to cancel session');
      throw e;
    }
  }, [user, sessions, refreshSessions]);

  const sortedSessions = useMemo(
    () => (user ? sortSessionsForUser(sessions, user.id) : sessions),
    [sessions, user]
  );

  const isUserJoined = useCallback(
    (sessionId: string) => {
      if (!user) return false;
      const s = sessions.find((s) => s.id === sessionId);
      return s ? s.players.some((p) => p.id === user.id) : false;
    },
    [sessions, user]
  );

  return (
    <SessionContext.Provider
      value={{ user, setUser, sessions, addSession, getSession, joinSession, leaveSession, cancelSession, sortedSessions, isUserJoined, isReady, refreshSessions }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSessions() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSessions must be used within SessionProvider');
  return ctx;
}
