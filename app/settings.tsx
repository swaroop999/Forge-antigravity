import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert, TextInput } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';
import { router } from 'expo-router';
import { Palette, Bell, Trash2, Info, User, ChevronRight, ChevronLeft, Bot, CheckCircle } from 'lucide-react-native';
import { geminiService, DEFAULT_GEMINI_MODEL } from '@/lib/services/gemini-service';

export default function SettingsScreen() {
  const colors = useColors();
  const { colorScheme, toggleColorScheme } = useColorScheme();

  // AI Coach settings
  const [apiKey, setApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState(DEFAULT_GEMINI_MODEL);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    (async () => {
      const storedKey = await AsyncStorage.getItem('gemini_api_key');
      if (storedKey) setApiKey(storedKey);
      const storedModel = await AsyncStorage.getItem('gemini_model');
      if (storedModel) setGeminiModel(storedModel);
    })();
  }, []);

  const saveAiSettings = async () => {
    await geminiService.setApiKey(apiKey.trim());
    const trimmed = geminiModel.trim();
    await AsyncStorage.setItem('gemini_model', trimmed || DEFAULT_GEMINI_MODEL);
    setTestStatus(null);
    setTestError(null);
    Alert.alert('Saved', 'API key and model saved.');
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Missing API Key', 'Enter your Gemini API key first.');
      return;
    }
    setIsTesting(true);
    setTestStatus(null);
    setTestError(null);
    try {
      // Save current values first so getModel() / getApiKey() reads them
      await geminiService.setApiKey(apiKey.trim());
      await AsyncStorage.setItem('gemini_model', geminiModel.trim() || DEFAULT_GEMINI_MODEL);
      const msg = await geminiService.testConnection();
      setTestStatus(msg);
    } catch (e: any) {
      setTestError(e?.message || 'Unknown error');
    } finally {
      setIsTesting(false);
    }
  };

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
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16 }}>
        <Pressable 
          onPress={() => router.back()}
          hitSlop={8}
          style={({ pressed }) => ({
            padding: 8, 
            marginRight: 8,
            backgroundColor: colors.surface,
            borderRadius: 20,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <ChevronLeft size={24} color={colors.foreground} />
        </Pressable>
        <Text style={{ fontSize: 24, fontWeight: '900', color: colors.foreground }}>Settings</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100, paddingTop: 16 }}>
        
        {/* AI Coach */}
        <Card title="AI Coach" icon={Bot} color={colors.primary}>
          {/* API Key */}
          <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 4 }}>Gemini API Key</Text>
          <TextInput
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="Paste your API key here"
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={{
              backgroundColor: colors.background, color: colors.foreground,
              borderRadius: 10, borderWidth: 1, borderColor: colors.border,
              paddingHorizontal: 12, paddingVertical: 10, fontSize: 13,
              marginBottom: 12, fontFamily: 'monospace',
            }}
          />

          {/* Model
            Alternatives (type one of these to switch):
              gemini-2.5-flash-lite  — higher free-tier quota, lower quality
              gemini-2.5-pro         — strongest reasoning, lower quota
          */}
          <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 4 }}>Gemini Model</Text>
          <TextInput
            value={geminiModel}
            onChangeText={setGeminiModel}
            placeholder={DEFAULT_GEMINI_MODEL}
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              backgroundColor: colors.background, color: colors.foreground,
              borderRadius: 10, borderWidth: 1, borderColor: colors.border,
              paddingHorizontal: 12, paddingVertical: 10, fontSize: 13,
              marginBottom: 12, fontFamily: 'monospace',
            }}
          />

          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            <Pressable
              onPress={saveAiSettings}
              style={({ pressed }) => ({
                flex: 1, backgroundColor: colors.primary, borderRadius: 10,
                paddingVertical: 10, alignItems: 'center', opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ color: '#000', fontWeight: '700', fontSize: 13 }}>Save</Text>
            </Pressable>
            <Pressable
              onPress={handleTestConnection}
              disabled={isTesting}
              style={({ pressed }) => ({
                flex: 1, backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1,
                borderColor: colors.border, paddingVertical: 10, alignItems: 'center',
                opacity: pressed || isTesting ? 0.6 : 1,
              })}
            >
              <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 13 }}>
                {isTesting ? 'Testing…' : 'Test'}
              </Text>
            </Pressable>
          </View>

          {testStatus != null && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <CheckCircle size={14} color={colors.success} />
              <Text style={{ color: colors.success, fontSize: 12, flex: 1 }}>{testStatus}</Text>
            </View>
          )}
          {testError != null && (
            <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>{testError}</Text>
          )}
        </Card>

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
