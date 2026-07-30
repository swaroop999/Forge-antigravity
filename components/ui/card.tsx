import React from 'react';
import { View, Text } from 'react-native';
import { useColors } from '@/hooks/use-colors';

export interface CardProps {
  children: React.ReactNode;
  title: string;
  icon?: any;
  color?: string;
}

export const Card = ({ children, title, icon: Icon, color }: CardProps) => {
  const colors = useColors();
  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
        {Icon && <Icon size={20} color={color || colors.primary} />}
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground }}>{title}</Text>
      </View>
      {children}
    </View>
  );
};
