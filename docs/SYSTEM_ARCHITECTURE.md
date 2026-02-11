# AI Learning OS — System Architecture

This document describes the **AI Learning OS** architecture and maps each layer to the AIra codebase. Same OS, two teaching philosophies: **Curriculum** (syllabus-first) and **Competitive** (exam-first), with zero cross-contamination.

See also: [USER_FLOW_1A_1B.md](./USER_FLOW_1A_1B.md) for student flows.

---

## 1. High-Level Architecture Overview

```
Client (Web / Mobile / Tablet)
        ↓
API Gateway
        ↓
Auth & User Context Service
        ↓
Mode Orchestrator (Curriculum | Competitive)
        ↓
Topic Lock Engine
        ↓
Pedagogy Engine (Mode-Specific)
        ↓
AI Teaching Core
        ↓
Visual Rendering Engine
        ↓
Voice & Interaction Layer
        ↓
Telemetry & Progress Engine
```

---

## 2. Core Layers — Implementation Map

### 2.1 Authentication & Student Context Layer

**Responsibilities**

- Student login  
- Class / grade / stream detection  
- Exam eligibility mapping  
- Learning history  

**Canonical context (target shape)**

```json
{
  "student_id": "S123",
  "grade": "Class 11",
  "board": "CBSE",
  "preferred_exams": ["JEE Main"],
  "learning_mode": null
}
```

**AIra implementation**

| Concern | Location | Notes |
|--------|----------|--------|
| Auth state | `src/stores/authStore.ts` | `user`, `isAuthenticated`, `isGuest` |
| User profile & context | `src/types/index.ts` → `UserProfile` | `curriculumType`, `board`, `grade`, `exam`, `subject`, `currentTopic`, `includePYQ` |
| Profile persistence | `src/services/backendService.ts` | `getUser`, `updateUser`, in-memory + optional sync |
| Onboarding (mode, board, grade, exam, subject, topic) | `src/pages/OnboardingPage.tsx` | Writes to profile; mode selection locks flow |

Context is established **before** mode selection and topic selection; see onboarding flow.

---

### 2.2 Mode Orchestrator (Critical Component)

**Role:** Brain switch. Once selected:

- Locks **pedagogy rules**
- Locks **content scope**
- Locks **AI tone & visuals**

No cross-contamination between **CURRICULUM_MODE** and **COMPETITIVE_MODE**.

**Modes**

| Mode | Internal value | Flow |
|------|----------------|------|
| Curriculum | `school` | Board → Grade → Subject → Topic → Main OS |
| Competitive | `competitive` | Exam → Subject → (PYQ) → Topic → Main OS |

**AIra implementation**

| Concern | Location | Notes |
|--------|----------|--------|
| Mode selection UI | `src/pages/OnboardingPage.tsx` | Step 0: Curriculum vs Competitive; steps 1–4 vary by mode |
| Mode in profile | `src/types/index.ts` → `UserProfile.curriculumType` | `'school' \| 'competitive'` |
| Syllabus/topic data by mode | `src/data/curriculumData.ts` | `getSubjectsForGrade`, `getSubjectsForExam`, `getSubjectsForContext(curriculumType, grade?, exam?)` |
| Mode-driven prompt construction | `src/stores/teachingStore.ts` → `generateAiSession` | Injects mode-specific constraints; see also **Prompt Control Layer** |
| Prompt Control Layer (canonical) | `src/services/promptControlLayer.ts` | `getPromptControlParams(mode, context)` → `allowed_sources`, `visual_style`, `voice` |

---

### 2.3 Topic Lock Engine

**Role:** AI must not reference next chapter, related but unselected topics, or deviate from the selected topic. Any deviation → auto-corrected or blocked.

**AIra implementation**

| Concern | Location | Notes |
|--------|----------|--------|
| Topic lock in prompts | `src/stores/teachingStore.ts` → `generateAiSession` | “Strict topic scope”, “MANDATORY: VISUALS STRICTLY AND EXCLUSIVELY FOR THIS TOPIC ONLY”, “selected topic only” |
| Prompt Control | `src/services/promptControlLayer.ts` | `topic_lock: true` in control params |
| Optional future | — | Server-side or client-side response guard that blocks/rewrites off-topic content |

Currently enforced via **prompt constraints**; a separate Topic Lock Engine service can be added later for validation/post-processing.

