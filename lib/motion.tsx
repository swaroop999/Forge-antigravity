import React from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

// ─── Central Motion & Physics Presets ─────────────────────────────────────────
export const motionSpring = {
  tactile: { damping: 20, stiffness: 260, mass: 0.7 },
  release: { damping: 18, stiffness: 220, mass: 0.7 },
  smooth: { damping: 22, stiffness: 220, mass: 0.75 },
  gentle: { damping: 24, stiffness: 180, mass: 0.85 },
} as const;

export const motionTiming = {
  instant: 60,
  fast: 120,
  base: 180,
  slow: 250,
} as const;

export interface TapProps extends PressableProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: boolean;
}

/**
 * High-Performance Zero-Latency Tap Component
 * Uses native Pressable state with unstable_pressDelay={0} so buttons inside
 * ScrollViews respond on the very first touch frame without worklet overhead or haptics.
 */
export function Tap({
  children,
  style,
  scaleTo = 0.97,
  disabled,
  ...rest
}: TapProps) {
  return (
    <Pressable
      {...rest}
      disabled={disabled}
      unstable_pressDelay={0}
      style={({ pressed }) => [
        style,
        pressed && !disabled
          ? {
              opacity: 0.82,
              transform: [{ scale: scaleTo }],
            }
          : null,
      ]}
    >
      {children}
    </Pressable>
  );
}
