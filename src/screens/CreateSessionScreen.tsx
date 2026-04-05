import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, radius, typography } from '../theme';
import { Chip } from '../components/Chip';
import { Button } from '../components/Button';
import { useSessions } from '../context/SessionContext';
import type { SessionType } from '../data/mockSessions';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateSession'>;

const SESSION_TYPES: { label: string; value: SessionType }[] = [
  { label: 'Singles', value: 'singles' },
  { label: 'Doubles', value: 'doubles' },
  { label: 'Hitting', value: 'hitting' },
];

const SKILL_RANGE_MAP: Record<string, string> = {
  '2.5': '2.5–3.0',
  '3.0': '3.0–3.5',
  '3.5': '3.5–4.0',
  '4.0': '4.0–4.5',
  '4.5+': '4.5+',
};
const PLAYER_LIMITS = [2, 4] as const;

const COURTS = [
  { name: 'Green Lake Tennis Courts', address: '7201 E Green Lake Dr N, Seattle, WA 98115' },
  { name: 'Volunteer Park Courts', address: '1247 15th Ave E, Seattle, WA 98112' },
  { name: 'Bobby Morris Playfield', address: '1600 11th Ave, Seattle, WA 98122' },
  { name: 'Amy Yee Tennis Center', address: '2000 Martin Luther King Jr Way S, Seattle, WA 98144' },
  { name: 'Lower Woodland Courts', address: '1000 N 50th St, Seattle, WA 98103' },
  { name: 'Magnuson Park Courts', address: '7400 Sand Point Way NE, Seattle, WA 98115' },
  { name: 'Rainier Beach Playfield', address: '8802 Rainier Ave S, Seattle, WA 98118' },
] as const;

const HOURS = ['8:00 AM', '9:00 AM', '10:00 AM', '5:00 PM', '6:00 PM', '7:00 PM'] as const;

/** Generate date options for the next 7 days */
function generateDateOptions(): { label: string; value: string }[] {
  const options: { label: string; value: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const value = `${yyyy}-${mm}-${dd}`;
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const label = i === 0 ? `Today (${monthDay})` : i === 1 ? `Tomorrow (${monthDay})` : `${weekday} ${monthDay}`;
    options.push({ label, value });
  }
  return options;
}

function SectionLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Text style={styles.sectionLabel}>
      {label}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
  );
}

export function CreateSessionScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { addSession, user } = useSessions();
  const submitting = useRef(false);

  const dateOptions = useMemo(() => generateDateOptions(), []);

  const [title, setTitle] = useState('');
  const [sessionType, setSessionType] = useState<SessionType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<number | null>(null);
  const [showCustomCourt, setShowCustomCourt] = useState(false);
  const [customCourt, setCustomCourt] = useState('');
  const [skillLevel, setSkillLevel] = useState<string | null>(null);
  const [playerLimit, setPlayerLimit] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const handlePublish = useCallback(async () => {
    if (submitting.current) return;
    if (!user) {
      Alert.alert('Error', 'User session lost. Please restart the app.');
      return;
    }

    const missing: string[] = [];
    if (!title.trim()) missing.push('Session title');
    if (!sessionType) missing.push('Session type');
    if (!selectedDate) missing.push('Date');
    if (!selectedTime) missing.push('Time');
    if (selectedCourt === null && (!showCustomCourt || !customCourt.trim())) missing.push('Location');
    if (!skillLevel) missing.push('Skill level');
    if (playerLimit === null) missing.push('Player limit');

    if (missing.length > 0) {
      Alert.alert('Missing Fields', missing.join(', '));
      return;
    }

    submitting.current = true;

    const skillRange = SKILL_RANGE_MAP[skillLevel!] ?? skillLevel!;

    const courtName = selectedCourt !== null ? COURTS[selectedCourt].name : customCourt.trim();
    const courtAddress = selectedCourt !== null ? COURTS[selectedCourt].address : user.location;

    try {
      await addSession({
        host_id: user.id,
        title: title.trim(),
        session_type: sessionType!,
        date: selectedDate!,
        time: selectedTime!,
        skill_range: skillRange,
        court_name: courtName,
        court_address: courtAddress,
        total_spots: playerLimit!,
        description: notes.trim() || `${title.trim()} — hosted by ${user.name}`,
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to create session');
      submitting.current = false;
    }
  }, [title, sessionType, selectedDate, selectedTime, selectedCourt, showCustomCourt, customCourt, skillLevel, playerLimit, notes, addSession, navigation, user]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Create Session</Text>
        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top + 56}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.field}>
            <SectionLabel label="Session Title" required />
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Saturday morning rally"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.field}>
            <SectionLabel label="Session Type" required />
            <View style={styles.chipRow}>
              {SESSION_TYPES.map((t) => (
                <Chip
                  key={t.value}
                  label={t.label}
                  active={sessionType === t.value}
                  onPress={() => setSessionType(t.value)}
                />
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <SectionLabel label="Date" required />
            <View style={styles.chipRow}>
              {dateOptions.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  active={selectedDate === opt.value}
                  onPress={() => setSelectedDate(opt.value)}
                />
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <SectionLabel label="Time" required />
            <View style={styles.chipRow}>
              {HOURS.map((h) => (
                <Chip
                  key={h}
                  label={h}
                  active={selectedTime === h}
                  onPress={() => setSelectedTime(h)}
                />
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <SectionLabel label="Court" required />
            <View style={styles.chipRow}>
              {COURTS.map((court, i) => (
                <Chip
                  key={court.name}
                  label={court.name}
                  active={selectedCourt === i}
                  onPress={() => {
                    setSelectedCourt(i);
                    setCustomCourt('');
                    setShowCustomCourt(false);
                  }}
                />
              ))}
              <Chip
                label="Other"
                active={showCustomCourt}
                onPress={() => {
                  setSelectedCourt(null);
                  setShowCustomCourt(true);
                }}
              />
            </View>
            {showCustomCourt && (
              <TextInput
                style={styles.textInput}
                value={customCourt}
                onChangeText={setCustomCourt}
                placeholder="Enter court name"
                placeholderTextColor={colors.textTertiary}
              />
            )}
          </View>

          <View style={styles.field}>
            <SectionLabel label="Skill Level" required />
            <View style={styles.chipRow}>
              {Object.keys(SKILL_RANGE_MAP).map((level) => (
                <Chip
                  key={level}
                  label={level}
                  active={skillLevel === level}
                  onPress={() => setSkillLevel(level)}
                />
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <SectionLabel label="Player Limit" required />
            <View style={styles.chipRow}>
              {PLAYER_LIMITS.map((limit) => (
                <Chip
                  key={limit}
                  label={`${limit} players`}
                  active={playerLimit === limit}
                  onPress={() => setPlayerLimit(limit)}
                />
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <SectionLabel label="Notes / Contact Info" />
            <TextInput
              style={[styles.textInput, styles.multiline]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Text me when you arrive. Court 3."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={500}
            />
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.base) }]}>
          <Button
            title="Publish Session"
            onPress={handlePublish}
            size="lg"
            style={styles.publishButton}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  field: {
    gap: spacing.sm,
  },
  sectionLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  required: {
    color: colors.danger,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },
  multiline: {
    minHeight: 80,
    paddingTop: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  publishButton: {
    width: '100%',
  },
});
