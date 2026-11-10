import React from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// ─── Central Motion & Physics Presets ─────────────────────────────────────────
export const motionSpring = {
  // Tactile press: fast, crisp, zero bounce overshoot
  tactile: { damping: 22, stiffness: 280, mass: 0.75 },
  // Smooth translation: for sliding indicators & pills
  smooth: { damping: 24, stiffness: 210, mass: 0.8 },
  // Gentle entrance: for modals and sheets
  gentle: { damping: 28, stiffness: 180, mass: 0.95 },
} as const;

export const motionTiming = {
  instant: 90,
  fast: 150,
  base: 210,
  slow: 300,
} as const;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface TapProps extends PressableProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: boolean;
}

/**
 * Tactile Tap Component
 * Combines subtle spring compression with micro-opacity response for premium button feel.
 */
export function Tap({
  children,
  style,
  scaleTo = 0.97,
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
          opacity.value = withTiming(0.9, { duration: motionTiming.instant });
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, motionSpring.tactile);
        opacity.value = withTiming(1, { duration: motionTiming.fast });
        onPressOut?.(e);
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
