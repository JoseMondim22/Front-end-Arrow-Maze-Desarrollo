/**
 * Shared design tokens for the whole UI layer — colorful/playful direction.
 * Every screen and component pulls colors/spacing/typography from here instead
 * of hardcoding values, so the app reads as one consistent product.
 */

export const colors = {
  primary: '#6366f1',
  primaryDark: '#4338ca',
  secondary: '#f59e0b',
  success: '#22c55e',
  danger: '#ef4444',

  background: '#fef9f3',
  surface: '#ffffff',
  text: '#1f2937',
  textMuted: '#6b7280',
  border: '#e5e7eb',

  // Board terrain (§6.2) and chain colors — swappable for real sprites later
  // without touching any component's logic.
  wall: '#4b5563',
  empty: '#f3f4f6',
  exit: '#22c55e',
  chain: '#6366f1',
} as const;

export const radii = { sm: 8, md: 12, lg: 20, full: 999 } as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '800' as const },
  heading: { fontSize: 20, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  button: { fontSize: 16, fontWeight: '700' as const },
} as const;
