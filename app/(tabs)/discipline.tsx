import * as Haptics from "expo-haptics";
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, Pressable, TextInput, Alert, Image, Modal, ActivityIndicator } from "react-native";
import { Camera, Image as ImageIcon, Trash2, X, RefreshCw, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Check } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '@/components/screen-container';
import { SubTabBar } from '@/components/sub-tab-bar';
import { useColors } from '@/hooks/use-colors';
import { DisciplineRepo, NavRepo, PhotoRepo, type ProgressPhoto } from '@/lib/db/database';
import { JournalSupabaseService } from '@/lib/supabase';
import { KNOWLEDGE_ARTICLES } from '@/lib/db/seeds';

type Tab = 'dopamine' | 'journal' | 'knowledge';
const TABS = [
  { key: 'dopamine' as Tab, label: 'Dopamine', icon: '🧠' },
  { key: 'journal' as Tab, label: 'Journal', icon: '📔' },
  { key: 'knowledge' as Tab, label: 'Knowledge', icon: '📚' },
];

// ─── Dopamine Reset ────────────────────────────────────────────────────────────

function DopamineResetScreen() {
  const colors = useColors();
  const [pornStreak, setPornStreak] = useState(0);
  const [socialStreak, setSocialStreak] = useState(0);

  useEffect(() => {
    DisciplineRepo.getStreakPorn().then(setPornStreak);
    DisciplineRepo.getStreakSocial().then(setSocialStreak);
  }, []);

  const resetStreak = (type: 'porn' | 'social') => {
    Alert.alert('Reset Streak', `Are you sure you want to reset your ${type} streak?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset (I Relapsed)', style: 'destructive', onPress: async () => {
        if (type === 'porn') { setPornStreak(0); await DisciplineRepo.setStreakPorn(0); }
        else { setSocialStreak(0); await DisciplineRepo.setStreakSocial(0); }
      }}
    ]);
  };

  const addDay = async (type: 'porn' | 'social') => {
    if (type === 'porn') {
      const n = pornStreak + 1;
      setPornStreak(n);
      await DisciplineRepo.setStreakPorn(n);
    } else {
      const n = socialStreak + 1;
      setSocialStreak(n);
      await DisciplineRepo.setStreakSocial(n);
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.error, marginBottom: 8 }}>The Dopamine Problem</Text>
        <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20 }}>
          Porn and infinite scrolling give you 1000% dopamine spikes. Real life gives 50-100%.{"\n"}
          Your brain has adapted to expect 1000%. That's why you procrastinate and feel unmotivated.{"\n"}
          You MUST starve the cheap dopamine to make real effort feel rewarding again.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
        <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>🔞</Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.foreground }}>No Porn</Text>
          <Text style={{ fontSize: 36, fontWeight: '900', color: pornStreak > 7 ? colors.success : colors.warning, marginVertical: 8 }}>{pornStreak}</Text>
          <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 12 }}>Days Clean</Text>
          <Pressable onPress={() => addDay('porn')} style={{ backgroundColor: colors.primary + '20', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>+ Add Day</Text>
          </Pressable>
          <Pressable onPress={() => resetStreak('porn')} style={{ paddingVertical: 8 }}>
            <Text style={{ color: colors.error, fontSize: 11, textDecorationLine: 'underline' }}>Reset</Text>
          </Pressable>
        </View>

        <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>📱</Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.foreground }}>No Mindless Scroll</Text>
          <Text style={{ fontSize: 36, fontWeight: '900', color: socialStreak > 7 ? colors.success : colors.warning, marginVertical: 8 }}>{socialStreak}</Text>
          <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 12 }}>Days Clean</Text>
          <Pressable onPress={() => addDay('social')} style={{ backgroundColor: colors.primary + '20', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>+ Add Day</Text>
          </Pressable>
          <Pressable onPress={() => resetStreak('social')} style={{ paddingVertical: 8 }}>
            <Text style={{ color: colors.error, fontSize: 11, textDecorationLine: 'underline' }}>Reset</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ backgroundColor: colors.primary + '15', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.primary + '40' }}>
        <Text style={{ color: colors.primary, fontWeight: '700', marginBottom: 8 }}>Urge Survival Tactics</Text>
        <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 18 }}>
          1. <Text style={{ fontWeight: '700' }}>20 Push-ups immediately.</Text> Forces blood to muscles.
          {"\n"}2. <Text style={{ fontWeight: '700' }}>Cold water on face.</Text> Activates mammalian dive reflex, lowers heart rate.
          {"\n"}3. <Text style={{ fontWeight: '700' }}>Change rooms.</Text> Physical movement breaks the mental loop.
          {"\n"}4. <Text style={{ fontWeight: '700' }}>Talk to AI Coach.</Text> Hit the "I want to relapse" quick prompt.
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Journal & Daily Photo Tracking ──────────────────────────────────────────

interface ActivePhotoModal {
  url: string;
  date: string;
  note?: string;
  onDelete?: () => void;
}

function PhotoDetailModal({
  photo,
  onClose,
}: {
  photo: ActivePhotoModal | null;
  onClose: () => void;
}) {
  const colors = useColors();
  if (!photo) return null;

  return (
    <Modal visible={!!photo} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.96)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        {/* Header bar */}
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 40, paddingBottom: 16, paddingHorizontal: 4 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800' }}>{photo.date}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {photo.onDelete ? (
              <Pressable
                onPress={() => {
                  photo.onDelete?.();
                  onClose();
                }}
                style={({ pressed }) => ({
                  backgroundColor: 'rgba(239,68,68,0.3)', width: 38, height: 38, borderRadius: 19,
                  alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1,
                })}>
                <Trash2 size={18} color="#EF4444" />
              </Pressable>
            ) : null}
            <Pressable onPress={onClose} style={({ pressed }) => ({
              backgroundColor: 'rgba(255,255,255,0.2)', width: 38, height: 38, borderRadius: 19,
              alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1,
            })}>
              <X size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* Image preview */}
        <Image
          source={{ uri: photo.url }}
          style={{ width: '100%', flex: 1, borderRadius: 14 }}
          resizeMode="contain"
        />

        {/* Note snippet */}
        {photo.note ? (
          <View style={{ width: '100%', backgroundColor: 'rgba(25,25,25,0.92)', borderRadius: 14, padding: 14, marginTop: 14, borderWidth: 1, borderColor: '#333333' }}>
            <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 }}>Daily Reflection Note</Text>
            <Text style={{ color: '#F0F0F0', fontSize: 13, lineHeight: 19 }} numberOfLines={4}>{photo.note}</Text>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function JournalWriteView({
  date,
  onSaved,
  onViewCalendar,
  onResetToToday,
}: {
  date: string;
  onSaved: () => void;
  onViewCalendar: () => void;
  onResetToToday: () => void;
}) {
  const colors = useColors();
  const [entry, setEntry] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<ActivePhotoModal | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const isToday = date === today;

  const formattedDate = (() => {
    try {
      return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      });
    } catch { return date; }
  })();

  const loadData = async () => {
    try {
      const day = await DisciplineRepo.getJournalDay(date);
      setEntry(day.content || '');
      setPhotos(day.photoUrls || []);
      if (day.content || day.photoUrls.length > 0) {
        setSaved(true);
      } else {
        setSaved(false);
      }
    } catch {}
  };

  useEffect(() => {
    loadData();
  }, [date]);

  const handleTakePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Camera Permission Required', 'Please enable camera access in your device settings to take daily progress photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setPhotos(prev => [...prev, result.assets[0].uri]);
        setSaved(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (e: any) {
      console.warn('Camera error:', e);
      Alert.alert('Camera Error', 'Could not open camera.');
    }
  };

  const handlePickPhotos = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Photos Permission Required', 'Please enable photos library access in your device settings to select progress photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUris = result.assets.map(a => a.uri).filter(Boolean);
        setPhotos(prev => [...prev, ...newUris]);
        setSaved(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (e: any) {
      console.warn('Photo picker error:', e);
      Alert.alert('Photo Picker Error', 'Could not open photo gallery.');
    }
  };

  const handleRemovePhoto = (index: number) => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setPhotos(prev => prev.filter((_, i) => i !== index));
          setSaved(false);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
      },
    ]);
  };

  const handleDeleteEntireEntry = () => {
    Alert.alert('Delete Entry?', `Delete all notes and photos for ${formattedDate}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await DisciplineRepo.deleteJournalDay(date);
          setEntry('');
          setPhotos([]);
          setSaved(false);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onSaved();
          Alert.alert('Deleted', 'Entry removed successfully.');
        },
      },
    ]);
  };

  const saveEntry = async () => {
    if (!entry.trim() && photos.length === 0) {
      Alert.alert('Empty Entry', 'Please write a reflection or add at least one photo before saving.');
      return;
    }
    setIsSaving(true);
    try {
      const uploadedPhotos: string[] = [];
      for (const p of photos) {
        if (!p.startsWith('http')) {
          try {
            const up = await JournalSupabaseService.uploadPhoto(p, date);
            uploadedPhotos.push(up || p);
          } catch {
            uploadedPhotos.push(p);
          }
        } else {
          uploadedPhotos.push(p);
        }
      }

      await DisciplineRepo.setJournalDay(date, entry, uploadedPhotos);
      setPhotos(uploadedPhotos);
      setSaved(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSaved();
    } catch (e) {
      Alert.alert('Error', 'Failed to save journal reflection.');
    } finally {
      setIsSaving(false);
    }
  };

  const hasExistingData = !!(entry.trim() || photos.length > 0 || saved);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, paddingBottom: 120 }}>
      {/* Date Header & Cloud Sync */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.foreground }}>
          {isToday ? 'Today' : formattedDate}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.success + '20', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, gap: 4 }}>
          <Text style={{ fontSize: 10 }}>☁️</Text>
          <Text style={{ color: colors.success, fontSize: 10, fontWeight: '700' }}>Cloud Synced</Text>
        </View>
      </View>

      {!isToday && (
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: colors.primary + '15', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
          marginBottom: 12, borderWidth: 1, borderColor: colors.primary + '40',
        }}>
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>
            📅 Editing entry for {date}
          </Text>
          <Pressable onPress={onResetToToday}>
            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800', textDecorationLine: 'underline' }}>
              Switch to Today
            </Text>
          </Pressable>
        </View>
      )}

      {/* Journal Reflection Text Area */}
      <TextInput
        value={entry}
        onChangeText={(t) => { setEntry(t); setSaved(false); }}
        placeholder="Write your thoughts, daily wins, slips, and focus for tomorrow..."
        placeholderTextColor={colors.muted}
        multiline
        textAlignVertical="top"
        style={{
          backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
          borderRadius: 14, padding: 16, color: colors.foreground, fontSize: 14,
          minHeight: 160, marginBottom: 16, lineHeight: 22,
        }}
      />

      {/* ─── 📸 Multi-Photo Upload Section ────────────────────────── */}
      <View style={{
        backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 20,
        borderWidth: 1, borderColor: photos.length > 0 ? colors.primary + '50' : colors.border,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.foreground }}>📸 Photos</Text>
            {photos.length > 0 && (
              <View style={{ backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>{photos.length}</Text>
              </View>
            )}
          </View>
          <Text style={{ color: colors.muted, fontSize: 11 }}>Upload multiple photos</Text>
        </View>

        <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 14 }}>
          Take or select pictures from today to track your transformation journey.
        </Text>

        {/* Upload Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: photos.length > 0 ? 14 : 0 }}>
          <Pressable
            onPress={handleTakePhoto}
            style={({ pressed }) => ({
              flex: 1, backgroundColor: colors.primary + '18',
              borderColor: colors.primary + '50', borderWidth: 1,
              borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center',
              flexDirection: 'row', gap: 6, opacity: pressed ? 0.8 : 1,
            })}>
            <Camera size={18} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12 }}>Take Photo</Text>
          </Pressable>

          <Pressable
            onPress={handlePickPhotos}
            style={({ pressed }) => ({
              flex: 1, backgroundColor: colors.background,
              borderColor: colors.border, borderWidth: 1,
              borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center',
              flexDirection: 'row', gap: 6, opacity: pressed ? 0.8 : 1,
            })}>
            <ImageIcon size={18} color={colors.foreground} />
            <Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 12 }}>Add from Gallery</Text>
          </Pressable>
        </View>

        {/* Horizontal Scroll of Uploaded Photos */}
        {photos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 4 }}>
            {photos.map((uri, idx) => (
              <View
                key={uri + idx}
                style={{
                  width: 120, height: 150, borderRadius: 12, overflow: 'hidden',
                  backgroundColor: colors.border, borderWidth: 1, borderColor: colors.border,
                  position: 'relative',
                }}
              >
                <Pressable
                  onPress={() => setPreviewPhoto({
                    url: uri,
                    date: formattedDate,
                    note: entry,
                    onDelete: () => handleRemovePhoto(idx),
                  })}
                  style={{ flex: 1 }}
                >
                  <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                </Pressable>

                {/* Badge Number */}
                <View style={{
                  position: 'absolute', bottom: 6, left: 6,
                  backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 6,
                  paddingHorizontal: 5, paddingVertical: 2,
                }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 9.5, fontWeight: '700' }}>#{idx + 1}</Text>
                </View>

                {/* Remove 'X' Button */}
                <Pressable
                  onPress={() => handleRemovePhoto(idx)}
                  style={({ pressed }) => ({
                    position: 'absolute', top: 6, right: 6,
                    backgroundColor: 'rgba(239, 68, 68, 0.9)',
                    width: 24, height: 24, borderRadius: 12,
                    alignItems: 'center', justifyContent: 'center',
                    opacity: pressed ? 0.7 : 1,
                  })}>
                  <X size={14} color="#FFFFFF" />
                </Pressable>
              </View>
            ))}

            {/* Quick "+ Add More" card */}
            <Pressable
              onPress={handlePickPhotos}
              style={({ pressed }) => ({
                width: 100, height: 150, borderRadius: 12,
                borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed',
                backgroundColor: colors.background,
                alignItems: 'center', justifyContent: 'center', gap: 6,
                opacity: pressed ? 0.7 : 1,
              })}>
              <Plus size={22} color={colors.muted} />
              <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '700' }}>Add More</Text>
            </Pressable>
          </ScrollView>
        )}
      </View>

      {/* Save Button */}
      <Pressable onPress={saveEntry} disabled={isSaving} style={({ pressed }) => ({
        backgroundColor: saved ? colors.success : colors.primary,
        borderRadius: 14, paddingVertical: 15, alignItems: 'center',
        opacity: pressed || isSaving ? 0.85 : 1, flexDirection: 'row', justifyContent: 'center', gap: 8,
      })}>
        {isSaving ? (
          <>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}>Saving & Syncing...</Text>
          </>
        ) : (
          <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}>
            {saved ? '✓ Saved & Synced' : 'Save Reflection & Photos'}
          </Text>
        )}
      </Pressable>

      {/* Delete Entry Button */}
      {hasExistingData && (
        <Pressable
          onPress={handleDeleteEntireEntry}
          style={({ pressed }) => ({
            marginTop: 14, paddingVertical: 12, borderRadius: 12,
            borderWidth: 1, borderColor: colors.error + '50',
            backgroundColor: colors.error + '10',
            alignItems: 'center', justifyContent: 'center',
            flexDirection: 'row', gap: 6, opacity: pressed ? 0.7 : 1,
          })}>
          <Trash2 size={15} color={colors.error} />
          <Text style={{ color: colors.error, fontSize: 13, fontWeight: '700' }}>
            Delete Entry for {date}
          </Text>
        </Pressable>
      )}

      {/* Link to Calendar */}
      <Pressable onPress={onViewCalendar} style={{ marginTop: 18, alignItems: 'center' }}>
        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>
          📅 View past reflections & photos in Calendar →
        </Text>
      </Pressable>

      <PhotoDetailModal
        photo={previewPhoto}
        onClose={() => setPreviewPhoto(null)}
      />
    </ScrollView>
  );
}

