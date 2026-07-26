import React from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';
import { Palette, Bell, Trash2, Info, User, ChevronRight } from 'lucide-react-native';

export default function SettingsScreen() {
  const colors = useColors();
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const handleReset = () => {
    Alert.alert(
      'Reset All Progress',
      'Are you absolutely sure? This will delete all your daily logs, streaks, and habits. There is no undo.',
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

  const Card = ({ children, title, icon: Icon, color }: any) => (
    <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
        {Icon && <Icon size={20} color={color || colors.primary} />}
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground }}>{title}</Text>
      </View>
      {children}
    </View>
  );

  return (
    <ScreenContainer>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <Text style={{ fontSize: 32, fontWeight: '900', color: colors.foreground, marginBottom: 24 }}>Settings</Text>
        
        {/* Profile */}
        <Card title="Profile" icon={User} color={colors.primary}>
          <Pressable style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
            <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: '500' }}>Edit Personal Data</Text>
            <ChevronRight size={18} color={colors.muted} />
          </Pressable>
        </Card>

        {/* Appearance */}
        <Card title="Appearance" icon={Palette} color={colors.warning}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
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
        </Card>

        {/* Notifications */}
        <Card title="Notifications" icon={Bell} color={colors.success}>
          <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 12 }}>Notifications are automatically scheduled based on your routines.</Text>
          {[
            'Morning Wakeup & Supplements',
            'Meal Timers',
            'Workout Reminder',
            'Night Routine'
          ].map((n, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: colors.success + '20', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success }} />
              </View>
              <Text style={{ color: colors.foreground, fontSize: 14 }}>{n}</Text>
            </View>
          ))}
        </Card>

        {/* About */}
        <Card title="About" icon={Info} color={colors.muted}>
          <Text style={{ color: colors.foreground, fontSize: 14, marginBottom: 4 }}>
            <Text style={{ fontWeight: '800' }}>FORGE</Text> — Life Transformation Tracker
          </Text>
          <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 8 }}>Version 1.0.0</Text>
          <Text style={{ color: colors.muted, fontSize: 12, fontStyle: 'italic' }}>"Built for becoming who you were meant to be."</Text>
        </Card>

        {/* Danger Zone */}
        <View style={{ backgroundColor: colors.error + '10', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.error + '40', marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
            <Trash2 size={20} color={colors.error} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.error }}>Danger Zone</Text>
          </View>
          
          <Pressable onPress={handleReset} style={{ backgroundColor: colors.error, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Reset All Progress</Text>
          </Pressable>
          <Text style={{ color: colors.error, fontSize: 12, textAlign: 'center', marginTop: 12 }}>
            This action cannot be undone. All logs, streaks, and configurations will be permanently deleted.
          </Text>
        </View>

      </ScrollView>
    </ScreenContainer>
  );
}
