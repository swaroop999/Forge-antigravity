/** @type {const} */
const themeColors = {
  // ── Brand ─────────────────────────────────────────────────────────────────
  primary: { light: '#00B386', dark: '#00D9A3' }, // Emerald — slightly deeper in light for contrast

  // ── Backgrounds ───────────────────────────────────────────────────────────
  background: { light: '#F5F5F0', dark: '#0A0A0A' }, // Warm off-white / Deep black
  surface:    { light: '#FFFFFF', dark: '#1A1A1A' }, // Pure white card / Dark card

  // ── Text ──────────────────────────────────────────────────────────────────
  foreground: { light: '#111111', dark: '#FFFFFF' }, // Near-black / White
  muted:      { light: '#6B7280', dark: '#A0A0A0' }, // Gray-500 / Soft gray

  // ── Borders ───────────────────────────────────────────────────────────────
  border:   { light: '#E5E5E0', dark: '#252525' }, // Soft warm border / Dark subtle

  // ── Status ────────────────────────────────────────────────────────────────
  success: { light: '#059669', dark: '#00E676' }, // Emerald-600 / Bright green
  warning: { light: '#D97706', dark: '#FFB800' }, // Amber-600 / Gold
  error:   { light: '#DC2626', dark: '#FF4444' }, // Red-600 / Red

  // ── Misc ──────────────────────────────────────────────────────────────────
  tertiary: { light: '#EDEDEA', dark: '#252525' }, // Elevated card bg
  urge:     { light: '#EA580C', dark: '#F97316' }, // Orange for urges
};

module.exports = { themeColors };
