import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useState } from 'react';

/**
 * Supplements Tab - Supplement tracking with Phase 1/2 schedules
 */
export default function SupplementsScreen() {
  const colors = useColors();
  const [phase, setPhase] = useState<1 | 2>(1);
  const [checkedSupps, setCheckedSupps] = useState<Record<string, boolean>>({});

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    tabButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
    },
    activeTab: {
      backgroundColor: colors.primary,
    },
    inactiveTab: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    warningBox: {
      backgroundColor: colors.warning,
      opacity: 0.1,
      borderLeftWidth: 4,
      borderLeftColor: colors.warning,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
  });

  const phase1Supplements = [
    { name: 'Whey Protein', dose: '1 scoop (30g)', timing: 'Post-workout', id: 'whey' },
    { name: 'Creatine Monohydrate', dose: '5g (1 tsp)', timing: 'Any time with water', id: 'creatine' },
    { name: 'Carbamide Forte Triple Strength Fish Oil (1400mg)', dose: '1 Softgel daily (900mg active Omega-3)', timing: 'With Breakfast (or Lunch)', id: 'omega3' },
    { name: 'Nutrabay Chelated Magnesium Glycinate (2000mg)', dose: '2 Tablets serving (~250mg elemental Mg)', timing: '30-45 min before sleep', id: 'mag' },
    { name: 'Vitamin B12', dose: '1500 mcg', timing: 'After breakfast', id: 'b12' },
    { name: 'Vitamin D3 (60K IU)', dose: '1 sachet', timing: 'Once per week (Sunday with fatty meal)', id: 'vitd' },
    { name: 'Carbamide Forte Zinc Picolinate + Vit C (85mg)', dose: '1 Tablet daily (~20mg elemental Zinc)', timing: 'Immediately after lunch (NEVER empty stomach)', id: 'zinc' },
    { name: 'Raw Pumpkin Seeds', dose: '1-2 tbsp (30g)', timing: 'Mid-morning or snack (DHT blocker)', id: 'pumpkin' },
  ];

  const phase2Supplements = [
    { name: 'Vitamin D3 + K2', dose: '1 capsule', timing: 'Daily after breakfast', id: 'vitdk2' },
    ...phase1Supplements.slice(0, -2), // All except Zinc & temporary D3
  ];

  const supplements = phase === 1 ? phase1Supplements : phase2Supplements;

  const toggleSupp = (id: string) => {
    setCheckedSupps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6 pb-8">
          <Text className="text-3xl font-bold text-foreground mb-2">Supplements</Text>
          <Text className="text-muted mb-6">💊 Calibrated to your exact bottles</Text>

          {/* Phase Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            {[1, 2].map((p) => (
              <Pressable
                key={p}
                style={({ pressed }) => [
                  styles.tabButton,
                  p === phase ? styles.activeTab : styles.inactiveTab,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => setPhase(p as 1 | 2)}
              >
                <Text
                  className={`text-sm font-semibold ${
                    p === phase ? 'text-background' : 'text-foreground'
                  }`}
                >
                  Phase {p}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Phase Description */}
          <View style={styles.card}>
            <Text className="text-sm font-semibold text-foreground mb-1">
              {phase === 1 ? 'Phase 1: Deficiency Correction (Days 1-60)' : 'Phase 2: Maintenance (Day 61+)'}
            </Text>
            <Text className="text-xs text-muted">
              {phase === 1
                ? 'Build foundation with essential micronutrients, joint protection & DHT inhibition'
                : 'Maintain gains with daily essentials'}
            </Text>
          </View>

          {/* Warnings */}
          <View style={styles.warningBox}>
            <Text className="text-xs font-bold text-warning mb-2">⚠️ CRITICAL SUPPLEMENT INSTRUCTIONS</Text>
            {phase === 1 ? (
              <>
                <Text className="text-xs text-foreground mb-1">• Zinc Picolinate: Take strictly IMMEDIATELY after a full lunch with water. NEVER on an empty stomach (causes sudden nausea).</Text>
                <Text className="text-xs text-foreground mb-1">• Triple Strength Fish Oil: 1 softgel daily at breakfast is sufficient (900mg active Omega-3). Do NOT take 2.</Text>
                <Text className="text-xs text-foreground mb-1">• Magnesium Glycinate: 2 tablets per serving 30-45 min before sleep. Start with 1 tab for 3 days to test digestion.</Text>
                <Text className="text-xs text-foreground mb-1">• Creatine: Drink 3.5L water daily while on it.</Text>
                <Text className="text-xs text-foreground">• Vitamin D3: 60K IU once per week on Sunday for first 8 weeks.</Text>
              </>
            ) : (
              <Text className="text-xs text-foreground">Continue all Phase 1 supplements except Zinc</Text>
            )}
          </View>

          {/* Supplement Checklist */}
          <View style={styles.card}>
            <Text className="text-lg font-bold text-foreground mb-4">Today's Schedule</Text>

            {supplements.map((supp) => (
              <Pressable
                key={supp.id}
                style={({ pressed }) => [
                  {
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => toggleSupp(supp.id)}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: checkedSupps[supp.id] ? colors.success : 'transparent',
                    borderWidth: 2,
                    borderColor: checkedSupps[supp.id] ? colors.success : colors.border,
                    marginRight: 12,
                    marginTop: 2,
                  }}
                />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">{supp.name}</Text>
                  <Text className="text-xs text-muted mt-1">{supp.dose}</Text>
                  <Text className="text-xs text-primary mt-1">🕐 {supp.timing}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Notifications Schedule */}
          <View style={styles.card}>
            <Text className="text-lg font-bold text-foreground mb-4">Notifications</Text>
            {[
              { time: '8:30 AM', msg: 'Take B12 + 1 Softgel Triple Strength Fish Oil with breakfast' },
              { time: '1:00 PM', msg: 'Take Zinc Picolinate immediately AFTER lunch with water' },
              { time: '10:45 PM', msg: 'Take Nutrabay Magnesium Glycinate (1-2 tabs) before sleep' },
              { time: 'Post-workout', msg: 'Time for Whey + Creatine' },
              { time: 'Sunday 9 AM', msg: 'Take Vitamin D3 60K sachet' },
            ].map((notif, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 8,
                  borderBottomWidth: i < 4 ? 1 : 0,
                  borderBottomColor: colors.border,
                }}
              >
                <Text className="text-xs text-muted">{notif.time}</Text>
                <Text className="text-xs text-foreground flex-1 ml-4">{notif.msg}</Text>
              </View>
            ))}
          </View>

          {/* Water Intake Reminder */}
          <View style={styles.card}>
            <Text className="text-lg font-bold text-foreground mb-4">Hydration (Creatine)</Text>
            <Text className="text-sm text-muted mb-4">Target: 3.5L per day while on Creatine</Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-3xl font-bold text-primary">2.1L</Text>
              <Text className="text-sm text-muted">/ 3.5L</Text>
            </View>
            <View className="h-2 bg-border rounded-full overflow-hidden mt-4">
              <View className="h-full bg-primary" style={{ width: '60%' }} />
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
