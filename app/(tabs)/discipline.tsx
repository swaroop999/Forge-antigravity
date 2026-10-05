import * as Haptics from "expo-haptics";
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, Pressable, TextInput, Alert, Image, Modal, ActivityIndicator } from "react-native";
import { Camera, Image as ImageIcon, Trash2, X, RefreshCw } from 'lucide-react-native';
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
  category?: string;
  note?: string;
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
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        {/* Header bar */}
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 36, paddingBottom: 16, paddingHorizontal: 4 }}>
          <View>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800' }}>{photo.date}</Text>
            {photo.category ? (
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700', marginTop: 2 }}>
                🏷️ {photo.category}
              </Text>
            ) : null}
          </View>
          <Pressable onPress={onClose} style={({ pressed }) => ({
            backgroundColor: 'rgba(255,255,255,0.2)', width: 38, height: 38, borderRadius: 19,
            alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1,
          })}>
            <X size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Image preview */}
        <Image
          source={{ uri: photo.url }}
          style={{ width: '100%', flex: 1, borderRadius: 14 }}
          resizeMode="contain"
        />

        {/* Note / reflection snippet */}
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

type JournalEntry = { date: string; content: string; photoUrl?: string | null; category?: string };

function JournalHistoryCard({
  entry,
  onPress,
  onPhotoPress,
}: {
  entry: JournalEntry;
  onPress?: () => void;
  onPhotoPress?: (photo: ActivePhotoModal) => void;
}) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);
  const PREVIEW_LENGTH = 140;
  const needsTruncation = entry.content.length > PREVIEW_LENGTH;

  const formattedDate = (() => {
    try {
      return new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      });
    } catch { return entry.date; }
  })();

  const relativeDate = (() => {
    try {
      const entryDate = new Date(entry.date + 'T00:00:00');
      const today = new Date();
      today.setHours(0,0,0,0);
      const diffMs = today.getTime() - entryDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays/7)} weeks ago`;
      return `${Math.floor(diffDays/30)} months ago`;
    } catch { return ''; }
  })();

  return (
    <View
      style={{
        backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 14,
        borderWidth: 1, borderColor: colors.border,
      }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: '700' }}>{formattedDate}</Text>
          {relativeDate ? <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '600', marginTop: 2 }}>{relativeDate}</Text> : null}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {entry.category && (
            <View style={{ backgroundColor: colors.primary + '18', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700' }}>{entry.category}</Text>
            </View>
          )}
          <Text style={{ color: colors.muted, fontSize: 10 }}>{entry.content.split(/\s+/).filter(Boolean).length} words</Text>
        </View>
      </View>

      {/* Attached Progress Photo */}
      {entry.photoUrl ? (
        <Pressable
          onPress={() => onPhotoPress?.({
            url: entry.photoUrl!,
            date: formattedDate,
            category: entry.category,
            note: entry.content,
          })}
          style={({ pressed }) => ({
            borderRadius: 12, overflow: 'hidden', marginBottom: 12,
            borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.9 : 1,
            position: 'relative',
          })}>
          <Image
            source={{ uri: entry.photoUrl }}
            style={{ width: '100%', height: 200, backgroundColor: colors.border }}
            resizeMode="cover"
          />
          <View style={{
            position: 'absolute', bottom: 8, right: 8,
            backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 8,
            paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4,
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600' }}>🔍 Tap to enlarge</Text>
          </View>
        </Pressable>
      ) : null}

      <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 20 }}>
        {expanded || !needsTruncation ? entry.content : entry.content.slice(0, PREVIEW_LENGTH) + '…'}
      </Text>

      {needsTruncation && (
        <Pressable onPress={() => setExpanded(!expanded)} style={{ marginTop: 8, paddingVertical: 4 }}>
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>
            {expanded ? '▲ Show less' : '▼ Read full entry'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const PHOTO_CATEGORIES = [
  'Face & Skin',
  'Physique / Body',
  'Hairline',
  'General',
];

function JournalWriteView({ onSaved, onViewGallery }: { onSaved: () => void; onViewGallery: () => void }) {
  const colors = useColors();
  const [entry, setEntry] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoCategory, setPhotoCategory] = useState<string>('Face & Skin');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const todayDisplay = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  useEffect(() => {
    DisciplineRepo.getJournalReflection(today).then(s => {
      if (s) { setEntry(s); setSaved(true); }
    });
    DisciplineRepo.getJournalPhoto(today).then(res => {
      if (res.photoUrl) setPhotoUri(res.photoUrl);
      if (res.category) setPhotoCategory(res.category);
    });
  }, []);

  const handleTakePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera Permission Required', 'Please enable camera access to take daily progress photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
      setSaved(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photos Permission Required', 'Please enable photos library access to select progress photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
      setSaved(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const removePhoto = () => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove today\'s photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
        setPhotoUri(null);
        setSaved(false);
      }},
    ]);
  };

  const saveEntry = async () => {
    if (!entry.trim() && !photoUri) {
      Alert.alert('Empty Entry', 'Please write a reflection or add a photo before saving.');
      return;
    }
    setIsSaving(true);
    try {
      let finalPhotoUrl = photoUri;
      // If photoUri is a local device file, attempt upload to Supabase
      if (photoUri && !photoUri.startsWith('http')) {
        try {
          const uploadedUrl = await JournalSupabaseService.uploadPhoto(photoUri, today);
          if (uploadedUrl) finalPhotoUrl = uploadedUrl;
        } catch (e) {
          console.warn('Supabase upload fallback to local storage:', e);
        }
      }

      await DisciplineRepo.setJournalReflection(today, entry, finalPhotoUrl, photoCategory);
      setSaved(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSaved();
    } catch (e) {
      Alert.alert('Error', 'Failed to save journal reflection.');
    } finally {
      setIsSaving(false);
    }
  };

  const prompts = [
    "What did I do well today?",
    "Where did my discipline slip?",
    "What is one thing I must accomplish tomorrow?",
  ];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
      {/* Date & Supabase Sync Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground }}>Daily Reflection — {todayDisplay}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.success + '20', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, gap: 4 }}>
          <Text style={{ fontSize: 10 }}>☁️</Text>
          <Text style={{ color: colors.success, fontSize: 10, fontWeight: '700' }}>Supabase</Text>
        </View>
      </View>

      {/* Prompts Inspiration Card */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12, marginBottom: 6 }}>💡 Reflection Prompts (Tap to insert)</Text>
        {prompts.map((p, i) => (
          <Pressable key={i} onPress={() => setEntry(prev => prev ? prev + '\n\n' + p + '\n' : p + '\n')}>
            <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 4 }}>• {p}</Text>
          </Pressable>
        ))}
      </View>

      {/* Journal Reflection Text Area */}
      <TextInput
        value={entry}
        onChangeText={(t) => { setEntry(t); setSaved(false); }}
        placeholder="Write your nightly thoughts, wins, and focus for tomorrow..."
        placeholderTextColor={colors.muted}
        multiline
        textAlignVertical="top"
        style={{
          backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
          borderRadius: 14, padding: 16, color: colors.foreground, fontSize: 14,
          minHeight: 160, marginBottom: 16, lineHeight: 22,
        }}
      />

      {/* ─── 📸 Daily Progress Photo Tracking Section ────────────────────────── */}
      <View style={{
        backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 20,
        borderWidth: 1, borderColor: photoUri ? colors.primary + '60' : colors.border,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: colors.foreground }}>📸 Daily Progress Photo</Text>
          {photoUri && (
            <Pressable onPress={removePhoto} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Trash2 size={14} color={colors.error} />
              <Text style={{ color: colors.error, fontSize: 11, fontWeight: '700' }}>Remove</Text>
            </Pressable>
          )}
        </View>
        <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 12 }}>
          Track visible changes in skin tone, pigmentation, face symmetry, hairline, or physique.
        </Text>

        {/* Category Selector Chips */}
        <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>
          Focus Area
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {PHOTO_CATEGORIES.map(cat => {
            const isSelected = photoCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => { setPhotoCategory(cat); setSaved(false); }}
                style={({ pressed }) => ({
                  paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
                  backgroundColor: isSelected ? colors.primary : colors.background,
                  borderWidth: 1, borderColor: isSelected ? colors.primary : colors.border,
                  opacity: pressed ? 0.8 : 1,
                })}>
                <Text style={{
                  color: isSelected ? '#FFFFFF' : colors.foreground,
                  fontSize: 11, fontWeight: '700',
                }}>
                  {cat === 'Face & Skin' ? '💆 ' : cat === 'Physique / Body' ? '💪 ' : cat === 'Hairline' ? '💈 ' : '✨ '}
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Photo Display / Action Buttons */}
        {photoUri ? (
          <View style={{ borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, position: 'relative' }}>
            <Image
              source={{ uri: photoUri }}
              style={{ width: '100%', height: 260, backgroundColor: colors.border }}
              resizeMode="cover"
            />
            {/* Tag Overlay */}
            <View style={{
              position: 'absolute', top: 10, left: 10,
              backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 8,
              paddingHorizontal: 10, paddingVertical: 5,
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>🏷️ {photoCategory}</Text>
            </View>

            {/* Quick Action Bar under photo */}
            <View style={{
              flexDirection: 'row', backgroundColor: colors.surface, padding: 10,
              borderTopWidth: 1, borderTopColor: colors.border, gap: 10,
            }}>
              <Pressable
                onPress={handleTakePhoto}
                style={({ pressed }) => ({
                  flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: colors.background, borderRadius: 10, paddingVertical: 8, gap: 6,
                  borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.7 : 1,
                })}>
                <RefreshCw size={14} color={colors.foreground} />
                <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700' }}>Retake</Text>
              </Pressable>
              <Pressable
                onPress={handlePickPhoto}
                style={({ pressed }) => ({
                  flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: colors.background, borderRadius: 10, paddingVertical: 8, gap: 6,
                  borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.7 : 1,
                })}>
                <ImageIcon size={14} color={colors.foreground} />
                <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700' }}>Choose New</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
              <Pressable
                onPress={handleTakePhoto}
                style={({ pressed }) => ({
                  flex: 1, backgroundColor: colors.primary + '18',
                  borderColor: colors.primary + '50', borderWidth: 1,
                  borderRadius: 14, paddingVertical: 18, alignItems: 'center', justifyContent: 'center',
                  gap: 8, opacity: pressed ? 0.8 : 1,
                })}>
                <Camera size={26} color={colors.primary} />
                <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 13 }}>Take Photo</Text>
              </Pressable>

              <Pressable
                onPress={handlePickPhoto}
                style={({ pressed }) => ({
                  flex: 1, backgroundColor: colors.surface,
                  borderColor: colors.border, borderWidth: 1,
                  borderRadius: 14, paddingVertical: 18, alignItems: 'center', justifyContent: 'center',
                  gap: 8, opacity: pressed ? 0.8 : 1,
                })}>
                <ImageIcon size={26} color={colors.foreground} />
                <Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 13 }}>From Gallery</Text>
              </Pressable>
            </View>
            <Text style={{ color: colors.muted, fontSize: 11, textAlign: 'center' }}>
              💡 Consistent morning lighting (e.g. bathroom mirror) yields the best visual progress tracking.
            </Text>
          </View>
        )}
      </View>

      {/* Save Button */}
      <Pressable onPress={saveEntry} disabled={isSaving} style={({ pressed }) => ({
        backgroundColor: saved ? colors.success : colors.primary,
        borderRadius: 14, paddingVertical: 16, alignItems: 'center',
        opacity: pressed || isSaving ? 0.85 : 1, flexDirection: 'row', justifyContent: 'center', gap: 8,
      })}>
        {isSaving ? (
          <>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>Saving & Syncing...</Text>
          </>
        ) : (
          <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>
            {saved ? '✓ Saved & Synced' : 'Save Reflection & Photo'}
          </Text>
        )}
      </Pressable>

      {saved && (
        <View style={{ marginTop: 12, alignItems: 'center' }}>
          <Text style={{ color: colors.success, fontSize: 12, textAlign: 'center', fontWeight: '600' }}>
            ✓ Successfully saved locally and backed up to Supabase cloud.
          </Text>
          <Pressable onPress={onViewGallery} style={{ marginTop: 8 }}>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>
              📸 View your progress photos in Gallery →
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

function JournalHistoryView({
  refreshKey,
  onPhotoPress,
}: {
  refreshKey: number;
  onPhotoPress: (photo: ActivePhotoModal) => void;
}) {
  const colors = useColors();
  const [history, setHistory] = useState<JournalEntry[]>([]);
  const [search, setSearch] = useState('');
  const [onlyPhotos, setOnlyPhotos] = useState(false);

  const loadHistory = async () => {
    try {
      const entries = await DisciplineRepo.getAllJournalReflections();
      const filtered = entries
        .filter(e => (!!e.content && e.content.trim().length > 0) || !!e.photoUrl)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setHistory(filtered);
    } catch {}
  };

  useEffect(() => { loadHistory(); }, [refreshKey]);
  useFocusEffect(useCallback(() => { loadHistory(); }, []));

  const visible = history.filter(h => {
    const matchesSearch = !search.trim() || h.content.toLowerCase().includes(search.toLowerCase());
    const matchesPhoto = !onlyPhotos || !!h.photoUrl;
    return matchesSearch && matchesPhoto;
  });

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>Past Entries</Text>
        <TextInput
          placeholder="Search journal reflections..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          style={{
            backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
            borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: colors.foreground, fontSize: 13,
          }}
        />

        {/* Filter Toggle */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <Text style={{ color: colors.muted, fontSize: 11 }}>
            {history.length} {history.length === 1 ? 'entry' : 'entries'} total
            {search.trim() || onlyPhotos ? ` · ${visible.length} match` : ''}
          </Text>
          <Pressable
            onPress={() => setOnlyPhotos(!onlyPhotos)}
            style={({ pressed }) => ({
              paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
              backgroundColor: onlyPhotos ? colors.primary + '20' : colors.surface,
              borderWidth: 1, borderColor: onlyPhotos ? colors.primary : colors.border,
              opacity: pressed ? 0.7 : 1,
            })}>
            <Text style={{ color: onlyPhotos ? colors.primary : colors.muted, fontSize: 11, fontWeight: '700' }}>
              📸 Photos only
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
        {visible.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 30 }}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>📔</Text>
            <Text style={{ color: colors.muted, fontSize: 13, textAlign: 'center' }}>
              {history.length === 0
                ? "No past entries yet. Write today's reflection and capture a progress photo."
                : 'No entries match your search criteria.'}
            </Text>
          </View>
        ) : (
          visible.map(h => (
            <JournalHistoryCard
              key={h.date}
              entry={h}
              onPhotoPress={onPhotoPress}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ─── 📸 Dedicated Progress Photo Gallery View ─────────────────────────────────

function JournalGalleryView({
  refreshKey,
  onPhotoPress,
  onTakePhoto,
}: {
  refreshKey: number;
  onPhotoPress: (photo: ActivePhotoModal) => void;
  onTakePhoto: () => void;
}) {
  const colors = useColors();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const loadPhotos = async () => {
    try {
      const all = await PhotoRepo.getAll();
      setPhotos(all);
    } catch {}
  };

  useEffect(() => { loadPhotos(); }, [refreshKey]);
  useFocusEffect(useCallback(() => { loadPhotos(); }, []));

  const categories = ['All', 'Face & Skin', 'Physique / Body', 'Hairline'];

  const filteredPhotos = photos.filter(p => {
    if (selectedCategory === 'All') return true;
    return p.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <View style={{ flex: 1 }}>
      {/* Category Pills & Count */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: colors.foreground }}>Transformation Gallery</Text>
          <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '700' }}>
            {filteredPhotos.length} {filteredPhotos.length === 1 ? 'photo' : 'photos'}
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={({ pressed }) => ({
                  paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderWidth: 1, borderColor: isSelected ? colors.primary : colors.border,
                  marginRight: 8, opacity: pressed ? 0.8 : 1,
                })}>
                <Text style={{
                  color: isSelected ? '#FFFFFF' : colors.foreground,
                  fontSize: 11, fontWeight: '700',
                }}>
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Grid Display */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {filteredPhotos.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 36, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 44, marginBottom: 12 }}>📸</Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.foreground, marginBottom: 6 }}>No Photos Yet</Text>
            <Text style={{ fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 18, marginBottom: 18 }}>
              Take a daily photo of your face, skin, hairline, or physique to track your physical transformation journey over time.
            </Text>
            <Pressable
              onPress={onTakePhoto}
              style={({ pressed }) => ({
                backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12,
                borderRadius: 12, opacity: pressed ? 0.85 : 1,
              })}>
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>📸 Take Today's Progress Photo</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {filteredPhotos.map((photo) => (
              <Pressable
                key={photo.id}
                onPress={() => onPhotoPress({
                  url: photo.uri,
                  date: photo.date,
                  category: photo.category,
                  note: photo.notes,
                })}
                style={({ pressed }) => ({
                  width: '48%', backgroundColor: colors.surface, borderRadius: 14,
                  overflow: 'hidden', borderWidth: 1, borderColor: colors.border,
                  opacity: pressed ? 0.85 : 1, position: 'relative', marginBottom: 6,
                })}>
                <Image
                  source={{ uri: photo.uri }}
                  style={{ width: '100%', height: 180, backgroundColor: colors.border }}
                  resizeMode="cover"
                />
                {/* Category chip */}
                <View style={{
                  position: 'absolute', top: 8, left: 8,
                  backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 6,
                  paddingHorizontal: 6, paddingVertical: 3,
                }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 9.5, fontWeight: '700' }}>
                    {photo.category}
                  </Text>
                </View>
                {/* Date footer */}
                <View style={{ padding: 8 }}>
                  <Text style={{ color: colors.foreground, fontSize: 11, fontWeight: '700' }}>
                    {photo.date}
                  </Text>
                  {photo.notes ? (
                    <Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }} numberOfLines={1}>
                      {photo.notes}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function JournalScreen() {
  const colors = useColors();
  const [journalView, setJournalView] = useState<'write' | 'history' | 'gallery'>('write');
  const [refreshKey, setRefreshKey] = useState(0);
  const [activePhotoModal, setActivePhotoModal] = useState<ActivePhotoModal | null>(null);

  return (
    <View style={{ flex: 1 }}>
      {/* Sub-view Navigation Tabs */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6, gap: 6 }}>
        {([
          { k: 'write' as const, label: '✍️ Write & Track' },
          { k: 'history' as const, label: '📚 Reflections' },
          { k: 'gallery' as const, label: '📸 Progress Photos' },
        ]).map(tab => (
          <Pressable key={tab.k} onPress={() => setJournalView(tab.k)}
            style={({ pressed }) => ({
              flex: 1, paddingVertical: 9, borderRadius: 12,
              backgroundColor: journalView === tab.k ? colors.primary : colors.surface,
              borderWidth: 1, borderColor: journalView === tab.k ? colors.primary : colors.border,
              alignItems: 'center', opacity: pressed ? 0.85 : 1,
            })}>
            <Text style={{
              color: journalView === tab.k ? '#FFFFFF' : colors.foreground,
              fontWeight: '700', fontSize: 11,
            }}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>

      {journalView === 'write' && (
        <JournalWriteView
          onSaved={() => setRefreshKey(k => k + 1)}
          onViewGallery={() => setJournalView('gallery')}
        />
      )}
      {journalView === 'history' && (
        <JournalHistoryView
          refreshKey={refreshKey}
          onPhotoPress={setActivePhotoModal}
        />
      )}
      {journalView === 'gallery' && (
        <JournalGalleryView
          refreshKey={refreshKey}
          onPhotoPress={setActivePhotoModal}
          onTakePhoto={() => setJournalView('write')}
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
