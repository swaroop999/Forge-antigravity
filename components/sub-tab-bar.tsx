import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { Tap } from '@/lib/motion';

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

  const handleSelect = (key: string) => {
    if (activeTab !== key) {
      onTabChange(key);
    }
  };

  return (
    <View style={{ paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border + '70' }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = typeof tab.icon !== 'string' ? tab.icon : null;
          return (
            <Tap
              key={tab.key}
              scaleTo={0.95}
              onPress={() => handleSelect(tab.key)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                height: 34,
                gap: 5,
                backgroundColor: isActive ? colors.primary : colors.surface,
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
          );
        })}
      </ScrollView>
    </View>
  );
}
