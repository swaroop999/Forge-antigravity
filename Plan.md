
# BUILD "FORGE" — COMPLETE LIFE TRANSFORMATION TRACKER APP

## PROJECT OVERVIEW

Build a comprehensive, production-quality Android application (local APK, not for Play Store) that serves as a complete life transformation tracker for a single user. This is a personal command center consolidating fitness, nutrition, skincare, tan removal, hair care, grooming, discipline, dopamine management, posture correction, body language, wardrobe planning, looksmax strategies, and AI coaching into ONE unified platform.

The app must be visually stunning, buttery smooth, modern, and feel like a premium health/lifestyle app. Every interaction should feel satisfying. Every screen should be beautiful.

---

## USER PROFILE (Hardcoded defaults, editable in Settings)

```json
{
  "name": "User",
  "age": 22,
  "height": "5'6\" (167 cm)",
  "startWeight": 45,
  "targetWeight": 62,
  "bodyType": "Severe ectomorph (hardgainer)",
  "frame": "Narrow shoulders, small joints, long legs relative to torso",
  "faceShape": "Oblong/Rectangular with soft angles",
  "skinType": "Normal, acne-prone on right cheek",
  "hairType": "Fine, soft, silky, dry scalp, dandruff",
  "location": "Bangalore, India",
  "workSchedule": "Mon-Fri, 9:30 AM - 4:00 PM, 20km scooter commute each way",
  "equipment": "Pull-up bar (wall-mounted, adjustable height), book-filled bags as weights, resistance band",
  "knownIssues": [
    "Severely underweight (BMI 16.0)",
    "Right cheek acne + post-inflammatory hyperpigmentation (PIH)",
    "Recent beach tan from Varkala trip (June) — uneven skin tone",
    "Black elbows/knees/knuckles",
    "Forward head posture (moderate), rounded shoulders (mild-moderate), mild anterior pelvic tilt",
    "Dandruff (heavy flaking, no itch), fine/thinning hair",
    "Father bald at 48 — androgenetic alopecia (AGA) risk",
    "Confirmed Vitamin D deficiency",
    "Daily porn addiction",
    "13+ hours daily screen time",
    "Chronic procrastination",
    "No exercise since 2020 (was competitive badminton player before)",
    "Sleep: 2 AM to 8 AM (6 hours, phone in bed)",
    "Never followed a structured plan for 30+ days"
  ],
  "strengths": [
    "Good facial bone structure (sharp nose, strong brows, defined lips)",
    "Intact hairline (no visible recession yet)",
    "Former athlete nervous system (badminton muscle memory)",
    "No medical conditions, no allergies",
    "Has a girlfriend (external accountability)",
    "Age 22 — peak testosterone and recovery window",
    "Problems are 100% behavioral, not genetic"
  ],
  "primaryGoals": [
    "Gain 17-20 kg of lean muscle (45 → 62-65 kg)",
    "Clear acne, remove marks, even skin tone, remove tan",
    "Preserve and thicken hair",
    "Fix posture (gain 1-1.5 inches visual height)",
    "Build unbreakable discipline",
    "Eliminate porn dependency",
    "Maximize physical attractiveness and presence"
  ]
}
```

---

## TECH STACK

- **Framework:** React Native with Expo (for easy APK build) OR Flutter (for native performance)
- **Local Database:** SQLite or Realm (ALL data stored locally on device, zero backend)
- **Charts/Graphs:** Victory Charts (RN) / FL Chart (Flutter) / MPAndroidChart
- **Notifications:** Local push notifications (no server needed)
- **AI Integration:** Google Gemini API (optional, requires internet only for AI features)
- **Export:** PDF and CSV export for progress reports
- **Camera:** For progress photos (stored locally)
- **State Management:** Redux Toolkit (RN) or Provider/Riverpod (Flutter)
- **Storage:** AsyncStorage / SharedPreferences for settings, SQLite for structured data
- **Secure Storage:** For API key encryption

---

## DESIGN SYSTEM

### Color Palette (Dark Theme — Default):
```
Primary Background:    #0A0A0A (near black)
Secondary Background:  #141414 (cards)
Tertiary Background:   #1E1E1E (elevated cards, modals)
Surface:               #252525 (input fields, inactive elements)
Primary Accent:        #00D9A3 (emerald green — growth, progress)
Secondary Accent:      #FFB800 (gold — achievements, milestones)
Tertiary Accent:       #4A90FF (blue — informational)
Danger:                #FF4444 (missed items, warnings)
Warning:               #FFA726 (caution items)
Success:               #00E676 (completed items)
Text Primary:          #FFFFFF
Text Secondary:        #B0B0B0
Text Muted:            #666666
Text Disabled:         #444444
Divider:               #2A2A2A
```

### Light Theme (Optional toggle):
```
Primary Background:    #F5F5F7
Secondary Background:  #FFFFFF
Text Primary:          #1A1A1A
Text Secondary:        #666666
Primary Accent:        #00B386 (slightly darker emerald for contrast)
Cards:                 White with subtle shadow
```

### Typography:
```
Font Family:           Inter OR Poppins (import from Google Fonts)
H1 (Screen titles):    28px, Bold (700)
H2 (Section headers):  22px, SemiBold (600)
H3 (Card titles):      18px, SemiBold (600)
Body:                  16px, Regular (400)
Body Small:            14px, Regular (400)
Caption:               12px, Regular (400)
Button Text:           16px, SemiBold (600)
Tab Labels:            12px, Medium (500)
Numbers/Stats:         24-48px, Bold (700) — for large stat displays
```

### UI Components:
```
Border Radius:         16px (cards), 12px (buttons), 8px (inputs), 24px (chips/tags)
Card Shadow:           0px 4px 12px rgba(0,0,0,0.3) (dark mode)
Card Padding:          16px internal
Screen Padding:        20px horizontal
Section Spacing:       24px between sections
Card Spacing:          12px between cards
Animation Duration:    300ms (transitions), 200ms (micro-interactions)
Animation Curve:       ease-in-out (standard), spring (bouncy elements)
Bottom Nav Height:     64px
Status Bar:            Translucent, matches background
```

### UI Principles:
- Smooth 60fps animations on ALL transitions (slide, fade, scale, spring physics)
- Card-based layout with subtle depth
- Bottom navigation bar with 6 main tabs (including AI Coach)
- Pull-to-refresh on all scrollable screens
- Haptic feedback on button taps and checkbox completions
- Skeleton loaders while data loads
- Empty states with motivational messages and subtle illustrations
- Progress rings (circular), progress bars (linear), streak flames everywhere
- Micro-interactions: checkbox fill animations, confetti on milestones, counter animations
- Swipe gestures: swipe right to complete, swipe left to delete/dismiss
- Floating Action Button (FAB) for quick-add actions
- Toast notifications for confirmations
- Bottom sheets for secondary actions
- Lottie animations for celebrations (confetti, fireworks, level-up)

---

## APP STRUCTURE — BOTTOM NAVIGATION (6 TABS)

```
Tab 1: 🏠 DASHBOARD      (Home — daily command center)
Tab 2: 💪 TRAINING        (Workouts, posture, exercises)
Tab 3: 🍽️ NUTRITION       (Meals, supplements, water, groceries)
Tab 4: ✨ APPEARANCE      (Skin, tan, hair, grooming, style, looksmax)
Tab 5: 🧠 DISCIPLINE     (Habits, dopamine, journal, milestones, body language)
Tab 6: 🤖 AI COACH       (Gemini-powered contextual coaching)
```

Each tab icon should be clean, minimal line-art style. Active tab highlighted with emerald accent + label visible. Inactive tabs show icon only in muted color.

---

## SCREEN-BY-SCREEN SPECIFICATION

---

## TAB 1: 🏠 DASHBOARD

The command center. Shows today's snapshot at a glance.

### Section 1: Header
- Top-left: "Good [morning/afternoon/evening]" + current date (e.g., "Monday, July 14, 2025")
- Top-right: Settings gear icon → navigates to Settings screen
- Below greeting: Phase badge (pill-shaped, accent color):
  - Phase 1: FOUNDATION (Days 1-30) — emerald badge
  - Phase 2: BUILD (Days 31-90) — blue badge
  - Phase 3: OPTIMIZE (Days 91-365) — gold badge
- Phase subtitle: Brief focus text (e.g., "Fix sleep, nutrition, skincare basics")
- Day counter: "Day X of 365" with thin progress bar spanning full width
- Phase auto-updates based on startDate calculation

### Section 2: Today's Completion Ring
- Large circular progress ring (220px diameter), centered
- Ring fills clockwise with emerald green as tasks complete
- Inside ring: Large percentage number + "X of Y tasks done"
- Subtle pulse animation when 100% reached
- Tap ring → modal/bottom sheet showing breakdown by category:
  - Nutrition: X/Y
  - Training: X/Y
  - Skincare: X/Y
  - Discipline: X/Y
  - Hair Care: X/Y

### Section 3: Quick Stats Cards (Horizontal scroll)
Horizontally scrollable row of stat cards (120px wide × 140px tall):

Card 1: **Weight**
- Current weight (large number)
- Trend arrow (↑ green if gaining, ↓ red if losing, → grey if stable)
- Change from start: "+X.X kg"

Card 2: **Streak**
- Current consecutive days following plan
- Flame emoji 🔥 if streak > 7
- "Best: X days" subtitle

Card 3: **Sleep**
- Last night's hours
- Quality rating (colored: green >7.5h, yellow 6-7.5h, red <6h)

Card 4: **Water**
- Glasses today / 12
- Small water drop graphic

Card 5: **Workout**
- "Done ✓" (green) or "Pending" (yellow) or "Rest Day" (blue)
- Workout type if applicable

Card 6: **Skincare**
- "AM ✓ PM ✓" or "AM ✓ PM ✗" etc.
- Streak count

Card 7: **Screen Time**
- Hours today (manual entry)
- Color: green <4h, yellow 4-8h, red >8h

Card 8: **Porn-Free**
- Current streak in days
- Color intensifies with longer streak

### Section 4: Today's Schedule Timeline
Vertical timeline with time-based tasks. Auto-adjusts for day of week.

**WEEKDAY SCHEDULE (Monday-Friday):**
```
7:30 AM  — Wake + 500ml water + lemon                    ☐
7:35 AM  — Posture routine (10 min)                      ☐
7:45 AM  — Priority movements (lat raises, neck, shrugs) ☐
7:50 AM  — Skincare AM + Minoxidil AM                    ☐
8:15 AM  — Breakfast + AM supplements (B12, Omega-3)     ☐
8:45 AM  — Leave for work (helmet + SPF body)            ☐
11:00 AM — Mid-morning snack                             ☐
12:15 PM — Lunch (protein tiffin) + Zinc after lunch     ☐
1:00 PM  — Post-lunch walk (10 min)                      ☐
4:00 PM  — Pre-commute snack                             ☐
5:45 PM  — Training session (30-45 min)                  ☐
6:30 PM  — Post-workout: Whey + Creatine + shower        ☐
7:00 PM  — Evening snack (healthy, NOT junk)             ☐
9:00 PM  — Dinner + Omega-3                              ☐
9:30 PM  — Skincare PM + Minoxidil PM                    ☐
10:00 PM — Journal (5 min)                               ☐
10:15 PM — Reading (physical book)                       ☐
10:45 PM — Magnesium Glycinate + Turmeric milk           ☐
11:00 PM — Phone out of bedroom                          ☐
11:15 PM — Lights out                                    ☐
11:30 PM — Sleep                                         ☐
```

**SATURDAY SCHEDULE:**
```
8:00 AM  — Wake + water                                  ☐
8:15 AM  — Posture routine                               ☐
8:30 AM  — Skincare AM + Minoxidil AM                    ☐
9:00 AM  — Breakfast + supplements + D3 60K sachet       ☐
10:00 AM — Training session (Priority Movements Focus)   ☐
11:00 AM — Protein shake + shower                        ☐
11:30 AM — Meal prep (2 hours)                           ☐
1:30 PM  — Lunch + Zinc                                  ☐
2:00 PM  — Personal time / GF time                       ☐
6:00 PM  — Evening — Restaurant (1 cheat meal allowed)   ☐
9:00 PM  — Dinner (home) + Omega-3                       ☐
9:30 PM  — Skincare PM + Minoxidil PM + Body scrub       ☐
10:00 PM — Journal + Plan next week                      ☐
10:45 PM — Magnesium + Turmeric milk                     ☐
11:00 PM — Phone out                                     ☐
12:00 AM — Sleep                                         ☐
```

