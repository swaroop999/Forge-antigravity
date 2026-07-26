# FORGE AI Coach - Implementation Guide

## Overview

The FORGE AI Coach is an intelligent, context-aware coaching system powered by Google's Gemini API. It provides personalized guidance across all aspects of the user's transformation plan: fitness, nutrition, skincare, hair care, discipline, and lifestyle optimization.

## Features Implemented

### 1. **AI Coach Tab (6th Tab)**
- Modern chat interface with message bubbles
- User messages (right, emerald green)
- AI messages (left, dark grey with "FORGE AI" label)
- Timestamps on each message
- Typing animation while AI generates responses
- Text input with send button
- Quick prompt suggestions (context-aware)

### 2. **API Key Setup Flow**
- Welcome screen explaining the feature
- Link to get free Gemini API key
- Secure local storage of API key (encrypted)
- Connection test before activation
- Masked display of API key for security

### 3. **System Prompt with Dynamic Data**
The AI receives full context including:
- User profile (name, age, height, weight, goals)
- Current phase (1, 2, or 3)
- Day number (1-365)
- Recent nutrition data (average calories, protein)
- Known issues and health concerns
- Current week's performance metrics

### 4. **Contextual Quick Prompts**
Suggestions change based on which tab the user is accessing:

**From Dashboard:**
- "How am I doing overall?"
- "What should I focus on today?"
- "Am I on track for my 90-day goals?"
- "Analyze my last week"

**From Nutrition:**
- "What can I substitute for [meal]?"
- "Am I hitting my protein target?"
- "Suggest a high-calorie snack"
- "I'm bloated, what should I do?"
- "How to increase appetite?"

**From Training:**
- "I can't do a pull-up yet, help me progress"
- "My [muscle] hurts during [exercise], what to do?"
- "Should I train today if I slept only 5 hours?"
- "Am I progressing fast enough?"
- "How to increase my push-up count?"

**From Skincare:**
- "My skin is peeling from Adapalene, is this normal?"
- "I have a new pimple, what should I do?"
- "Can I use Niacinamide and Adapalene same night?"
- "How long until I see results?"
- "What if my skin gets worse?"

**From Hair:**
- "I'm shedding more hair after Minoxidil, is this normal?"
- "Can I skip Minoxidil for one day?"
- "Best diet for hair growth?"
- "When should I consider Finasteride?"

**From Discipline:**
- "I want to relapse to porn, help me now"
- "How do I stop procrastinating?"
- "I broke my streak, how do I bounce back?"
- "How to build discipline when unmotivated?"
- "Why am I feeling so lazy today?"

### 5. **Settings Integration**
- Settings screen for API key management
- Usage tracking (requests today/this month)
- Free tier limit reminders
- Option to clear API key
- Data export functionality

## Technical Implementation

### Files Created

1. **`app/(tabs)/ai-coach.tsx`** - Main AI Coach chat interface
2. **`lib/services/gemini-service.ts`** - Gemini API service layer
3. **`app/settings.tsx`** - Settings screen for configuration

### Dependencies

```json
{
  "@google/generative-ai": "^0.x.x"
}
```

### API Integration

The app uses the Google Generative AI SDK to communicate with Gemini:

```typescript
// Example usage
const geminiService = new GeminiService(apiKey);
const response = await geminiService.sendMessage(userMessage, appState);
```

### Data Flow

1. User types message in AI Coach tab
2. App fetches latest user data from local storage
3. System prompt is constructed with dynamic values
4. Message + system prompt sent to Gemini API
5. Response streamed back to chat
6. Conversation saved to local SQLite database
7. Usage stats updated

## Setup Instructions

### For Users

1. **Get API Key:**
   - Visit https://aistudio.google.com/apikey
   - Sign in with Google account
   - Click "Create API Key"
   - Copy the key

2. **Add to App:**
   - Open FORGE app
   - Navigate to Settings
   - Paste API key in "AI Coach" section
   - Click "Save & Test"
   - If successful, AI Coach tab becomes active

### For Developers

1. **Install Dependencies:**
   ```bash
   npm install @google/generative-ai
   ```

2. **Environment Setup:**
   - No hardcoded API keys
   - Keys stored in encrypted local storage
   - Keys never sent to any server except Gemini API

3. **Testing:**
   - Use the connection test in Settings
   - Try sample scenarios from the spec

## AI Coaching Style

The AI coach is designed to be:
- **Direct and honest** - No sugar-coating, but never cruel
- **Data-driven** - References specific user metrics
- **Tactical** - Provides actionable steps
- **Contextual** - Understands user's phase and goals
- **Urgent** - Responds with intensity when user might quit/relapse
- **Caring** - Like a hard but supportive older brother

