import React from "react";
import { View, type ViewProps } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { cn } from "@/lib/utils";
import { useColors } from "@/hooks/use-colors";

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
 * A container component that properly handles SafeArea and solid background colors
 * with zero opacity flash when switching between screens or bottom tabs.
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
  const colors = useColors();

  return (
    <View
      className={cn("flex-1", "bg-background", containerClassName)}
      style={{ flex: 1, backgroundColor: colors.background }}
      {...props}
    >
      <SafeAreaView
        edges={edges}
        className={cn("flex-1", safeAreaClassName)}
        style={[{ flex: 1, backgroundColor: colors.background }, style]}
      >
        <View className={cn("flex-1", className)} style={{ flex: 1, backgroundColor: colors.background }}>
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}
