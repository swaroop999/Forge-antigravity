import * as Haptics from "expo-haptics";
import React, { useState, useEffect, useCallback } from 'react';
import { Check } from 'lucide-react-native';
import { ScrollView, View, Text, Pressable, TextInput, Alert } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '@/components/screen-container';
import { SubTabBar } from '@/components/sub-tab-bar';
import { useColors } from '@/hooks/use-colors';
import { DailyLogRepo, NutritionRepo, NavRepo, ProfileRepo } from '@/lib/db/database';
import { DAILY_MEALS, SUPPLEMENTS, type Meal, type Supplement } from '@/lib/db/seeds';

type Tab = 'meals' | 'supplements' | 'water';
const TABS = [
  { key: 'meals' as Tab, label: 'Meals', icon: '🍽️' },
  { key: 'supplements' as Tab, label: 'Supplements', icon: '💊' },
  { key: 'water' as Tab, label: 'Water', icon: '💧' },
];

// ─── Today's Meals ─────────────────────────────────────────────────────────────

function TodaysMeals() {
  const colors = useColors();
  const [mealsDone, setMealsDone] = useState<Record<string, boolean>>({});
  const [junkCount, setJunkCount] = useState(0);
  const today = new Date().toISOString().split('T')[0];
  const isWeekday = ![0, 6].includes(new Date().getDay());
  const isSaturday = new Date().getDay() === 6;

  useEffect(() => {
    DailyLogRepo.getForDate(today).then(log => {
      if (log?.mealsJson) {
        try { setMealsDone(JSON.parse(log.mealsJson)); } catch {}
      }
    });
    NutritionRepo.getJunkCount(today).then(setJunkCount);
  }, []);

  const toggleMeal = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newDone = { ...mealsDone, [id]: !mealsDone[id] };
    setMealsDone(newDone);
    let log = await DailyLogRepo.getForDate(today);
    if (!log) log = await DailyLogRepo.getDefault(today, []);
    log.mealsJson = JSON.stringify(newDone);
    await DailyLogRepo.save(log);
  };

  const totalCals = DAILY_MEALS.filter(m => !m.isPostWorkoutOnly).reduce((s, m) => s + m.calories, 0);
  const totalProtein = DAILY_MEALS.filter(m => !m.isPostWorkoutOnly).reduce((s, m) => s + m.protein, 0);
  const doneMeals = DAILY_MEALS.filter(m => mealsDone[m.id]);
  const doneCals = doneMeals.reduce((s, m) => s + m.calories, 0);
  const doneProtein = doneMeals.reduce((s, m) => s + m.protein, 0);

  const mealsToShow = DAILY_MEALS.filter(m => !m.isPostWorkoutOnly);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      {/* Macro Progress */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>Today's Macros</Text>
        {[
          { label: 'Calories', current: doneCals, target: totalCals, unit: 'kcal', color: colors.primary },
          { label: 'Protein', current: doneProtein, target: totalProtein, unit: 'g', color: '#60A5FA' },
          { label: 'Carbs', current: doneMeals.reduce((s, m) => s + m.carbs, 0), target: 380, unit: 'g', color: colors.warning },
          { label: 'Fats', current: doneMeals.reduce((s, m) => s + m.fats, 0), target: 75, unit: 'g', color: '#FB923C' },
        ].map(macro => {
          const pct = Math.min((macro.current / macro.target) * 100, 100);
          return (
            <View key={macro.label} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '600' }}>{macro.label}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>{macro.current} / {macro.target} {macro.unit}</Text>
              </View>
              <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' }}>
                <View style={{ height: 8, backgroundColor: macro.color, borderRadius: 4, width: `${pct}%` }} />
              </View>
            </View>
          );
        })}
      </View>

      {/* Junk Food Rules */}
      <View style={{
        backgroundColor: isWeekday || (!isWeekday && !isSaturday) ? colors.success + '15' : colors.warning + '15',
        borderRadius: 12, padding: 14, marginBottom: 16,
        borderWidth: 1, borderColor: isWeekday || (!isWeekday && !isSaturday) ? colors.success + '40' : colors.warning + '40',
      }}>
        <Text style={{ color: isWeekday || (!isWeekday && !isSaturday) ? colors.success : colors.warning, fontWeight: '700', marginBottom: 4 }}>
          {isWeekday ? '✓ Weekday: Zero Junk' : isSaturday ? '⚡ Saturday: 1 Restaurant Cheat Allowed' : '🏠 Sunday: Home Food Only'}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 12 }}>
          {isWeekday ? 'No coke, momos, puff, masala puri, or street food.' : isSaturday ? `Cheat meals used: ${junkCount}/1. Restaurant dinner allowed.` : 'Home-cooked food only. Recovery day.'}
        </Text>
        {isSaturday && junkCount === 0 && (
          <Pressable onPress={() => {
            const n = junkCount + 1;
            setJunkCount(n);
            NutritionRepo.setJunkCount(today, n);
          }} style={{ backgroundColor: colors.warning, borderRadius: 8, paddingVertical: 8, alignItems: 'center', marginTop: 8 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12 }}>Mark Cheat Meal Used</Text>
          </Pressable>
        )}
      </View>

      {/* Meal Cards */}
      {mealsToShow.map(meal => (
        <Pressable key={meal.id} onPress={() => toggleMeal(meal.id)}
          style={({ pressed }) => ({
            backgroundColor: mealsDone[meal.id] ? colors.success + '12' : colors.surface,
            borderRadius: 14, padding: 16, marginBottom: 10,
            borderWidth: 1, borderColor: mealsDone[meal.id] ? colors.success + '60' : colors.border,
            opacity: pressed ? 0.85 : 1,
          })}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{
                  width: 22, height: 22, borderRadius: 11,
                  backgroundColor: mealsDone[meal.id] ? colors.success : 'transparent',
                  borderWidth: 2, borderColor: mealsDone[meal.id] ? colors.success : colors.border,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {mealsDone[meal.id] && <Check size={14} color="#FFFFFF" />}
                </View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: mealsDone[meal.id] ? colors.success : colors.foreground }}>
                  Meal {meal.number}: {meal.name}
                </Text>
              </View>
              <Text style={{ color: colors.primary, fontSize: 11, marginTop: 4, marginLeft: 30 }}>{meal.time}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 14 }}>{meal.calories} kcal</Text>
              <Text style={{ color: colors.muted, fontSize: 11 }}>{meal.protein}g protein</Text>
            </View>
          </View>

          {/* Items */}
          <View style={{ marginTop: 10, marginLeft: 30 }}>
            {meal.items.map((item, i) => (
              <Text key={i} style={{ color: mealsDone[meal.id] ? colors.muted : colors.foreground, fontSize: 12, marginBottom: 2, lineHeight: 18 }}>
                • {item}
              </Text>
            ))}
          </View>

          {meal.notes && (
            <Text style={{ color: colors.warning, fontSize: 11, marginTop: 8, marginLeft: 30, fontStyle: 'italic' }}>⚠️ {meal.notes}</Text>
          )}
        </Pressable>
      ))}

      {/* Post-workout */}
      {DAILY_MEALS.find(m => m.isPostWorkoutOnly) && (
        <View style={{ backgroundColor: colors.primary + '15', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.primary + '40' }}>
          <Text style={{ color: colors.primary, fontWeight: '700', marginBottom: 8 }}>Post-Workout (If Training Today)</Text>
          {DAILY_MEALS.find(m => m.isPostWorkoutOnly)?.items.map((item, i) => (
            <Text key={i} style={{ color: colors.foreground, fontSize: 12, marginBottom: 4 }}>• {item}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// ─── Supplements ──────────────────────────────────────────────────────────────

function SupplementsScreen() {
  const colors = useColors();
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    NutritionRepo.getSupplements(today).then(setChecked);
    ProfileRepo.get().then(p => {
      if (p?.phase) setPhase(p.phase);
    });
  }, []);

  const toggle = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const n = { ...checked, [id]: !checked[id] };
    setChecked(n);
    const today = new Date().toISOString().split('T')[0];
    await NutritionRepo.setSupplements(today, n);
  };

  const filtered = SUPPLEMENTS.filter(s => s.phase <= phase);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      {/* Active Phase Badge (no redundant duplicate selectors) */}
      <View style={{
        backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 16,
        borderWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 14 }}>Supplements & Micronutrients</Text>
          <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>Daily intake · Natural DHT & hair follicle support</Text>
        </View>
        <View style={{ backgroundColor: colors.primary + '22', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800' }}>PHASE {phase}</Text>
        </View>
      </View>

      {/* Warnings */}
      <View style={{ backgroundColor: colors.warning + '15', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.warning + '40' }}>
        <Text style={{ color: colors.warning, fontWeight: '700', marginBottom: 6 }}>⚠️ Critical Warnings</Text>
        <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 18 }}>
          • Zinc: NEVER on empty stomach — causes severe nausea{'\n'}
          • Creatine: Drink 3.5L water daily while on it{'\n'}
          • Vitamin D 60K: Once per week ONLY (8 weeks){'\n'}
          • Magnesium: Must be GLYCINATE form only{'\n'}
          • Pumpkin Seeds: Raw or lightly dry-roasted only (Delta-7 sterols for DHT suppression)
        </Text>
      </View>

      {filtered.map(supp => (
        <Pressable key={supp.id} onPress={() => toggle(supp.id)}
          style={({ pressed }) => ({
            backgroundColor: checked[supp.id] ? colors.success + '12' : colors.surface,
            borderRadius: 14, padding: 14, marginBottom: 10,
            borderWidth: 1, borderColor: checked[supp.id] ? colors.success + '50' : colors.border,
            opacity: pressed ? 0.8 : 1,
          })}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{
              width: 22, height: 22, borderRadius: 11,
              backgroundColor: checked[supp.id] ? colors.success : 'transparent',
              borderWidth: 2, borderColor: checked[supp.id] ? colors.success : colors.border,
              marginRight: 12, alignItems: 'center', justifyContent: 'center', marginTop: 2,
            }}>
              {checked[supp.id] && <Check size={14} color="#FFFFFF" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', color: checked[supp.id] ? colors.success : colors.foreground, textDecorationLine: checked[supp.id] ? 'line-through' : 'none' }}>
                {supp.name}
              </Text>
              <Text style={{ color: colors.primary, fontSize: 11, marginTop: 2 }}>🕐 {supp.timing}</Text>
              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 1 }}>Dose: {supp.dose}</Text>
              {supp.purpose && <Text style={{ color: colors.foreground, fontSize: 11, marginTop: 4, opacity: 0.9 }}>🎯 {supp.purpose}</Text>}
              {supp.warning && <Text style={{ color: colors.warning, fontSize: 11, marginTop: 4 }}>⚠️ {supp.warning}</Text>}
            </View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// ─── Water Tracker ────────────────────────────────────────────────────────────

function WaterTracker() {
  const colors = useColors();
  const [glasses, setGlasses] = useState(0);
  const TARGET = 14; // 3.5L = 14 x 250ml
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    DailyLogRepo.getForDate(today).then(log => { if (log) setGlasses(log.waterGlasses); });
  }, []);

  const addGlass = async (amt: number) => {
    const newG = Math.max(0, Math.min(glasses + amt, 20));
    setGlasses(newG);
    let log = await DailyLogRepo.getForDate(today);
    if (!log) log = await DailyLogRepo.getDefault(today, []);
    log.waterGlasses = newG;
    await DailyLogRepo.save(log);
  };

  const pct = Math.min((glasses / TARGET) * 100, 100);
  const litres = (glasses * 0.25).toFixed(1);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      {/* Visual */}
      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        {/* Water bottle visual */}
        <View style={{ width: 100, height: 200, borderRadius: 50, backgroundColor: colors.border, overflow: 'hidden', borderWidth: 2, borderColor: colors.primary + '60', position: 'relative' }}>
          <View style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: `${pct}%`, backgroundColor: colors.primary + '80',
            borderBottomLeftRadius: 48, borderBottomRightRadius: 48,
          }} />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: colors.foreground }}>{litres}L</Text>
            <Text style={{ fontSize: 11, color: colors.muted }}>of 3.5L</Text>
          </View>
        </View>
        <Text style={{ fontSize: 28, fontWeight: '800', color: colors.primary, marginTop: 20 }}>{glasses}</Text>
        <Text style={{ color: colors.muted, fontSize: 14 }}>glasses of 14 target</Text>
        <View style={{ width: '80%', height: 10, backgroundColor: colors.border, borderRadius: 5, overflow: 'hidden', marginTop: 12 }}>
          <View style={{ height: 10, backgroundColor: colors.primary, borderRadius: 5, width: `${pct}%` }} />
        </View>
      </View>

      {/* Buttons */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
        <Pressable onPress={() => addGlass(-1)} style={{ flex: 1, backgroundColor: colors.border, borderRadius: 14, paddingVertical: 18, alignItems: 'center' }}>
          <Text style={{ fontSize: 24, color: colors.foreground }}>−</Text>
        </Pressable>
        <Pressable onPress={() => addGlass(1)} style={{ flex: 2, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 18, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#FFFFFF' }}>+ Add 250ml Glass</Text>
        </Pressable>
      </View>

      {/* Schedule */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ color: colors.foreground, fontWeight: '700', marginBottom: 12 }}>Hydration Schedule</Text>
        {[
          { time: '7:30 AM', amt: '500ml', note: 'First thing on waking (lemon water)' },
          { time: 'With Breakfast', amt: '250ml', note: 'Take with supplements' },
          { time: '10-11 AM', amt: '500ml', note: 'Sip steadily at work' },
          { time: 'With Lunch', amt: '250ml', note: 'Drink before/during lunch' },
          { time: '2-4 PM', amt: '500ml', note: 'Afternoon session' },
          { time: 'Pre-Workout', amt: '300ml', note: '30 min before training' },
          { time: 'Post-Workout', amt: '500ml', note: 'Rehydrate (creatine needs this)' },
          { time: 'With Dinner', amt: '250ml', note: 'Final glasses' },
        ].map((item, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: i < 7 ? 1 : 0, borderBottomColor: colors.border }}>
            <View>
              <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '600' }}>{item.time}</Text>
              <Text style={{ color: colors.muted, fontSize: 11 }}>{item.note}</Text>
            </View>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{item.amt}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Main Nutrition Screen ────────────────────────────────────────────────────

export default function NutritionScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<Tab>('meals');

  useFocusEffect(useCallback(() => {
    NavRepo.consumePendingSubTab('/(tabs)/nutrition').then((pending) => {
      if (pending && ['meals','supplements','water'].includes(pending)) {
        setActiveTab(pending as Tab);
      }
    });
  }, []));

  return (
    <ScreenContainer>
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
          <Text style={{ fontSize: 26, fontWeight: '900', color: colors.foreground }}>Nutrition 🍽️</Text>
          <Text style={{ color: colors.muted, fontSize: 13 }}>2,600–2,800 kcal · 90–110g protein</Text>
        </View>

        <SubTabBar tabs={TABS} activeTab={activeTab as string} onTabChange={(k) => setActiveTab(k as Tab)} />

        <View style={{ flex: 1 }}>
          {activeTab === 'meals' && <TodaysMeals />}
          {activeTab === 'supplements' && <SupplementsScreen />}
          {activeTab === 'water' && <WaterTracker />}
        </View>
      </View>
    </ScreenContainer>
  );
}
