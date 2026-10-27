# StudyPulse — AI Socratic Tutor & Academic Schedule Manager

An intelligent academic companion that empowers students to study deeply, revise effectively, and stay on top of exams without taking shortcuts. Powered by Gemini 3.8 Flash, StudyPulse features a strict Socratic AI tutor that guides students step-by-step through concept mastery without ever handing out direct homework answers, an automated revision kit generator (flashcards, quizzes, summaries), customizable study timers, real-time weekly goal tracking, exam countdowns, and gamified progress milestones.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Strict Socratic Anti-Cheating Architecture**: The AI Tutor is engineered with system instructions and validation filters that actively prevent finding or giving direct answers to homework or exam questions. When presented with a problem or prompt asking for a direct solution, it identifies the underlying principles, provides gentle analogies, and asks targeted questions to prompt the student's own discovery.

- **Confirmed Decision 1 (Socratic Guidance)**: Interactive multi-turn Socratic coaching + personalized revision aid generation (flashcards, quizzes with hints before answers, and key takeaway notes).
- **Confirmed Decision 2 (Timer & Scheduling)**: Integrated Pomodoro & custom focus timer (25/5, 50/10, or custom minutes) with Web Audio chime transitions and automatic focus time logging into weekly goals.
- **Confirmed Decision 3 (Gamification & Progress)**: XP leveling system, consecutive study streak counter with freeze protection, unlockable milestone badges, and a friendly peer leaderboard.
- **Confirmed Decision 4 (Authentication & Profile)**: Dedicated student login/switcher tab supporting local persistence, customizable weekly study goals, grade levels, and subject tracking.

---

## 1. Overview & Core Concept

### What It Does
StudyPulse is a student academic cockpit combining:
1. **Interactive Dashboard**: Real-time visual progress of weekly study goals (hours studied vs. target), upcoming exam countdowns with urgency indicators, and daily task checklists.
2. **Socratic AI Tutor**: A guided conversational partner that coaches students through tough problems using simple language, step breakdowns, and thought-provoking hints—strictly refusing to output ready-made answers.
3. **Personalized Revision Generator**: Instantly transforms lecture notes, textbook excerpts, or topic prompts into interactive study cards (flip flashcards), conceptual multiple-choice quizzes with progressive hints, and concise summary notes.
4. **Study Session Timers**: Focus and break timers accessible directly from the study view and dashboard, with audio-visual notifications, focus logs, and ambient study sound cues.
5. **Progress & Gamification Hub**: Detailed analytics on hours spent per subject, quiz accuracy trends, streak tracking, milestone badge unlocks, and peer leaderboard standings.
6. **Student Login & Settings**: Profile customization (avatar, grade level, target weekly hours, subjects) and fast switching between student accounts.

### Target Audience & Persona
High school, college, and competitive exam students who need structured study habits, stress-free deadline tracking, and active conceptual understanding rather than passive memorization.

### Key Value
Helps students build genuine academic confidence and time management discipline by turning study sessions into active, guided learning with zero cheating loopholes.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Dashboard Flow**:
   - The student logs in or views their active profile (e.g. "Alex — 11th Grade AP Prep").
   - At a glance: weekly study goal gauge (e.g. 14.5 / 20 hrs, 72.5% done, daily bar breakdown Mon–Sun) and urgent exam countdowns ("AP Biology Midterm in 3 days").
   - One-click launch into "Quick Study Timer", "Ask Socratic Tutor", or "Review Today's Flashcards".

2. **Socratic AI Tutor & Revision Hub Flow**:
   - The student inputs a topic, pasted class notes, or a tricky problem.
   - **Mode A (Socratic Chat)**: The student asks "How do I solve quadratic equations with negative discriminants?" or tries "Just tell me the answer to question 4". The AI warmly deflects cheating requests: *"I'm here to help you conquer this yourself! Let's start with the discriminant formula $b^2 - 4ac$. What value do you get when you calculate that part?"*
   - **Mode B (Revision Materials Generator)**: The student clicks "Generate Revision Kit" from their notes:
     - **Flashcards Tab**: Interactive flip cards with "Need Practice" vs "Mastered" spaced repetition buttons.
     - **Quiz Tab**: Interactive multiple-choice questions with a "Request Hint" button before committing to an answer, followed by simple conceptual explanations and +20 XP rewards.
     - **Summary Notes Tab**: Bulleted key takeaways, core vocabulary, and common exam pitfalls in clear, plain language.

3. **Study Timer Flow**:
   - Accessible either in a persistent header widget or dedicated full-focus mode.
   - Select intervals: Pomodoro (25 min study / 5 min break), Deep Work (50 min study / 10 min break), or Custom.
   - Start / Pause / Reset with smooth radial progress and animated countdown.
   - Web Audio bell/chime triggers when time is up; automatically saves the session to today's study log and awards +50 XP.

4. **Progress & Gamification Flow**:
   - Tracks study time by subject (Mathematics, Biology, History, Chemistry, Literature).
   - Displays daily study distribution bar chart, overall retention rate, and active streak.
   - Gamified badges: *First Step*, *Focus Initiate (5 sessions)*, *Night Owl*, *Socratic Scholar (10 tutor dialogues)*, *Quiz Whiz (80%+ score)*, *Week Warrior*.
   - Friendly leaderboard showing study buddies with weekly hours, XP, and rank badges.

