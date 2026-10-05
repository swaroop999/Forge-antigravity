/**
 * Gemini AI Service
 * Handles all interactions with Google Generative AI API
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '@/lib/db/database';

export interface AiContextData {
  userProfile: UserProfile | null;
  dayNumber: number;
  currentPhase: number;
  recentMeals: { calories: number }[];
}

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

// Default model is Gemini 2.0 Flash (fast, free tier, multimodal, high reasoning).
// Fallback: 'gemini-1.5-flash'
export const DEFAULT_GEMINI_MODEL = 'gemini-2.0-flash';

export class GeminiService {
  private apiKey: string | null = null;
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

  /** Read stored model name, falling back to the default. */
  async getModel(): Promise<string> {
    const stored = await AsyncStorage.getItem('gemini_model');
    return stored?.trim() || DEFAULT_GEMINI_MODEL;
  }

  /**
   * Build system prompt with dynamic user data
   */
  buildSystemPrompt(contextData: AiContextData): string {
    const profile = contextData.userProfile;
    const currentDay = contextData.dayNumber;
    const currentPhase = contextData.currentPhase;

    // Calculate averages from recent data
    const recentMeals = contextData.recentMeals.slice(-56); // Last 8 days
    const avgCalories = recentMeals.length > 0
      ? Math.round(recentMeals.reduce((sum: number, m: { calories: number }) => sum + m.calories, 0) / Math.ceil(recentMeals.length / 8))
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
Sleep: 11:30 PM to 7:30 AM (target 8 hours, strict back-sleeping for facial symmetry)
Nutrition: 2600-2800 kcal daily, 90-110g protein, 3.5L water
Training: Home workouts 4-5x/week (bodyweight + book-bag + pull-up bar + priority lateral delts/neck/traps for frame width)
Skincare:
  - AM: Lukewarm splash + Alpha Arbutin 2% spot treatment (moustache patch & dark spots) + 10% Niacinamide + Nivea Soft + Aqualogica SPF 50+
  - PM: Gentle cleanser + Bone-Dry Adapalene 0.1% rotation (Mon/Wed/Fri) / Arbutin (Tue/Sat) / Barrier Rest (Thu/Sun) + Nivea Soft + Benzomycin pinpoint only on active inflamed pimples
Hair: 100% Natural Hairline Protocol: Nizoral 2x/week, Rosemary oil (in carrier oil) 2x/week, 4-min daily scalp massage, weekly 0.5mm dermastamp, raw pumpkin seeds (Delta-7 sterols for DHT suppression). Strictly NO Minoxidil.
Supplements (Calibrated to User's Exact Bottles):
  - Carbamide Forte Triple Strength Fish Oil (1400mg / 900mg active Omega-3): 1 Softgel daily with breakfast (never take 2).
  - Carbamide Forte Zinc Picolinate 85mg + Vit C: 1 Tablet daily strictly IMMEDIATELY after a solid Lunch with water (NEVER on empty stomach).
  - Nutrabay Chelated Magnesium Glycinate 2000mg: 2 Tablets (~250mg elemental Mg) 30-45 min before sleep with water/turmeric milk.
  - Whey Protein (post-workout), Creatine Monohydrate (5g daily with 3.5L water), Vitamin D3 (60K IU once weekly for 8 weeks).
Discipline: Daily journal reflections with progress photo tracking, 30-day dopamine reset, zero porn.
Looksmax & Symmetry: Unilateral chewing on weaker right side, back-sleeping, proper tongue posture (mewing), neck and shoulder posture alignment.

KNOWN ISSUES:
- Underweight (severe ectomorph)
- Right-side facial asymmetry (uneven chewing habit, side-sleeping)
- Hyperpigmentation patch on left moustache perimeter + acne marks on chin/cheeks
- Forward head posture, rounded shoulders
- Dandruff, fine/thinning hairline (AGA family history)
- Dopamine/porn recovery
- High screen time

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
  async sendMessage(userMessage: string, contextData: AiContextData, chatHistory?: GeminiMessage[]): Promise<string> {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const systemPrompt = this.buildSystemPrompt(contextData);

    // Build multi-turn contents array — strictly alternating user/model turns
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // Use Gemini's built-in systemInstruction field so we don't contaminate
    // conversation history.
    const historyToUse = chatHistory && chatHistory.length > 0
      ? chatHistory.slice(-20) // cap to last 20 messages
      : [];

    for (const msg of historyToUse) {
      // Gemini requires first message to be from user; skip leading model turns
      if (contents.length === 0 && msg.role !== 'user') continue;
      // Strict alternation: skip adjacent duplicate roles
      const last = contents[contents.length - 1];
      if (last && last.role === msg.role) continue;
      contents.push({ role: msg.role, parts: msg.parts });
    }

    // Append current user message
    const last = contents[contents.length - 1];
    if (!last || last.role !== 'user') {
      contents.push({ role: 'user', parts: [{ text: userMessage }] });
    } else {
      last.parts[0].text += '\n\n' + userMessage;
    }

    const requestBody = {
      systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    };

    try {
      const preferredModel = await this.getModel();
      const modelsToTry = [preferredModel];
      if (preferredModel !== 'gemini-2.0-flash') modelsToTry.push('gemini-2.0-flash');
      if (preferredModel !== 'gemini-1.5-flash') modelsToTry.push('gemini-1.5-flash');

      let lastError: any = null;
      for (const model of modelsToTry) {
        try {
          const response = await fetch(
            `${this.baseUrl}/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestBody),
            }
          );

          if (response.ok) {
            const data = await response.json();
            const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (aiResponse) return aiResponse;
          } else {
            const error = await response.json();
            lastError = new Error(`Gemini API error (${model}): ${error.error?.message || 'Unknown error'}`);
          }
        } catch (e) {
          lastError = e;
        }
      }

      throw lastError || new Error('No response from Gemini');
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  /**
   * Test API connection.
   * Returns a success message string on success, or throws with the real
   * API error message so the Settings screen can display it directly.
   */
  async testConnection(): Promise<string> {
    const apiKey = await this.getApiKey();
    if (!apiKey) throw new Error('No API key configured');

    const preferredModel = await this.getModel();
    const modelsToTry = [preferredModel];
    if (preferredModel !== 'gemini-2.0-flash') modelsToTry.push('gemini-2.0-flash');
    if (preferredModel !== 'gemini-1.5-flash') modelsToTry.push('gemini-1.5-flash');

    let lastError: any = null;
    for (const model of modelsToTry) {
      try {
        const response = await fetch(
          `${this.baseUrl}/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: 'Say "ok".' }] }],
            }),
          }
        );

        if (response.ok) {
          return `Connected — using ${model}`;
        } else {
          const errBody = await response.json();
          lastError = new Error(errBody?.error?.message || `HTTP ${response.status}`);
        }
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError || new Error('Connection failed');
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
