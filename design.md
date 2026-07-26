# Forge App - Design Specification

## Design Philosophy

Forge is a premium, production-quality life transformation tracker designed for a single user. The interface prioritizes **clarity, motivation, and progress visualization** across five interconnected life domains: fitness, nutrition, appearance, discipline, and health optimization.

The app assumes **portrait orientation (9:16)** with **one-handed usage** as the primary interaction model. All interactions follow **Apple Human Interface Guidelines** to feel like a native iOS/Android app.

## Color Palette (Dark Mode Default)

| Token | Hex | Usage |
|-------|-----|-------|
| Primary Background | #0A0A0A | Screen backgrounds, extends behind status bar |
| Secondary Background | #1A1A1A | Card backgrounds, elevated surfaces |
| Tertiary Background | #252525 | Highly elevated cards, modals |
| Primary Accent | #00D9A3 | Growth, progress, completion (emerald green) |
| Secondary Accent | #FFB800 | Achievements, milestones (gold) |
| Danger/Warning | #FF4444 | Missed tasks, warnings |
| Success | #00E676 | Completed tasks, positive states |
| Text Primary | #FFFFFF | Main text, headings |
| Text Secondary | #A0A0A0 | Subtext, descriptions |
| Text Muted | #666666 | Disabled, placeholder text |

## Typography

- **Font Family**: Inter or Poppins (clean, modern, minimal)
- **Headers**: Bold weight, 24-32px
- **Body**: Regular weight, 14-16px
- **Small**: Regular weight, 12-13px

## Screen Structure

### Screen List

1. **Dashboard** (Tab 1) - Home overview with daily schedule and stats
2. **Training** (Tab 2) - Workouts, exercise library, posture, progress
3. **Nutrition** (Tab 3) - Meals, macros, supplements, water, grocery
4. **Appearance** (Tab 4) - Skincare, hair, grooming, wardrobe, looksmax
5. **Discipline** (Tab 5) - Habits, dopamine, journal, milestones

### Bottom Navigation

Five tabs with icons:
- 🏠 Dashboard
- 💪 Training
- 🍽️ Nutrition
- ✨ Appearance
- 🧠 Discipline

Tab bar: 56px height + safe area bottom padding, background #1A1A1A with subtle border.

## Key User Flows

### Flow 1: Daily Routine
User opens app → Dashboard shows today's schedule → Checks off tasks as completed → Sees completion ring fill with emerald green → Receives motivational quote → Views weekly summary.

### Flow 2: Workout Session
User navigates to Training → Selects "Today's Workout" → Sees phase-appropriate exercises → Logs sets/reps → Rest timer counts down → Marks set complete → After last set, sees confetti + completion screen → Compares to previous week.

### Flow 3: Meal Tracking
User navigates to Nutrition → Views daily macro targets → Taps meal cards to mark complete → Sees macro progress bars fill → Tracks junk food counter → Receives supplement reminders.

### Flow 4: Skincare Consistency
User navigates to Appearance → Skincare sub-tab → Follows AM/PM routine steps → Marks each step complete → Sees skincare streak counter increment → Weekly photos tracked side-by-side.

### Flow 5: Habit & Discipline
User navigates to Discipline → Habit Tracker shows calendar heatmap → Completes daily habits → Sees discipline score increase → Journal at night (3 wins, 1 improvement) → Views mood/energy trends.

## Component Design Patterns

### Card Layout
- Background: #1A1A1A with 16px rounded corners
- Padding: 16px
- Shadow: subtle (iOS-style)
- Tap feedback: opacity 0.7

### Progress Indicators
- **Circular Ring**: 200px diameter, emerald fill on completion
- **Progress Bars**: Full width, emerald fill, rounded ends
- **Streak Counters**: Large number + "day streak" label
- **Heatmap**: GitHub-style calendar grid

### Buttons
- **Primary**: Emerald background (#00D9A3), white text, 48px height, 16px rounded
- **Secondary**: #252525 background, white text, 48px height, 16px rounded
- **Tertiary**: Text-only, emerald color

### Input Fields
- Background: #252525
- Border: #333333 (subtle)
- Text: white
- Placeholder: #666666

### List Items
- Background: transparent
- Divider: #252525
- Tap feedback: opacity 0.6

## Interaction Patterns

### Animations
- **Transitions**: 250-300ms duration, subtle easing
- **Press Feedback**: Scale 0.97, opacity 0.9
- **Completion**: Satisfying checkbox animation + haptic
- **Milestone**: Confetti animation + badge pop

### Haptic Feedback
- Button tap: Light impact
- Toggle/switch: Medium impact
- Success/completion: Success notification
- Error/failure: Error notification

### Gestures
- **Swipe Left**: Delete/remove item
- **Swipe Right**: Complete/mark done
- **Pull to Refresh**: Reload data
- **Long Press**: Context menu

## Empty States

Each screen shows motivational messaging when empty:
- "No workouts logged yet. Start today!" (Training)
- "No meals logged. Time to eat!" (Nutrition)
- "No habits tracked. Begin now!" (Discipline)

## Loading States

Skeleton loaders appear while data loads:
- Placeholder cards with shimmer animation
- Fade in to real content when ready

## Accessibility

- Minimum touch target: 44px × 44px
- Color contrast: WCAG AA compliant
- Text sizing: Respects system font size settings
- Dark mode: Default, no light mode toggle needed initially

## Responsive Breakpoints

- **Mobile**: 375px (iPhone SE) to 430px (iPhone 14 Pro Max)
- **Tablet**: 768px+ (not primary target, but should work)
- **Web**: 1280px (for testing, not primary)

## Data Persistence

All data stored locally on device:
- AsyncStorage for simple key-value data
- SQLite for complex relational data
- Photos stored in app filesystem

No cloud sync required (local-first design).

## Performance Targets

- **App Launch**: < 2 seconds
- **Screen Transition**: < 300ms
- **List Scroll**: 60 FPS
- **Data Load**: < 1 second

## Branding

- **App Name**: Forge
- **Tagline**: "Complete Life Transformation Tracker"
- **Emoji**: 🔥 (fire, representing transformation)
- **Logo**: Custom icon reflecting growth/transformation
