import React, { useEffect } from "react";
import { View, type ViewProps } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";

import { cn } from "@/lib/utils";
import { motionSpring } from "@/lib/motion";

export interface ScreenContainerProps extends ViewProps {
  /**
   * SafeArea edges to apply. Defaults to ["top", "left", "right"].
   * Bottom is typically handled by Tab Bar.
   */
  edges?: Edge[];
  /**
   * Tailwind className for the content area.
   */
  className?: string;
  /**
   * Additional className for the outer container (background layer).
   */
  containerClassName?: string;
  /**
   * Additional className for the SafeAreaView (content layer).
   */
  safeAreaClassName?: string;
}

/**
 * A container component that properly handles SafeArea, background colors,
 * and smooth focus-based transitions when switching between bottom tabs or screens.
 */
export function ScreenContainer({
  children,
  edges = ["top", "left", "right"],
  className,
  containerClassName,
  safeAreaClassName,
  style,
  ...props
}: ScreenContainerProps) {
  const isFocused = useIsFocused();
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isFocused) {
      opacity.value = 0.72;
      translateY.value = 6;
      scale.value = 0.992;

      opacity.value = withTiming(1, {
        duration: 240,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withSpring(0, motionSpring.smooth);
      scale.value = withSpring(1, motionSpring.smooth);
    }
  }, [isFocused]);

  const animatedFocusStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <View
      className={cn(
        "flex-1",
        "bg-background",
        containerClassName
      )}
      {...props}
    >
      <SafeAreaView
        edges={edges}
        className={cn("flex-1", safeAreaClassName)}
        style={style}
      >
        <Animated.View style={animatedFocusStyle} className={cn("flex-1", className)}>
          {children}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
