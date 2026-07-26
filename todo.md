# Forge App - Development TODO

## Phase 1: Core Infrastructure
- [x] Update theme colors (dark mode: #0A0A0A, #1A1A1A, #252525, emerald #00D9A3, gold #FFB800)
- [x] Configure 5-tab bottom navigation (Dashboard, Training, Nutrition, Appearance, Discipline)
- [x] Set up local database schema (SQLite/Realm)
- [x] Implement state management (Redux Toolkit or Context)
- [x] Create user profile defaults (name, age, height, weight, etc.)
- [x] Set up AsyncStorage for persistence

## Phase 2: Dashboard Tab
- [x] Header with greeting and phase badge (Phase 1-3)
- [x] Day counter and progress bar (Day X of 365)
- [x] Today's completion ring (circular progress, 200px)
- [x] Quick stats cards (weight, sleep, water, streak, workout, skincare, screen time, porn-free days)
- [ ] Today's schedule timeline (weekday/weekend variations)
- [ ] Milestone progress cards (30/90/365 day targets)
- [x] Daily motivational quote (100+ quotes)
- [ ] Weekly summary (collapsible bar chart)

## Phase 3: Training Tab
- [ ] Sub-tabs: Today's Workout, Program Overview, Exercise Library, Progress, Posture, Priority Movements
- [ ] Phase 1 workouts (Days 1-30, 4-day split)
- [ ] Phase 2 workouts (Days 31-90, 5-day PPL split)
- [ ] Phase 3 workouts (Days 91-365, 6-day advanced split)
- [ ] Exercise cards with sets, reps, rest timer
- [ ] Form descriptions and common mistakes
- [ ] Progressive overload tracker
- [ ] Exercise library with 50+ exercises
- [ ] Posture correction exercises
- [ ] Priority movements (lateral raises, neck, shrugs, etc.)
- [ ] Warm-up reminder popup (5-min countdown)
- [ ] Workout completion screen with confetti

## Phase 4: Nutrition Tab
- [ ] Sub-tabs: Today's Meals, Meal Plan, Supplements, Water Tracker, Grocery List
- [ ] Daily macro targets (2600-2800 kcal, 90-110g protein, 350-400g carbs, 70-80g fat)
- [ ] 8 meal cards with macros (Morning drink, Breakfast, Mid-morning, Lunch, Pre-commute, Evening, Dinner, Pre-bed)
- [ ] Post-workout protein addition
- [ ] Junk food rules card (weekday zero, Saturday 1 cheat, Sunday home food)
- [ ] Junk food counter
- [ ] Weekly meal plan grid
- [ ] Meal prep reminder (Saturday)
- [ ] Supplements tracker (Phase 1, 2, 3 protocols)
- [ ] Local notifications for supplements
- [ ] Water tracker with visual bottle graphic
- [ ] Water streak counter
- [ ] Grocery list with checkboxes

## Phase 5: Appearance Tab
- [ ] Sub-tabs: Skincare, Hair Care, Grooming, Body Care, Style & Wardrobe, Looksmax, Face Progression
- [ ] Skincare product warnings and inventory
- [ ] AM/PM skincare routines with steps
- [ ] Weekly actives schedule (Adapalene rotation)
- [ ] Adapalene progression tracker (weeks 1-4, 5-8, 9+)
- [ ] Skincare streak counter
- [ ] Behavioral reminders (hands off face, pillowcase, helmet visor, etc.)
- [ ] Skin issues face map
- [ ] Weekly skin photos (front, left, right)
- [ ] Black elbows/knees protocol
- [ ] Hair wash schedule (3x/week rotation)
- [ ] Oil massage schedule
- [ ] Minoxidil 5% protocol with daily tracker
- [ ] Minoxidil phase indicators (weeks 1-3, 4-12, 13-24, 6+)
- [ ] Hair metrics tracking (dandruff, hair fall, thinning areas)
- [ ] Monthly hair photos
- [ ] Daily grooming checklist
- [ ] Weekly grooming tasks
- [ ] Monthly grooming tasks
- [ ] Wardrobe essentials checklist
- [ ] Outfit ideas gallery
- [ ] Height perception booster info (insoles)
- [ ] Looksmax impact ranking (high/moderate/cautious/avoid)
- [ ] Face analysis and progression photos
- [ ] Face metrics (skin clarity, jaw definition, cheek fullness, etc.)

## Phase 6: Discipline Tab
- [ ] Sub-tabs: Habit Tracker, Dopamine Reset, Journal, Milestones, Body Language, Knowledge Base, Commitment Letter
- [ ] Habit tracker calendar (GitHub-style heatmap)
- [ ] 30+ core daily habits
- [ ] Habit stacking system
- [ ] Weekly discipline score
- [ ] Dopamine reset protocol (4-week phases)
- [ ] Porn/fap tracker (calendar, streak, relapse logging)
- [ ] Screen time logger
- [ ] Dopamine rules card
- [ ] Nightly journal template (3 wins, 1 improvement, sliders)
- [ ] Weekly reflection
- [ ] Mood/energy/confidence trend chart
- [ ] 30-day, 90-day, 1-year milestone checklists
- [ ] Achievement badges (15+ badges)
- [ ] Body language daily practice checklist
- [ ] Knowledge base (articles, tips)
- [ ] Commitment letter

## Phase 7: Polish & Features
- [ ] Smooth animations (slide, fade, scale, spring physics)
- [ ] Haptic feedback on button taps
- [ ] Skeleton loaders while data loads
- [ ] Empty states with motivational messages
- [ ] Pull-to-refresh on all scrollable screens
- [ ] Swipe gestures (swipe to complete, swipe to delete)
- [ ] Floating action buttons for quick-add
- [ ] Confetti on milestones
- [ ] Local push notifications
- [ ] PDF/CSV export capability
- [ ] Progress photos storage (local)

## Phase 8: Testing & Delivery
- [ ] Test all user flows end-to-end
- [ ] Verify dark mode consistency
- [ ] Test on Android emulator
- [ ] Build APK
- [ ] Create checkpoint
- [ ] Deliver to user

## Phase 9: AI Coach Tab (Gemini Integration)
- [ ] Set up Google Generative AI SDK (@google/generative-ai)
- [ ] Create Settings screen with Gemini API key input
- [ ] Implement secure local storage for API key (expo-secure-store)
- [ ] Create AI Coach tab (6th tab in bottom navigation)
- [ ] Build chat interface with message bubbles (user right, AI left)
- [ ] Implement contextual quick prompts (nutrition, training, skincare, hair, discipline, dashboard)
- [ ] Build system prompt with dynamic user data injection
- [ ] Implement chat history persistence to SQLite
- [ ] Add typing animation while AI generates response
- [ ] Build voice-to-text input (STT)
- [ ] Implement daily check-in notification (9 PM)
- [ ] Implement weekly coaching session (Sunday 6 PM)
- [ ] Build "Analyze My Progress" button on Dashboard
- [ ] Integrate "Talk to FORGE AI" in dopamine urge button
- [ ] Add "Explain This" feature (? icon on cards)
- [ ] Build meal suggestion AI ("What should I eat now?")
- [ ] Build workout modification AI ("Modify today's workout")
- [ ] Implement Gemini Vision for photo analysis
- [ ] Add usage tracking in Settings
- [ ] Implement offline fallback UI
- [ ] Build API key setup flow (first-time users)
- [ ] Test with sample scenarios (don't feel like working out, pizza question, relapse)

## Phase 10: Notifications & Polish
- [ ] Implement local push notifications (expo-notifications)
- [ ] Set up daily check-in reminder (9 PM)
- [ ] Set up weekly coaching session reminder (Sunday 6 PM)
- [ ] Implement supplement reminders
- [ ] Add smooth animations throughout app
- [ ] Implement haptic feedback
- [ ] Add pull-to-refresh on all scrollable screens
- [ ] Implement skeleton loaders
- [ ] Add empty states with motivational messages
- [ ] Test all user flows end-to-end
- [ ] Build APK for Android
