import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { geminiService } from '@/lib/services/gemini-service';
import { AppRepo, ProfileRepo } from '@/lib/db/database';
import { AIQuickPrompts } from '@/components/ai-quick-prompts';
import { Send, Bot, Trash2, Sparkles, Settings } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';
import { router } from 'expo-router';
import { Tap } from '@/lib/motion';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

export default function AICoachScreen() {
  const colors = useColors();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isSetup, setIsSetup] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => { loadApiKey(); }, []);

  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return () => sub.remove();
  }, []);

  const loadApiKey = async () => {
    try {
      const stored = await AsyncStorage.getItem('gemini_api_key');
      if (stored) {
        setApiKey(stored);
        setIsSetup(true);
        loadChatHistory();
      }
    } catch (e) {}
  };

  const loadChatHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('ai_coach_chat_history');
      if (stored) setMessages(JSON.parse(stored));
    } catch (e) {}
  };

  const sendMessage = async (text?: string) => {
    const msgText = text || inputText;
    if (!msgText.trim() || !apiKey) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: msgText, timestamp: Date.now() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInputText('');
    setIsLoading(true);
    try {
      const startDate = await AppRepo.getStartDate();
      const { phase, dayNumber } = startDate ? AppRepo.calcPhaseAndDay(startDate) : { phase: 1 as const, dayNumber: 1 };
      const profile = await ProfileRepo.get();
      const contextData = {
        userProfile: profile,
        dayNumber: dayNumber,
        currentPhase: phase,
        recentMeals: [],
      };
      const historyForContext = messages.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.content }],
      }));
      const response = await geminiService.sendMessage(msgText, contextData, historyForContext);
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'ai', content: response, timestamp: Date.now() };
      const updated = [...newMsgs, aiMsg];
      setMessages(updated);
      await AsyncStorage.setItem('ai_coach_chat_history', JSON.stringify(updated));
      await geminiService.updateUsageStats();
    } catch (e) {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(), role: 'ai',
        content: `Error: ${e instanceof Error ? e.message : 'Unknown error'}. Check your API key and internet connection.`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally { setIsLoading(false); }
  };

  const clearHistory = () => {
    Alert.alert('Clear Chat?', 'This will delete all chat history.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => {
        setMessages([]);
        await AsyncStorage.setItem('ai_coach_chat_history', '[]');
      }},
    ]);
  };

  if (!isSetup) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View style={{
            width: 64, height: 64, borderRadius: 20,
            backgroundColor: colors.primary + '18',
            borderWidth: 1, borderColor: colors.primary + '38',
            alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <Bot size={30} color={colors.primary} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.foreground, textAlign: 'center', marginBottom: 8, letterSpacing: -0.3 }}>
            Gemini API Key Required
          </Text>
          <Text style={{ fontSize: 13, color: colors.muted, textAlign: 'center', marginBottom: 24, lineHeight: 19 }}>
            Configure your Gemini API Key in Settings to unlock 24/7 context-aware coaching across training, nutrition, and skincare.
          </Text>
          <Tap
            onPress={() => router.push('/settings')}
            scaleTo={0.96}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 8,
              backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20,
            }}
          >
            <Settings size={16} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>Open Settings</Text>
          </Tap>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Compact Header */}
        <View style={{
          paddingHorizontal: 18, paddingTop: 6, paddingBottom: 10,
          borderBottomWidth: 1, borderBottomColor: colors.border,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{
              width: 34, height: 34, borderRadius: 10,
              backgroundColor: colors.primary + '18',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={{ fontSize: 17, fontWeight: '800', color: colors.foreground, letterSpacing: -0.3 }}>FORGE AI Coach</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success }} />
                <Text style={{ fontSize: 10.5, color: colors.muted, fontWeight: '600' }}>Online · Full Protocol Context</Text>
              </View>
            </View>
          </View>
          {messages.length > 0 && (
            <Tap
              onPress={clearHistory}
              scaleTo={0.92}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5,
                borderWidth: 1, borderColor: colors.border,
              }}
            >
              <Trash2 size={12} color={colors.muted} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.muted }}>Clear</Text>
            </Tap>
          )}
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          style={{ flex: 1 }}
          overScrollMode="always"
          bounces={true}
          decelerationRate="normal"
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={() => (
            <View style={{ flex: 1, alignItems: 'center', paddingTop: 36, paddingHorizontal: 16 }}>
              <View style={{
                width: 48, height: 48, borderRadius: 15,
                backgroundColor: colors.primary + '16',
                alignItems: 'center', justifyContent: 'center', marginBottom: 12,
              }}>
                <Sparkles size={22} color={colors.primary} />
              </View>
              <Text style={{ fontSize: 15, fontWeight: '800', color: colors.foreground, marginBottom: 4 }}>
                Ready to Optimize Your Day
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 18 }}>
                Ask about your Mon–Sat split, Sunday active recovery, macro adjustments, or skincare routine.
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 12, alignItems: item.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {item.role === 'ai' && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <Bot size={11} color={colors.primary} />
                  <Text style={{ fontSize: 10, color: colors.muted, fontWeight: '700', letterSpacing: 0.4 }}>FORGE AI</Text>
                </View>
              )}
              <View style={{
                maxWidth: '84%',
                backgroundColor: item.role === 'user' ? colors.primary : colors.surface,
                borderRadius: 16,
                borderBottomRightRadius: item.role === 'user' ? 4 : 16,
                borderBottomLeftRadius: item.role === 'ai' ? 4 : 16,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderWidth: item.role === 'ai' ? 1 : 0,
                borderColor: colors.border,
              }}>
                {item.role === 'user' ? (
                  <Text style={{ color: '#FFFFFF', fontSize: 13.5, lineHeight: 19 }}>
                    {item.content}
                  </Text>
                ) : (
                  <Markdown style={{ body: { color: colors.foreground, fontSize: 13.5, lineHeight: 19 } }}>
                    {item.content}
                  </Markdown>
                )}
                <Text style={{ fontSize: 9.5, color: item.role === 'user' ? 'rgba(255,255,255,0.72)' : colors.muted, marginTop: 4 }}>
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          )}
        />

        {isLoading && (
          <View style={{ paddingHorizontal: 18, paddingBottom: 6, alignItems: 'flex-start' }}>
            <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600' }}>Analyzing protocol…</Text>
            </View>
          </View>
        )}

        {messages.length === 0 && (
          <AIQuickPrompts context="default" onSelectPrompt={(text) => {
            setInputText(text);
            sendMessage(text);
          }} />
        )}

        {/* Input Bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          paddingHorizontal: 14,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 12 : 8,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          gap: 8,
        }}>
          <TextInput
            placeholder="Ask your coach anything..."
            placeholderTextColor={colors.muted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            scrollEnabled
            textAlignVertical="top"
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingTop: 9,
              paddingBottom: 9,
              color: colors.foreground,
              fontSize: 13.5,
              lineHeight: 19,
              minHeight: 40,
              maxHeight: 110,
            }}
          />
          <Tap
            onPress={() => sendMessage()}
            disabled={!inputText.trim() || isLoading}
            scaleTo={0.92}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: inputText.trim() && !isLoading ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor: inputText.trim() && !isLoading ? colors.primary : colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send size={16} color={inputText.trim() && !isLoading ? '#FFFFFF' : colors.muted} />
          </Tap>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
