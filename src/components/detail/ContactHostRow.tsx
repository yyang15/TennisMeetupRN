import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, radius, typography } from '../../theme';
import type { ContactMethod } from '../../data/mockSessions';

interface ContactHostRowProps {
  contactMethod?: ContactMethod;
  contactValue?: string;
}

const methodLabels: Record<ContactMethod, string> = {
  phone: 'Phone',
  wechat: 'WeChat',
  whatsapp: 'WhatsApp',
};

const methodIcons: Record<ContactMethod, string> = {
  phone: 'call-outline',
  wechat: 'chatbubble-outline',
  whatsapp: 'logo-whatsapp',
};

export function ContactHostRow({ contactMethod, contactValue }: ContactHostRowProps) {
  if (!contactMethod || !contactValue) return null;

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(contactValue);
      Alert.alert('Copied', `${contactValue} copied to clipboard`);
    } catch {
      Alert.alert('Contact', contactValue);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name={methodIcons[contactMethod] as any}
          size={18}
          color={colors.textSecondary}
        />
        <Text style={styles.label}>Contact Host</Text>
      </View>

      <Pressable onPress={handleCopy} style={styles.contactRow}>
        <View style={styles.contactInfo}>
          <Text style={styles.method}>{methodLabels[contactMethod]}</Text>
          <Text style={styles.value}>{contactValue}</Text>
        </View>
        <View style={styles.copyButton}>
          <Ionicons name="copy-outline" size={16} color={colors.accent} />
          <Text style={styles.copyText}>Copy</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactInfo: {
    gap: 2,
  },
  method: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  value: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  copyText: {
    ...typography.captionMedium,
    color: colors.accent,
  },
});
