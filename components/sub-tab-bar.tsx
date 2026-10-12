import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/use-colors';
import { Tap } from '@/lib/motion';

interface SubTabBarProps {
  tabs: { key: string; label: string; icon: string }[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function SubTabBar({ tabs, activeTab, onTabChange }: SubTabBarProps) {
  const colors = useColors();

  const handleSelect = (key: string) => {
    if (activeTab !== key) {
      Haptics.selectionAsync();
      onTabChange(key);
    }
  };

  return (
    <View style={{ paddingVertical: 6 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Tap
              key={tab.key}
              scaleTo={0.95}
              onPress={() => handleSelect(tab.key)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: isActive ? colors.primary : colors.surface,
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderWidth: 1,
                borderColor: isActive ? colors.primary : colors.border,
              }}
            >
              <Text style={{ fontSize: 13 }}>{tab.icon}</Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: isActive ? '800' : '600',
                  color: isActive ? '#FFFFFF' : colors.foreground,
                }}
              >
                {tab.label}
              </Text>
            </Tap>
          );
        })}
      </ScrollView>
    </View>
  );
}
