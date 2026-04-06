import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
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
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, radius, typography } from '../theme';
import { Chip } from '../components/Chip';
import { Button } from '../components/Button';
import { useSessions } from '../context/SessionContext';
import * as api from '../data/supabaseApi';
import type { SessionType } from '../data/mockSessions';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { findNearbyCourts, NearbyCourt } from '../data/nearbySearch';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateSession'>;

const SESSION_TYPES: { label: string; value: SessionType }[] = [
  { label: 'Singles', value: 'singles' },
  { label: 'Doubles', value: 'doubles' },
  { label: 'Hitting', value: 'hitting' },
];

const SKILL_LEVELS: { label: string; value: string; range: string }[] = [
  { label: 'Beginner', value: 'beginner', range: '2.5–3.0' },
  { label: 'Intermediate', value: 'intermediate', range: '3.5–4.0' },
  { label: 'Advanced', value: 'advanced', range: '4.5+' },
];
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

/** Generate quick date+time presets based on current time */
function generateQuickPresets(): { label: string; date: string; time: string }[] {
  const presets: { label: string; date: string; time: string }[] = [];
  const now = new Date();
  const currentHour = now.getHours();

  const fmt = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const today = new Date(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Find next Saturday
  const saturday = new Date(now);
  const dayOfWeek = saturday.getDay();
  const daysUntilSat = dayOfWeek === 6 ? 7 : (6 - dayOfWeek);
  saturday.setDate(saturday.getDate() + daysUntilSat);

  if (currentHour < 16) presets.push({ label: 'Today 5 PM', date: fmt(today), time: '5:00 PM' });
  if (currentHour < 17) presets.push({ label: 'Today 6 PM', date: fmt(today), time: '6:00 PM' });
  if (currentHour < 19) presets.push({ label: 'Today 7 PM', date: fmt(today), time: '7:00 PM' });
  presets.push({ label: 'Tomorrow 9 AM', date: fmt(tomorrow), time: '9:00 AM' });
  presets.push({ label: 'Tomorrow 6 PM', date: fmt(tomorrow), time: '6:00 PM' });
  if (daysUntilSat > 1) presets.push({ label: 'Sat 9 AM', date: fmt(saturday), time: '9:00 AM' });

  return presets.slice(0, 4);
}

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
  const published = useRef(false);

  const dateOptions = useMemo(() => generateDateOptions(), []);
  const quickPresets = useMemo(() => generateQuickPresets(), []);

  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    api.fetchPreferredLocations(user.id)
      .then(setPreferredLocations)
      .catch(() => {});
  }, [user]);

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
  const [nearbyModalVisible, setNearbyModalVisible] = useState(false);
  const [nearbyCourts, setNearbyCourts] = useState<NearbyCourt[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  const hasFormData = title.trim() !== '' ||
    sessionType !== null ||
    selectedDate !== null ||
    selectedTime !== null ||
    selectedCourt !== null ||
    showCustomCourt ||
    skillLevel !== null ||
    playerLimit !== null ||
    notes.trim() !== '';

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (published.current || !hasFormData) return;

      e.preventDefault();

      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasFormData]);

  const handleFindNearby = useCallback(async () => {
    setNearbyModalVisible(true);
    setNearbyLoading(true);
    setNearbyCourts([]);
    try {
      const courts = await findNearbyCourts();
      setNearbyCourts(courts);
    } catch (e: any) {
      const msg = e.message === 'Location permission denied'
        ? 'Please enable location access in your device settings.'
        : 'Could not find nearby courts. Try again later.';
      Alert.alert('Location Error', msg);
      setNearbyModalVisible(false);
    } finally {
      setNearbyLoading(false);
    }
  }, []);

  const handleSelectNearbyCourt = useCallback((court: NearbyCourt) => {
    setSelectedCourt(null);
    setCustomCourt(court.name);
    setShowCustomCourt(true);
    setNearbyModalVisible(false);
  }, []);

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

    const matchedLevel = SKILL_LEVELS.find((l) => l.value === skillLevel!);
    const skillRange = matchedLevel?.range ?? skillLevel!;

    const courtName = selectedCourt !== null ? COURTS[selectedCourt].name : customCourt.trim();
    const courtAddress = selectedCourt !== null ? COURTS[selectedCourt].address : user.location;

    try {
      const newSessionId = await addSession({
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
      api.savePreferredLocation(user.id, courtName).catch(() => {});
      submitting.current = false;
      published.current = true;
      Alert.alert('Session Created 🎾', 'Your session is now live!', [
        {
          text: 'View Session',
          onPress: () => navigation.replace('SessionDetail', { sessionId: newSessionId }),
        },
      ], { cancelable: false });
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
              placeholder="Sunday morning hitting"
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
            <SectionLabel label="When" required />
            <Text style={styles.subsectionLabel}>Quick Pick</Text>
            <View style={styles.chipRow}>
              {quickPresets.map((p) => (
                <Chip
                  key={p.label}
                  label={p.label}
                  active={selectedDate === p.date && selectedTime === p.time}
                  onPress={() => {
                    setSelectedDate(p.date);
                    setSelectedTime(p.time);
                  }}
                />
              ))}
            </View>
            {(() => {
              const matched = selectedDate && selectedTime
                ? quickPresets.find((p) => p.date === selectedDate && p.time === selectedTime)
                : null;
              return matched ? (
                <Text style={styles.quickPickConfirm}>✓ {matched.label}</Text>
              ) : null;
            })()}
            <Text style={styles.subsectionLabel}>Date</Text>
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
            <Text style={styles.subsectionLabel}>Time</Text>
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
            <View style={styles.courtHeader}>
              <SectionLabel label="Court" required />
              <Pressable style={styles.findNearbyButton} onPress={handleFindNearby}>
                <Ionicons name="navigate-outline" size={14} color={colors.accent} />
                <Text style={styles.findNearbyText}>Find Nearby</Text>
              </Pressable>
            </View>
            {preferredLocations.length > 0 && (
              <>
                <Text style={styles.subsectionLabel}>Recent</Text>
                <View style={styles.chipRow}>
                  {preferredLocations.map((loc) => {
                    const courtIndex = COURTS.findIndex((c) => c.name === loc);
                    const isActive = courtIndex >= 0
                      ? selectedCourt === courtIndex
                      : showCustomCourt && customCourt === loc;
                    return (
                      <Chip
                        key={`pref-${loc}`}
                        label={loc}
                        active={isActive}
                        onPress={() => {
                          if (courtIndex >= 0) {
                            setSelectedCourt(courtIndex);
                            setCustomCourt('');
                            setShowCustomCourt(false);
                          } else {
                            setSelectedCourt(null);
                            setCustomCourt(loc);
                            setShowCustomCourt(true);
                          }
                        }}
                      />
                    );
                  })}
                </View>
                <Text style={styles.subsectionLabel}>All Courts</Text>
              </>
            )}
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
                label="Other…"
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
              {SKILL_LEVELS.map((level) => (
                <Chip
                  key={level.value}
                  label={level.label}
                  active={skillLevel === level.value}
                  onPress={() => setSkillLevel(level.value)}
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
            <SectionLabel label="Notes" />
            <TextInput
              style={[styles.textInput, styles.multiline]}
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Looking for rally partner, Court 3, bring water"
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={500}
            />
            {skillLevel && notes.trim().length > 0 && (() => {
              const skillLabel = SKILL_LEVELS.find((l) => l.value === skillLevel)?.label.toLowerCase();
              const notesLower = notes.toLowerCase();
              const conflictWord = ['beginner', 'intermediate', 'advanced'].find(
                (w) => notesLower.includes(w) && w !== skillLabel
              );
              if (!conflictWord) return null;
              return (
                <Text style={styles.skillWarning}>
                  ⚠️ Notes mention "{conflictWord}" but skill level is set to {skillLabel}.
                </Text>
              );
            })()}
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

      <Modal
        visible={nearbyModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setNearbyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, spacing.base) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nearby Tennis Courts</Text>
              <Pressable onPress={() => setNearbyModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            {nearbyLoading ? (
              <View style={styles.modalCenter}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={styles.modalLoadingText}>Searching nearby courts…</Text>
              </View>
            ) : nearbyCourts.length === 0 ? (
              <View style={styles.modalCenter}>
                <Ionicons name="tennisball-outline" size={48} color={colors.textTertiary} />
                <Text style={styles.modalEmptyText}>No tennis courts found nearby</Text>
              </View>
            ) : (
              <FlatList
                data={nearbyCourts}
                keyExtractor={(_, i) => String(i)}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.courtResultRow}
                    onPress={() => handleSelectNearbyCourt(item)}
                  >
                    <Ionicons name="location" size={18} color={colors.accent} />
                    <View style={styles.courtResultInfo}>
                      <Text style={styles.courtResultName}>{item.name}</Text>
                      {item.address ? (
                        <Text style={styles.courtResultAddress}>{item.address}</Text>
                      ) : null}
                    </View>
                    <Text style={styles.courtResultDistance}>{item.distance.toFixed(1)} mi</Text>
                  </Pressable>
                )}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
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
  subsectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  skillWarning: {
    ...typography.caption,
    color: colors.warning,
    marginTop: spacing.xs,
  },
  quickPickConfirm: {
    ...typography.caption,
    color: colors.accent,
    marginTop: spacing.xxs,
  },
  courtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  findNearbyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  findNearbyText: {
    ...typography.captionMedium,
    color: colors.accent,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    paddingTop: spacing.base,
    paddingHorizontal: spacing.base,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  modalCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxxl,
    gap: spacing.md,
  },
  modalLoadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalEmptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  courtResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  courtResultInfo: {
    flex: 1,
    gap: spacing.xxs,
  },
  courtResultName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  courtResultAddress: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  courtResultDistance: {
    ...typography.captionMedium,
    color: colors.accent,
  },
});