**SUNDAY SCHEDULE:**
```
8:00 AM  — Wake + water                                  ☐
8:15 AM  — Posture routine                               ☐
8:30 AM  — Skincare AM + Minoxidil AM                    ☐
9:00 AM  — Breakfast + supplements                       ☐
10:00 AM — Long walk / light activity (30 min)           ☐
10:45 AM — Deep skincare: Face mask + Ubtan body pack    ☐
11:15 AM — Let masks dry (read/plan week)                ☐
11:30 AM — Shower + rinse masks + hair oil application   ☐
12:00 PM — Lunch + Zinc                                  ☐
1:00 PM  — Weekly review + Planning                      ☐
3:00 PM  — Reading / Hobby                               ☐
6:00 PM  — Evening snack                                 ☐
9:00 PM  — Dinner + Omega-3                              ☐
9:30 PM  — Skincare PM + Minoxidil PM                    ☐
10:00 PM — Journal                                       ☐
10:30 PM — Magnesium + Turmeric milk                     ☐
10:45 PM — Phone out                                     ☐
11:00 PM — Sleep                                         ☐
```

**Timeline item behavior:**
- Each item is tappable to toggle completion
- Color states: Grey (pending) → Blue (in-progress, current time window) → Green (completed with checkmark animation) → Red (missed, time passed + unchecked)
- Completed items show subtle strikethrough + green checkmark
- Auto-scrolls to current time block on screen load
- Satisfying haptic feedback + sound on completion

### Section 5: Milestone Progress Cards
3 horizontally scrollable cards:
- **30-Day Goals** — circular progress showing X/Y completed
- **90-Day Goals** — circular progress
- **365-Day Goals** — circular progress
- Each card tappable → expands to full milestone checklist

### Section 6: Daily Motivational Quote
Card at bottom with random quote from pre-loaded database of 100+ quotes.
Changes daily at midnight. Subtle background gradient.

Example quotes:
- "Discipline is choosing between what you want now and what you want most."
- "Your body is a reflection of your lifestyle."
- "The man who moves a mountain begins by carrying away small stones."
- "You don't have to be extreme, just consistent."
- "Hard choices, easy life. Easy choices, hard life."
(Include 100+ quotes in the app database)

### Section 7: Weekly Summary (Collapsible card)
- Bar chart: daily completion % for past 7 days
- Stats row: Avg sleep | Avg water | Workouts done | Skincare streak | Discipline score

---

## TAB 2: 💪 TRAINING

### Top Tab Navigation:
```
Today's Workout | Program | Exercises | Progress | Posture | Priority
```

---

### Sub-tab: TODAY'S WORKOUT

Header: Shows current Phase, Day, Workout Type
Example: "Phase 1 — Monday — Upper Push"

**Pre-workout card:**
"⚡ Warm up first! 5 minutes: Jumping jacks → Arm circles → Leg swings → Hip circles"
5-minute countdown timer button. Trackable: Y/N.

#### PHASE 1 WORKOUTS (Days 1-30) — "REBUILD THE MACHINE"
Frequency: 4 days/week (Mon, Tue, Thu, Fri) — 30 min max
Rest days: Wed, Sat (priority movements only), Sun (full rest)

**MONDAY — Upper Push:**
| Exercise | Sets × Reps | Rest | Notes |
|----------|-------------|------|-------|
| Wall push-ups → Incline push-ups | 3 × 8-12 | 60s | Progress from wall to incline weekly |
| Pike push-ups | 3 × 6-10 | 60s | Shoulders focus — your #1 priority muscle |
| Book-bag overhead press | 3 × 10 | 60s | Use 5-8 kg bag |
| Lateral raises (book-bag/bottles) | 3 × 12 | 45s | Width builder — CRITICAL for your frame |
| Tricep dips on chair | 3 × 8-12 | 60s | Control the negative |
| Plank | 3 × 30 sec | 45s | Core tight, no sagging |

**TUESDAY — Lower + Core:**
| Exercise | Sets × Reps | Rest | Notes |
|----------|-------------|------|-------|
| Bodyweight squats | 3 × 15 | 60s | Full depth, heels down |
| Bulgarian split squats | 3 × 10 each leg | 60s | Rear foot on chair |
| Glute bridges | 3 × 15 | 45s | Squeeze at top 2 sec |
| Calf raises | 3 × 20 | 45s | Slow 3-sec negative |
| Dead bugs | 3 × 10 each side | 45s | Core activation |
| Side plank | 2 × 20 sec each | 45s | Build duration weekly |

**WEDNESDAY — REST DAY**
Display: "Rest Day — 20 min walk + full posture routine + daily priority movements"
Show posture routine as suggested activity.

**THURSDAY — Upper Pull:**
| Exercise | Sets × Reps | Rest | Notes |
|----------|-------------|------|-------|
| Dead hangs | 3 × max time | 60s | Track seconds, beat last week |
| Negative pull-ups | 3 × 5 | 90s | Jump up, lower 5 sec slowly |
| Book-bag bent-over rows | 3 × 12 | 60s | Squeeze shoulder blades together |
| Book-bag bicep curls | 3 × 12 | 60s | Control tempo, no swinging |
| Shrugs (heavy bag) | 3 × 15 | 45s | Trap builder — thickens neck area |
| Face pulls (band/towel) | 3 × 15 | 45s | Posture correction + rear delts |

**FRIDAY — Full Body + Core:**
| Exercise | Sets × Reps | Rest | Notes |
|----------|-------------|------|-------|
| Push-ups | 3 × max | 60s | Track total reps weekly |
| Squats | 3 × 20 | 60s | Add tempo (3 sec down) |
| Inverted rows (under table) | 3 × 10 | 60s | Pull chest to table edge |
| Reverse lunges | 3 × 10 each | 60s | Step back, not forward |
| Hollow body hold | 3 × 20 sec | 45s | Core |
| Superman hold | 3 × 20 sec | 45s | Lower back + posture |

**SATURDAY — Priority Movements Focus Day (30 min):**
| Exercise | Sets × Reps | Rest | Notes |
|----------|-------------|------|-------|
| Lateral raises (book-bag) | 4 × 15 | 45s | Width — your #1 visual weakness |
| Neck curls (lying face-up) | 3 × 15 | 45s | Thick neck = masculine presence |
| Neck extensions (lying face-down) | 3 × 15 | 45s | Balance with curls |
| Shrugs (heaviest bag) | 3 × 15 | 60s | Traps fill out shirt area |
| Band pull-aparts | 3 × 20 | 30s | Posture + rear delts |
| Dead hangs | 3 × max time | 60s | Spinal decompression + grip |

**SUNDAY — Full Rest**
Display: "Complete rest. No training. Walk if desired. Focus on recovery, skincare deep treatment, and weekly planning."

#### PHASE 2 WORKOUTS (Days 31-90) — "STRENGTH & HYPERTROPHY"
Frequency: 5 days/week (Mon-Fri) — 45 min
Rest: Sat (priority movements), Sun (full rest)

**Rules card:**
- 5-min warm-up required
- Train to 1-2 reps before failure now
- Progressive overload every week (more reps OR heavier weight)
- Creatine 5g daily started

**MONDAY — Push (Chest, Shoulders, Triceps):**
| Exercise | Sets × Reps | Rest |
|----------|-------------|------|
| Push-ups (weighted backpack) | 4 × 10-15 | 60s |
| Pike push-ups → Handstand progression | 4 × 8-12 | 90s |
| Book-bag overhead press | 4 × 10 | 60s |
| Lateral raises (book-bag) | 4 × 12-15 | 45s |
| Diamond push-ups | 3 × 8-12 | 60s |
| Tricep dips (feet elevated) | 3 × 10-15 | 60s |
| Plank to push-up | 3 × 10 | 45s |

**TUESDAY — Pull (Back, Biceps):**
| Exercise | Sets × Reps | Rest |
|----------|-------------|------|
| Pull-ups (assisted → strict) | 4 × 5-8 | 90s |
| Chin-ups | 3 × 5-8 | 90s |
| Book-bag rows | 4 × 12 | 60s |
| Inverted rows | 3 × max | 60s |
| Shrugs (heavy bag) | 3 × 15 | 60s |
| Book-bag curls | 3 × 12 | 60s |
| Reverse curls | 3 × 12 | 60s |
| Face pulls | 3 × 15 | 45s |

**WEDNESDAY — Legs:**
| Exercise | Sets × Reps | Rest |
|----------|-------------|------|
| Bulgarian split squats (weighted) | 4 × 10 each | 90s |
| Bodyweight squats | 4 × 20 | 60s |
| Reverse lunges | 3 × 12 each | 60s |
| Single-leg glute bridges | 3 × 12 each | 45s |
| Calf raises | 4 × 25 | 45s |
| Wall sit | 3 × 45 sec | 60s |

**THURSDAY — Push Volume Day:**
| Exercise | Sets × Reps | Rest |
|----------|-------------|------|
| Push-up variations (rotate: incline/decline/wide/close) | 5 × 12 | 60s |
| Lateral raises | 4 × 15 | 45s |
| Overhead press (book-bag) | 4 × 10 | 60s |
| Shoulder taps | 3 × 20 | 45s |
| Tricep extensions (bag behind head) | 3 × 12 | 60s |

**FRIDAY — Pull + Core:**
| Exercise | Sets × Reps | Rest |
|----------|-------------|------|
| Pull-ups | 4 × max | 90s |
| Rows | 4 × 12 | 60s |
| Curls | 4 × 12 | 60s |
| Core circuit (3 rounds): Hollow hold 20s → Leg raises 12 → Plank 30s → Russian twists 20 → Mountain climbers 20 | 3 rounds | 60s between rounds |

**SATURDAY — Priority Movements + Weak Points (30 min):**
| Exercise | Sets × Reps |
|----------|-------------|
| Lateral raises (heavy bag) | 5 × 15 |
| Neck curls + extensions | 4 × 15 each |
| Face pulls | 4 × 20 |
| Rear delt flyes (bent over, book-bag) | 4 × 15 |
| Band pull-aparts | 4 × 20 |
| Dead hangs | 4 × max |

#### PHASE 3 WORKOUTS (Days 91-365) — "OPTIMIZE"
Same PPL structure as Phase 2 but with:
- 5 sets instead of 4 for main compound lifts
- Advanced progressions: Archer push-ups, one-arm push-up progression, muscle-up progression, pistol squat progression, archer pull-ups, weighted vest use
- Saturday becomes full weak-point day (6 day training week)
- Add 15-min low-intensity walking post-workout 3x/week for conditioning and recovery

**Each exercise card in the workout screen must have:**
- Exercise name (bold)
- Target muscle group tag (small colored chip)
- Target sets × reps displayed
- Rest timer: Countdown that auto-starts when a set is logged. Audio chime when rest is over.
- Input fields per set: Actual reps completed + Weight used (kg, 0 for bodyweight)
- Notes field (expandable)
- Small "?" icon → tapping shows text description of proper form + common mistakes
- Checkbox per set to mark complete
- When all sets done for an exercise, card background shifts to subtle green
- When ALL exercises complete, show celebration screen

**After full workout completion:**
- Full-screen congratulations with confetti/Lottie animation
- Summary: Total volume (sets × reps × weight), Total time, Exercises completed
- "Save Workout" button → saves to workout history database
- Comparison card: "You did X more reps than last [same workout type]!" (if historical data exists)
- Rating: "How hard was this? 1-10" slider

---

### Sub-tab: PROGRAM OVERVIEW

Visual timeline showing all 3 phases:

Phase 1 Card (Days 1-30): "FOUNDATION"
- 4-day split
- Goals: Wake up muscles, build baseline, learn form
- "You are here" indicator if current

Phase 2 Card (Days 31-90): "BUILD"
- 5-day PPL split
- Goals: Progressive overload, muscle gain, strength benchmarks
- Add creatine

Phase 3 Card (Days 91-365): "OPTIMIZE"
- 6-day advanced split
- Goals: Peak aesthetic, advanced progressions, athletic performance

Each card expandable to show full weekly structure and milestone targets.

**Progressive Overload Tracker:**
For each exercise, line graph showing reps and/or weight over time.
Weekly prompt card: "Time to progress! Add 1-2 reps or increase weight this week."

**Training Rules Card (always visible at top):**
- Warm up 5 min before every session
- Stop 1-2 reps before failure (Phase 1), near-failure (Phase 2-3)
- Track every workout — what gets measured gets improved
- Increase difficulty every week
- Rest days are MANDATORY — muscles grow during rest, not during training

---

### Sub-tab: EXERCISE LIBRARY

Searchable, filterable, categorized list of ALL exercises in the program.

**Categories (filter chips at top):**
- All | Push | Pull | Legs | Core | Posture | Priority | Mobility

