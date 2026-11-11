import React, { useState, useEffect, useCallback } from 'react';
import {
  Check, Utensils, Pill, Droplets, AlertTriangle, Clock, Package, Target, Plus, Minus, ShieldCheck,
} from 'lucide-react-native';
import { ScrollView, View, Text } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '@/components/screen-container';
import { SubTabBar, type SubTabItem } from '@/components/sub-tab-bar';
import { useColors } from '@/hooks/use-colors';
import { DailyLogRepo, NutritionRepo, NavRepo, ProfileRepo } from '@/lib/db/database';
import { DAILY_MEALS, SUPPLEMENTS } from '@/lib/db/seeds';
import { Tap } from '@/lib/motion';

type Tab = 'meals' | 'supplements' | 'water';
const TABS: SubTabItem[] = [
  { key: 'meals', label: 'Meals', icon: Utensils },
  { key: 'supplements', label: 'Supplements', icon: Pill },
  { key: 'water', label: 'Water', icon: Droplets },
];

// ─── Today's Meals ─────────────────────────────────────────────────────────────

function TodaysMeals() {
  const colors = useColors();
  const [mealsDone, setMealsDone] = useState<Record<string, boolean>>({});
  const [junkCount, setJunkCount] = useState(0);
  const today = new Date().toISOString().split('T')[0];
  const dayIdx = new Date().getDay();
  const isWeekday = ![0, 6].includes(dayIdx);
  const isSaturday = dayIdx === 6;
  const isSunday = dayIdx === 0;

  useEffect(() => {
    DailyLogRepo.getForDate(today).then(log => {
      if (log?.mealsJson) {
        try { setMealsDone(JSON.parse(log.mealsJson)); } catch {}
      }
    });
    NutritionRepo.getJunkCount(today).then(setJunkCount);
  }, []);

  const toggleMeal = async (id: string) => {
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
    <ScrollView style={{ flex: 1 }} overScrollMode="always" bounces={true} decelerationRate="normal" scrollEventThrottle={16} contentContainerStyle={{ padding: 18, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      {/* Macro Progress */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: colors.foreground }}>Today's Macro Targets</Text>
          <Text style={{ fontSize: 10.5, fontWeight: '700', color: colors.primary }}>Surplus Protocol</Text>
        </View>
        {[
          { label: 'Calories', current: doneCals, target: totalCals, unit: 'kcal', color: colors.primary },
          { label: 'Protein', current: doneProtein, target: totalProtein, unit: 'g', color: '#38BDF8' },
          { label: 'Carbs', current: doneMeals.reduce((s, m) => s + m.carbs, 0), target: 380, unit: 'g', color: colors.warning },
          { label: 'Fats', current: doneMeals.reduce((s, m) => s + m.fats, 0), target: 75, unit: 'g', color: '#FB923C' },
        ].map(macro => {
          const pct = Math.min((macro.current / macro.target) * 100, 100);
          return (
            <View key={macro.label} style={{ marginBottom: 9 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                <Text style={{ color: colors.foreground, fontSize: 11.5, fontWeight: '700' }}>{macro.label}</Text>
                <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '600' }}>{macro.current} / {macro.target} {macro.unit}</Text>
              </View>
              <View style={{ height: 6, backgroundColor: colors.background, borderRadius: 3, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
                <View style={{ height: '100%', backgroundColor: macro.color, borderRadius: 3, width: `${pct}%` }} />
              </View>
            </View>
          );
        })}
      </View>

      {/* Junk Food Rules */}
      <View style={{
        backgroundColor: isWeekday || isSunday ? colors.success + '12' : colors.warning + '14',
        borderRadius: 14, padding: 13, marginBottom: 12,
        borderWidth: 1, borderColor: isWeekday || isSunday ? colors.success + '38' : colors.warning + '38',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <ShieldCheck size={15} color={isWeekday || isSunday ? colors.success : colors.warning} />
          <Text style={{ color: isWeekday || isSunday ? colors.success : colors.warning, fontWeight: '800', fontSize: 12.5 }}>
            {isWeekday ? 'Weekday Protocol: Zero Junk' : isSaturday ? 'Saturday: 1 Controlled Restaurant Meal Allowed' : 'Sunday Recovery: Clean Home Nutrition'}
          </Text>
        </View>
        <Text style={{ color: colors.muted, fontSize: 11.5, lineHeight: 16 }}>
          {isWeekday
            ? 'Zero sugary sodas, fried street snacks, or refined bakery items.'
            : isSaturday
            ? `Cheat meals used today: ${junkCount}/1. Keep protein high.`
            : 'Sunday is Rest & Recovery day. Stick to home-cooked whole foods + Vitamin D3 60K with breakfast.'}
        </Text>
        {isSaturday && junkCount === 0 && (
          <Tap
            onPress={() => {
              const n = junkCount + 1;
              setJunkCount(n);
              NutritionRepo.setJunkCount(today, n);
            }}
            scaleTo={0.96}
            style={{ backgroundColor: colors.warning, borderRadius: 9, paddingVertical: 8, alignItems: 'center', marginTop: 9 }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 11.5 }}>Log Weekly Cheat Meal</Text>
          </Tap>
        )}
      </View>

      {/* Meal Cards */}
      {mealsToShow.map(meal => {
        const isDone = !!mealsDone[meal.id];
        return (
          <Tap
            key={meal.id}
            onPress={() => toggleMeal(meal.id)}
            scaleTo={0.985}
            style={{
              backgroundColor: isDone ? colors.success + '10' : colors.surface,
              borderRadius: 14, padding: 14, marginBottom: 9,
              borderWidth: 1, borderColor: isDone ? colors.success + '45' : colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{
                    width: 22, height: 22, borderRadius: 7,
                    backgroundColor: isDone ? colors.success : 'transparent',
                    borderWidth: 1.8, borderColor: isDone ? colors.success : colors.border,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isDone && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: isDone ? colors.success : colors.foreground }}>
                    Meal {meal.number}: {meal.name}
                  </Text>
                </View>
                <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700', marginTop: 3, marginLeft: 32 }}>{meal.time}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 13 }}>{meal.calories} kcal</Text>
                <Text style={{ color: colors.muted, fontSize: 10.5, fontWeight: '600' }}>{meal.protein}g protein</Text>
              </View>
            </View>

            <View style={{ marginTop: 8, marginLeft: 32 }}>
              {meal.items.map((item, i) => (
                <Text key={i} style={{ color: isDone ? colors.muted : colors.foreground, fontSize: 11.5, marginBottom: 2, lineHeight: 17 }}>
                  • {item}
                </Text>
              ))}
            </View>

            {meal.notes && (
              <Text style={{ color: colors.warning, fontSize: 11, marginTop: 6, marginLeft: 32, fontStyle: 'italic' }}>
                Note: {meal.notes}
              </Text>
            )}
          </Tap>
        );
      })}

      {/* Post-workout (Monday-Saturday training days) */}
      {!isSunday && DAILY_MEALS.find(m => m.isPostWorkoutOnly) && (
        <View style={{ backgroundColor: colors.primary + '12', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.primary + '35' }}>
          <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12.5, marginBottom: 6 }}>
            Post-Workout Nutrition (Mon–Sat Training Days)
          </Text>
          {DAILY_MEALS.find(m => m.isPostWorkoutOnly)?.items.map((item, i) => (
            <Text key={i} style={{ color: colors.foreground, fontSize: 11.5, marginBottom: 3 }}>• {item}</Text>
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
    const n = { ...checked, [id]: !checked[id] };
    setChecked(n);
    const today = new Date().toISOString().split('T')[0];
    await NutritionRepo.setSupplements(today, n);
  };

  const filtered = SUPPLEMENTS.filter(s => s.phase <= phase);

  return (
    <ScrollView style={{ flex: 1 }} overScrollMode="always" bounces={true} decelerationRate="normal" scrollEventThrottle={16} contentContainerStyle={{ padding: 18, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <View style={{
        backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 12,
        borderWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 14 }}>Supplements & Micronutrients</Text>
          <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>Daily stack · Natural DHT & recovery support</Text>
        </View>
        <View style={{ backgroundColor: colors.primary + '1C', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 }}>
          <Text style={{ color: colors.primary, fontSize: 10.5, fontWeight: '800' }}>PHASE {phase}</Text>
        </View>
      </View>

      {/* Protocol Rules */}
      <View style={{ backgroundColor: colors.warning + '14', borderRadius: 14, padding: 13, marginBottom: 12, borderWidth: 1, borderColor: colors.warning + '38' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <AlertTriangle size={14} color={colors.warning} />
          <Text style={{ color: colors.warning, fontWeight: '800', fontSize: 12.5 }}>Critical Supplement Timing</Text>
        </View>
        <Text style={{ color: colors.foreground, fontSize: 11.5, lineHeight: 17 }}>
          • Zinc Picolinate: Take immediately after lunch with a full glass of water. Never on an empty stomach.{'\n'}
          • Triple Strength Fish Oil: 1 softgel daily with breakfast (900mg active Omega-3).{'\n'}
          • Magnesium Glycinate: 2 tablets 30–45 min before sleep with water or warm milk.{'\n'}
          • Creatine Monohydrate: Maintain 3.5L daily hydration.{'\n'}
          • Vitamin D3 60K: Once weekly on Sunday morning with breakfast (first 8 weeks).
        </Text>
      </View>

      {filtered.map(supp => {
        const isChecked = !!checked[supp.id];
        return (
          <Tap
            key={supp.id}
            onPress={() => toggle(supp.id)}
            scaleTo={0.985}
            style={{
              backgroundColor: isChecked ? colors.success + '10' : colors.surface,
              borderRadius: 14, padding: 13, marginBottom: 8,
              borderWidth: 1, borderColor: isChecked ? colors.success + '45' : colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{
                width: 22, height: 22, borderRadius: 7,
                backgroundColor: isChecked ? colors.success : 'transparent',
                borderWidth: 1.8, borderColor: isChecked ? colors.success : colors.border,
                marginRight: 12, alignItems: 'center', justifyContent: 'center', marginTop: 2,
              }}>
                {isChecked && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '800', fontSize: 13.5, color: isChecked ? colors.success : colors.foreground, textDecorationLine: isChecked ? 'line-through' : 'none' }}>
                  {supp.name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 }}>
                  <Clock size={11} color={colors.primary} />
                  <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>{supp.timing}</Text>
                </View>
                <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>Dose: {supp.dose}</Text>
                {supp.form && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
                    <Package size={11} color={colors.muted} />
                    <Text style={{ color: colors.muted, fontSize: 11 }}>{supp.form}</Text>
                  </View>
                )}
                {supp.purpose && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}>
                    <Target size={11} color={colors.foreground} />
                    <Text style={{ color: colors.foreground, fontSize: 11, opacity: 0.9, flex: 1 }}>{supp.purpose}</Text>
                  </View>
                )}
                {supp.warning && (
                  <Text style={{ color: colors.warning, fontSize: 11, marginTop: 4, fontWeight: '600' }}>
                    Note: {supp.warning}
                  </Text>
                )}
              </View>
            </View>
          </Tap>
        );
      })}
    </ScrollView>
  );
}

// ─── Water Tracker ────────────────────────────────────────────────────────────

const WATER_BLUE = '#0EA5E9';

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
  const litres = (glasses * 0.25).toFixed(2);

  return (
    <ScrollView style={{ flex: 1 }} overScrollMode="always" bounces={true} decelerationRate="normal" scrollEventThrottle={16} contentContainerStyle={{ padding: 18, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <View style={{
        backgroundColor: colors.surface, borderRadius: 18, padding: 22,
        borderWidth: 1, borderColor: colors.border, alignItems: 'center',
      }}>
        <Text style={{ fontSize: 10.5, fontWeight: '800', color: WATER_BLUE, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>
          Daily Hydration Tracker
        </Text>

        {/* Visual Water Bottle Fill Gauge */}
        <View style={{
          width: 108, height: 200, borderRadius: 34, backgroundColor: colors.background,
          overflow: 'hidden', borderWidth: 2, borderColor: WATER_BLUE + '55', position: 'relative',
          alignItems: 'center', justifyContent: 'center', marginBottom: 18,
        }}>
          <View style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: `${pct}%`, backgroundColor: WATER_BLUE + '55',
          }} />
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.foreground, letterSpacing: -0.5 }}>{litres}L</Text>
          <Text style={{ fontSize: 11, color: colors.muted, fontWeight: '700', marginTop: 2 }}>of 3.50L</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text style={{ fontSize: 30, fontWeight: '800', color: colors.foreground, letterSpacing: -0.5 }}>{glasses}</Text>
          <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600' }}>/ {TARGET} glasses (250ml each)</Text>
        </View>

        <View style={{ width: '100%', height: 7, backgroundColor: colors.background, borderRadius: 4, overflow: 'hidden', marginTop: 12, marginBottom: 18, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ height: '100%', backgroundColor: WATER_BLUE, borderRadius: 4, width: `${pct}%` }} />
        </View>

        <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
          <Tap
            onPress={() => addGlass(-1)}
            scaleTo={0.94}
            style={{
              width: 52, height: 44, backgroundColor: colors.background, borderRadius: 12,
              borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Minus size={18} color={colors.foreground} />
          </Tap>
          <Tap
            onPress={() => addGlass(1)}
            scaleTo={0.96}
            style={{
              flex: 1, height: 44, backgroundColor: WATER_BLUE, borderRadius: 12,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Plus size={17} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>Add 250ml Glass</Text>
          </Tap>
        </View>
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
        <View style={{ paddingHorizontal: 18, paddingTop: 6, paddingBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.foreground, letterSpacing: -0.5 }}>Nutrition</Text>
          <Text style={{ color: colors.muted, fontSize: 11.5, fontWeight: '700' }}>2,600–2,800 kcal · 90–110g protein</Text>
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
