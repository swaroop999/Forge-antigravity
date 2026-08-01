/** @type {const} */
const themeColors = {
  // Forge palette — light and dark properly defined
  primary: { light: '#059669', dark: '#00D9A3' }, // Emerald green (darker for light mode contrast)
  background: { light: '#F8FAFC', dark: '#0A0A0A' }, // Light: soft off-white, Dark: deep black
  surface: { light: '#FFFFFF', dark: '#1A1A1A' }, // Cards
  foreground: { light: '#0F172A', dark: '#FFFFFF' }, // Main text
  muted: { light: '#64748B', dark: '#A0A0A0' }, // Secondary text
  border: { light: '#E2E8F0', dark: '#252525' }, // Dividers
  success: { light: '#059669', dark: '#00E676' },
  warning: { light: '#D97706', dark: '#FFB800' },
  error: { light: '#DC2626', dark: '#FF4444' },
  tertiary: { light: '#F1F5F9', dark: '#252525' }, // Elevated/secondary cards
  urge: { light: '#EA580C', dark: '#F97316' },
};

module.exports = { themeColors };