// ─── 📅 Unified Calendar & History View ────────────────────────────────────────

function JournalCalendarView({
  refreshKey,
  selectedDate,
  onSelectDate,
  onEditDate,
  onPhotoPress,
}: {
  refreshKey: number;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onEditDate: (date: string) => void;
  onPhotoPress: (photo: ActivePhotoModal) => void;
}) {
  const colors = useColors();

  const parsedDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(() => parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => parsedDate.getMonth()); // 0-11

  const [entryMap, setEntryMap] = useState<Record<string, { hasReflection: boolean; hasPhotos: boolean; photoCount: number }>>({});
  const [selectedDayData, setSelectedDayData] = useState<{
    date: string;
    content?: string;
    photoUrls: string[];
    mood?: string;
    tags?: string[];
  } | null>(null);
  const [loadingDay, setLoadingDay] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const loadEntryMap = async () => {
    try {
      const map = await DisciplineRepo.getEntryDatesMap();
      setEntryMap(map);
    } catch (e) {
      console.warn('Error loading entry map:', e);
    }
  };

  const loadSelectedDay = async (date: string) => {
    setLoadingDay(true);
    try {
      const day = await DisciplineRepo.getJournalDay(date);
      setSelectedDayData(day);
    } catch (e) {
      console.warn('Error loading selected day:', e);
    } finally {
      setLoadingDay(false);
    }
  };

  useEffect(() => {
    loadEntryMap();
  }, [refreshKey]);

  useFocusEffect(
    useCallback(() => {
      loadEntryMap();
      loadSelectedDay(selectedDate);
    }, [selectedDate])
  );

  useEffect(() => {
    loadSelectedDay(selectedDate);
  }, [selectedDate, refreshKey]);

  // Calendar month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const jumpToToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    onSelectDate(today);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const monthTitle = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Monday-first: (day + 6) % 7
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const formattedSelectedDate = (() => {
    try {
      return new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  })();

  const handleDeletePhoto = (photoUrl: string) => {
    Alert.alert('Delete Photo?', 'Are you sure you want to delete this photo from this entry? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await DisciplineRepo.deleteJournalPhoto(selectedDate, photoUrl);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          loadSelectedDay(selectedDate);
          loadEntryMap();
        },
      },
    ]);
  };

  const handleDeleteReflection = () => {
    Alert.alert('Delete Reflection?', `Delete the reflection note for ${selectedDate}? Photos will be kept.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete Reflection',
        style: 'destructive',
        onPress: async () => {
          await DisciplineRepo.deleteJournalReflectionOnly(selectedDate);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          loadSelectedDay(selectedDate);
          loadEntryMap();
        },
      },
    ]);
  };

  const handleDeleteEntireDay = () => {
    Alert.alert('Delete Entire Day Entry?', `Delete all reflection notes and photos for ${selectedDate}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete Everything',
        style: 'destructive',
        onPress: async () => {
          await DisciplineRepo.deleteJournalDay(selectedDate);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          loadSelectedDay(selectedDate);
          loadEntryMap();
        },
      },
    ]);
  };

  const hasData = Boolean(
    (selectedDayData?.content && selectedDayData.content.trim().length > 0) ||
    (selectedDayData?.photoUrls && selectedDayData.photoUrls.length > 0)
  );

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>
      {/* ─── Calendar Card ────────────────────────────────────────── */}
      <View style={{
        backgroundColor: colors.surface, borderRadius: 16, padding: 14,
        borderWidth: 1, borderColor: colors.border, marginBottom: 16,
      }}>
        {/* Month Header & Controls */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <CalendarIcon size={16} color={colors.primary} />
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.foreground }}>
              {monthTitle}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Pressable
              onPress={jumpToToday}
              style={({ pressed }) => ({
                paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8,
                backgroundColor: colors.primary + '18', borderWidth: 1, borderColor: colors.primary + '35',
                opacity: pressed ? 0.7 : 1,
              })}>
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800' }}>Today</Text>
            </Pressable>

            <Pressable
              onPress={prevMonth}
              style={({ pressed }) => ({
                width: 32, height: 32, borderRadius: 8,
                backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
                alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1,
              })}>
              <ChevronLeft size={16} color={colors.foreground} />
            </Pressable>

            <Pressable
              onPress={nextMonth}
              style={({ pressed }) => ({
                width: 32, height: 32, borderRadius: 8,
                backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
                alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1,
              })}>
              <ChevronRight size={16} color={colors.foreground} />
            </Pressable>
          </View>
        </View>

        {/* Weekday Labels (Mon - Sun) */}
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(w => (
            <View key={w} style={{ width: '14.28%', alignItems: 'center' }}>
              <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '700' }}>{w}</Text>
            </View>
          ))}
        </View>

        {/* Days Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {/* Leading empty cells */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <View key={`empty-${i}`} style={{ width: '14.28%', height: 46 }} />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isSelected = dayStr === selectedDate;
            const isToday = dayStr === today;
            const entryInfo = entryMap[dayStr];
            const hasRef = Boolean(entryInfo?.hasReflection);
            const hasPics = Boolean(entryInfo?.hasPhotos);

            return (
              <Pressable
                key={dayStr}
                onPress={() => {
                  onSelectDate(dayStr);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={({ pressed }) => ({
                  width: '14.28%', height: 46,
                  alignItems: 'center', justifyContent: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}>
                <View style={{
                  width: 34, height: 36, borderRadius: 10,
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: isSelected
                    ? colors.primary
                    : isToday
                    ? colors.primary + '18'
                    : 'transparent',
                  borderWidth: isSelected
                    ? 0
                    : isToday
                    ? 1.5
                    : 0,
                  borderColor: colors.primary,
                }}>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: isSelected ? '800' : isToday ? '800' : '600',
                    color: isSelected ? '#FFFFFF' : isToday ? colors.primary : colors.foreground,
                  }}>
                    {dayNum}
                  </Text>

                  {/* Indicator Dots */}
                  <View style={{ flexDirection: 'row', gap: 2.5, height: 4, marginTop: 2, alignItems: 'center', justifyContent: 'center' }}>
                    {hasRef && (
                      <View style={{
                        width: 4, height: 4, borderRadius: 2,
                        backgroundColor: isSelected ? '#A7F3D0' : '#10B981',
                      }} />
                    )}
                    {hasPics && (
                      <View style={{
                        width: 4, height: 4, borderRadius: 2,
                        backgroundColor: isSelected ? '#BAE6FD' : '#06B6D4',
                      }} />
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Legend */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          gap: 18, paddingTop: 10, marginTop: 4,
          borderTopWidth: 1, borderColor: colors.border + '60',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
            <Text style={{ fontSize: 11, color: colors.muted, fontWeight: '700' }}>Reflection</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#06B6D4' }} />
            <Text style={{ fontSize: 11, color: colors.muted, fontWeight: '700' }}>Photos</Text>
          </View>
        </View>
      </View>

      {/* ─── Selected Day Details ────────────────────────────────────── */}
      <View style={{
        backgroundColor: colors.surface, borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: colors.border,
      }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <View>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.foreground }}>
              {formattedSelectedDate}
            </Text>
            <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
              {selectedDate === today ? 'Today' : selectedDate}
            </Text>
          </View>

          <Pressable
            onPress={() => onEditDate(selectedDate)}
            style={({ pressed }) => ({
              paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
              backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 5,
              opacity: pressed ? 0.85 : 1,
            })}>
            <Plus size={13} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '800' }}>
              {hasData ? 'Edit / Add' : 'Add Entry'}
            </Text>
          </Pressable>
        </View>

        {loadingDay ? (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <ActivityIndicator color={colors.primary} size="small" />
          </View>
        ) : !hasData ? (
          <View style={{
            padding: 24, alignItems: 'center', borderRadius: 12,
            borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
          }}>
            <Text style={{ fontSize: 30, marginBottom: 8 }}>📅</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>
              No Entry for this Date
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted, textAlign: 'center', marginBottom: 16, lineHeight: 18 }}>
              Record a daily reflection or upload progress photos to track your journey.
            </Text>
            <Pressable
              onPress={() => onEditDate(selectedDate)}
              style={({ pressed }) => ({
                backgroundColor: colors.primary + '20', borderWidth: 1, borderColor: colors.primary,
                paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10,
                opacity: pressed ? 0.8 : 1,
              })}>
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '800' }}>
                ✍️ Write or Upload for this Date
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* 1. Written Reflection Card */}
            {selectedDayData?.content && selectedDayData.content.trim().length > 0 && (
              <View style={{
                backgroundColor: colors.background, borderRadius: 12, padding: 14,
                marginBottom: 14, borderWidth: 1, borderColor: colors.border,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
                    <Text style={{ fontSize: 12, fontWeight: '800', color: colors.foreground, textTransform: 'uppercase' }}>
                      Daily Reflection
                    </Text>
                  </View>

                  <Pressable
                    onPress={handleDeleteReflection}
                    hitSlop={8}
                    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}>
                    <Trash2 size={14} color={colors.error} />
                  </Pressable>
                </View>

                <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 20 }}>
                  {selectedDayData.content}
                </Text>
              </View>
            )}

            {/* 2. Photos Section: Horizontal Swipe / Scroll Gallery */}
            {selectedDayData?.photoUrls && selectedDayData.photoUrls.length > 0 && (
              <View style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#06B6D4' }} />
                    <Text style={{ fontSize: 13, fontWeight: '800', color: colors.foreground }}>
                      Photos ({selectedDayData.photoUrls.length})
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, color: colors.muted }}>Swipe to browse →</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  {selectedDayData.photoUrls.map((url, idx) => (
                    <View
                      key={`${url}-${idx}`}
                      style={{
                        width: 200, height: 260, borderRadius: 14, overflow: 'hidden',
                        backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
                        position: 'relative',
                      }}>
                      <Pressable
                        style={{ width: '100%', height: '100%' }}
                        onPress={() => onPhotoPress({
                          url,
                          date: selectedDate,
                          note: selectedDayData.content,
                          onDelete: () => handleDeletePhoto(url),
                        })}>
                        <Image
                          source={{ uri: url }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      </Pressable>

                      {/* Badge Number */}
                      <View style={{
                        position: 'absolute', bottom: 8, left: 8,
                        backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 6,
                        paddingHorizontal: 6, paddingVertical: 3,
                      }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>
                          #{idx + 1} of {selectedDayData.photoUrls.length}
                        </Text>
                      </View>

                      {/* Direct Delete Button */}
                      <Pressable
                        onPress={() => handleDeletePhoto(url)}
                        style={({ pressed }) => ({
                          position: 'absolute', top: 8, right: 8,
                          backgroundColor: 'rgba(239, 68, 68, 0.9)',
                          width: 28, height: 28, borderRadius: 14,
                          alignItems: 'center', justifyContent: 'center',
                          opacity: pressed ? 0.7 : 1,
                        })}>
                        <Trash2 size={14} color="#FFFFFF" />
                      </Pressable>
                    </View>
                  ))}

                  {/* Quick "+ Add More" card at the end */}
                  <Pressable
                    onPress={() => onEditDate(selectedDate)}
                    style={({ pressed }) => ({
                      width: 120, height: 260, borderRadius: 14,
                      borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed',
                      backgroundColor: colors.background,
                      alignItems: 'center', justifyContent: 'center', gap: 8,
                      opacity: pressed ? 0.7 : 1,
                    })}>
                    <Plus size={24} color={colors.primary} />
                    <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700' }}>Add More</Text>
                  </Pressable>
                </ScrollView>
              </View>
            )}

            {/* 3. Delete Entire Day Button */}
            <Pressable
              onPress={handleDeleteEntireDay}
              style={({ pressed }) => ({
                marginTop: 6, paddingVertical: 12, borderRadius: 12,
                borderWidth: 1, borderColor: colors.error + '40',
                backgroundColor: colors.error + '10',
                alignItems: 'center', justifyContent: 'center',
                flexDirection: 'row', gap: 6, opacity: pressed ? 0.7 : 1,
              })}>
              <Trash2 size={14} color={colors.error} />
              <Text style={{ color: colors.error, fontSize: 12, fontWeight: '700' }}>
                Delete All Entries for {selectedDate}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </ScrollView>
  );
}

