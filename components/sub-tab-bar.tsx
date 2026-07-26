import React from 'react';
import { ScrollView, Pressable, Text } from 'react-native';
import { useColors } from '@/hooks/use-colors';

interface SubTabBarProps {
  tabs: { key: string; label: string; icon: string }[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function SubTabBar({ tabs, activeTab, onTabChange }: SubTabBarProps) {
  const colors = useColors();

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={{ paddingHorizontal: 16, paddingVertical: 10, maxHeight: 60 }}
    >
      {tabs.map(tab => (
        <Pressable 
          key={tab.key} 
          onPress={() => onTabChange(tab.key)}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            backgroundColor: activeTab === tab.key ? colors.primary : colors.surface,
            borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, marginRight: 8,
            borderWidth: 1, borderColor: activeTab === tab.key ? colors.primary : colors.border,
          }}
        >
          <Text style={{ fontSize: 13 }}>{tab.icon}</Text>
          <Text style={{ fontSize: 12, fontWeight: '700', color: activeTab === tab.key ? '#000' : colors.foreground }}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
