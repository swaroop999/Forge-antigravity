import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, View, useColorScheme as useSystemColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ThemeProvider as NavigationThemeProvider,
  DarkTheme,
  DefaultTheme,
  type Theme as NavigationTheme,
} from "@react-navigation/native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";
import * as SystemUI from "expo-system-ui";

import { SchemeColors, type ColorScheme } from "@/constants/theme";

const THEME_KEY = "forge_color_scheme";

type ThemeContextValue = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? "dark";
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(systemScheme);
  const [loaded, setLoaded] = useState(false);

  const applyScheme = useCallback((scheme: ColorScheme) => {
    nativewindColorScheme.set(scheme);
    Appearance.setColorScheme?.(scheme);
    const palette = SchemeColors[scheme];
    SystemUI.setBackgroundColorAsync(palette.background).catch(() => {});
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = scheme;
      root.classList.toggle("dark", scheme === "dark");
      Object.entries(palette).forEach(([token, value]) => {
        root.style.setProperty(`--color-${token}`, value);
      });
    }
  }, []);

  // Load saved preference on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        const scheme: ColorScheme = saved === "light" || saved === "dark" ? saved : systemScheme;
        setColorSchemeState(scheme);
        applyScheme(scheme);
      } catch {
        applyScheme(systemScheme);
      } finally {
        setLoaded(true);
      }
    })();
  }, [applyScheme, systemScheme]);

  const setColorScheme = useCallback(async (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    applyScheme(scheme);
    try { await AsyncStorage.setItem(THEME_KEY, scheme); } catch {}
  }, [applyScheme]);

  useEffect(() => {
    if (loaded) applyScheme(colorScheme);
  }, [applyScheme, colorScheme, loaded]);

  const palette = SchemeColors[colorScheme];

  const navigationTheme: NavigationTheme = useMemo(() => {
    const base = colorScheme === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      dark: colorScheme === "dark",
      colors: {
        ...base.colors,
        primary: palette.primary,
        background: palette.background,
        card: palette.surface,
        text: palette.foreground,
        border: palette.border,
        notification: palette.error,
      },
    };
  }, [colorScheme, palette]);

  const themeVariables = useMemo(
    () =>
      vars({
        "color-primary": palette.primary,
        "color-background": palette.background,
        "color-surface": palette.surface,
        "color-foreground": palette.foreground,
        "color-muted": palette.muted,
        "color-border": palette.border,
        "color-success": palette.success,
        "color-warning": palette.warning,
        "color-error": palette.error,
        "color-tertiary": palette.tertiary,
        "color-urge": palette.urge,
      }),
    [palette],
  );

  const value = useMemo(
    () => ({
      colorScheme,
      setColorScheme,
    }),
    [colorScheme, setColorScheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <NavigationThemeProvider value={navigationTheme}>
        <View style={[{ flex: 1, backgroundColor: palette.background }, themeVariables]}>
          {children}
        </View>
      </NavigationThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
