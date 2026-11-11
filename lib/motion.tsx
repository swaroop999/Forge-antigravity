import React from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// ─── Central Motion & Physics Presets ─────────────────────────────────────────
export const motionSpring = {
  // Cushioned tactile press: smooth compression and organic rebound
  tactile: { damping: 18, stiffness: 200, mass: 0.7 },
  // Fluid release: soft, natural settle back to 1
  release: { damping: 17, stiffness: 175, mass: 0.75 },
  // Smooth translation: for sliding sub-tab indicators & active pills
  smooth: { damping: 22, stiffness: 180, mass: 0.8 },
  // Gentle entrance: for screens, modals, and sheets
  gentle: { damping: 24, stiffness: 150, mass: 0.9 },
} as const;

export const motionTiming = {
  instant: 110,
  fast: 170,
  base: 240,
  slow: 320,
} as const;

export const smoothEasing = Easing.out(Easing.cubic);

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface TapProps extends PressableProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: boolean;
}

/**
 * Fluid Tactile Tap Component
 * Zero haptics. Uses organic spring physics on press/release and smooth cubic easing
 * so every button, card, and chip feels responsive and cushioned rather than rigid.
 */
export function Tap({
  children,
  style,
  scaleTo = 0.965,
  disabled,
  onPressIn,
  onPressOut,
  ...rest
}: TapProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        if (!disabled) {
          scale.value = withSpring(scaleTo, motionSpring.tactile);
          opacity.value = withTiming(0.88, { duration: motionTiming.instant, easing: smoothEasing });
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, motionSpring.release);
        opacity.value = withTiming(1, { duration: motionTiming.fast, easing: smoothEasing });
        onPressOut?.(e);
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
