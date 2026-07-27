import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { ForgeState } from './store/app-store';

const BACKUP_KEY = 'forge_last_backup_date';

export interface BackupMetadata {
  exportDate: string;
  appVersion: string;
  dataVersion: number;
}

export interface BackupFile {
  metadata: BackupMetadata;
  data: ForgeState;
}

export async function exportToJSON(state: ForgeState): Promise<boolean> {
  try {
    const backupData: BackupFile = {
      metadata: {
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
        dataVersion: 1,
      },
      data: state,
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
      // Create hidden file input for web
      const file = await new Promise<File | null>((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = (e) => {
          const target = e.target as HTMLInputElement;
          resolve(target.files?.[0] || null);
        };
        // Note: oncancel doesn't work reliably across all browsers,
        // but since it's a fallback it's mostly fine.
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
    if (!parsed.data.appState) {
      throw new Error('This backup file appears to be corrupted.');
    }
    return parsed as BackupFile;
  } catch (e: any) {
    if (e.name === 'SyntaxError') {
      throw new Error('This file is not a valid backup file.');
    }
    throw e;
  }
}

export function getBackupStats(data: ForgeState) {
  return {
    tasks: data.dailyTasks?.length || 0,
    meals: data.mealEntries?.length || 0,
    habits: data.habitEntries?.length || 0,
    skincare: data.skincareRoutines?.length || 0,
    dopamine: data.dopamineEntries?.length || 0,
  };
}

export async function getLastBackupDate(): Promise<string | null> {
  return AsyncStorage.getItem(BACKUP_KEY);
}

export async function setLastBackupDate(date: string): Promise<void> {
  await AsyncStorage.setItem(BACKUP_KEY, date);
}
