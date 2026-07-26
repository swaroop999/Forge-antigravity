/**
 * Gemini AI Service
 * Handles all interactions with Google Generative AI API
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ForgeState } from '@/lib/store/app-store';

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export class GeminiService {
  private apiKey: string | null = null;
  private model = 'gemini-1.5-flash';
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor(apiKey?: string) {
    if (apiKey) {
      this.apiKey = apiKey;
    }
  }

  async setApiKey(key: string): Promise<void> {
    this.apiKey = key;
    await AsyncStorage.setItem('gemini_api_key', key);
  }

  async getApiKey(): Promise<string | null> {
    if (this.apiKey) return this.apiKey;
    const stored = await AsyncStorage.getItem('gemini_api_key');
    if (stored) {
      this.apiKey = stored;
    }
    return stored;
  }

  /**
   * Build system prompt with dynamic user data
   */
  buildSystemPrompt(appState: ForgeState): string {
    const profile = appState.userProfile;
    const currentDay = appState.appState.dayNumber;
    const currentPhase = appState.appState.currentPhase;

    // Calculate averages from recent data
    const recentMeals = appState.mealEntries.slice(-56); // Last 8 days
    const avgCalories = recentMeals.length > 0
      ? Math.round(recentMeals.reduce((sum, m) => sum + m.calories, 0) / Math.ceil(recentMeals.length / 8))
      : 2700;

    const systemPrompt = `You are FORGE AI Coach — the personal transformation coach for a specific user.
You have expertise in fitness (body recomposition), dermatology, trichology, nutrition, discipline coaching, and lifestyle optimization.

USER PROFILE:
Name: ${profile?.name || 'User'}
Age: ${profile?.age || 22}
Height: ${profile?.height || "5'6\""}
Starting Weight: ${profile?.startingWeight || 45} kg
Current Weight: ${profile?.currentWeight || 47.5} kg
Target Weight: ${profile?.targetWeight || 63} kg (12 months)
Body Type: Severe ectomorph (hardgainer)

CURRENT STATUS:
Day: ${currentDay} of 365
Phase: ${currentPhase === 1 ? 'PHASE 1: FOUNDATION (Days 1-30)' : currentPhase === 2 ? 'PHASE 2: BUILD (Days 31-90)' : 'PHASE 3: OPTIMIZE (Days 91-365)'}

CORE PLAN:
Sleep: 11:30 PM to 7:30 AM (target 8 hours)
Nutrition: 2600-2800 kcal daily, 90-110g protein, 3L water
Training: Home workouts 4-5x/week (bodyweight + book-bag + pull-up bar)
Skincare: AM routine (Niacinamide + Moisturizer + SPF 50) + PM routine (Cleanser + Adapalene + Moisturizer)
Hair: Nizoral 2x/week + Coconut+Rosemary oil 2x/week + Minoxidil 5% 2x daily
Supplements: Whey, Multivitamin, Omega-3, Vitamin D3, Creatine (Phase 2+)
Discipline: Journal nightly, 30-day dopamine reset, reduce porn to 0

KNOWN ISSUES:
- Underweight (severe ectomorph)
- Right cheek acne + post-inflammatory hyperpigmentation
- Forward head posture, rounded shoulders
- Dandruff, fine/thinning hair
- Father bald at 48 (AGA risk)
- Porn addiction (working to reduce)
- High screen time
- Chronic procrastination

COACHING STYLE:
- Direct and brutally honest but never cruel
- Reference specific data in every response
- Prioritize scientific reasoning over generic motivation
- Call out excuses if they're making them
- Acknowledge good progress briefly, then push for more
- Keep responses concise (under 200 words unless deep analysis requested)
- Use bullet points for clarity
- Never give medical advice — recommend consulting professionals
- Match the tone of a hard but caring older brother / elite mentor
- Use Indian context when relevant
- If they express intent to skip/quit/relapse, respond with urgency and specific tactical push-back

RESPONSE RULES:
- Never say "I don't have access to your data" — you DO have access
- Never suggest expensive interventions unless already in their plan
- Evaluate products against their phase, budget, and existing stack
- Always end responses with a clear action item when applicable`;

    return systemPrompt;
  }

  /**
   * Send a message to Gemini API
   */
  async sendMessage(userMessage: string, appState: ForgeState): Promise<string> {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const systemPrompt = this.buildSystemPrompt(appState);

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemPrompt}\n\nUSER'S QUESTION: ${userMessage}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    };

    try {
      const response = await fetch(
        `${this.baseUrl}/${this.model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        throw new Error('No response from Gemini');
      }

      return aiResponse;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const apiKey = await this.getApiKey();
      if (!apiKey) return false;

      const response = await fetch(
        `${this.baseUrl}/${this.model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: 'Say "Connection successful" in one word.' }],
              },
            ],
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get usage stats
   */
  async getUsageStats(): Promise<{ requestsToday: number; requestsThisMonth: number }> {
    try {
      const stats = await AsyncStorage.getItem('gemini_usage_stats');
      if (stats) {
        return JSON.parse(stats);
      }
    } catch (error) {
      console.error('Failed to get usage stats:', error);
    }

    return { requestsToday: 0, requestsThisMonth: 0 };
  }

  /**
   * Update usage stats
   */
  async updateUsageStats(): Promise<void> {
    try {
      const stats = await this.getUsageStats();
      const today = new Date().toDateString();
      const lastDate = await AsyncStorage.getItem('gemini_last_usage_date');

      if (lastDate !== today) {
        stats.requestsToday = 1;
        await AsyncStorage.setItem('gemini_last_usage_date', today);
      } else {
        stats.requestsToday += 1;
      }

      stats.requestsThisMonth += 1;
      await AsyncStorage.setItem('gemini_usage_stats', JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to update usage stats:', error);
    }
  }
}

export const geminiService = new GeminiService();
