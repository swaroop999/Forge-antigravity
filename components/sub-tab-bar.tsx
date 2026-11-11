import React, { useRef, useState, useEffect } from 'react';
import { ScrollView, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';
import { Tap, motionSpring } from '@/lib/motion';

export interface SubTabItem {
  key: string;
  label: string;
  icon?: React.ComponentType<{ size: number; color: string; strokeWidth?: number }> | string;
}

interface SubTabBarProps {
  tabs: SubTabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function SubTabBar({ tabs, activeTab, onTabChange }: SubTabBarProps) {
  const colors = useColors();
  const scrollRef = useRef<ScrollView>(null);
  const [layouts, setLayouts] = useState<Record<string, { x: number; width: number }>>({});
  const pillX = useSharedValue(0);
  const pillW = useSharedValue(0);
  const pillOpacity = useSharedValue(0);

  const handleLayout = (key: string, e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setLayouts((prev) => {
      const existing = prev[key];
      if (existing && Math.abs(existing.x - x) < 0.5 && Math.abs(existing.width - width) < 0.5) {
        return prev;
      }
      return { ...prev, [key]: { x, width } };
    });
  };

  useEffect(() => {
    const target = layouts[activeTab];
    if (target && target.width > 0) {
      if (pillOpacity.value === 0) {
        pillX.value = target.x;
        pillW.value = target.width;
        pillOpacity.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) });
      } else {
        pillX.value = withSpring(target.x, motionSpring.smooth);
        pillW.value = withSpring(target.width, motionSpring.smooth);
      }

      // Smoothly center the selected pill in the horizontal scroll view
      scrollRef.current?.scrollTo({
        x: Math.max(0, target.x - 90),
        animated: true,
      });
    }
  }, [activeTab, layouts]);

  const slidingPillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: pillW.value,
    opacity: pillOpacity.value,
  }));

  const handleSelect = (key: string) => {
    if (activeTab !== key) {
      onTabChange(key);
    }
  };

  return (
    <View style={{ paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border + '70' }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        overScrollMode="always"
        bounces={true}
        decelerationRate="normal"
        contentContainerStyle={{ paddingHorizontal: 16, gap: 6, position: 'relative' }}
      >
        {/* Animated Sliding Active Pill Indicator */}
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              height: 34,
              borderRadius: 10,
              backgroundColor: colors.primary,
            },
            slidingPillStyle,
          ]}
        />

        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = typeof tab.icon !== 'string' ? tab.icon : null;
          const hasMeasured = !!layouts[activeTab];
          return (
            <View key={tab.key} onLayout={(e) => handleLayout(tab.key, e)}>
              <Tap
                scaleTo={0.94}
                onPress={() => handleSelect(tab.key)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  height: 34,
                  gap: 5,
                  backgroundColor: isActive && !hasMeasured ? colors.primary : isActive ? 'transparent' : colors.surface,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: isActive ? colors.primary : colors.border,
                }}
              >
                {Icon ? (
                  <Icon size={13} color={isActive ? '#FFFFFF' : colors.muted} strokeWidth={isActive ? 2.4 : 2} />
                ) : tab.icon ? (
                  <Text style={{ fontSize: 12 }}>{tab.icon as string}</Text>
                ) : null}
                <Text
                  style={{
                    fontSize: 11.5,
                    fontWeight: isActive ? '800' : '600',
                    color: isActive ? '#FFFFFF' : colors.muted,
                    letterSpacing: 0.1,
                  }}
                >
                  {tab.label}
                </Text>
              </Tap>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
