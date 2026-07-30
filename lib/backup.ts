import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

const BACKUP_KEY = 'forge_last_backup_date';

export interface BackupMetadata {
  exportDate: string;
  appVersion: string;
  dataVersion: number;
}

export interface BackupFile {
  metadata: BackupMetadata;
  data: [string, string][]; // Key-value pairs from AsyncStorage
}

export async function exportToJSON(): Promise<boolean> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    // Exclude Gemini API key and model from export to protect privacy and device-specific config
    const keysToExport = allKeys.filter(k => !k.startsWith('gemini_') && k !== BACKUP_KEY);
    const storeData = await AsyncStorage.multiGet(keysToExport);
    
    // Filter out any null values to satisfy the [string, string][] type
    const validData = storeData.filter((pair): pair is [string, string] => pair[1] !== null);

    const backupData: BackupFile = {
      metadata: {
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
        dataVersion: 2, // Bumped to 2 for the new AsyncStorage based backup
      },
      data: validData,
    };
    
    const jsonString = JSON.stringify(backupData, null, 2);
    const fileName = `forge-backup-${new Date().toISOString().split('T')[0]}.json`;

    if (Platform.OS === 'web') {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, jsonString, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        throw new Error('Sharing is not available on this device');
      }
    }

    await setLastBackupDate(new Date().toISOString());
    return true;
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

export async function pickAndParseBackupFile(): Promise<BackupFile | null> {
  try {
    let jsonString = '';

    if (Platform.OS === 'web') {
      const file = await new Promise<File | null>((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = (e) => {
          const target = e.target as HTMLInputElement;
          resolve(target.files?.[0] || null);
        };
        input.click();
      });

      if (!file) return null;
      jsonString = await file.text();
    } else {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }
      const uri = result.assets[0].uri;
      jsonString = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 });
    }

    return validateBackupData(jsonString);
  } catch (error: any) {
    console.error('Import failed:', error);
    throw new Error(error.message || 'Failed to read the backup file.');
  }
}

function validateBackupData(jsonString: string): BackupFile {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.metadata || !parsed.data) {
      throw new Error('This file is missing required data.');
    }
    // Check if it's the old corrupted state format and fail gracefully or migrate if we cared
    if (parsed.data.appState !== undefined) {
      throw new Error('This is an old incompatible backup file that contains no real data.');
    }
    if (!Array.isArray(parsed.data)) {
      throw new Error('This backup file appears to be corrupted.');
    }
    return parsed as BackupFile;
  } catch (e: any) {
    if (e.name === 'SyntaxError') {
      throw new Error('This file is not a valid JSON backup file.');
    }
    throw e;
  }
}

export async function importFromJSON(data: [string, string][], mode: 'replace' | 'merge'): Promise<void> {
  if (mode === 'replace') {
    // Clear all app keys first, keeping gemini settings
    const allKeys = await AsyncStorage.getAllKeys();
    const keysToKeep = ['gemini_api_key', 'gemini_model', 'gemini_usage_stats', 'gemini_last_usage_date', BACKUP_KEY, 'color_scheme'];
    const keysToRemove = allKeys.filter(k => !keysToKeep.includes(k));
    await AsyncStorage.multiRemove(keysToRemove);
  }
  
  // Then load everything from the backup
  await AsyncStorage.multiSet(data);
}

export function getBackupStats(data: [string, string][]) {
  let dailyLogs = 0;
  let workouts = 0;
  let habits = 0;
  let journal = 0;
  
  data.forEach(([key, value]) => {
    if (key.startsWith('forge_daily_')) dailyLogs++;
    else if (key === 'forge_workout_logs') {
      try { workouts = JSON.parse(value).length; } catch { workouts = 1; }
    }
    else if (key === 'forge_habit_history') {
      try { habits = JSON.parse(value).length; } catch { habits = 1; }
    }
    else if (key === 'forge_journal_entries') {
      try { journal = JSON.parse(value).length; } catch { journal = 1; }
    }
  });

  return {
    tasks: dailyLogs,
    meals: workouts, // Using 'meals' to map to the UI's workouts text due to previous terminology, or we can just change settings.tsx to say workouts
    habits: habits,
    skincare: journal, // mapping journal entries to skincare for UI compatibility
  };
}

export async function getLastBackupDate(): Promise<string | null> {
  return AsyncStorage.getItem(BACKUP_KEY);
}

export async function setLastBackupDate(date: string): Promise<void> {
  await AsyncStorage.setItem(BACKUP_KEY, date);
}
