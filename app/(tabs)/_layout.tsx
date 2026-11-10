import { Tabs, router } from 'expo-router';
import { View, Text, Pressable, StyleSheet, Platform, Alert, Modal, ScrollView, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/use-colors';
import { Home, Dumbbell, Utensils, Sparkles, Brain, Bot, X, Snowflake, PenLine, Phone, BookOpen, ChevronRight, Flame } from 'lucide-react-native';
import { useEffect, useState } from 'react';

import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { motionSpring, Tap } from '@/lib/motion';

interface TabIconProps {
  IconComponent: any;
  label: string;
  focused: boolean;
}

function TabIcon({ IconComponent, label, focused }: TabIconProps) {
  const colors = useColors();

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(focused ? 1.08 : 1, motionSpring.smooth) }],
  }));

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 4, minWidth: 58 }}>
      <View
        style={{
          width: 18,
          height: 2.5,
          borderRadius: 2,
          backgroundColor: focused ? colors.primary : 'transparent',
          marginBottom: 4,
        }}
      />
      <Animated.View style={iconAnimatedStyle}>
        <IconComponent 
          size={20} 
          color={focused ? colors.primary : colors.muted} 
          strokeWidth={focused ? 2.4 : 1.9} 
        />
      </Animated.View>
      <Text
        style={{
          fontSize: 9.5,
          fontWeight: focused ? '700' : '600',
          color: focused ? colors.primary : colors.muted,
          textAlign: 'center',
          marginTop: 3,
          letterSpacing: 0.1,
          opacity: focused ? 1 : 0.7,
        }}
      >
        {label}
      </Text>
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
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    let showSub: any;
    let hideSub: any;
    try {
      showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardVisible(true));
      hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardVisible(false));
    } catch {}
    return () => {
      try {
        showSub?.remove?.();
        hideSub?.remove?.();
      } catch {}
    };
  }, []);

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

      {/* Floating Urge Button (hidden when keyboard is open to avoid blocking text input) */}
      {!keyboardVisible && (
        <Tap
          onPress={() => setUrgeModalVisible(true)}
          scaleTo={0.92}
          style={{
            position: 'absolute', right: 16, bottom: insets.bottom + 68,
            backgroundColor: colors.error, width: 46, height: 46,
            borderRadius: 15, alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
            shadowColor: colors.error, shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
            zIndex: 100,
          }}
        >
          <Flame size={21} color="#FFFFFF" strokeWidth={2.3} />
        </Tap>
      )}

      {/* Urge Modal Bottom Sheet */}
      <Modal visible={urgeModalVisible} transparent animationType="slide" onRequestClose={() => { setUrgeModalVisible(false); setSelectedUrgeAction(null); }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 20 + insets.bottom, borderTopWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: colors.error + '18', alignItems: 'center', justifyContent: 'center' }}>
                  <Flame size={18} color={colors.error} strokeWidth={2.4} />
                </View>
                <View>
                  <Text style={{ fontSize: 17, fontWeight: '800', color: colors.foreground }}>Emergency Urge Protocol</Text>
                  <Text style={{ fontSize: 11, color: colors.muted }}>Interrupt the dopamine loop immediately</Text>
                </View>
              </View>
              <Tap onPress={() => { setUrgeModalVisible(false); setSelectedUrgeAction(null); }} scaleTo={0.9} style={{ width: 32, height: 32, backgroundColor: colors.background, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}>
                <X size={16} color={colors.muted} />
              </Tap>
            </View>

            {!selectedUrgeAction ? (
              <View>
                <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                  {URGE_ACTIONS.map(action => {
                    const Icon = action.icon;
                    return (
                      <Tap key={action.id} onPress={() => handleUrgeAction(action)} scaleTo={0.98} style={{
                        flexDirection: 'row', alignItems: 'center', padding: 13, backgroundColor: colors.background, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border
                      }}>
                        <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: action.color + '18', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={16} color={action.color} />
                        </View>
                        <Text style={{ flex: 1, marginLeft: 12, fontSize: 13.5, fontWeight: '700', color: colors.foreground }}>{action.label}</Text>
                        <ChevronRight size={16} color={colors.muted} />
                      </Tap>
                    );
                  })}
                </ScrollView>
                <View style={{ marginTop: 10, padding: 11, backgroundColor: colors.success + '14', borderRadius: 10, borderColor: colors.success + '35', borderWidth: 1 }}>
                  <Text style={{ color: colors.success, fontWeight: '700', textAlign: 'center', fontSize: 12 }}>Discipline is choosing what you want most over what you want right now.</Text>
                </View>
              </View>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <View style={{
                  width: 60, height: 60, borderRadius: 18,
                  backgroundColor: colors.primary + '18',
                  alignItems: 'center', justifyContent: 'center', marginBottom: 14,
                  borderWidth: 1, borderColor: colors.primary + '35',
                }}>
                  <Dumbbell size={28} color={colors.primary} />
                </View>
                <Text style={{ fontSize: 20, fontWeight: '800', color: colors.foreground, marginBottom: 6 }}>Execute Immediately</Text>
                <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 22, textAlign: 'center' }}>{selectedUrgeAction.label}</Text>
                <Tap onPress={completeAction} scaleTo={0.97} style={{
                  backgroundColor: colors.primary, width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center'
                }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>Complete — Urge Defeated</Text>
                </Tap>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
