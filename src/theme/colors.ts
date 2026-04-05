export const colors = {
  bg: '#0E1116',
  surface: '#1A1F2E',
  surfaceElevated: '#232938',
  textPrimary: '#F5F7FA',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  textTertiary: 'rgba(255, 255, 255, 0.35)',
  accent: '#A6FF4D',
  accentMuted: 'rgba(166, 255, 77, 0.15)',
  danger: '#FF4D4F',
  dangerMuted: 'rgba(255, 77, 79, 0.15)',
  warning: '#FFC857',
  warningMuted: 'rgba(255, 200, 87, 0.15)',
  success: '#52C41A',
  border: 'rgba(255, 255, 255, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.5)',

  reliability: {
    high: '#52C41A',
    medium: '#FFC857',
    low: '#FF4D4F',
  },

  sessionType: {
    singles: '#A6FF4D',
    doubles: '#4DACFF',
    hitting: '#FFC857',
    coaching: '#C084FC',
  },
} as const;

export type Colors = typeof colors;
