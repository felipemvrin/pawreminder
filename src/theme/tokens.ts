export const colors = {
  primary: '#6D3DC8',
  primaryForeground: '#FFFFFF',
  secondary: '#E9DDFC',
  background: '#FCFAFF',
  surface: '#FFFFFF',
  foreground: '#20152F',
  muted: '#786D87',
  border: '#E4DDED',
  success: '#25855A',
  warning: '#A86700',
  error: '#C5354B'
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999
} as const;

export const typography = {
  display: { fontSize: 29, lineHeight: 36, fontWeight: '700' },
  heading: { fontSize: 24, lineHeight: 32, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' }
} as const;
