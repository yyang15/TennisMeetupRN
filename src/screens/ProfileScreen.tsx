import React, { useState, useCallback } from 'react';
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
import { Toast } from '../components/Toast';
import { useSessions, CurrentUser } from '../context/SessionContext';
import * as supabaseApi from '../data/supabaseApi';
import type { ContactMethod } from '../data/mockSessions';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const SKILL_LEVELS = ['2.5', '3.0', '3.5', '4.0', '4.5+'] as const;
const CONTACT_METHODS: { label: string; value: ContactMethod }[] = [
  { label: 'Phone', value: 'phone' },
  { label: 'WeChat', value: 'wechat' },
  { label: 'WhatsApp', value: 'whatsapp' },
];

function SectionLabel({ label }: { label: string }) {
  return (
    <Text style={styles.sectionLabel}>
      {label}
      <Text style={styles.required}> *</Text>
    </Text>
  );
}

export function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user, setUser } = useSessions();

  const [name, setName] = useState(user?.name ?? '');
  const [skillLevel, setSkillLevel] = useState<string | null>(user?.skillLevel ?? null);
  const [location, setLocation] = useState(user?.location ?? '');
  const [contactMethod, setContactMethod] = useState<ContactMethod | null>(user?.contactMethod ?? null);
  const [contactValue, setContactValue] = useState(user?.contactValue ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const handleSave = useCallback(async () => {
    if (submitting || !user) return;

    const missing: string[] = [];
    if (!name.trim()) missing.push('Name');
    if (!skillLevel) missing.push('Skill level');
    if (!location.trim()) missing.push('Location');
    if (!contactMethod) missing.push('Contact method');
    if (!contactValue.trim()) missing.push('Contact info');

    if (missing.length > 0) {
      Alert.alert('Missing Fields', missing.join(', '));
      return;
    }

    setSubmitting(true);
    try {
      await supabaseApi.updateUser(user.id, {
        name: name.trim(),
        skill_level: skillLevel!,
        location: location.trim(),
        contact_method: contactMethod!,
        contact_value: contactValue.trim(),
      });

      const updated: CurrentUser = {
        ...user,
        name: name.trim(),
        skillLevel: skillLevel!,
        location: location.trim(),
        contactMethod: contactMethod!,
        contactValue: contactValue.trim(),
      };
      setUser(updated);
      setToastVisible(true);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  }, [name, skillLevel, location, contactMethod, contactValue, user, setUser, submitting]);

  if (!user) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      <Toast
        message="Profile updated ✓"
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />

      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
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
            <SectionLabel label="Your Name" />
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Kevin Yang"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <SectionLabel label="Skill Level (NTRP)" />
            <View style={styles.chipRow}>
              {SKILL_LEVELS.map((level) => (
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
            <SectionLabel label="Location" />
            <TextInput
              style={styles.textInput}
              value={location}
              onChangeText={setLocation}
              placeholder="Seattle, WA"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.field}>
            <SectionLabel label="Preferred Contact" />
            <View style={styles.chipRow}>
              {CONTACT_METHODS.map((m) => (
                <Chip
                  key={m.value}
                  label={m.label}
                  active={contactMethod === m.value}
                  onPress={() => setContactMethod(m.value)}
                />
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <SectionLabel label="Contact Info" />
            <TextInput
              style={styles.textInput}
              value={contactValue}
              onChangeText={setContactValue}
              placeholder={
                contactMethod === 'phone'
                  ? '(206) 555-1234'
                  : contactMethod === 'wechat'
                  ? 'WeChat ID'
                  : contactMethod === 'whatsapp'
                  ? '+1 (206) 555-1234'
                  : 'Enter contact info'
              }
              placeholderTextColor={colors.textTertiary}
              keyboardType={
                contactMethod === 'phone' || contactMethod === 'whatsapp'
                  ? 'phone-pad'
                  : 'default'
              }
            />
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.base) }]}>
          <Button
            title="Save Changes"
            onPress={handleSave}
            size="lg"
            loading={submitting}
            disabled={submitting}
            style={styles.saveButton}
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
  saveButton: {
    width: '100%',
  },
});
