import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography } from '../theme';
import { Chip } from '../components/Chip';
import { Button } from '../components/Button';
import { useSessions, CurrentUser } from '../context/SessionContext';
import * as supabaseApi from '../data/supabaseApi';
import type { ContactMethod } from '../data/mockSessions';

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

export function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { setUser } = useSessions();

  const [name, setName] = useState('');
  const [skillLevel, setSkillLevel] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [contactMethod, setContactMethod] = useState<ContactMethod | null>(null);
  const [contactValue, setContactValue] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;

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
      const dbUser = await supabaseApi.createUser({
        name: name.trim(),
        skill_level: skillLevel!,
        location: location.trim(),
        contact_method: contactMethod!,
        contact_value: contactValue.trim(),
      });

      const user: CurrentUser = {
        id: dbUser.id,
        name: dbUser.name,
        skillLevel: dbUser.skill_level,
        reliabilityScore: 95,
        location: dbUser.location,
        contactMethod: dbUser.contact_method as ContactMethod,
        contactValue: dbUser.contact_value,
      };

      setUser(user);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to create account');
      setSubmitting(false);
    }
  }, [name, skillLevel, location, contactMethod, contactValue, setUser, submitting]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>🎾</Text>
            <Text style={styles.title}>Tennis Meetup</Text>
            <Text style={styles.subtitle}>Set up your profile to get started</Text>
          </View>

          {/* Name */}
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

          {/* Skill Level */}
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

          {/* Location */}
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

          {/* Contact Method */}
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

          {/* Contact Value */}
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

        {/* Submit */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.base) }]}>
          <Button
            title="Get Started"
            onPress={handleSubmit}
            size="lg"
            loading={submitting}
            disabled={submitting}
            style={styles.submitButton}
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
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
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
  submitButton: {
    width: '100%',
  },
});
