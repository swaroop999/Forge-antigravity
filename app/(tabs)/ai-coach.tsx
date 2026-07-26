import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ScrollView, View, Text, Pressable, TextInput, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { geminiService } from '@/lib/services/gemini-service';
import { AppRepo } from '@/lib/db/database';
import { useForgeState } from '@/lib/store/app-store';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

const QUICK_PROMPTS = [
  { text: 'Analyze my progress today', icon: '📊' },
  { text: 'Motivate me to train', icon: '💪' },
  { text: 'What should I eat now?', icon: '🍽️' },
  { text: 'I want to relapse. Help.', icon: '🆘' },
  { text: 'Skincare question', icon: '✨' },
  { text: 'Help me with tonight\'s workout', icon: '🏋️' },
  { text: 'Why am I not gaining weight?', icon: '📈' },
  { text: 'I feel like quitting. Help.', icon: '🔥' },
];

export default function AICoachScreen() {
  const colors = useColors();
  const appState = useForgeState();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isSetup, setIsSetup] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKeySetup, setShowKeySetup] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => { loadApiKey(); }, []);

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

  const saveApiKey = async () => {
    if (!tempApiKey.trim()) { Alert.alert('Error', 'Please enter a valid API key'); return; }
    try {
      await AsyncStorage.setItem('gemini_api_key', tempApiKey);
      setApiKey(tempApiKey);
      setIsSetup(true);
      setShowKeySetup(false);
      setTempApiKey('');
      const welcomeMsg: ChatMessage = {
        id: Date.now().toString(), role: 'ai',
        content: "Welcome! I'm your FORGE AI Coach 🔥\n\nI have full context of your 365-day transformation plan. I know your goals, your current phase, your struggles, and what you need to do today.\n\nAsk me anything — training form, what to eat, skincare doubts, or when you feel like giving up. I'm here 24/7.\n\nWhat do you need right now?",
        timestamp: Date.now(),
      };
      const newMessages = [welcomeMsg];
      setMessages(newMessages);
      await AsyncStorage.setItem('ai_coach_chat_history', JSON.stringify(newMessages));
    } catch (e) { Alert.alert('Error', 'Failed to save API key'); }
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
      const contextStr = `[FORGE CONTEXT - Day ${dayNumber}, Phase ${phase}]`;
      const response = await geminiService.sendMessage(`${contextStr} ${msgText}`, appState);
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
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1, padding: 24, alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 64, marginBottom: 16 }}>🤖</Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: colors.foreground, textAlign: 'center', marginBottom: 8 }}>
              FORGE AI Coach
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, textAlign: 'center', marginBottom: 40, lineHeight: 22 }}>
              Your personal 24/7 transformation coach. Knows your entire plan. Available whenever you need motivation, guidance, or accountability.
            </Text>

            {!showKeySetup ? (
              <>
                <View style={{ width: '100%', backgroundColor: colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border, marginBottom: 20 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>How to set up (30 seconds):</Text>
                  {['1. Go to aistudio.google.com/apikey', '2. Create a free API key', '3. Paste it below'].map((step, i) => (
                    <Text key={i} style={{ color: colors.muted, fontSize: 13, marginBottom: 6 }}>{step}</Text>
                  ))}
                </View>
                <Pressable onPress={() => setShowKeySetup(true)} style={{ width: '100%', backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ color: colors.background, fontWeight: '700', fontSize: 16 }}>I Have My API Key →</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={{ width: '100%', marginBottom: 16 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>Gemini API Key:</Text>
                  <TextInput
                    placeholder="Paste your API key here..."
                    placeholderTextColor={colors.muted}
                    value={tempApiKey}
                    onChangeText={setTempApiKey}
                    secureTextEntry
                    style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: colors.foreground, fontSize: 14 }}
                  />
                  <Text style={{ fontSize: 11, color: colors.muted, marginTop: 8 }}>
                    🔒 Stored locally only. Never sent anywhere except directly to Google's API.
                  </Text>
                </View>
                <Pressable onPress={saveApiKey} style={{ width: '100%', backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ color: colors.background, fontWeight: '700', fontSize: 16 }}>Activate AI Coach</Text>
                </Pressable>
                <Pressable onPress={() => setShowKeySetup(false)} style={{ width: '100%', backgroundColor: colors.surface, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ color: colors.foreground, fontWeight: '600' }}>Back</Text>
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.foreground }}>FORGE AI Coach</Text>
            <Text style={{ fontSize: 11, color: colors.success }}>● Online — Powered by Gemini</Text>
          </View>
          <Pressable onPress={clearHistory} style={{ padding: 8 }}>
            <Text style={{ fontSize: 13, color: colors.muted }}>Clear</Text>
          </Pressable>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={() => (
            <View style={{ flex: 1, alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>🔥</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>Ready to coach you</Text>
              <Text style={{ fontSize: 13, color: colors.muted, textAlign: 'center' }}>Ask me anything about your plan, or use a quick prompt below.</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 12, alignItems: item.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {item.role === 'ai' && (
                <Text style={{ fontSize: 10, color: colors.muted, marginBottom: 4, fontWeight: '600' }}>🤖 FORGE AI</Text>
              )}
              <View style={{
                maxWidth: '82%',
                backgroundColor: item.role === 'user' ? colors.primary : colors.surface,
                borderRadius: 18,
                borderBottomRightRadius: item.role === 'user' ? 4 : 18,
                borderBottomLeftRadius: item.role === 'ai' ? 4 : 18,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderWidth: item.role === 'ai' ? 1 : 0,
                borderColor: colors.border,
              }}>
                <Text style={{ color: item.role === 'user' ? colors.background : colors.foreground, fontSize: 14, lineHeight: 20 }}>
                  {item.content}
                </Text>
                <Text style={{ fontSize: 10, color: item.role === 'user' ? 'rgba(0,0,0,0.4)' : colors.muted, marginTop: 6 }}>
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          )}
        />

        {isLoading && (
          <View style={{ paddingHorizontal: 20, paddingBottom: 4, alignItems: 'flex-start' }}>
            <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ color: colors.muted, fontSize: 13 }}>Thinking...</Text>
            </View>
          </View>
        )}

        {/* Quick Prompts */}
        {messages.length === 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16, paddingVertical: 8, maxHeight: 60 }}>
            {QUICK_PROMPTS.map((p, i) => (
              <Pressable key={i} onPress={() => sendMessage(p.text)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ marginRight: 6 }}>{p.icon}</Text>
                <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '500' }}>{p.text}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Input */}
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: colors.border, gap: 10 }}>
          <TextInput
            placeholder="Ask me anything..."
            placeholderTextColor={colors.muted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 24,
              paddingHorizontal: 18,
              paddingVertical: 12,
              color: colors.foreground,
              fontSize: 14,
              maxHeight: 100,
            }}
            onSubmitEditing={() => sendMessage()}
          />
          <Pressable
            onPress={() => sendMessage()}
            disabled={!inputText.trim() || isLoading}
            style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: inputText.trim() && !isLoading ? colors.primary : colors.border,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 18 }}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