### Example Responses

**Scenario: User doesn't feel like working out**
```
"Understandable. You slept only 5.5 hours last night — that's why. But here's the deal: 
You have a Push day scheduled. Skipping = losing progress. 

Compromise: Do 50% of the volume. 5 min warm-up + 3 exercises at 2 sets each instead of 5. 
That's 15 minutes. Non-negotiable.

Tonight, sleep by 11 PM. No exceptions. Your body needs recovery."
```

**Scenario: User asks about pizza**
```
"Today is Wednesday. Your rule: Zero junk on weekdays. Save it for Saturday cheat meal — 3 days away.

Alternative tonight: Make a homemade version. Tortilla + tomato sauce + chicken + cheese + veggies = 
700 kcal, hits your calorie target, doesn't wreck your discipline.

Bookmark that pizza craving. Redirect it to Saturday. Ask me for cheat meal ideas Friday night."
```

## Future Enhancements

### Planned Features (Phase 2)

1. **Daily Check-in (Auto Prompt at 9 PM)**
   - Notification: "FORGE AI is ready for your daily check-in"
   - AI asks: "How did today go? Rate it 1-10"
   - Provides personalized feedback + tomorrow's focus

2. **Weekly Coaching Session (Sunday 6 PM)**
   - Auto-generated summary of wins/failures/trends
   - Recommendations for next week
   - Saved as "Week X Review"

3. **"Analyze My Progress" Button**
   - Comprehensive report on all metrics
   - Identifies strengths and weaknesses
   - Recommends phase progression

4. **Emergency Coach (Urge Button Integration)**
   - Crisis-mode response when user taps "Urge" button
   - Uses streak data and relapse patterns
   - 5-min de-escalation guidance

5. **"Explain This" Feature**
   - "?" icon on any card/section
   - AI explains concept using user's context
   - Example: Tap "?" on Adapalene → full explanation

6. **Meal Suggestion AI**
   - "What should I eat now?" button
   - Recommends based on time, macros, availability
   - Provides recipe + macros

7. **Workout Modification AI**
   - "Modify today's workout" button
   - Suggests alternatives if equipment unavailable
   - Adjusts intensity based on user's state

8. **Photo Analysis (Gemini Vision)**
   - Analyze progress photos
   - Compare to previous weeks
   - Identify posture issues
   - Track skin condition trends

9. **Voice Input**
   - Native STT for hands-free questions
   - Useful during workouts/cooking

10. **Chat History & Search**
    - Persistent chat history
    - Search past conversations
    - Export conversation as text
    - Delete specific messages

## Security & Privacy

- **API Key:** Encrypted local storage, never transmitted except to Gemini
- **Data:** All conversation data stored locally, not sent to any server
- **Privacy:** User can review Gemini's privacy policy
- **Control:** Option to disable AI features entirely
- **Clear Data:** Can remove all chat history at any time

## Offline Behavior

When no internet connection:
- Chat shows "AI Coach unavailable — no internet"
- Previous conversations cached and viewable
- All other app features work normally
- Automatic retry when connection restored

## Usage Limits

- Free tier: ~60 requests/day (Gemini 1.5 Flash)
- Pro tier: Higher limits with Gemini 1.5 Pro
- Usage tracked in Settings
- Reminders when approaching limits

## Troubleshooting

### API Key Not Working
1. Verify key is valid at https://aistudio.google.com/apikey
2. Check internet connection
3. Try "Test Connection" in Settings
4. Clear and re-add API key

### No Response from AI
1. Check internet connection
2. Verify API key is still valid
3. Check usage limits in Settings
4. Try a simpler question first

### Chat History Lost
1. Check if data was cleared in Settings
2. Verify app hasn't been uninstalled
3. Chat history is stored locally — cannot be recovered if cleared

## Integration with Other Tabs

The AI Coach is accessible from anywhere in the app:
- Dedicated tab in bottom navigation
- Quick access from any screen
- Context-aware prompts based on current tab
- "Explain This" feature on any card
- Emergency button integration in Discipline tab

## Testing

Sample test scenarios are provided in the spec:
1. User doesn't feel like working out
2. User asks about eating pizza
3. User relapsed to porn and feels like a failure

Run these through the AI Coach to verify it's working correctly.

## Support

For issues with the Gemini API:
- Check Google AI Studio documentation
- Verify API key permissions
- Check API usage quota
- Review error messages in app logs

For app-specific issues:
- Check Settings for API key status
- Verify internet connection
- Clear app cache if needed
- Reinstall if problems persist