**Each exercise entry includes:**
- Exercise name
- Target muscles (small body diagram with highlighted muscles — front and back view)
- Difficulty badge: Beginner (green) / Intermediate (yellow) / Advanced (red)
- Equipment needed: Bodyweight / Book-bag / Pull-up bar / Band / Chair / Table
- Step-by-step form description (numbered list, clear text)
- Common mistakes to avoid (bullet list)
- Progression path: Visual chain showing progression (e.g., Wall push-up → Incline → Standard → Decline → Weighted → Diamond → Archer → One-arm)
- Personal best tracker: Highest reps, longest hold, heaviest weight — with date
- "Log a PR" button

**Complete Exercise Database (ALL must be included):**

**PUSH EXERCISES (18):**
Wall push-ups, Incline push-ups, Standard push-ups, Wide push-ups, Close/Diamond push-ups, Decline push-ups, Weighted push-ups (backpack), Archer push-ups, One-arm push-up progression, Pike push-ups, Handstand push-ups (wall-assisted), Book-bag overhead press, Lateral raises (book-bag/bottles), Front raises, Shoulder taps, Tricep dips (chair), Tricep dips (feet elevated), Tricep extensions (bag behind head), Plank to push-up

**PULL EXERCISES (17):**
Dead hangs, Negative pull-ups, Assisted pull-ups, Standard pull-ups, Chin-ups, Wide-grip pull-ups, Archer pull-ups, Muscle-up progression, Book-bag bent-over rows, Inverted rows (under table), Book-bag bicep curls, Hammer curls, Reverse curls, Face pulls (band/towel), Band pull-aparts, Shrugs (heavy bag), Rear delt flyes (bent-over)

**LEG EXERCISES (13):**
Bodyweight squats, Bulgarian split squats, Weighted Bulgarian split squats, Reverse lunges, Walking lunges, Pistol squat progression, Jump squats (Phase 3), Glute bridges, Single-leg glute bridges, Hip thrusts, Calf raises, Single-leg calf raises, Wall sit, Step-ups

**CORE EXERCISES (14):**
Plank, Side plank, Dead bugs, Hollow body hold, Superman hold, Leg raises (lying), Hanging leg raises, Russian twists, Mountain climbers, Bicycle crunches, Flutter kicks, Ab roller (if acquired), L-sit progression, Bird dogs

**POSTURE EXERCISES (12):**
Doorway chest stretch, Wall angels, Chin tucks, Cat-cow, Band pull-aparts, Towel pull-aparts, YTW raises (prone), Face pulls, Dead hangs (spinal decompression), Thoracic spine rotation, Scapular push-ups, Wall slides

**PRIORITY MOVEMENTS (9):**
Lateral raises (extra volume), Neck curls (lying face-up), Neck extensions (lying face-down), Neck side flexion, Shrugs, Face pulls, Rear delt flyes, Band pull-aparts, Dead hangs

**MOBILITY & STRETCHING (10):**
Arm circles, Leg swings, Hip circles, World's greatest stretch, Pigeon stretch, Couch stretch, Hamstring stretch, Shoulder dislocates (band/towel), 90/90 hip stretch, Thoracic foam roll

**TOTAL: 93 exercises**

---

### Sub-tab: PROGRESS

**Weight Graph:**
Line chart, daily weigh-ins. X-axis: dates. Y-axis: kg.
Target lines (dotted, labeled): 48kg (30-day), 52kg (90-day), 58kg (6-month), 62kg (1-year).
Trend line (7-day moving average).

**Body Measurements:**
Weekly line charts for each (entered every Sunday):
Chest (cm), Left Arm, Right Arm, Left Forearm, Right Forearm, Waist, Left Thigh, Right Thigh, Left Calf, Right Calf, Neck, Shoulders (bideltoid width)

**Strength Benchmarks (tracked over time, line graphs):**
- Max push-ups in one set
- Max pull-ups in one set
- Max dead hang time (seconds)
- Max wall sit time (seconds)
- Max plank time (seconds)
- Bulgarian split squat max weight
- Overhead press max weight

**Progress Photos:**
Grid gallery showing weekly photos: Front relaxed, Side profile, Back, Front flexed (arms up).
Each photo date-stamped automatically.
**Side-by-side comparison slider:** Pick any 2 dates → swipe slider to compare.

**Volume Tracker:**
Weekly bar charts showing total sets and total reps per muscle group.

---

### Sub-tab: POSTURE

**Posture Assessment Status:**
| Issue | Severity | Status |
|-------|----------|--------|
| Forward head posture | Moderate | ⚠️ Needs correction |
| Rounded shoulders | Mild-Moderate | ⚠️ Needs correction |
| Anterior pelvic tilt | Mild | 👀 Monitor |
| Upper back rounding (kyphosis) | Mild | 👀 Monitor |

**Morning Posture Routine (5 min):**
| Exercise | Duration/Reps | Done? |
|----------|---------------|-------|
| Doorway chest stretch | 30 sec each side × 2 | ☐ |
| Wall angels | 15 reps | ☐ |
| Chin tucks | 15 reps | ☐ |
| Cat-cow | 10 reps | ☐ |

**Evening Posture Routine (5 min):**
| Exercise | Duration/Reps | Done? |
|----------|---------------|-------|
| Band/towel pull-aparts | 20 reps × 2 | ☐ |
| YTW raises (prone) | 10 each × 2 | ☐ |
| Face pulls | 15 × 2 | ☐ |
| Dead hangs | 20-30 sec × 3 | ☐ |

Each exercise: checkbox + timer for holds. Streak counter.

**Height Optimization Info Card:**
"Growth plates fused at 22. Bones will NOT grow taller."
"What you CAN gain:
• 0.5–1.5 inches visual height from posture correction
• ~0.5 inch from spinal decompression + core strength
• Perceived height from V-taper physique (broader shoulders, lean waist)
• Style-based height perception (see Wardrobe section)"
"IGNORE: Grow-taller pills, HGH, ankle weights, stretching myths"

**Posture Reminders:**
Toggleable notification every 1/2/3 hours: "Posture check! Shoulders back, chin tucked."
Monthly posture comparison photo (side profile, facing left).

---

### Sub-tab: PRIORITY MOVEMENTS

**Physique Analysis Card:**
"Based on your photos, these are your specific weak points:
1. **Shoulders (Deltoids)** — narrow bideltoid width is #1 visual weakness. Lateral raises are your most important exercise.
2. **Neck** — thin neck creates frail appearance. Neck curls + extensions will add masculine presence within 8-12 weeks.
3. **Traps** — absent traps create 'no neck' narrow look. Shrugs will fill out your shirt area.
4. **Rear Delts + Upper Back** — corrects posture AND adds visual width from behind.
Doing these daily (5-10 min) accelerates transformation MORE than doubling regular workouts."

**Daily Priority Movements (do anytime, spread through day):**
| Exercise | Target | Done? |
|----------|--------|-------|
| Lateral raises (book-bag/bottles) | 15 reps × 2 sets | ☐ |
| Neck curls (lying face-up) | 10 reps | ☐ |
| Neck extensions (lying face-down) | 10 reps | ☐ |
| Shrugs (heavy bag) | 15 reps | ☐ |
| Band pull-aparts | 20 reps | ☐ |
| Dead hangs | 20-30 sec | ☐ |

Weekly completion targets:
- Lateral raises: 5-6 days/week
- Neck training: 4-5 days/week
- Shrugs: 3-4 days/week
- Face pulls / band pull-aparts: DAILY
- Dead hangs: DAILY

---

## TAB 3: 🍽️ NUTRITION

### Top Tab Navigation:
```
Today's Meals | Meal Plan | Supplements | Water | Groceries
```

---

### Sub-tab: TODAY'S MEALS

**Daily Target Display (top, always visible):**
4 horizontal progress bars:
- Calories: 2600-2800 kcal
- Protein: 90-110g
- Carbs: 350-400g
- Fats: 70-80g
Each bar fills with color as meals are logged. Shows "X / target" number.

**Meal Cards (scrollable list):**

**Meal 1 — Morning Drink (7:45 AM):** ☐
- 1 glass warm water + 1 tsp lemon + pinch salt
- 1 glass whole milk (250ml) + 1 tbsp jaggery
- 6-8 soaked almonds + 2 soaked walnuts (soaked overnight, peeled)
- ~350 kcal | 12g P | 30g C | 20g F