// ─── 📔 Journal Tab Master Container (2 Subtabs: Write & Calendar) ───────────

function JournalScreen() {
  const colors = useColors();
  const [journalTab, setJournalTab] = useState<'write' | 'calendar'>('write');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activePhotoModal, setActivePhotoModal] = useState<ActivePhotoModal | null>(null);

  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={{ flex: 1 }}>
      {/* 2-Tab Navigation Bar */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6, gap: 8 }}>
        <Pressable
          onPress={() => setJournalTab('write')}
          style={({ pressed }) => ({
            flex: 1, paddingVertical: 10, borderRadius: 12,
            backgroundColor: journalTab === 'write' ? colors.primary : colors.surface,
            borderWidth: 1, borderColor: journalTab === 'write' ? colors.primary : colors.border,
            alignItems: 'center', opacity: pressed ? 0.85 : 1,
            flexDirection: 'row', justifyContent: 'center', gap: 6,
          })}>
          <Text style={{
            color: journalTab === 'write' ? '#FFFFFF' : colors.foreground,
            fontWeight: '800', fontSize: 12,
          }}>
            ✍️ {selectedDate === today ? "Today's Entry" : `Edit (${selectedDate})`}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setJournalTab('calendar')}
          style={({ pressed }) => ({
            flex: 1, paddingVertical: 10, borderRadius: 12,
            backgroundColor: journalTab === 'calendar' ? colors.primary : colors.surface,
            borderWidth: 1, borderColor: journalTab === 'calendar' ? colors.primary : colors.border,
            alignItems: 'center', opacity: pressed ? 0.85 : 1,
            flexDirection: 'row', justifyContent: 'center', gap: 6,
          })}>
          <CalendarIcon size={14} color={journalTab === 'calendar' ? '#FFFFFF' : colors.foreground} />
          <Text style={{
            color: journalTab === 'calendar' ? '#FFFFFF' : colors.foreground,
            fontWeight: '800', fontSize: 12,
          }}>
            📅 Calendar & History
          </Text>
        </Pressable>
      </View>

      {journalTab === 'write' ? (
        <JournalWriteView
          date={selectedDate}
          onSaved={() => {
            setRefreshKey(k => k + 1);
          }}
          onViewCalendar={() => setJournalTab('calendar')}
          onResetToToday={() => setSelectedDate(today)}
        />
      ) : (
        <JournalCalendarView
          refreshKey={refreshKey}
          selectedDate={selectedDate}
          onSelectDate={(d) => setSelectedDate(d)}
          onEditDate={(d) => {
            setSelectedDate(d);
            setJournalTab('write');
          }}
          onPhotoPress={setActivePhotoModal}
        />
      )}

      {/* Full-screen Photo Modal */}
      <PhotoDetailModal
        photo={activePhotoModal}
        onClose={() => setActivePhotoModal(null)}
      />
    </View>
  );
}

