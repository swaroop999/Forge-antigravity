import React from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';

export default function SettingsScreen() {
  const colors = useColors();
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const handleReset = () => {
    Alert.alert(
      'Reset All Progress',
      'Are you absolutely sure? This will delete all your daily logs, streaks, and habits.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Everything', 
          style: 'destructive',
          onPress: async () => {
            const keys = await AsyncStorage.getAllKeys();
            await AsyncStorage.multiRemove(keys);
            Alert.alert('Reset Complete', 'All progress has been erased. Time to rebuild.');
          }
        }
      ]
    );
  };

  return (
    <ScreenContainer>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <Text style={{ fontSize: 28, fontWeight: '900', color: colors.foreground, marginBottom: 24 }}>Settings</Text>
        
        {/* Appearance */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.primary, marginBottom: 16, textTransform: 'uppercase' }}>Appearance</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: '600' }}>Dark Mode</Text>
              <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>Essential for night usage</Text>
            </View>
            <Switch 
              value={colorScheme === 'dark'} 
              onValueChange={toggleColorScheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colorScheme === 'dark' ? '#000' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.primary, marginBottom: 16, textTransform: 'uppercase' }}>Notifications</Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 10 }}>Notifications are automatically scheduled based on your routines.</Text>
          
          {[
            'Morning Wakeup & Supplements',
            'Meal Timers',
            'Workout Reminder',
            'Night Routine & Minoxidil',
            'Weekly Assessment (Sunday)'
          ].map((n, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: colors.success, marginRight: 8 }}>✓</Text>
              <Text style={{ color: colors.foreground, fontSize: 13 }}>{n}</Text>
            </View>
          ))}
        </View>

        {/* Danger Zone */}
        <View style={{ backgroundColor: colors.error + '10', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.error + '40' }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.error, marginBottom: 16, textTransform: 'uppercase' }}>Danger Zone</Text>
          
          <Pressable onPress={handleReset} style={{ backgroundColor: colors.error, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Reset All Progress</Text>
          </Pressable>
          <Text style={{ color: colors.error, fontSize: 11, textAlign: 'center', marginTop: 12 }}>
            This action cannot be undone. All logs, streaks, and configurations will be permanently deleted.
          </Text>
        </View>

        <Text style={{ color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 40 }}>FORGE v1.0.0</Text>
      </ScrollView>
    </ScreenContainer>
  );
}
