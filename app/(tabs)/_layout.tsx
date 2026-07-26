import { Tabs, router } from 'expo-router';
import { View, Text, Pressable, StyleSheet, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/use-colors';

interface TabIconProps {
  icon: string;
  label: string;
  focused: boolean;
}

function TabIcon({ icon, label, focused }: TabIconProps) {
  const colors = useColors();
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 4, minWidth: 54 }}>
      <Text style={{ fontSize: 20, marginBottom: 2 }}>{icon}</Text>
      <Text
        style={{
          fontSize: 9.5,
          fontWeight: focused ? '700' : '500',
          color: focused ? colors.primary : colors.muted,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
      {focused && (
        <View
          style={{
            position: 'absolute',
            top: -6,
            width: 3,
            height: 3,
            borderRadius: 1.5,
            backgroundColor: colors.primary,
          }}
        />
      )}
    </View>
  );
}

const TABS = [
  { name: 'index', icon: '🏠', label: 'Dashboard' },
  { name: 'training', icon: '💪', label: 'Training' },
  { name: 'nutrition', icon: '🍽️', label: 'Nutrition' },
  { name: 'appearance', icon: '✨', label: 'Appearance' },
  { name: 'discipline', icon: '🧠', label: 'Discipline' },
  { name: 'ai-coach', icon: '🤖', label: 'AI Coach' },
];

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const handleUrge = () => {
    Alert.alert(
      'EMERGENCY: URGE DETECTED',
      'Do not negotiate with weakness. Do 20 pushups RIGHT NOW. If you still feel the urge, talk to the AI Coach immediately.',
      [
        { text: 'I did my pushups', style: 'cancel' },
        { text: 'Help Me AI Coach', onPress: () => router.push('/(tabs)/ai-coach') }
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 56 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          tabBarShowLabel: false,
        }}
      >
        {TABS.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              tabBarIcon: ({ focused }) => (
                <TabIcon icon={tab.icon} label={tab.label} focused={focused} />
              ),
            }}
          />
        ))}

        {/* Hide supplemental screens not in bottom nav */}
        <Tabs.Screen name="supplements" options={{ href: null }} />
        <Tabs.Screen name="tan-removal" options={{ href: null }} />
      </Tabs>

      {/* Floating Urge Button */}
      <Pressable
        onPress={handleUrge}
        style={({ pressed }) => ({
          position: 'absolute',
          right: 20,
          bottom: 76 + insets.bottom,
          backgroundColor: '#EF4444',
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
          opacity: pressed ? 0.8 : 1,
          borderWidth: 2,
          borderColor: '#FCA5A5'
        })}
      >
        <Text style={{ fontSize: 24 }}>🚨</Text>
      </Pressable>
    </View>
  );
}