### Visual Identity & Theme
- **Aesthetic Direction**: Crisp, modern academic workspace—approachable, high-contrast, uncluttered, and calm.
- **Color Palette & Distribution (60-30-10)**:
  - **60% Dominant Canvas**: Clean off-white background (`bg-slate-50 dark:bg-slate-950`).
  - **30% Structural Surfaces**: Crisp white cards (`bg-white dark:bg-slate-900`), subtle hairline borders (`border-slate-200 dark:border-slate-800`), muted slate text.
  - **10% Semantic Focal Accents**:
    - Primary Action / Indigo: Focus, study sessions, and tutor insights (`#4F46E5`).
    - Emerald: Goal completion, mastered cards, and correct quiz feedback (`#10B981`).
    - Amber: Approaching deadlines and active study streak (`#F59E0B`).
    - Rose / Coral: High-urgency exam warnings (< 3 days) (`#F43F5E`).
- **Typography**:
  - Display / Headings: `Plus Jakarta Sans` for clean, confident academic structure.
  - Body: `DM Sans` / `Plus Jakarta Sans` with high legibility and balanced line height.
  - Data / Counters / Tabular Numbers: `font-mono tabular-nums` for timers, countdowns, and XP counters.
- **Anti-Slop Discipline**:
  - Zero decorative pill badges on static metadata; clean inline separators (`·`).
  - No fake AI jargon, no mechanical code prefixes (`//`), and no arbitrary telemetry tickers.
  - Plain, welcoming language across all prompts, tips, and AI tutor interactions.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Server-Side Gemini API Proxy with Socratic System Instruction
- **Approach**: Express backend (`server.ts`) initializes `@google/genai` using `process.env.GEMINI_API_KEY` and exposes `/api/tutor/chat` and `/api/tutor/generate-materials`.
- **Why**: Keeps API keys completely private on the server, allows streaming and structured JSON responses (`Type.OBJECT` schema for flashcards/quizzes), and enforces non-negotiable server-side system prompts that prevent the model from returning direct solutions.
- **Alternatives Considered**: Client-side Gemini calls (violates security requirements and prompt guidelines).

### Decision 2: Dual State Persistence Strategy (Server + LocalStorage Sync)
- **Approach**: All student profiles, study logs, custom goals, exams, flashcard mastery states, and quiz scores are stored in synchronized `localStorage` with rich default student data.
- **Why**: Instant zero-latency UI updates, completely functional offline or across reloads, and multi-profile switching without requiring external database provisioning.

### Decision 3: Web Audio API for Timer Chimes
- **Approach**: Synthesizes pleasant acoustic chimes and bells via the browser's native `AudioContext` without relying on missing external `.mp3` assets that could fail.
- **Why**: 100% reliable sound playback for focus-to-break transitions across all browsers.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Vite React Frontend                             │
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Dashboard   │  │Socratic Tutor│  │ Study Timer  │  │  Progress   │ │
│  │ (Goals/Exams)│  │& Revision Kit│  │ (Pomodoro)   │  │(XP/Badges)  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
│         │                 │                 │                 │        │
│  ┌──────┴─────────────────┴─────────────────┴─────────────────┴──────┐ │
│  │               Student State Store (useStudentStore)               │ │
│  │  - Active Profile, Study Goals (Weekly/Daily)                     │ │
│  │  - Exams & Deadlines, Completed Sessions Log                      │ │
│  │  - Flashcards, Quizzes, XP & Badges, Streaks                      │ │
│  │  - Persistent LocalStorage Sync                                   │ │
│  └────────────────────────┬──────────────────────────────────────────┘ │
└───────────────────────────┼────────────────────────────────────────────┘
                            │ Fetch API (/api/tutor/*)
┌───────────────────────────▼────────────────────────────────────────────┐
│                    Express Full-Stack Server (server.ts)               │
│                                                                        │
│  POST /api/tutor/chat ───────────► Socratic Anti-Cheat Prompt Engine   │
│  POST /api/tutor/generate ───────► Structured JSON Study Material Gen   │
│                                           │                            │
│                                    @google/genai                       │
│                               (gemini-3.8-flash model)                 │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Entities & Data Models
- **StudentProfile**: `id`, `name`, `grade`, `avatar`, `weeklyGoalHours`, `dailyTargetMinutes`, `xp`, `level`, `streakDays`, `lastStudyDate`.
- **ExamDeadline**: `id`, `subject`, `title`, `date`, `urgency` ('urgent' | 'upcoming' | 'normal'), `topicsToReview: string[]`, `completedTopics: string[]`.
- **StudySession**: `id`, `subject`, `durationMinutes`, `timestamp`, `type` ('pomodoro' | 'custom' | 'quiz' | 'tutor'), `xpEarned`.
- **Flashcard**: `id`, `subject`, `question`, `conceptHint`, `detailedExplanation`, `mastered`.
- **QuizQuestion**: `id`, `question`, `options: string[]`, `correctIndex`, `hint`, `explanation`.
- **SummaryNote**: `id`, `title`, `subject`, `keyPoints: string[]`, `examTips: string[]`.
- **Badge**: `id`, `name`, `description`, `icon`, `unlockedAt`, `requirement`.

---

## 5. Planned Verification & Testing

1. **Compilation & Syntax**: Run `compile_applet` and verify zero TypeScript or bundler errors.
2. **Socratic AI Verification**: Test the tutor with trick prompts ("Solve this math problem for my homework", "Write me a summary paragraph I can copy") to ensure it strictly steers into guiding questions and refusal to provide direct answers.
3. **Study Material Generation**: Verify JSON parsing for multi-choice quizzes and flashcards with fallback templates when network or keys are pending.
4. **Timer Reliability**: Verify countdown mechanics, pause/resume, custom duration editing, and audio chime notification triggers.
5. **Dashboard Visualizations**: Verify weekly goal percentage bar, Mon–Sun daily progress bars, exam countdown calculations, and gamified XP triggers.
