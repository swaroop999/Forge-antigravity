import React from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// ─── 🏃 Central Motion & Physics Presets ──────────────────────────────────────
export const motionSpring = {
  // Tactile press: fast, crisp, zero overshoot
  tactile: { damping: 20, stiffness: 240, mass: 0.8 },
  // Smooth translation: for sliding indicators & pills
  smooth: { damping: 24, stiffness: 200, mass: 0.85 },
  // Gentle entrance: for modals and sheets
  gentle: { damping: 28, stiffness: 180, mass: 1 },
} as const;

export const motionTiming = {
  instant: 100,
  fast: 160,
  base: 220,
  slow: 320,
} as const;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface TapProps extends PressableProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: boolean;
}

/**
 * Tactile Tap Button
 * Replaces hard opacity flickers with a silky physics-based micro-scale (0.97).
 */
export function Tap({
  children,
  style,
  scaleTo = 0.97,
  haptic = false,
  onPressIn,
  onPressOut,
  ...rest
}: TapProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, motionSpring.tactile);
        if (haptic) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, motionSpring.tactile);
        onPressOut?.(e);
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
