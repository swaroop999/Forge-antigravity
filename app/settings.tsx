import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert, TextInput, Modal } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';
import { router } from 'expo-router';
import { Palette, Bell, Trash2, Info, User, ChevronRight, ChevronLeft, Bot, CheckCircle, Database, Download, Upload, Calendar, AlertTriangle, X } from 'lucide-react-native';
import { geminiService, DEFAULT_GEMINI_MODEL } from '@/lib/services/gemini-service';
import { exportToJSON, pickAndParseBackupFile, getLastBackupDate, getBackupStats, BackupFile, importFromJSON } from '@/lib/backup';
import { Card } from '@/components/ui/card';


export default function SettingsScreen() {
  const colors = useColors();
  const { colorScheme, toggleColorScheme } = useColorScheme();

  // AI Coach settings
  const [apiKey, setApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState(DEFAULT_GEMINI_MODEL);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Backup & Restore
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState<BackupFile | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    (async () => {
      const storedKey = await AsyncStorage.getItem('gemini_api_key');
      if (storedKey) setApiKey(storedKey);
      const storedModel = await AsyncStorage.getItem('gemini_model');
      if (storedModel) setGeminiModel(storedModel);
      
      const backupDate = await getLastBackupDate();
      setLastBackup(backupDate);
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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToJSON();
      const date = await getLastBackupDate();
      setLastBackup(date);
      Alert.alert('Success', 'Data exported successfully.');
    } catch (e: any) {
      Alert.alert('Export Failed', e.message || 'An error occurred during export.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      const file = await pickAndParseBackupFile();
      if (file) {
        setImportData(file);
        setShowImportModal(true);
      }
    } catch (e: any) {
      Alert.alert('Import Failed', e.message || 'Could not parse the backup file.');
    }
  };

  const confirmImport = async () => {
    if (!importData) return;
    try {
      await importFromJSON(importData.data, importMode);
      setShowImportModal(false);
      setImportData(null);
      Alert.alert('Success', 'Data imported successfully.');
    } catch (e: any) {
      Alert.alert('Import Failed', e.message || 'An error occurred during import.');
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
            const allKeys = await AsyncStorage.getAllKeys();
            const keysToKeep = [
              'gemini_api_key', 
              'gemini_model', 
              'gemini_usage_stats', 
              'gemini_last_usage_date', 
              'forge_last_backup_date', 
              'color_scheme'
            ];
            const keysToRemove = allKeys.filter(k => !keysToKeep.includes(k));
            await AsyncStorage.multiRemove(keysToRemove);
            Alert.alert('Reset Complete', 'All progress has been erased. Time to rebuild.');
          }
        }
      ]
    );
  };

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

        {/* Data & Backup */}
        <Card title="Data & Backup" icon={Database} color={colors.primary}>
          {(() => {
            const isOldBackup = lastBackup ? (Date.now() - new Date(lastBackup).getTime()) > 7 * 24 * 60 * 60 * 1000 : true;
            
            return (
              <View style={{ marginBottom: 16 }}>
                {isOldBackup ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.warning + '20', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                    <AlertTriangle size={20} color={colors.warning} style={{ marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: '600' }}>No recent backup</Text>
                      <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                        Last backup: {lastBackup ? new Date(lastBackup).toLocaleDateString() : 'Never'}
                      </Text>
                      <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>Back up your data to avoid losing progress.</Text>
                    </View>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Calendar size={16} color={colors.muted} style={{ marginRight: 8 }} />
                    <Text style={{ color: colors.muted, fontSize: 13 }}>
                      Last backup: {new Date(lastBackup!).toLocaleDateString()}
                    </Text>
                  </View>
                )}
                
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable
                    onPress={handleExport}
                    disabled={isExporting}
                    style={({ pressed }) => ({
                      flex: 1, backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1,
                      borderColor: colors.border, paddingVertical: 10, alignItems: 'center',
                      flexDirection: 'row', justifyContent: 'center', gap: 8,
                      opacity: pressed || isExporting ? 0.6 : 1,
                    })}
                  >
                    <Download size={16} color={colors.foreground} />
                    <Text style={{ color: colors.foreground, fontWeight: '600', fontSize: 13 }}>
                      {isExporting ? 'Exporting...' : 'Export Data'}
                    </Text>
                  </Pressable>
                  
                  <Pressable
                    onPress={handleImport}
                    style={({ pressed }) => ({
                      flex: 1, backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1,
                      borderColor: colors.border, paddingVertical: 10, alignItems: 'center',
                      flexDirection: 'row', justifyContent: 'center', gap: 8,
                      opacity: pressed ? 0.6 : 1,
                    })}
                  >
                    <Upload size={16} color={colors.foreground} />
                    <Text style={{ color: colors.foreground, fontWeight: '600', fontSize: 13 }}>Import Data</Text>
                  </Pressable>
                </View>
                
                <Text style={{ color: colors.muted, fontSize: 12, marginTop: 12, textAlign: 'center' }}>
                  ⚠️ Your data is stored locally on this device. Regular backups are recommended.
                </Text>
              </View>
            );
          })()}
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

      {/* Import Modal */}
      <Modal
        visible={showImportModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowImportModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: colors.foreground }}>Import Backup</Text>
              <Pressable onPress={() => setShowImportModal(false)}>
                <X size={24} color={colors.muted} />
              </Pressable>
            </View>

            {importData && (() => {
              const stats = getBackupStats(importData.data);
              return (
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ color: colors.foreground, fontSize: 14, marginBottom: 4 }}>
                    <Text style={{ fontWeight: '700' }}>Created:</Text> {new Date(importData.metadata.exportDate).toLocaleDateString()}
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 12 }}>
                    Contains: {stats.tasks} daily logs, {stats.meals} workouts, {stats.habits} habits, {stats.skincare} journal entries.
                  </Text>

                  <View style={{ backgroundColor: colors.background, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border }}>
                    <Pressable 
                      onPress={() => setImportMode('replace')}
                      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
                    >
                      <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: importMode === 'replace' ? colors.primary : colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        {importMode === 'replace' && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary }} />}
                      </View>
                      <View>
                        <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: '600' }}>Replace all existing data</Text>
                        <Text style={{ color: colors.muted, fontSize: 12 }}>Overwrites your current data.</Text>
                      </View>
                    </Pressable>

                    <Pressable 
                      onPress={() => setImportMode('merge')}
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: importMode === 'merge' ? colors.primary : colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        {importMode === 'merge' && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary }} />}
                      </View>
                      <View>
                        <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: '600' }}>Merge with existing data</Text>
                        <Text style={{ color: colors.muted, fontSize: 12 }}>Combines both datasets.</Text>
                      </View>
                    </Pressable>
                  </View>
                  
                  <Text style={{ color: colors.warning, fontSize: 13, marginTop: 16, fontWeight: '600', textAlign: 'center' }}>
                    ⚠️ This action cannot be undone.
                  </Text>
                </View>
              );
            })()}

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setShowImportModal(false)}
                style={{ flex: 1, backgroundColor: colors.background, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}
              >
                <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 15 }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={confirmImport}
                style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
              >
                <Text style={{ color: '#000', fontWeight: '800', fontSize: 15 }}>Import</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
