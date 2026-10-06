import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SUPABASE_URL = 'https://zhwihplacmakkjgvrpin.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpod2locGxhY21ha2tqZ3ZycGluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMzk1MjksImV4cCI6MjEwNjcxNTUyOX0.IMQYJdU5XVQ_KVhD3UwTVOnrvpPtaErbwmpImIXvHsY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export interface SupabaseJournal {
  id?: string;
  date: string;
  reflection: string;
  photo_url?: string | null;
  created_at?: string;
}

export const JournalSupabaseService = {
  /**
   * Upsert a daily reflection into the Supabase 'journals' table.
   */
  async upsertJournal(date: string, reflection: string, photoUrl?: string | null): Promise<boolean> {
    try {
      const { error } = await supabase.from('journals').upsert(
        {
          date,
          reflection,
          photo_url: photoUrl || null,
        },
        { onConflict: 'date' }
      );
      if (error) {
        console.warn('Supabase upsert warning:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase network / upsert error:', err);
      return false;
    }
  },

  /**
   * Delete journal entry for a date from Supabase
   */
  async deleteJournal(date: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('journals').delete().eq('date', date);
      if (error) {
        console.warn('Supabase delete warning:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase network / delete error:', err);
      return false;
    }
  },

  /**
   * Fetch all journal entries from Supabase, ordered by date descending.
   */
  async fetchAllJournals(): Promise<SupabaseJournal[]> {
    try {
      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.warn('Supabase fetch error:', error.message);
        return [];
      }
      return data || [];
    } catch (err) {
      console.warn('Supabase network / fetch error:', err);
      return [];
    }
  },

  /**
   * Upload an image to Supabase Storage bucket 'progress-photos' if available,
   * returning the public URL. If bucket does not exist or fails, returns the local URI as safe fallback.
   */
  async uploadPhoto(localUri: string, date: string): Promise<string> {
    try {
      const fileExt = localUri.split('.').pop() || 'jpg';
      const fileName = `${date}_${Date.now()}.${fileExt}`;
      const filePath = `journals/${fileName}`;

      const formData = new FormData();
      formData.append('file', {
        uri: localUri,
        name: fileName,
        type: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
      } as any);

      const { data, error } = await supabase.storage
        .from('progress-photos')
        .upload(filePath, formData, { upsert: true });

      if (!error && data) {
        const { data: pubData } = supabase.storage
          .from('progress-photos')
          .getPublicUrl(filePath);
        if (pubData?.publicUrl) return pubData.publicUrl;
      }
    } catch (e) {
      console.warn('Supabase photo upload fallback to local URI:', e);
    }
    // Return localUri if cloud upload didn't succeed
    return localUri;
  },
};
