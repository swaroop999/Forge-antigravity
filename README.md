# 🚀 FORGE App

![FORGE App Banner](assets/images/medusa.jpg)

> **FORGE** is an aggressive, uncompromising 365-day transformation tracker built to convert a 22-year-old underweight (BMI 16.0) individual into a disciplined, aesthetic, and high-performing man. This app isn't a gentle suggestion tool; it's a military-grade protocol enforcement system.

## 📱 About The App
Built with **React Native (Expo)**, **NativeWind** (Tailwind CSS for React Native), and **SQLite** for completely offline, lightning-fast data persistence. The UI is designed with a premium, aggressive **Gold & Emerald** color palette to reflect high status and high performance.

The app is fully offline-first. Your transformation data belongs to you.

## 🛠️ Tech Stack
- **Framework:** React Native / Expo Router (File-based routing)
- **Styling:** NativeWind v4 (Tailwind CSS)
- **Database:** SQLite (expo-sqlite) + Drizzle ORM
- **State Management:** Zustand (App Store) + AsyncStorage (Key-value pairs)
- **AI Integration:** Google Gemini API (Strictly prompted AI Accountability Coach)

## 🏗️ Core Features & The 6-Tab System

The app is divided into 6 distinct pillars of transformation:

### 1. 🏠 Dashboard
- **Daily Rings:** Visualizes macro completion, water intake, and habit adherence.
- **Urgent Timeline:** A strict hourly schedule that adapts based on Weekdays vs. Weekends.
- **Milestone Tracker:** Progress bars for the 30-Day, 90-Day, and 365-Day phases.

### 2. 💪 Training (45kg → 62kg Protocol)
- **Workout Tracker:** Logs sets, reps, and weights with a built-in rest timer (90s-120s).
- **Exercise Library:** 93 specific exercises seeded into the database, categorized by muscle group.
- **Posture Correction:** Protocols for chin tucks, band pull-aparts, and dead hangs to fix forward head posture and add perceived height.

### 3. 🍽️ Nutrition (2,600 - 2,800 kcal)
- **Meal Tracking:** Enforces 8 specific daily meals (e.g., Eggs, Chicken, Oats, Paneer).
- **Supplement Protocol:** Tracks Phase 1 to Phase 3 supplements with critical warnings (e.g., Zinc nausea, Vitamin D 60K weekly limit).
- **Water Visualizer:** A dynamic 3.5L bottle visualization tracker.
- **Junk Food Rules:** Strict enforcement (0 junk on weekdays, 1 restaurant meal on Saturday).

### 4. ✨ Appearance (Looksmaxing)
- **Skincare:** AM/PM routine tracking with Adapalene rotation and strict warnings against steroid creams (Mometasone).
- **Tan Removal:** Weekly coffee scrubs, Kojic acid tracking, and SPF 50+ enforcement.
- **Hair Preservation:** Daily Minoxidil 5% AM/PM tracker with phase guides (Dread Shed to New Growth).
- **Grooming & Style:** Daily/Weekly/Monthly checklists and a wardrobe essentials guide focusing on fitted, monochromatic clothing.

### 5. 🧠 Discipline
- **32 Core Habits:** A categorized list of daily non-negotiables.
- **Dopamine Reset:** Streak trackers for No-Porn and No-Mindless-Scrolling to repair dopamine baseline.
- **Journal:** Daily reflection templates for accountability.
- **Body Language:** Reminders on posture, eye contact (70% rule), and speaking cadence.
- **Commitment Letter:** A hardcoded declaration of responsibility to read when urges hit.

### 6. 🤖 AI Coach
- **Aggressive Accountability:** Powered by Gemini, prompted with the entire 3000-line `Plan.md` context.
- **Emergency Urge Button:** A globally floating button on all screens. Hitting it prescribes an immediate physical pattern interrupt (e.g., 20 push-ups) and opens the AI coach for intervention.

## 🚀 How to Run Locally

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Metro Bundler**
   ```bash
   npx expo start
   ```

3. **Run on Device / Emulator**
   - Press `a` to open on an Android emulator.
   - Scan the QR code with the **Expo Go** app on a physical device.

## 📦 Building the APK
The app size is heavily optimized and compiles to `< 50MB` for Android.
```bash
npx expo prebuild --clean
cd android
./gradlew assembleRelease
```
The resulting APK will be found in `android/app/build/outputs/apk/release/app-release.apk`.

---
*“No one is coming to save you. No one cares if you fail. If you want respect, build a respectable vessel.”*