---

### 2.4 Pedagogy Engine (Mode-Specific)

**Curriculum mode**

- Content: **only** official curriculum.  
- Topic: single selected topic.  
- Style: conceptual, board-style.  
- Visuals: diagrams, simulations.  
- Voice: teacher-like, explanatory.  
- No: PYQs, tricks, shortcuts.

**Competitive mode**

- Goal: exam performance.  
- Entry: Exam → Subject / PYQs.  
- Visuals: problem breakdowns.  
- Voice: analytical.  
- Scope: exam syllabus only.  
- Focus: step-by-step solving.

**AIra implementation**

| Concern | Location | Notes |
|--------|----------|--------|
| Curriculum teaching style text | `src/stores/teachingStore.ts` | `curriculumTeachingStyle` for `school`: syllabus-first, no JEE/NEET depth, seamless narrative |
| Competitive teaching style text | `src/stores/teachingStore.ts` | `curriculumTeachingStyle` for `competitive`: exam-oriented, step-by-step, analytical, problem breakdowns, optional PYQ |
| Structural flow (motivation → foundations → mechanisms → examples → misconceptions → summary) | Same | “MANDATORY STRUCTURAL FLOW” in prompt |
| Concept sequencer (intuition → definition → derivation → visualization → examples) | Same | Reflected in section structure and depth requirements |

---

### 2.5 AI Teaching Core (Shared, Mode-Controlled)

One AI; behavior strictly parameterized by **Prompt Control Layer**.

**Prompt Control (non-negotiable)**

Competitive example:

```json
{
  "mode": "COMPETITIVE",
  "topic_lock": true,
  "allowed_sources": ["JEE_SYLLABUS", "PYQ_DB"],
  "visual_style": "problem_breakdown",
  "voice": "analytical"
}
```

Curriculum example:

```json
{
  "mode": "CURRICULUM",
  "topic_lock": true,
  "allowed_sources": ["NCERT", "BOARD_SYLLABUS"],
  "visual_style": "board_teaching",
  "voice": "teacher"
}
```

If AI drifts topic, uses exam tricks in curriculum, or storytelling in competitive → **Prompt Governor** (prompt design + future guards) blocks or corrects.

**AIra implementation**

| Concern | Location | Notes |
|--------|----------|--------|
| Prompt control params | `src/services/promptControlLayer.ts` | Single source of truth for mode → `allowed_sources`, `visual_style`, `voice` |
| Prompt assembly | `src/stores/teachingStore.ts` → `generateAiSession` | Uses domain (board/grade or exam), topic, mode constraint, curriculumTeachingStyle, visualAidInfo |
| AI API call | `src/services/aiApi.ts` → `generateTeachingContent` | Sends assembled prompt; returns JSON (title, sections, summary) |
| Session creation | `teachingStore` | Maps AI response to `TeachingSession` with `teachingSteps`, `curriculumType`, `board`, `grade`, `exam` |

---

### 2.6 Visual Rendering Engine

**Curriculum:** Blackboard-style animations, force diagrams, simulations, stepwise reveal. No storytelling, no exam tricks.  
**Competitive:** Problem breakdowns, equation highlighting, variable isolation, step stacking. No unrelated animations.

**AIra implementation**

| Concern | Location | Notes |
|--------|----------|--------|
| Visual types | `src/types/index.ts` → `Topic.visualType`, step `visualType` | diagram, animation, 3d-model, interactive, technical, etc. |
| Topic visuals registry | `src/components/teaching/topicVisualRegistry.ts`, `topicVisuals.tsx` | Maps topic/visualType to components |
| Step-level visual | `TeachingStep.visualType`, `visualPrompt` | Per-step; used by teaching panel/canvas |

---

### 2.7 Voice & Interaction Layer

**Curriculum:** Natural, explanatory, teacher-like.  
**Competitive:** Analytical, direct.

**AIra implementation**

| Concern | Location | Notes |
|--------|----------|--------|
| Voice selection | `src/utils/voice.ts` | Human-like voice picker |
| Speech synthesis | `src/services/teachingEngine.ts` | Speaks `spokenContent`; rate/pitch from settings |
| Sync with visuals | `teachingStore` session steps | Each step has `spokenContent` + `visualType`/`visualPrompt`; narration references visual |

---

### 2.8 Telemetry & Progress Engine