**Meal 2 — Breakfast (8:30 AM):** ☐
- South Indian base (chitranna/vangibath/palav/puri — whatever's made)
- ADD: 3 whole eggs (scrambled or boiled)
- ADD: 1 banana
- ADD: 1 glass milk (250ml)
- ~650 kcal | 28g P | 75g C | 22g F

**Meal 3 — Mid-Morning Snack (11:00 AM):** ☐
- 1 handful mixed nuts (almonds, cashews, walnuts) — 30g
- 1 boiled egg OR 2 dates + 1 tbsp peanut butter
- ~250 kcal | 10g P | 15g C | 18g F

**Meal 4 — Lunch (12:15 PM):** ☐
- Office rice + rasam (existing)
- ADD: 150-200g grilled/boiled chicken OR paneer OR 3 boiled eggs (carry in tiffin)
- ADD: 1 cucumber/carrot on side (raw fiber)
- ~600 kcal | 35g P | 70g C | 12g F

**Meal 5 — Pre-Commute Snack (4:00 PM):** ☐
- 1 banana + 2 tbsp peanut butter
- OR 1 glass milk + 4 dates
- ~300 kcal | 8g P | 40g C | 14g F

**Meal 6 — Evening Snack (6:30-7:00 PM):** ☐
- Sprouts salad (moong + tomato + onion + lemon + chaat masala)
- OR 2 boiled eggs + 1 fruit
- OR homemade chicken sandwich (brown bread + chicken + veggies)
- ❌ NOT: momos, egg puff, masala puri, street food
- ~250 kcal | 15g P | 30g C | 5g F

**Meal 7 — Dinner (9:00 PM):** ☐
- 2 chapathis + palya + dal + 100g chicken/paneer/eggs
- OR rice + sambar + 3 egg omelette + vegetable
- Include 1 small salad
- ~550 kcal | 25g P | 65g C | 12g F

**Meal 8 — Pre-Bed (10:45 PM):** ☐
- 1 glass warm milk + 1 tsp turmeric
- ~150 kcal | 8g P | 15g C | 6g F

**Post-Workout (training days only):** ☐
- 1 scoop whey protein + 5g creatine + water/milk
- ~120 kcal | 24g P | 3g C | 1g F

**DAILY TOTAL: ~2800-3100 kcal | ~100-115g protein**

Each meal card features:
- Tap to mark complete (green fill animation)
- Approximate macros displayed
- "Swap" button → shows 2-3 alternative options for that meal
- Notes field for customization
- Red warning banner if marked as junk food
- Time indicator: upcoming (grey), current window (blue pulse), completed (green), missed (red)

**Junk Food Rules Card (persistent top banner):**
- "Weekdays: ZERO junk food."
- "Saturday: 1 cheat meal allowed (any restaurant, no guilt)."
- "Sunday: Home food only."
- "Coke: ELIMINATED. Replace with lemon water or coconut water."
- Counter: "Weekday junk-free streak: X days"

---

### Sub-tab: MEAL PLAN

Weekly grid/list view of all 7 days.
Tabs for each day showing full meal plan.
Color coding: Weekday (standard), Saturday (has cheat meal badge), Sunday (home food badge).

**Meal Prep Reminder (Saturday 11:30 AM):**
Card + notification:
"Meal Prep Day! ~2 hours. This saves your entire week."
Checklist:
- ☐ Boil 20 eggs for the week
- ☐ Grill/boil 1 kg chicken breast
- ☐ Soak almonds + walnuts for the week
- ☐ Prepare sprouts (soak moong overnight)
- ☐ Chop veggies for salads
- ☐ Fill office snack boxes (nuts, dates, PB)
- ☐ Buy bananas and fruits for week

---

### Sub-tab: SUPPLEMENTS

**⚠️ IMPORTANT WARNINGS CARD (always visible):**
- "Zinc: NEVER take on empty stomach — causes nausea. Always after lunch."
- "Creatine: Drink 3.5L water daily when taking. 1-2kg water weight in muscles is GOOD."
- "Vitamin D3 60K: Only 1 sachet per week for first 8 weeks. Then switch to daily D3+K2."
- "Magnesium: Must be GLYCINATE form. Oxide/Citrate = poor absorption + digestive issues."
- "B12: Must be METHYLCOBALAMIN form. Not Cyanocobalamin."

**Phase 1 (Days 1-60) — Deficiency Correction:**
| Supplement | Dose | Timing | Checkbox |
|------------|------|--------|----------|
| Whey Protein | 1 scoop (30g) | Post-workout with water/milk | ☐ |
| Creatine Monohydrate | 5g (1 flat tsp) | Any time with water (consistency > timing) | ☐ |
| Omega-3 Fish Oil (1000mg) | 2 capsules | 1 with breakfast, 1 with dinner | ☐ ☐ |
| Magnesium Glycinate | 200-400mg | 30 min before bed | ☐ |
| Vitamin B12 (Methylcobalamin) | 1500 mcg | After breakfast | ☐ |
| Vitamin D3 (60K IU Sachet) | 1 sachet | Once per week (Sunday with fatty meal) | ☐ |
| Zinc Picolinate | 15-30mg | After lunch (NEVER empty stomach) | ☐ |

**Phase 2 (Day 61+) — Maintenance Switch:**
| Change | Details |
|--------|---------|
| Vitamin D3 60K → D3+K2 Daily | Switch from weekly sachet to daily D3 2000 IU + K2 capsule |
| Zinc: Reduce to 15mg | Maintenance dose |
| All others continue unchanged | — |

**Phase 3 (Day 91+) — Optional Additions:**
| Supplement | When to Add | Dose | Timing |
|------------|-------------|------|--------|
| Ashwagandha KSM-66 | Only if sleep/stress still poor | 600mg | Before bed |
| Biotin + Silica | Only if hair not improving after 3 months Minoxidil | As per label | With breakfast |

**Supplements NOT to buy (info card):**
- Multivitamin: Redundant — your standalone stack covers everything better
- BCAAs: Waste if hitting protein target
- Pre-workout: Not needed for home training
- Testosterone boosters: Sleep + diet + training = real T boosters
- Fat burners: You need to GAIN weight
- L-Carnitine, Glutamine, HMB: Overhyped, minimal effect

**Supplement Notifications:**
- 8:30 AM: "Take B12 + Omega-3 with breakfast"
- 1:00 PM: "Take Zinc AFTER lunch"
- Post-workout: "Whey protein + Creatine"
- 9:00 PM: "Take Omega-3 with dinner"
- 10:45 PM: "Magnesium Glycinate before bed"
- Sunday 9 AM: "Take D3 60K sachet with breakfast (fatty meal)"

**Monthly Cost Tracker:**
Display total supplement spend per month. Graph over time.
Current estimate: ~₹3,150/month

---

### Sub-tab: WATER TRACKER

Visual water bottle/pitcher graphic that fills up as glasses logged.
- Target: 3.5L (14 glasses of 250ml) — increased due to Creatine
- Large "+" button to log a glass (splash animation + counter increment)
- Shows: X/14 glasses | X/3.5L
- Hourly reminder toggle: "Drink water!" notification (9 AM to 9 PM)
- Daily streak: Consecutive days hitting 3.5L
- Weekly bar chart (daily totals)

---

### Sub-tab: GROCERIES

**Weekly Staples Checklist:**
- ☐ Eggs — 30 (1 tray)
- ☐ Whole milk — 2L
- ☐ Chicken breast — 1.5 kg
- ☐ Bananas — 7
- ☐ Almonds — 250g
- ☐ Walnuts — 100g
- ☐ Cashews — 100g
- ☐ Dates — 250g
- ☐ Peanut butter — 1 jar (500g)
- ☐ Moong sprouts / dry moong — 500g
- ☐ Brown bread — 1 pack
- ☐ Tomatoes — 500g
- ☐ Onions — 500g
- ☐ Lemons — 6
- ☐ Cucumber — 4
- ☐ Carrots — 4
- ☐ Spinach — 1 bunch
- ☐ Curd/Yogurt — 500g
- ☐ Besan (gram flour) — 250g
- ☐ Turmeric powder — (check stock)
- ☐ Jaggery — (check stock)
- ☐ Coconut oil — (check stock)
- ☐ Honey — (check stock)
- ☐ Seasonal fruit — 1 kg

**Monthly Supplements Reorder:**
- ☐ Whey Protein
- ☐ Omega-3
- ☐ Magnesium Glycinate
- ☐ B12
- ☐ D3 sachets / D3+K2
- ☐ Zinc
- ☐ Creatine (every 3 months)

Each item: checkbox + swipe to remove if stocked.
"Share List" button (WhatsApp share).
Estimated weekly grocery cost display.

---

## TAB 4: ✨ APPEARANCE

### Top Tab Navigation:
```
Skincare | Tan Removal | Hair Care | Grooming | Body Care | Style | Looksmax | Face Log
```

---

### Sub-tab: SKINCARE

**⚠️ PRODUCT WARNINGS (persistent red card at top):**
- "❌ STOP using Humasone (Mometasone) on face — potent steroid. Causes skin thinning, permanent redness, steroid acne. Only use if specifically prescribed for max 2 weeks."
- "❌ STOP using Multani Mitti — too harsh, disrupts skin barrier"
- "❌ STOP using Dabur Gulabari Rose Water — contains alcohol, irritating"
- "✅ Benzomycin: SPOT TREATMENT ONLY — dab on active pimples with Q-tip, not all over face"

**Products You Own (with status):**
| Product | Status | Use? |
|---------|--------|------|
| Aqualogica De-Tan SPF 50+ | ✅ KEEP | AM only — face sunscreen |
| Derma Co 10% Niacinamide | ✅ KEEP | AM serum + select PM nights |
| Nivea Soft | ⚠️ BODY ONLY | Repurpose for elbows/knees/body |
| Benzomycin Gel | ⚠️ SPOT ONLY | Dab on active pimples only |
| Nizoral 2% | ✅ KEEP | For scalp — see Hair section |
| Humasone | ❌ STOP | Do NOT use on face |
| Multani Mitti | ❌ STOP | Too harsh |
| Gulabari Rose Water | ❌ STOP | Contains alcohol |

**Products to BUY:**
| Product | Brand | Cost | Purchased? |
|---------|-------|------|-----------|
| Adapalene 0.1% Gel | Deriva CMS or Adaferin | ₹200 | ☐ |
| Gentle Cleanser | Cetaphil Gentle Skin Cleanser or Minimalist 2% Salicylic | ₹350 | ☐ |
| Face Moisturizer | Minimalist Sepicalm or Cetaphil Moisturizing Lotion | ₹500 | ☐ |
| Vitamin C Serum 10% | Minimalist or Derma Co | ₹400 | ☐ |
| Alpha Arbutin 2% | Minimalist | ₹400 | ☐ |
| Caffeine Undereye Solution | The Ordinary Caffeine 5% + EGCG | ₹700 | ☐ |
| Lip Balm | Nivea Men Cool Kick | ₹100 | ☐ |

**AM ROUTINE (7:50 AM):**
| Step | Product | Action | Done? |
|------|---------|--------|-------|
| 1 | Lukewarm water splash | No cleanser AM — preserves skin barrier | ☐ |
| 2 | Vitamin C Serum 10% | 3-4 drops, pat into skin. Wait 5 min. | ☐ |
| 3 | Derma Co Niacinamide 10% | 3-4 drops, focus on right cheek area | ☐ |
| 4 | Moisturizer (Cetaphil/Minimalist) | Pea-sized amount, face + neck | ☐ |
| 5 | Caffeine Solution | Tiny amount under both eyes | ☐ |
| 6 | Aqualogica SPF 50 | 2 finger-lengths, face + neck + ears | ☐ |
| 7 | Lip balm | Apply to lips | ☐ |

**PM ROUTINE (9:30 PM):**
| Step | Product | Action | Done? |
|------|---------|--------|-------|
| 1 | Cleanser | Massage 30-60 sec, rinse lukewarm | ☐ |
| 2 | WAIT 15-20 min | Skin must be completely dry before actives | ☐ |
| 3 | Active (see rotation below) | Pea-sized for entire face | ☐ |
| 4 | Wait 5 min | — | ☐ |
| 5 | Moisturizer | Generous layer | ☐ |
| 6 | Spot treatment (Benzomycin) | ONLY on active pimples, Q-tip | ☐ |

**PM ACTIVES — WEEKLY ROTATION (app auto-calculates tonight's active):**
| Day | Active | Purpose |
|-----|--------|---------|
| Monday | Adapalene 0.1% (all face) | Acne, texture, marks, tone |
| Tuesday | Alpha Arbutin 2% + Niacinamide 10% | Tan removal, brightening, marks |
| Wednesday | Adapalene 0.1% (all face) | Acne, texture, marks |
| Thursday | REST — cleanse + moisturize only | Barrier recovery |
| Friday | Adapalene 0.1% (all face) | Acne, texture, marks |
| Saturday | Vitamin C Serum (PM dose) + Niacinamide | Brightening, antioxidant |
| Sunday | REST — cleanse + moisturize only | Barrier recovery + deep treatment day |

**Adapalene Progression Tracker:**
- Weeks 1-4: 3x/week only (Mon/Wed/Fri)
- Weeks 5-8: 5x/week (add Tue/Thu)
- Weeks 9+: Can go daily except 1 rest night
- ⚠️ PURGING WARNING (Weeks 1-6): "Skin might get worse before better. New pimples appearing = product working, pushing out existing clogs. Do NOT stop."

**Skincare Streak Counter:**
"AM + PM completed: X days in a row" — milestone badges at 7, 14, 30, 60, 90

**Behavioral Reminders (toggleable):**
- Every 2 hours: "Hands off your face!"
- Every 3 days: "Change pillowcase today"
- Every 3 days: "Change face towel today"
- AM: "Wear helmet visor on commute — dust + UV destroying your skin"
- "Wash hands before skincare"
- "DO NOT pop/pick pimples — every pop = 6 months of pigmentation"

**Skin Face Map:**
Face outline diagram. Tap areas to log: Active acne count, marks, pigmentation, dryness, oiliness.
Weekly tracking shows improvement over time.

**Weekly Skin Photo (Sunday):**
Take close-ups: front, left profile, right profile. Same lighting each time. Date-stamped gallery. Slider comparison.

**Black Elbows/Knees/Knuckles Protocol:**
| Step | Action | Frequency | Done? |
|------|--------|-----------|-------|
| 1 | Rub raw potato OR lemon+honey mix 5 min → rinse → Nivea Soft/coconut oil | Every alternate night | ☐ |
| 2 | Exfoliate: sugar + honey scrub 2 min | Once/week (Sunday) | ☐ |
| 3 | Apply Niacinamide 10% or Sebamed Urea 10% cream | Every night on these areas | ☐ |
| 4 | Stop leaning on elbows on desks/beds | Always | ☐ |

Monthly progress photo: elbows/knees close-ups.

---

### Sub-tab: TAN REMOVAL

**Tan Assessment Dashboard:**
Rate tan severity per body part (1-10 scale, reassess weekly):
- Face | Neck | Arms | Hands | Legs | Feet
Graph showing improvement over time per area.

**How Tan Removal Works (info card):**
"3-front attack:
1. PREVENTION — Stop new tan (SPF + helmet + protective gear)
2. EXFOLIATION — Remove tanned dead skin cells
3. BRIGHTENING — Reduce melanin production + fade existing pigmentation
All 3 must happen simultaneously. SPF alone won't reverse tan. Brightening without SPF = wasted effort."

**Daily Tan Prevention Checklist:**
- ☐ Face SPF applied (linked to skincare AM)
- ☐ Body SPF on neck + arms + hands (before commute)
- ☐ Helmet with visor worn for commute
- ☐ Sunglasses worn
- ☐ Long sleeves worn (if weather allows)

**Weekly Tan Removal Schedule:**
- Wednesday 9:30 PM: Body scrub session in shower ☐
- Saturday 9:30 PM: Body scrub session in shower ☐
- Sunday 10:45 AM: Ubtan body pack + face brightening mask ☐

**Daily Body Care (Night):**
- ☐ Apply brightening body lotion (Derma Co 5% Niacinamide Body Lotion) on tanned areas (neck, arms, hands, feet)
- ☐ Apply Aloe Vera Gel on face and body (cooling + brightening)

**Body Scrub Protocol (Wed + Sat nights):**
1. In shower: Apply coffee/sugar body scrub to tanned areas
2. Massage in circular motions 2 min per area
3. Rinse off
4. Pat dry
5. Immediately apply brightening body lotion

**Sunday Deep Treatment — Face + Body (10:45 AM slot):**

Face Brightening Mask:
- 1 tbsp raw honey + ½ tsp turmeric + 1 tbsp yogurt + few drops lemon juice
- Apply 15 min, rinse off
- Follow with moisturizer

Ubtan Body Pack (for arms, legs, neck):
- 2 tbsp besan (gram flour) + 1 tbsp curd/yogurt + ½ tsp turmeric + 1 tsp honey + few drops rose water/milk
- Mix into paste
- Apply on all tanned areas
- Let dry 15-20 min (read/plan during this time)
- Rinse off while gently rubbing (adds exfoliation)
- Moisturize heavily after

**DIY Recipe Library (expandable cards):**
1. **Ubtan Pack** — besan + yogurt + turmeric + honey (weekly body de-tan)
2. **Honey Turmeric Mask** — honey + turmeric + yogurt + lemon (weekly face brightener)
3. **Tomato Lemon Pack** — ½ tomato pulp + ½ tsp lemon + turmeric (3x/week face, PM only)
4. **Aloe Vera** — daily application on face + body (cooling, hydrating, mild brightening)
5. **Cucumber Rosewater Toner** — cucumber juice + rose water (2x/day with cotton pad)
6. **Milk Honey Wash** — raw cold milk + 1 tsp honey, massage 5 min, rinse (weekly)
Each recipe: ingredients, steps, timer, frequency, warnings.

**Product Inventory for Tan Removal:**
| Product | Cost | Purchased? |
|---------|------|-----------|
| Vitamin C Serum 10% | ₹400 | ☐ |
| Alpha Arbutin 2% | ₹400 | ☐ |
| Body Scrub (Mcaffeine Coffee) | ₹400 | ☐ |
| SPF Body Lotion (Nivea Sun SPF 50) | ₹400 | ☐ |
| Brightening Body Lotion (Derma Co Niacinamide) | ₹600 | ☐ |
| Aloe Vera Gel (Patanjali) | ₹150 | ☐ |
| Full-face Helmet with Visor (Steelbird) | ₹1,500 | ☐ |
| Polarized Sunglasses | ₹700 | ☐ |

**Tan Removal Warnings:**
- ❌ No bleach or fairness creams (Fair & Lovely etc.) — dangerous long-term
- ❌ No lemon on skin during daytime — causes sun sensitivity
- ❌ Max 2-3x body scrub per week — over-exfoliation worsens pigmentation
- ❌ No parlour bleaching — use actives at home instead
- ❌ Don't chase "instant fairness" — goal is restoring YOUR natural tone

**Expected Timeline:**
- Week 1-2: Smoother skin, mild brightening
- Week 3-4: 30-40% tan faded (face + body)
- Week 5-6: Face mostly restored, body 50-60% faded
- Week 8-10: Complete tan removal, even tone
- Ongoing: Maintain with SPF to prevent re-tanning

**Notification Additions:**
- Every AM: "Apply SPF on body before commute"
- Wednesday 9 PM: "Body scrub tonight"
- Saturday 9 PM: "Body scrub tonight"
- Sunday 10:30 AM: "Prep ubtan + face mask for deep skincare session"

---

### Sub-tab: HAIR CARE

**⚠️ URGENT INFO CARD (red border):**
"Dad bald at 48 + your current thinning + fine hair = HIGH RISK for androgenetic alopecia. Start preservation NOW. Every year you delay, follicles die permanently."

**Hair Wash Schedule (3x/week):**
| Wash Day | Shampoo | Instructions |
|----------|---------|--------------|
| Monday | Nizoral 2% Ketoconazole | Leave on scalp 5 min before rinsing |
| Wednesday | Nizoral 2% Ketoconazole | Leave on scalp 5 min before rinsing |
| Friday | L'Oreal Anti-Dandruff (current) | Normal wash |

**Oil Massage (2x/week, night before wash):**
- Sunday night (before Monday wash)
- Tuesday night (before Wednesday wash)
- Recipe: Warm coconut oil + 3-4 drops rosemary essential oil
- Massage scalp 5 min with FINGERTIPS (not nails)
- Sleep with it, wash morning
- Rosemary oil is proven as effective as minoxidil in peer-reviewed studies

**Hair Rules:**
- ❌ No hot water — lukewarm only
- ❌ No aggressive towel drying — pat dry gently
- ❌ No tight hairstyles
- ✅ Eat daily: eggs, nuts, fish/omega-3, spinach, dates (iron)
- ✅ 8 hours sleep (crucial for hair cycle)
- ✅ Reduce stress and porn (stress → cortisol → hair fall)

**MINOXIDIL 5% PROTOCOL:**

Info: "Scientifically proven for hair regrowth. Given your risk profile, start within 30 days."
"⚠️ COMMITMENT: Once started, must continue for life. Stopping = losing all gained hair within 3-6 months."
"Product: Mintop Forte 5% or Tugain 5% — ~₹400/month"

Application: 1ml morning + 1ml night
Apply to scalp, focus on thinning areas + hairline
Wait 4 hours between application and washing

**Minoxidil Daily Tracker:**
- AM application ☐
- PM application ☐
- Streak counter
- Total days on Minoxidil

**Minoxidil Phase Indicators:**
- Weeks 1-3: Initial adjustment
- Weeks 4-12: DREAD SHED phase (WARNING BANNER: "Extra shedding is NORMAL. Follicles resetting. DO NOT STOP.")
- Weeks 13-24: New growth phase
- Month 6+: Visible density improvement

**Future Options (info cards, not started yet):**
- Topical Finasteride 0.25% — blocks DHT locally, safer than oral. Evaluate Month 3-6. ~₹800/month.
- Oral Finasteride 1mg — most effective, ~2% risk of libido effects. Evaluate Month 6-12 if thinning progresses. Consult dermatologist.

**Hair Metrics:**
- Dandruff Severity (weekly): None / Mild / Moderate / Severe — graph over time
- Hair Fall (weekly): <20 (normal) / 20-50 (mild) / 50-100 (moderate) / 100+ (see derm) — graph
- Thinning Areas: Head diagram (top view), mark areas. Monthly update.
- Photos: Top of head + hairline, monthly. Side-by-side comparison.

**Product Inventory:** Current products with purchase/expiry dates. Reorder reminders.

---

### Sub-tab: GROOMING

**PERSONALIZED HAIRSTYLE (info card with reference images):**

Face Shape: Oblong/Rectangular with soft angles

Recommended: **TEXTURED CROP WITH LOW-MID FADE**

Ask barber for:
- Sides: Low-mid fade (skin fade at bottom, blending up)
- Top: 1.5-2 inches, textured (choppy layers)
- Front: Slight fringe, textured, swept slightly to one side or forward and messy
- NO slicked-back, NO wet look

Styling:
- Use matte hair paste/clay (Beardo Matte Wax or Set Wet Matte Clay — ₹250)
- NEVER use gel
- Aim for casually messy with slight volume on top

Celebrity references: Timothée Chalamet short textured, Younger Ranveer Singh, Vijay Deverakonda casual

AVOID: Slicked back, center part, buzz cut, long hair

**FACIAL HAIR DECISION:**

Current: Patchy cheeks + strong mustache + chin patch + jawline growth

RECOMMENDATION (next 6 months): **CLEAN SHAVE**
- Shows your good jaw structure
- Cleaner, fresher appearance
- Beard will develop more evenly by 25-30
- Shave every 2-3 days with quality razor

Alternatives:
- Stubble (5-7mm): Weekly trim, clean neck + cheek lines
- Full Beard: 4-6 months untouched growth + minoxidil on cheeks

Beard Decision Log: Track current choice. Weekly photo if growing.

**Daily Grooming Checklist:**
- ☐ Face wash AM + PM (linked to skincare)
- ☐ Moisturize face
- ☐ Sunscreen applied
- ☐ Brush teeth 2x (morning + night)
- ☐ Floss teeth (night)
- ☐ Lip balm applied
- ☐ Nose/ear hair check (trim if needed)
- ☐ Nails clean (no dirt)
- ☐ Deodorant applied
- ☐ Mewing practiced (tongue on roof of mouth, lips closed, teeth lightly together)

**Weekly Grooming:**
- ☐ Eyebrow cleanup (unibrow area + stray hairs only — do NOT thin or arch)
- ☐ Body hair trim (if needed)
- ☐ Clip and file nails
- ☐ Deep clean ears

**Monthly:**
- ☐ Haircut / trim (every 3-4 weeks)
- ☐ Eyebrow cleanup at salon (optional)

**Eyebrow Guide:** "Your brows are excellent. Minimal work. Clean middle unibrow area. Trim stray hairs. Do NOT thin them. Thick masculine brows = strength."

**Jawline Optimization:**
- Mewing (24/7 habit, tongue posture). Real but slow: 12-24 months.
- Chew hard foods daily (nuts, apples, mastic gum)
- Weight gain → natural jaw definition
- IGNORE: jaw exercisers, chisel tools (gimmicks)

**Teeth:** Whitening toothpaste (Colgate Optic White). Floss nightly. Professional cleaning consultation later.

**Dark Circles:** 8 hours sleep = 70%. Cold spoon compress AM. Caffeine eye cream AM+PM. No screens 1hr before bed.

**Lips:** Lip balm AM + PM + before bed. Drink more water.

---

### Sub-tab: BODY CARE

**Full Body Moisturizing:** Apply lotion/coconut oil after EVERY shower. Focus: elbows, knees, knuckles, ankles.

**Sun Exposure Tracker:**
Target: 15 min direct sunlight daily (before 10 AM)
Benefits: Vitamin D, mood, circadian rhythm
ALWAYS apply face sunscreen before going outside
Daily: "Sun exposure done?" ☐

**Body Hair Grooming:**
- Chest: Trim, don't shave
- Back: Wax/trim if excessive
- Groin: Trim
- Recommended: Philips BG3005 body trimmer (₹1,200)

**Nails:** Weekly clipping + filing. Never bitten. Clean daily.

**Fragrance (High Impact):**
Budget: Bella Vita Man, Beardo Whisky Smoke — ₹500-1,500
Premium: Dior Sauvage EDP — ₹9,000

---

### Sub-tab: STYLE & WARDROBE

**Rules for 5'6" Frame:**

**DO ✅:** Monochromatic outfits, Vertical stripes (mild), Fitted not oversized, High-waisted pants, V-necks, Tucked shirts, Clean minimal sneakers, Slim-cut jeans/chinos, Shorter jackets (bomber/cropped), Chelsea boots (1-inch heel)

**DON'T ❌:** Oversized tees/baggy pants, Long overcoats, High-top chunky sneakers, Horizontal stripes, Bulky watches, Cargo pants with knee pockets

**Colors:** Black, white, navy, olive, beige, grey. Max 1 accent color.

**Wardrobe Essentials (Checklist with purchase tracking):**
- ☐ 3 fitted tees (white, black, navy) — ₹1,500
- ☐ 2 button-down shirts (white, light blue) — ₹1,500
- ☐ 1 bomber jacket — ₹2,000
- ☐ 2 slim-fit jeans (dark blue, black) — ₹2,500
- ☐ 2 chinos (beige, olive) — ₹2,000
- ☐ 1 white sneakers — ₹2,500
- ☐ 1 Chelsea boots — ₹2,500
- ☐ 1 watch (Casio Oak/Titan) — ₹2,500
- ☐ 2 belts (brown, black) — ₹1,500
- ☐ Sunglasses — ₹1,500
Total: ~₹20,000 (Phase 3)

**Outfit Combinations Gallery (pre-loaded):**
1. White tee + dark jeans + white sneakers + bomber
2. Navy tee + olive chinos + Chelsea boots
3. Light blue shirt (tucked) + beige chinos + white sneakers
4. Full black + Chelsea boots (monochromatic power)

**Height Perception:** Height insoles (Ceremony 3-Layer, ₹1,500) — invisible 3-5cm gain. Chelsea boots + insoles = perceived 5'8"+.

---

### Sub-tab: LOOKSMAX

**HIGH IMPACT (Safe, High ROI) — Do First:**
1. Body composition (weight gain + muscle) — "#1 lever"
2. Skincare consistency — "6-month payoff"
3. Sleep — "Free, most impactful"
4. Grooming (hair, brows, beard decision) — "Instant gains"
5. Style + wardrobe — "Instant gains"
6. Teeth whitening — "Cheap, effective"
7. Subtle tanning (15 min sun daily) — "Vitamin D + skin evens"
8. Tan removal protocol — "8-10 weeks for full restoration"

**MODERATE IMPACT (Safe):**
1. Mewing — "12-24 months, commit to 24/7"
2. Chewing gum/hard foods — "Mild jaw development"
3. Body language — "Walk slow, space, eye contact, deep voice"
4. Fragrance — "Dramatic perception boost"

**CAUTIOUS (Research First):**
1. Minoxidil for beard — "Works but commitment"
2. Adapalene/Tretinoin — "Best skin transformer"

**AVOID ❌:**
1. Steroids — ruins T, hair, health
2. HGH — useless post-22
3. Fillers/Botox — you're 22
4. Bone smashing — pseudoscience
5. Height surgery — extreme, dangerous

Each item: expandable card with scientific basis, risk level (green/yellow/red), cost, timeline, current recommendation.

---

### Sub-tab: FACE LOG

**Face Analysis Summary:**
- Shape: Oblong/Rectangular
- Strong features: Eyebrows (thick, masculine), Nose (sharp, well-proportioned), Lips (full, symmetrical), Eye shape, Bone structure
- Improve: Face fullness (needs weight), Acne marks (fading with Adapalene), Jaw definition (comes with muscle), Dark circles (sleep fixes 70%), Tan (protocol active)

**Monthly Face Photo Protocol:**
Front neutral, Left profile, Right profile, Upward angle (jaw visible).
Same lighting (natural daylight). Gallery with date stamps. Slider comparison.

**Monthly Face Metrics (1-10 subjective):**
Skin clarity, Skin evenness, Jaw definition, Cheek fullness, Undereye area, Overall confidence in appearance.
Line graphs over 12 months.

**Weight-Face Correlation:**
"As you gain weight (45→62kg), face will fill out. This alone will:
• Remove sunken cheek appearance
• Reduce 'sick/tired' look
• Fill temple hollows
• Improve overall facial harmony
The biggest facial change comes from weight gain + clear skin, not products."

---

## TAB 5: 🧠 DISCIPLINE

### Top Tab Navigation:
```
Habits | Dopamine | Journal | Milestones | Body Language | Knowledge | Commitment
```

---

### Sub-tab: HABITS

**GitHub-style contribution grid** showing daily habit completion over past 90 days.
Color intensity = completion percentage that day.

**Core Daily Habits (32 total):**
| Habit | Category |
|-------|----------|
| Wake by 7:30 AM (weekday) / 8 AM (weekend) | Sleep |
| No phone 30 min after waking | Dopamine |
| Morning water (500ml + lemon) | Nutrition |
| Posture routine — Morning | Training |
| Priority movements done | Training |
| Skincare AM completed | Appearance |
| Minoxidil AM applied | Appearance |
| Breakfast with protein | Nutrition |
| B12 + Omega-3 taken (AM) | Nutrition |
| Mid-morning snack | Nutrition |
| Lunch with protein tiffin | Nutrition |
| Zinc taken after lunch | Nutrition |
| Post-lunch walk (10 min) | Training |
| Pre-commute snack | Nutrition |
| Body SPF before commute | Appearance |
| Helmet visor worn | Appearance |
| Training session completed | Training |
| Whey + Creatine post-workout | Nutrition |
| Evening snack (healthy) | Nutrition |
| Dinner completed | Nutrition |
| Omega-3 taken (PM) | Nutrition |
| Skincare PM completed | Appearance |
| Adapalene/Active applied (scheduled night) | Appearance |
| Minoxidil PM applied | Appearance |
| Journal written (5 min) | Discipline |
| Reading (15+ min) | Discipline |
| Magnesium before bed | Nutrition |
| Turmeric milk | Nutrition |
| Phone out of bedroom | Sleep |
| Sleep by 11:30 PM | Sleep |
| Water target hit (3.5L) | Nutrition |
| No junk food (weekday) | Nutrition |
| No porn today | Dopamine |
| Posture routine — Evening | Training |
| Sun exposure (15 min) | Appearance |
| Mewing practiced | Appearance |

Each habit shows: Current streak, Longest streak (all-time), Completion rate (%), Calendar heatmap.

**Habit Stacking Card:**
- After wake up → drink water + posture routine
- After brush teeth → skincare AM + Minoxidil AM
- After breakfast → B12 + Omega-3
- After lunch → Zinc
- After work arrives home → train immediately (DON'T sit!)
- After training → shower + Whey + Creatine
- After dinner → Omega-3
- After dinner → skincare PM + Minoxidil PM
- After skincare → journal 5 min
- After journal → phone to other room
- Before bed → Magnesium + turmeric milk

**Weekly Discipline Score:**
(Total completed / total possible) × 100
Graph over time. Achievements at 50%, 70%, 85%, 95%.

---

### Sub-tab: DOPAMINE RESET

**Week 1: AWARENESS**
Track opens: Instagram counter, YouTube counter, Porn counter, Reels counter.
Daily totals. "This alone will shock you."

**Week 2: REDUCTION**
- ☐ Delete Instagram + reel apps (browser only)
- ☐ Porn: Every 3 days max
- ☐ Limits: Instagram 20 min/day, YouTube 45 min/day
- Screen time logger. Porn tracker (days since, weekly count).

**Week 3: REPLACEMENT**
When urge hits, do one:
- ☐ 20 push-ups | ☐ Cold shower 30s | ☐ Journal 3 lines | ☐ Walk 5 min
- "Urge resisted" button (motivational animation). Porn: 2x/week max.

**Week 4: STABILIZATION**
- Porn: 1x/week max
- Zero scrolling before 10 AM and after 9:30 PM

**Long-term:** Masturbation 1-2x/week (visualization only). Porn: 0 by Month 3. Screen time <4 hours non-work.

**Porn/Fap Tracker:**
Calendar: Green (clean), Red (porn), Yellow (masturbation no porn).
Current streak, longest streak, monthly count.
"Relapse" button → mandatory journal: "Trigger? Emotion? Time? What will you change?"

**Screen Time Logger:**
Daily: Phone hours + Laptop hours (non-work). Target <4h combined.
Weekly average chart. Trend line.

**Dopamine Rules Card:**
- No phone 30 min after waking
- No scrolling before 10 AM or after 9:30 PM
- Phone out of bedroom at night
- No eating while watching screens
- One thing at a time

---

### Sub-tab: JOURNAL

**Nightly Template (5 min, 10:00 PM):**
1. **3 Wins Today:** (3 text fields)
2. **1 Thing to Improve Tomorrow:** (1 field)
3. **Energy Level:** Slider 1-10
4. **Mood:** Slider 1-10
5. **Confidence Level:** Slider 1-10
6. **Did I follow the plan?** Yes / Mostly / Partially / No
7. **Free Notes:** Open text

Past entries browsable by date. Searchable.

**Weekly Reflection (Sunday):**
1. Biggest win this week?
2. What failed and why?
3. What will I change next week?
4. Rate this week (1-10)
5. One thing I'm grateful for

**Mood/Energy/Confidence Trends:**
Line charts over time. Correlation insights with sleep, workouts, porn use.

---

### Sub-tab: MILESTONES

**🎯 30-DAY TARGETS (Phase 1):**
- ☐ Weight: 47-48 kg
- ☐ Sleep by 11:30 PM consistently (7+ days)
- ☐ Zero coke consumed
- ☐ Minimal weekday junk (0-1 in past 7 days)
- ☐ Skincare AM + PM daily (30 days straight)
- ☐ Adapalene routine started
- ☐ Minoxidil started (daily AM + PM)
- ☐ Working out 4x/week (4 consecutive weeks)
- ☐ Priority movements 5x/week
- ☐ Porn reduced to 1-2x/week
- ☐ Phone out of bedroom (30 days straight)
- ☐ Dandruff visibly reduced
- ☐ Elbows/knees visibly lighter
- ☐ 3.5L water daily (20+ days)
- ☐ All supplements daily (25+ days)
- ☐ New haircut (Textured Crop with Fade)
- ☐ Clean shave executed

**🎯 90-DAY TARGETS (Phase 2):**
- ☐ Weight: 50-52 kg
- ☐ Visible arm, chest, back development (photo compare)
- ☐ 5 clean pull-ups
- ☐ 25 push-ups in one set
- ☐ 40 bodyweight squats in one set
- ☐ Lateral raises with 10kg+
- ☐ Skin: acne 70% cleared, marks fading
- ☐ Tan: 80%+ removed
- ☐ Hair: dandruff gone, fall reduced, Minoxidil consistent
- ☐ Posture visibly improved (Day 1 vs Day 90 photo)
- ☐ Morning routine established (60+ consecutive days)
- ☐ Porn: 1x/week or less
- ☐ 2+ books read
- ☐ Blood test completed at Month 3

**🎯 1-YEAR TARGETS (Phase 3):**
- ☐ Weight: 58-65 kg lean
- ☐ Body fat: 12-15%
- ☐ 10+ pull-ups
- ☐ 50+ push-ups
- ☐ Weighted exercise variations
- ☐ Skin: even tone, glowing, no active issues
- ☐ Tan: Completely removed, natural tone restored
- ☐ Hair: Preserved, thickened
- ☐ Perfect posture, 1+ inch visual height
- ☐ Complete wardrobe overhaul
- ☐ Grooming fully dialed
- ☐ Zero porn (30+ days clean)
- ☐ Discipline automatic
- ☐ Confident presence
- ☐ 1-2 new real friendships
- ☐ Career improving
- ☐ Blood tests at Month 6 + 12

Each: Checkbox, completion date, badge animation, cannot uncheck.

**Achievement Badges:**
🔥 7-Day Warrior | 💪 First Pull-up | 🧴 Skin Streak 30 | 💧 Hydration King (30 days 3.5L) | 🚫 Dopamine Detox (30 days porn-free) | 📚 First Book | ⚖️ 50 Club (50 kg) | 🏋️ Phase 2 Unlocked | 👑 Phase 3 Unlocked | 🎯 Consistency King (100 day streak) | 🦁 One Year Legend (365 days) | 🌟 Transformed (all Phase 3 milestones)

---

### Sub-tab: BODY LANGUAGE

**Daily Practice Checklist:**
- ☐ Walk slowly, deliberately (not anxious/fast)
- ☐ Take up space (don't shrink shoulders)
- ☐ Chest slightly out, shoulders back and down
- ☐ Eye contact: 2 seconds longer than comfortable
- ☐ Low, slow voice (from diaphragm)
- ☐ Zero nervous tics (no leg bouncing, fiddling)
- ☐ Neutral resting face (calm, composed)
- ☐ Mirror practice done (2 min)

**Weekly Presence Challenges (rotating):**
Week 1: Hold eye contact 1 sec longer in every conversation
Week 2: Speak 20% slower for one full day
Week 3: Enter room without checking phone for 5 minutes
Week 4: Start conversation with a stranger
(Continues with increasing difficulty, cycles)

---

### Sub-tab: KNOWLEDGE BASE

10 articles (500-800 words each):
1. Sleep Science | 2. Nutrition Science | 3. Training Science | 4. Skincare Science (including Adapalene mechanism) | 5. Hair Science (DHT, AGA, Minoxidil) | 6. Posture Science | 7. Dopamine Science (porn neuroscience) | 8. Hormone Optimization | 9. Height Perception | 10. Looksmax Science

**Reading List:**
- ☐ Atomic Habits (James Clear)
- ☐ Deep Work (Cal Newport)
- ☐ Can't Hurt Me (David Goggins)
- ☐ The Compound Effect (Darren Hardy)
- ☐ No More Mr. Nice Guy (Robert Glover)
Status: Not Started / Reading / Completed + Notes field

---

### Sub-tab: COMMITMENT LETTER

**Day 1 Prompt:**
"Write a letter to yourself. Why are you doing this? What happens if you quit? What does the man you want to become look like? Be raw. Be honest."

Locked after writing (editable monthly). Displayed when:
- Habit streak about to break
- Relapse button tapped
- Monthly review screen
- Emergency coach activated

Optional: Video recording of yourself.

---

## TAB 6: 🤖 AI COACH (Gemini Integration)

### API Setup:
- Use Google Generative AI SDK
- Model: gemini-2.0-flash-exp or gemini-1.5-flash (fast, free tier friendly)
- Optional toggle: gemini-1.5-pro (deeper analysis)
- User enters their own API key in Settings (encrypted local storage)
- Get free key from: https://aistudio.google.com/apikey
- Internet only needed for AI features. All other app functions work offline.

### Setup Flow (First time AI tab opened):
1. Welcome: "Meet FORGE AI — your personal coach"
2. "Get a FREE Gemini API key (30 seconds)" → opens browser
3. Instructions: Sign in → Create API Key → Copy
4. Paste key in input field
5. "Test Connection" → confirms working
6. "AI Coach activated!"

If no key: Tab shows locked state with setup prompt. All other features work.

### Main Chat Interface:
- Modern chat UI (user right emerald, AI left dark grey)
- AI messages labeled "FORGE AI" with shield icon
- Timestamps on messages
- "Typing..." animation during generation
- Text input + send button
- Voice-to-text button
- Photo attachment (for progress photo analysis via Gemini Vision)
- Chat history saved locally, searchable

### System Prompt (sent with EVERY query):

```
You are FORGE AI Coach — the personal transformation coach for a specific user.
You have expertise in fitness, dermatology, trichology, nutrition, discipline coaching, and lifestyle optimization.

USER PROFILE:
- 22M, 5'6", Bangalore, India
- Starting: 45 kg (severe ectomorph, underweight, BMI 16.0)
- Current Weight: [DYNAMIC from latest daily log]
- Target: 62-65 kg in 12 months
- Day: [DYNAMIC] of 365
- Phase: [DYNAMIC]
- Face: Oblong, right cheek acne/PIH, recent Varkala tan, dark circles
- Hair: Fine, thinning, dandruff, dad bald at 48, on Minoxidil
- Posture: Forward head (moderate), rounded shoulders (mild-moderate)
- Equipment: Pull-up bar, book-bags, resistance band (home only)
- Skincare: Adapalene nights, Vitamin C + Niacinamide AM, SPF 50
- Supplements: Whey, Creatine, Omega-3, Magnesium Glycinate, B12, D3, Zinc
- Habits: Reducing porn (was daily), fixing sleep (was 2 AM, targeting 11:30 PM)

CURRENT DATA:
- Last 7 days avg calories: [DYNAMIC]
- Last 7 days avg sleep: [DYNAMIC]
- Workouts this week: [DYNAMIC]
- Skincare streak: [DYNAMIC]
- Porn-free streak: [DYNAMIC]
- Weight trend: [DYNAMIC]
- Discipline score: [DYNAMIC]
- Current screen: [DYNAMIC]
- Time of day: [DYNAMIC]

COACHING STYLE:
- Direct, brutally honest, never cruel
- Reference SPECIFIC data in every response
- Scientific reasoning over generic motivation
- Call out excuses
- Keep under 200 words unless deep analysis requested
- Indian context (foods, brands, culture)
- End with clear action item
- If user wants to skip/quit/relapse: maximum urgency + tactical pushback
- Never say "I don't have access" — you DO
- Only recommend products from existing plan or budget Indian alternatives
```

### Contextual Quick Prompts (change based on current tab):

**From Nutrition:** "What can I substitute?", "Am I hitting protein?", "High-calorie snack ideas", "How to increase appetite?"

**From Training:** "Can't do pull-ups, help", "Should I train if slept 5 hours?", "Am I progressing enough?"

**From Skincare:** "Skin peeling from Adapalene, normal?", "New pimple, what to do?", "How long until results?"

**From Hair:** "Shedding more after Minoxidil, worried", "Can I skip Minoxidil one day?"

**From Discipline:** "Want to relapse, help NOW", "How to stop procrastinating?", "Broke streak, how to recover?"

**From Dashboard:** "How am I doing overall?", "What to focus on today?", "Analyze my last week"

### AI Features:

1. **Chat Screen** — persistent history, search, export
2. **Daily Check-in (9 PM auto-prompt)** — AI asks "How was today? Rate 1-10" → analyzes response + data → personalized feedback
3. **Weekly Coaching (Sunday 6 PM)** — AI auto-analyzes week → wins, failures, trends, next week recommendations
4. **"Analyze Progress" Button (Dashboard)** — comprehensive multi-metric report
5. **Emergency Coach (Urge Button integration)** — crisis-mode with streak data, de-escalation, coping strategy
6. **"Explain This" (?) icons throughout app** — tap → AI explains that concept in user's context
7. **Meal Suggestion** — "What should I eat now?" based on time, remaining macros, kitchen availability
8. **Workout Modification** — alternatives if equipment unavailable, reduce if sick, increase if strong
9. **Photo Analysis (Gemini Vision)** — analyze progress photos, compare weeks, identify changes
10. **Voice Input** — native STT for hands-free queries

### Offline Fallback:
- "AI Coach unavailable — no internet"
- Show cached conversations
- Suggest: "Check Knowledge Base for FAQ"
- All other features work normally

### Usage Tracking (Settings):
Requests today, monthly, estimated tokens, free tier reminder.

---

## ADDITIONAL APP-WIDE FEATURES

### 1. NOTIFICATION SYSTEM

**Scheduled Daily:**
- 7:30 AM: "Day X. Wake up. No phone 30 min."
- 7:40 AM: "Posture + priority movements"
- 7:50 AM: "Skincare AM + Minoxidil AM"
- 8:15 AM: "Breakfast + B12 + Omega-3"
- 8:40 AM: "Apply body SPF. Helmet visor on."
- 10:45 AM: "Mid-morning snack"
- 12:00 PM: "Lunch soon. Protein tiffin!"
- 1:00 PM: "Zinc AFTER lunch. Post-lunch walk."
- 3:45 PM: "Pre-commute snack"
- 5:30 PM: "Home. Change. START TRAINING. Don't sit!"
- 6:30 PM: "Whey + Creatine"
- 8:45 PM: "Skincare PM + Minoxidil PM"
- 9:45 PM: "Journal time"
- 10:00 PM: "Phone → other room NOW"
- 10:45 PM: "Magnesium + turmeric milk. Lights out soon."

**Recurring:**
- Every 2h (9 AM-9 PM): "Posture check!"
- Every 2h: "Hands off face!"
- Every 3 days: "Change pillowcase"
- Every 3 days: "Change face towel"
- Saturday 11:30 AM: "Meal prep day!"
- Sunday 10:30 AM: "Deep skincare + ubtan"
- Sunday 6 PM: "Weekly review + photos"
- Wednesday + Saturday 9 PM: "Body scrub tonight"
- Monthly: "Progress photo comparison"

All individually toggleable in Settings.

### 2. EMERGENCY URGE BUTTON

Floating red button, accessible from ANY screen.
Tap → shows options:
- 20 push-ups RIGHT NOW
- 30-second cold shower
- Write 3 lines in journal
- 5-minute walk
- Call your girlfriend
- Read commitment letter
- **Talk to FORGE AI** (opens AI with crisis context)

After completing: "You beat it. Streak preserved. 💪"
Logs: urge time, trigger, coping mechanism used.

### 3. WEEKLY REVIEW (Sunday auto-popup)

1. Take progress photos (front, side, back, flexed)
2. Take measurements (all body parts)
3. Log weight
4. Fill weekly reflection journal
5. Rate week 1-10
6. Check milestones
7. Plan next week

### 4. PURCHASE TRACKER

**Immediate Purchases:**
| Item | Cost | Purchased? |
|------|------|-----------|
| Adapalene 0.1% Gel | ₹200 | ☐ |
| Cetaphil Cleanser | ₹350 | ☐ |
| Minimalist Sepicalm Moisturizer | ₹500 | ☐ |
| Vitamin C Serum 10% | ₹400 | ☐ |
| Alpha Arbutin 2% | ₹400 | ☐ |
| Minoxidil 5% (Mintop Forte) | ₹500 | ☐ |
| Rosemary Essential Oil | ₹250 | ☐ |
| Whey Protein (2 lbs) | ₹2,000 | ☐ |
| Creatine Monohydrate (250g) | ₹700 | ☐ |
| Omega-3 Fish Oil | ₹600 | ☐ |
| Magnesium Glycinate | ₹500 | ☐ |
| Vitamin B12 | ₹300 | ☐ |
| Vitamin D3 60K Sachets | ₹200 | ☐ |
| Zinc Picolinate | ₹300 | ☐ |
| Body Scrub (Mcaffeine) | ₹400 | ☐ |
| SPF Body Lotion | ₹400 | ☐ |
| Brightening Body Lotion | ₹600 | ☐ |
| Aloe Vera Gel | ₹150 | ☐ |
| Full-face Helmet (Steelbird) | ₹1,500 | ☐ |
| Polarized Sunglasses | ₹700 | ☐ |
| Analog Alarm Clock | ₹300 | ☐ |
| Steel Tiffin Box | ₹300 | ☐ |
| Resistance Band | ₹300 | ☐ |
| Lip Balm | ₹100 | ☐ |
| Matte Hair Paste | ₹250 | ☐ |
| Caffeine Undereye Solution | ₹700 | ☐ |
| **TOTAL** | **~₹12,400** | |

**Month 2 Additions:** Azelaic Acid 10% (₹450)
**Month 3 Additions:** Wardrobe pieces (₹5,000-7,000)

Total Spent Counter (auto-calculated). Monthly graph.

### 5. ONBOARDING FLOW

Screen 1: "FORGE" logo + "Your Transformation Starts Now" + continue button
Screen 2: Profile entry — Name, Age (22), Height (5'6"), Weight (45), Start Date
Screen 3: Take starting photos (front, side, back, flexed) → Day 1 gallery
Screen 4: Starting measurements (chest, arms, waist, thigh, neck, shoulders)
Screen 5: Target weight (default 62 kg)
Screen 6: Quick tour of 6 tabs (swipeable cards explaining each)
Screen 7: Write Commitment Letter (mandatory, text field, "Save & Lock" button)
Screen 8: "Day 1. Let's forge." → Navigate to Dashboard with entrance animation

### 6. SETTINGS SCREEN

- **Profile:** Name, age, height, start weight, current weight, start date, target weight (all editable)
- **Notifications:** Master toggle + individual toggle for each notification
- **Theme:** Dark (default) / Light toggle
- **AI Coach:** API key input, model selection, usage stats
- **Data:** Export all data (CSV/PDF), Local backup, Restore backup
- **Measurements:** Set measurement units (kg/lbs, cm/inches)
- **Reset:** Nuclear option — reset all data (double confirmation required)
- **About:** App version, credits, "Built for becoming who you were meant to be"

---

## DATA MODELS

### UserProfile
```json
{
  "name": "string",
  "age": 22,
  "height": "167cm",
  "startWeight": 45.0,
  "currentWeight": "number",
  "targetWeight": 62.0,
  "startDate": "date",
  "currentPhase": "1|2|3 (calculated)",
  "currentDay": "number (calculated)"
}
```

### DailyLog
```json
{
  "date": "date",
  "weight": "number",
  "sleepTime": "time",
  "wakeTime": "time",
  "sleepHours": "number",
  "sleepQuality": "1-10",
  "waterGlasses": "number",
  "screenTimePhone": "hours",
  "screenTimeLaptop": "hours",
  "workoutCompleted": "boolean",
  "workoutType": "string",
  "priorityMovementsDone": "boolean",
  "skincareAM": "boolean",
  "skincarePM": "boolean",
  "adapaleneUsed": "boolean",
  "minoxidilAM": "boolean",
  "minoxidilPM": "boolean",
  "bodyScpfApplied": "boolean",
  "bodyBrighteningApplied": "boolean",
  "postureAM": "boolean",
  "posturePM": "boolean",
  "pornUsed": "boolean",
  "masturbated": "boolean",
  "junkFoodEaten": "boolean",
  "sunExposure": "boolean",
  "mewingPracticed": "boolean",
  "pillowcaseChanged": "boolean",
  "towelChanged": "boolean",
  "hairOilApplied": "boolean",
  "supplements": {
    "whey": "boolean",
    "creatine": "boolean",
    "omega3AM": "boolean",
    "omega3PM": "boolean",
    "magnesium": "boolean",
    "b12": "boolean",
    "d3": "boolean",
    "zinc": "boolean"
  },
  "meals": {
    "morningDrink": "boolean",
    "breakfast": "boolean",
    "midMorningSnack": "boolean",
    "lunch": "boolean",
    "preCommuteSnack": "boolean",
    "eveningSnack": "boolean",
    "dinner": "boolean",
    "preBedMilk": "boolean",
    "proteinShake": "boolean"
  },
  "journal": {
    "wins": ["string", "string", "string"],
    "improve": "string",
    "energy": "1-10",
    "mood": "1-10",
    "confidence": "1-10",
    "followedPlan": "Yes|Mostly|Partially|No",
    "notes": "string"
  },
  "scheduleItems": [{"time": "string", "task": "string", "completed": "boolean"}]
}
```

### WorkoutLog
```json
{
  "date": "date",
  "phase": "1|2|3",
  "dayType": "string",
  "warmupDone": "boolean",
  "exercises": [{
    "name": "string",
    "sets": [{"targetReps": "number", "actualReps": "number", "weight": "number", "completed": "boolean"}],
    "restSeconds": "number",
    "notes": "string"
  }],
  "totalDuration": "minutes",
  "totalVolume": "number",
  "rating": "1-10"
}
```

### WeeklyReview
```json
{
  "weekNumber": "number",
  "date": "date",
  "photos": {"front": "uri", "side": "uri", "back": "uri", "flexed": "uri"},
  "measurements": {
    "chest": "cm", "leftArm": "cm", "rightArm": "cm",
    "waist": "cm", "leftThigh": "cm", "rightThigh": "cm",
    "neck": "cm", "shoulders": "cm",
    "leftForearm": "cm", "rightForearm": "cm",
    "leftCalf": "cm", "rightCalf": "cm"
  },
  "biggestWin": "string",
  "whatFailed": "string",
  "changeNextWeek": "string",
  "weekRating": "1-10",
  "gratitude": "string",
  "disciplineScore": "number (auto)"
}
```

### HabitStreak
```json
{
  "habitName": "string",
  "currentStreak": "number",
  "longestStreak": "number",
  "totalCompletions": "number",
  "totalDays": "number",
  "completionRate": "percentage",
  "history": [{"date": "date", "completed": "boolean"}]
}
```

### TanAssessment
```json
{
  "date": "date",
  "face": "1-10",
  "neck": "1-10",
  "arms": "1-10",
  "hands": "1-10",
  "legs": "1-10",
  "feet": "1-10"
}
```

### SkinLog
```json
{
  "date": "date",
  "areas": [{"location": "string", "type": "acne|mark|pigmentation|dry|oily", "severity": "1-5"}],
  "photos": {"front": "uri", "left": "uri", "right": "uri"}
}
```

### ChatMessage
```json
{
  "id": "uuid",
  "timestamp": "datetime",
  "role": "user|assistant",
  "content": "string",
  "context": "string (which screen user was on)"
}
```

---

## BUILD & DEPLOYMENT

1. Build using React Native + Expo OR Flutter
2. SQLite/Realm for 100% local storage
3. All images stored locally on device (compressed)
4. Generate signed APK for Android
5. Works completely offline (except AI features)
6. Target min Android API: 24 (Android 7.0+)
7. App name: **FORGE**
8. App icon: Minimalist shield or rising flame in emerald (#00D9A3) on dark (#0A0A0A) background
9. Splash screen: Dark background, "FORGE" in bold Inter/Poppins, tagline: "Become who you were meant to be." Fade-in animation.
10. No ads, no analytics, no external tracking
11. Internet permission ONLY for Gemini AI (clearly indicated)

## PERFORMANCE

- App launch: <2 seconds to interactive
- Screen transitions: <300ms with smooth spring/fade animations
- Database operations: <100ms
- 60fps scrolling maintained at all times
- Progress photos compressed before storage
- APK size: <50MB
- Memory efficient — no leaks on long sessions

## CUSTOMIZATION ARCHITECTURE

Build the app with easy customization in mind:
- All schedule times configurable from a central config file/screen
- All meal plans editable (add/remove/swap meals)
- Workout plans editable (add/remove exercises, change sets/reps)
- Skincare routine editable (add/remove products, change rotation)
- Supplement list editable (add/remove, change timing)
- Habit list editable (add custom habits)
- Notification times all adjustable
- Color theme customizable (accent color picker)
- All text content stored in a central strings file for easy editing

---

## FINAL NOTE TO DEVELOPER

This app is a single-user personal transformation tool encoding a complete 365-day life overhaul plan. Every data point, every routine, every protocol, every exercise, every meal, every product, every notification described above MUST be implemented EXACTLY as specified. Do not simplify. Do not remove sections. Do not generalize.

The user is a 22-year-old, 5'6", 45 kg male in Bangalore undergoing a comprehensive physical, mental, and lifestyle transformation. This app is his command center, his accountability partner, his coach, his tracker, and his motivation — all in one private, offline, beautiful tool.

Build it with the care and attention that someone's entire life transformation deserves.

The app should feel like having a personal trainer, dermatologist, nutritionist, trichologist, and discipline coach combined into one elegant, smooth, private experience — available 24/7 in your pocket.

Make it beautiful. Make it fast. Make it complete. Make it transformative.
```

---

**This is the complete, final, definitive prompt.** It includes:

✅ All workouts (Phase 1, 2, 3) with every exercise
✅ Complete meal plan with all 8 daily meals + macros
✅ Updated standalone supplement stack (Whey, Creatine, Omega-3, Magnesium Glycinate, B12, D3, Zinc)
✅ Complete skincare routine (AM + PM + weekly rotation + Adapalene progression)
✅ Full tan removal protocol (daily prevention + weekly scrubs + Sunday deep treatment + DIY recipes)
✅ Hair care with Minoxidil tracking + dandruff protocol
✅ Personalized grooming (hairstyle, beard, eyebrows, jawline, teeth, dark circles)
✅ Black elbows/knees protocol
✅ Body care + sun exposure
✅ Style & wardrobe for 5'6" frame
✅ Looksmax ranking (safe to avoid)
✅ Face progression tracking
✅ Complete habit tracker (32 habits)
✅ Dopamine reset protocol (4-week phased)
✅ Journal system (daily + weekly)
✅ Milestones (30/90/365 day) with achievement badges
✅ Body language training
✅ Knowledge base (10 articles)
✅ Commitment letter
✅ Gemini AI Coach integration (full context-aware system)
✅ Emergency urge button
✅ Purchase tracker
✅ Notification system (25+ scheduled notifications)
✅ Onboarding flow
✅ Settings with full customization
✅ All data models
✅ Priority movements for your specific physique weak points
✅ Posture correction protocol
✅ Weekly review system
✅ Progress photos with comparison slider
✅ Dark/Light theme
✅ Complete grocery list
✅ Meal prep Saturday checklist
✅ Product warnings (Humasone, Multani Mitti, Rose Water)
✅ Customization architecture

---

## 🚀 FINAL DELIVERY REQUIREMENTS — READY-TO-INSTALL APK

**CRITICAL: This is not just a code project. The final deliverable must be a WORKING, INSTALLABLE APK FILE that I can transfer to my Android phone and install immediately.**

### Build Requirements:

1. **Build Type:** Signed RELEASE APK (not debug build)
   - Debug builds are slower, larger, and show "Debug" watermarks — unacceptable
   - Release build must be optimized, minified, and production-grade

2. **Signing:**
   - Generate a keystore file (JKS or Keystore format)
   - Sign the APK with this keystore
   - Save the keystore file separately so I can use it for future updates
   - Provide keystore password and key alias in a README

3. **APK Configuration:**
   - Package name: `com.forge.transformation` (or similar unique identifier)
   - Version: 1.0.0 (versionCode: 1)
   - Min SDK: 24 (Android 7.0)
   - Target SDK: 34 (Android 14) or latest stable
   - Architecture: Universal APK (supports arm64-v8a, armeabi-v7a, x86_64) OR provide separate APKs per architecture
   - Enable Hermes engine (React Native) for performance
   - Enable ProGuard/R8 code shrinking for smaller APK size

4. **Assets & Resources:**
   - Include a custom app icon (adaptive icon for Android 8+)
     - Icon design: Emerald flame/shield on dark background (matches app theme)
     - Provide in all required densities (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
   - Include custom splash screen
   - Bundle all fonts (Inter or Poppins) locally so app works offline
   - Bundle all Lottie animations locally
   - Include all pre-loaded content (100+ motivational quotes, 10 knowledge base articles, exercise database, meal database)

5. **Permissions in AndroidManifest.xml:**
   ```xml
   <uses-permission android:name="android.permission.INTERNET" /> (for AI Coach only)
   <uses-permission android:name="android.permission.CAMERA" /> (for progress photos)
   <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
   <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
   <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" /> (for notifications)
   <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" /> (for scheduled notifications)
   <uses-permission android:name="android.permission.POST_NOTIFICATIONS" /> (Android 13+)
   <uses-permission android:name="android.permission.VIBRATE" /> (haptic feedback)

Request permissions at runtime (not just declare) when needed
Pre-Delivery Testing Checklist (MUST verify before delivering APK):
 App installs successfully on Android 7.0+ device
 App launches without crashes
 Onboarding flow completes without errors
 All 6 tabs navigate correctly
 Bottom navigation smooth (60fps)
 Data persists after closing and reopening app
 Photos can be captured and saved
 Photos display correctly in gallery
 Progress graphs render correctly with sample data
 Notifications schedule and fire correctly
 Dark mode displays correctly across all screens
 Light mode toggle works (if implemented)
 Checkbox animations smooth
 Timer functions work (workout rest timer, holds, warm-up)
 AI Coach chat interface loads (even without API key)
 Settings screen accessible and editable
 Data export (CSV/PDF) generates correctly
 Emergency Urge Button accessible from all screens
 App works completely offline (except AI features)
 No debug logs or console output visible in release build
 APK size under 50MB
 No memory leaks in 30-minute stress test
Deliverables (Provide ALL of these):
📱 The Signed Release APK File (FORGE-v1.0.0-release.apk)

This is the primary deliverable
Should be a single downloadable file
Ready to transfer to my Android phone via USB, cloud, or WhatsApp
🔑 Keystore File (forge-release-key.jks)

For signing future updates
Include password, alias, and validity in README
📖 README.md with:

How to install the APK on my phone (step-by-step for beginners)
How to enable "Install from Unknown Sources" on Android
First-time setup instructions
How to get Gemini API key (for AI Coach activation)
Keystore details for future builds
How to backup my data
Troubleshooting common issues
How to update the app in the future
📁 Complete Source Code (organized in a folder or GitHub repo)

All React Native / Flutter source files
package.json / pubspec.yaml with dependencies
Configuration files
Build scripts
Comments in complex sections
🛠️ Build Instructions (BUILD.md)

How to rebuild the APK from source (in case I want to customize)
Required dev environment (Node.js version, Java JDK, Android SDK)
Commands to run for building
Where the APK output file will be located after build
Installation Instructions to Include in README:
text

INSTALLING FORGE ON YOUR ANDROID PHONE:

1. Transfer the APK file (FORGE-v1.0.0-release.apk) to your Android phone
   - Options: USB cable, Google Drive, WhatsApp (send to yourself), Email

2. On your Android phone, enable installation from unknown sources:
   - Settings → Security → "Install unknown apps"
   - Select the app you'll use to open the APK (e.g., Files, Chrome, Drive)
   - Toggle "Allow from this source"

3. Open the APK file using your file manager
   - Tap the APK file
   - Tap "Install"
   - Wait 10-15 seconds

4. Open FORGE from your app drawer
   - Grant permissions when prompted (Camera, Storage, Notifications)
   - Complete the onboarding

5. (Optional) Activate AI Coach:
   - Go to Settings → AI Coach
   - Get a free Gemini API key from https://aistudio.google.com/apikey
   - Paste the key and test connection

That's it! FORGE is ready to use.
Build Commands (Provide these clearly):
For React Native + Expo:

Bash

# Install dependencies
npm install

# Build the release APK (Expo EAS Build)
eas build --platform android --profile production

# OR local build:
cd android
./gradlew assembleRelease
# APK output: android/app/build/outputs/apk/release/app-release.apk
For Flutter:

Bash

# Get dependencies
flutter pub get

# Build the release APK
flutter build apk --release

# For architecture-specific APKs (smaller size):
flutter build apk --split-per-abi --release

# APK output: build/app/outputs/flutter-apk/app-release.apk
File Structure to Deliver:
text

FORGE-v1.0.0/
├── FORGE-v1.0.0-release.apk        ← THE INSTALLABLE APK (primary deliverable)
├── forge-release-key.jks           ← Keystore for future updates
├── README.md                        ← Installation + setup guide
├── BUILD.md                         ← Rebuild instructions
├── source-code/                     ← All source files
│   ├── src/
│   ├── android/
│   ├── package.json
│   └── ...
└── assets/                          ← Icon files, splash screen, etc.
Non-Negotiable Requirements:
❌ Do NOT deliver just source code and tell me to "figure out how to build it"
❌ Do NOT deliver a debug APK
❌ Do NOT deliver an unsigned APK (won't install on modern Android)
❌ Do NOT skip any features to reduce build complexity
❌ Do NOT use any paid APIs (except optional Gemini which has free tier)
✅ DO deliver a working, tested, installable APK file
✅ DO include complete source for future customization
✅ DO include clear beginner-friendly installation instructions
If you cannot generate the APK file directly in your environment, provide:

Complete source code + build configuration
Cloud build service instructions (like Expo EAS Build, Codemagic, GitHub Actions, or Bitrise) with a step-by-step guide I can follow to get the APK in under 30 minutes
Alternative: Instructions to use online APK builders like Appetize, WebIntoApp, or similar
End Goal: I should be able to install FORGE on my Android phone within 1 hour of receiving your delivery, without needing to know how to code. I am hoping for the final ready to use apk that i can download and send to my mobile. Hopefully i avoid the 3rd party stuff like expo and stuuff, we can install whatever we need to build this ourselves.

