import { Tabs, router } from 'expo-router';
import { View, Text, Pressable, StyleSheet, Platform, Alert, Animated, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/use-colors';
import { Home, Dumbbell, Utensils, Sparkles, Brain, Bot, X, Snowflake, PenLine, Phone, BookOpen, ChevronRight } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';

interface TabIconProps {
  IconComponent: any;
  label: string;
  focused: boolean;
}

function TabIcon({ IconComponent, label, focused }: TabIconProps) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(focused ? 1.1 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.15 : 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  }, [focused]);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 4, minWidth: 54 }}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <IconComponent 
          size={focused ? 24 : 22} 
          color={focused ? colors.primary : colors.muted} 
          strokeWidth={focused ? 2.5 : 2} 
        />
      </Animated.View>
      {focused && (
        <Text
          style={{
            fontSize: 9.5,
            fontWeight: '700',
            color: colors.primary,
            textAlign: 'center',
            marginTop: 4,
          }}
        >
          {label}
        </Text>
      )}
    </View>
  );
}

const TABS = [
  { name: 'index', icon: Home, label: 'Dashboard' },
  { name: 'training', icon: Dumbbell, label: 'Training' },
  { name: 'nutrition', icon: Utensils, label: 'Nutrition' },
  { name: 'appearance', icon: Sparkles, label: 'Appearance' },
  { name: 'discipline', icon: Brain, label: 'Discipline' },
];

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [urgeModalVisible, setUrgeModalVisible] = useState(false);
  const [selectedUrgeAction, setSelectedUrgeAction] = useState<any>(null);

  const URGE_ACTIONS = [
    { id: 'pushups', icon: Dumbbell, label: '20 push-ups RIGHT NOW', color: colors.primary },
    { id: 'shower', icon: Snowflake, label: '30-second cold shower', color: '#60A5FA' },
    { id: 'journal', icon: PenLine, label: 'Write 3 lines in journal', color: '#818CF8' },
    { id: 'walk', icon: ChevronRight, label: '5-minute walk outside', color: colors.success },
    { id: 'call', icon: Phone, label: 'Call someone you care about', color: '#F472B6' },
    { id: 'letter', icon: BookOpen, label: 'Read commitment letter', color: colors.warning },
    { id: 'ai', icon: Bot, label: 'Talk to FORGE AI', color: colors.primary },
  ];

  const handleUrgeAction = (action: any) => {
    setSelectedUrgeAction(action);
    if (action.id === 'ai') {
      setUrgeModalVisible(false);
      setSelectedUrgeAction(null);
      router.navigate('/(tabs)/ai-coach');
    }
  };

  const completeAction = () => {
    setSelectedUrgeAction(null);
    setUrgeModalVisible(false);
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
                <TabIcon IconComponent={tab.icon} label={tab.label} focused={focused} />
              ),
            }}
          />
        ))}

        {/* Hide supplemental screens not in bottom nav */}
        <Tabs.Screen name="ai-coach" options={{ href: null }} />
        <Tabs.Screen name="supplements" options={{ href: null }} />
        <Tabs.Screen name="tan-removal" options={{ href: null }} />
      </Tabs>

      {/* Floating Urge Button */}
      <Pressable
        onPress={() => setUrgeModalVisible(true)}
        style={({ pressed }) => ({
          position: 'absolute', right: 20, bottom: insets.bottom + 70,
          backgroundColor: colors.error, width: 56, height: 56,
          borderRadius: 28, alignItems: 'center', justifyContent: 'center',
          shadowColor: colors.error, shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
          opacity: pressed ? 0.8 : 1, zIndex: 100,
        })}
      >
        <Text style={{ fontSize: 24 }}>🚨</Text>
      </Pressable>

      {/* Urge Modal Bottom Sheet */}
      <Modal visible={urgeModalVisible} transparent animationType="slide" onRequestClose={() => { setUrgeModalVisible(false); setSelectedUrgeAction(null); }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 20 + insets.bottom }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: colors.error }}>🚨 Urge Mode</Text>
              <Pressable onPress={() => { setUrgeModalVisible(false); setSelectedUrgeAction(null); }} style={{ padding: 4, backgroundColor: colors.background, borderRadius: 16 }}>
                <X size={24} color={colors.foreground} />
              </Pressable>
            </View>

            {!selectedUrgeAction ? (
              <View>
                <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 16 }}>Choose an action. The urge will pass.</Text>
                <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                  {URGE_ACTIONS.map(action => {
                    const Icon = action.icon;
                    return (
                      <Pressable key={action.id} onPress={() => handleUrgeAction(action)} style={({ pressed }) => ({
                        flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.background, borderRadius: 12, marginBottom: 8, opacity: pressed ? 0.7 : 1
                      })}>
                        <Icon size={20} color={action.color} />
                        <Text style={{ flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '600', color: colors.foreground }}>{action.label}</Text>
                        <ChevronRight size={18} color={colors.muted} />
                      </Pressable>
                    );
                  })}
                </ScrollView>
                <View style={{ marginTop: 16, padding: 12, backgroundColor: colors.success + '20', borderRadius: 12, borderColor: colors.success + '40', borderWidth: 1 }}>
                  <Text style={{ color: colors.success, fontWeight: '600', textAlign: 'center', fontSize: 13 }}>Don't throw away your progress. You got this. 🔥</Text>
                </View>
              </View>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Text style={{ fontSize: 48, marginBottom: 16 }}>💪</Text>
                <Text style={{ fontSize: 24, fontWeight: '800', color: colors.foreground, marginBottom: 8 }}>Do it now!</Text>
                <Text style={{ fontSize: 16, color: colors.muted, marginBottom: 24 }}>{selectedUrgeAction.label}</Text>
                <Pressable onPress={completeAction} style={({ pressed }) => ({
                  backgroundColor: colors.primary, width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', opacity: pressed ? 0.8 : 1
                })}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>✓ Done! Urge beaten.</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