// ─── Knowledge Base ────────────────────────────────────────────────────────────

function KnowledgeScreen() {
  const colors = useColors();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (selectedId) {
    const article = KNOWLEDGE_ARTICLES.find(a => a.id === selectedId);
    if (!article) return null;

    const renderMarkdown = (text: string) => {
      return text.split('\n').map((line, i) => {
        if (line.startsWith('# ')) return <Text key={i} style={{ fontSize: 22, fontWeight: '900', color: colors.foreground, marginTop: 16, marginBottom: 12 }}>{line.replace('# ', '')}</Text>;
        if (line.startsWith('## ')) return <Text key={i} style={{ fontSize: 18, fontWeight: '800', color: colors.primary, marginTop: 24, marginBottom: 10 }}>{line.replace('## ', '')}</Text>;
        if (line.startsWith('**') && line.endsWith('**')) return <Text key={i} style={{ fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>{line.replace(/\*\*/g, '')}</Text>;
        if (line.startsWith('- ')) return <Text key={i} style={{ color: colors.muted, fontSize: 14, marginLeft: 16, marginBottom: 6, lineHeight: 22 }}>• {line.replace('- ', '')}</Text>;
        if (line.trim() === '') return <View key={i} style={{ height: 12 }} />;

        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <Text key={i} style={{ color: colors.muted, fontSize: 14, marginBottom: 12, lineHeight: 22 }}>
            {parts.map((p, j) => p.startsWith('**')
              ? <Text key={j} style={{ fontWeight: '700', color: colors.foreground }}>{p.replace(/\*\*/g, '')}</Text>
              : p)}
          </Text>
        );
      });
    };

    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <Pressable onPress={() => setSelectedId(null)} style={({ pressed }) => ({
          flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8, opacity: pressed ? 0.7 : 1,
        })}>
          <Text style={{ color: colors.primary, fontSize: 16 }}>←</Text>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Back</Text>
        </Pressable>

        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.foreground, marginBottom: 6 }}>{article.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.muted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>{article.category}</Text>
          </View>
          <Text style={{ color: colors.muted, fontSize: 11 }}>{article.readingTime} min read</Text>
        </View>

        {renderMarkdown(article.content)}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 16 }}>Read these to understand the science behind your transformation plan. Knowledge breeds conviction.</Text>

      {KNOWLEDGE_ARTICLES.map(a => (
        <Pressable key={a.id} onPress={() => setSelectedId(a.id)}
          style={({ pressed }) => ({
            backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 12,
            borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.8 : 1,
            flexDirection: 'row', alignItems: 'center',
          })}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>{a.category}</Text>
              <Text style={{ color: colors.muted, fontSize: 10 }}>• {a.readingTime}m read</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground }}>{a.title}</Text>
          </View>
          <Text style={{ color: colors.muted, fontSize: 16 }}>›</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// ─── Main Discipline Screen ───────────────────────────────────────────────────

export default function DisciplineScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<Tab>('dopamine');

  useFocusEffect(useCallback(() => {
    NavRepo.consumePendingSubTab('/(tabs)/discipline').then((pending) => {
      if (pending && (pending === 'dopamine' || pending === 'journal' || pending === 'knowledge')) {
        setActiveTab(pending);
      }
    });
  }, []));

  return (
    <ScreenContainer>
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
          <Text style={{ fontSize: 26, fontWeight: '900', color: colors.foreground }}>Discipline 🧠</Text>
          <Text style={{ color: colors.muted, fontSize: 13 }}>Mindset · Reflection · Learning</Text>
        </View>

        <SubTabBar tabs={TABS} activeTab={activeTab as string} onTabChange={(k) => setActiveTab(k as Tab)} />

        <View style={{ flex: 1 }}>
          {activeTab === 'dopamine' && <DopamineResetScreen />}
          {activeTab === 'journal' && <JournalScreen />}
          {activeTab === 'knowledge' && <KnowledgeScreen />}
        </View>
      </View>
    </ScreenContainer>
  );
}
