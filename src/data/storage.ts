import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  userId: 'tennis_meetup_user_id',
} as const;

/** Save the current user's ID locally so we know who is "logged in" */
export async function saveUserId(userId: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.userId, userId);
}

/** Load the locally stored user ID */
export async function loadUserId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEYS.userId);
  } catch {
    return null;
  }
}

/** Clear local user (logout) */
export async function clearUserId(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.userId);
}
