# Student User Flow: 1A (Curriculum) & 1B (Competitive)

This document defines the two isolated student learning flows and how they map to the app.

---

## 1A. Curriculum Mode (Syllabus-First)

**Path:** Student Login → Mode Selection → **Curriculum Mode** → Subject → Topic → Main OS

### Steps
1. **Login** – Student chooses "Student Login".
2. **Mode Selection** – User selects **Curriculum** (syllabus-first learning).
3. **Board** – Select board (e.g. Telangana Board, AP Board, …).
4. **Grade** – Select grade (e.g. Inter 1st Year, Class 10, …).
5. **Subject** – Choose subject for the curriculum.
6. **Topic** – Pick a topic within that subject.
7. **Main OS (Teaching Screen)**  
   - AI teaches **only** the selected topic.  
   - Content is **strictly mapped to the official curriculum syllabus**.  
   - **Teaching format:**  
     - Realistic visuals: diagrams, simulations, board-style explanations.  
     - Natural, narrative voice (not analytical).  
     - No exam shortcuts or competitive-level depth.

---

## 1B. Competitive Mode (Exam-First)

**Path:** Student Login → Mode Selection → **Competitive Mode** → Select Exam → Choose Subject + PYQ (Last 10 Years) → Topic → Main OS

### Steps
1. **Login** – Student chooses "Student Login".
2. **Mode Selection** – User selects **Competitive** (exam-first learning).
3. **Select Exam** – JEE Main / NEET / EAMCET / GATE / IIT (etc.).
4. **Choose Subject** – Subject for the selected exam.
5. **Previous Year Question Papers (Last 10 Years)** – Optional toggle to include PYQ-based practice.
6. **Topic** – Pick a topic within that subject.
7. **Main OS (Teaching Screen)**  
   - Teaching is **exam-oriented**.  
   - **Step-by-step problem solving.**  
   - **Visuals** = problem breakdowns, exam-style diagrams (not storytelling).  
   - **Voice** = analytical, not narrative.  
   - **Content scope** = strictly aligned to:  
     - Exam syllabus  
     - Selected topic only  

---

## Implementation Mapping

| Flow | Onboarding steps | Main OS behavior |
|------|------------------|------------------|
| **1A** | Mode → Board → Grade → Subject → Topic | `teachingStore`: Curriculum style (syllabus-only, realistic visuals, seamless narrative, no JEE/NEET depth). |
| **1B** | Mode → Exam → Subject → PYQ + Topic | `teachingStore`: Competitive style (exam-oriented, step-by-step, analytical voice, problem breakdowns, optional PYQ). |

- **Routes:** `/login` → `/onboarding` → `/learn/:topicId` (Main OS). Curriculum browser: `/curriculum` (Subject → Topic → `/learn/:topicId`).
- **Stores:** `userStore` (curriculumType, selectedBoard, selectedGrade, selectedExam, selectedSubject, includePYQ); `teachingStore` (generates session with curriculum-specific prompts).
- **AI prompts:** Differentiated in `teachingStore.generateAiSession` and `contextualAI` by `curriculumType` and `includePYQ`.
