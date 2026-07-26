// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Forge App Icon Mappings
 * SF Symbols to Material Icons mappings for all Forge features
 */
const MAPPING: Record<string, string> = {
  // Navigation
  "house.fill": "home",
  "dumbbell.fill": "fitness-center",
  "fork.knife": "restaurant",
  "sparkles": "auto-awesome",
  "brain.head.profile": "psychology",

  // Dashboard
  "calendar": "calendar-today",
  "clock": "schedule",
  "flame.fill": "local-fire-department",
  "drop.fill": "water-drop",
  "moon.stars": "nights-stay",

  // Training
  "figure.walk": "directions-walk",
  "figure.strengthtraining": "fitness-center",
  "target": "track-changes",
  "chart.line.uptrend.xyaxis": "trending-up",
  "checkmark.circle.fill": "check-circle",

  // Nutrition
  "apple": "restaurant",
  "cup.and.saucer": "local-cafe",
  "pill": "medication",
  "scale": "scale",

  // Appearance
  "face.smiling": "face",
  "sparkles.rectangle.stack": "auto-awesome",
  "scissors": "content-cut",
  "shirt": "checkroom",
  "mirror": "mirror",

  // Discipline
  "calendar.badge.checkmark": "event-available",
  "book": "menu-book",
  "pencil": "edit",
  "heart.fill": "favorite",
  "star.fill": "star",

  // General
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "plus.circle.fill": "add-circle",
  "trash.fill": "delete",
  "pencil.circle.fill": "edit",
  "checkmark.circle": "check-circle-outline",
  "xmark.circle": "cancel",
  "ellipsis": "more-vert",
  "gear": "settings",
  "bell.fill": "notifications-active",
  "camera.fill": "camera-alt",
  "photo.fill": "image",
  "arrow.clockwise": "refresh",
  "square.and.pencil": "edit-note",
  "chart.bar.fill": "bar-chart",
  "line.3.horizontal": "menu",
  "magnifyingglass": "search",
  "exclamationmark.triangle.fill": "warning",
  "info.circle.fill": "info",
  "checkmark.seal.fill": "verified",
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name] as any} style={style} />;
}