**Tracks:** Topic mastery, concept gaps, exam accuracy, time per question.  
**Feeds:** Topic suggestions, difficulty adjustment, revision prompts.

**AIra implementation**

| Concern | Location | Notes |
|--------|----------|--------|
| Session analytics | `src/services/backendService.ts` | Sessions, metrics stored per user |
| Progress metrics | `src/types/index.ts` → `ProgressMetrics` | totalHours, topicsCompleted, averageQuizScore, knowledgeRetention, streakDays, weeklyHours |
| Analytics store | `src/stores/analyticsStore.ts` | Client-side analytics state |
| Session sync | `teachingStore` + `backendService` | `createTeachingSession`, `updateTeachingSession` on start/update |

---

## 3. Flow 1A — Curriculum Mode

- **Path:** Subject → Topic → Curriculum Syllabus Mapper → Topic Content Graph → Concept Sequencer → AI Teaching Core → Visual Teaching Engine.  
- **Syllabus mapper:** Topic → official syllabus nodes; reject out-of-syllabus prompts.  
- **Concept sequencer:** Intuition → Definition → Derivation → Visualization → Simple examples.  
- **Visual teaching engine:** Blackboard animations, diagrams, simulations, stepwise reveal.

**AIra:** Curriculum data in `src/data/curriculum/` (middle, secondary, seniorSecondary); `getSubjectsForGrade(grade)`. Teaching content and structure in `teachingStore.generateAiSession` when `curriculumType === 'school'`.

---

## 4. Flow 1B — Competitive Mode

- **Path:** Exam Selection → Exam Syllabus Mapper → PYQ Repository (10 years) → Topic Filter → Problem Strategy Engine → AI Teaching Core → Problem Visualization Engine.  
- **Exam syllabus mapper:** Exam → Subject → Topic (e.g. weightage).  
- **PYQ repository:** Indexed by exam, year, topic, difficulty, concept tag.  
- **Problem strategy:** Identify concept → choose method → apply formula → solve → time-optimization hint.  
- **Problem visualization:** Equation highlighting, variable isolation, step stacking.

**AIra:** `src/data/curriculum/competitive.ts` → `COMPETITIVE_CURRICULUM`; `getSubjectsForExam(exam)`; `includePYQ` in profile and in prompt when `curriculumType === 'competitive'`. Full PYQ repository and problem-strategy engine can be added as separate services.

---

## 5. Main OS Screen (Unified UI, Dual Behavior)

**UI shell (same):** Canvas, Voice, Controls, Notes, Replay.

**Behavior (different):**

| Feature | Curriculum | Competitive |
|--------|------------|-------------|
| Start | Concept intro | Question |
| Visuals | Diagrams | Step stacks |
| Voice | Explanatory | Analytical |
| Flow | Learn → Understand | Solve → Optimize |

**AIra:** Single teaching UI (e.g. `TeachingPage`, teaching panel); behavior comes from `currentSession.curriculumType` and the generated steps (content and visual style).

---

## 6. Guardrails Summary

- **Mode Orchestrator:** Mode chosen at onboarding; syllabus and prompts respect it (`OnboardingPage`, `teachingStore`, `promptControlLayer`).  
- **Topic Lock:** Enforced in prompts (single topic, no next chapter, no unrelated topics); `topic_lock` in Prompt Control.  
- **No syllabus leakage:** Curriculum vs competitive content and tone are strictly separated in prompt design and data (curriculum vs competitive curriculum).

---

## 7. Scalable Tech Stack (Reference)

| Layer | Tech (suggestion) | AIra current |
|-------|--------------------|--------------|
| Frontend | React / Flutter | React (Vite) |
| Canvas | WebGL / Konva | React components + topic visuals |
| Backend | Node / Python | In-memory backendService; optional Node backend |
| AI orchestration | LangGraph / Custom | aiApi + teachingStore prompts |
| Vector DB | Pinecone / Weaviate | — |
| Telemetry | Kafka + ClickHouse | In-app analytics + backend sessions |

---

## 8. What This Architecture Enables

- Same OS for both modes.  
- Two distinct teaching philosophies (syllabus-first vs exam-first).  
- No syllabus leakage between modes.  
- AI behaves as teacher **or** exam coach, not both.  
- Ready to scale from Class 6 → GATE with clear extension points (syllabus mapper, PYQ repository, topic lock engine).
