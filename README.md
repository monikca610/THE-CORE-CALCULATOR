# THE CORE CALCULATOR
> "One Semester. Every Decision Counts."
> **ACADEMIC NEXUS — Attendance Intelligence System**

A futuristic academic mission control and predictive attendance platform built with React, TypeScript, Tailwind CSS, Recharts, and Framer Motion for **SRM Institute of Science and Technology (Tiruchirappalli Campus)**.

---

## 🔬 Dataset Inspection & Ground Truth

The application directly encodes and uses the timetable schedules across all 10 academic class sections from the School of Electrical and Electronics Engineering:

| # | Section ID | Batch / Year / Sem | Program | Venue | Total Subjects |
|---|---|---|---|---|---|
| 1 | `ii-bme` | II - Year BME (III Sem) | Biomedical Engineering | IST 602 / FN | 10 |
| 2 | `ii-ece-ds-a` | II - Year DS-A (III Sem) | ECE (Data Science) | IST 416 / FN | 10 |
| 3 | `ii-ece-ds-b` | II - Year DS-B (III Sem) | ECE (Data Science) | IST 411 / AN | 10 |
| 4 | `iii-ece-a` | III - Year ECE-A (V Sem) | Electronics & Communication | IST 518 / FN | 9 |
| 5 | `iii-ece-b` | III - Year ECE-B (V Sem) | Electronics & Communication | IST 518 / AN | 9 |
| 6 | `iii-ece-ds` | III - Year ECE_DS (V Sem) | ECE (Data Science) | IST 519 / FN | 9 |
| 7 | `iii-bme` | III - Year BME (V Sem) | Biomedical Engineering | IST 211 / AN | 10 |
| 8 | `iv-ece-a` | IV - Year ECE-A (VII Sem) | Electronics & Communication | IST 225 | 7 |
| 9 | `iv-ece-b` | IV - Year ECE-B (VII Sem) | Electronics & Communication | IST 227 | 7 |
| 10| `i-ece-a` | I - Year ECE-A (I Sem) | Electronics & Communication | IST 602 | 10 |

All course codes (e.g. `21MAB201T`, `21BMC202T`, `21ECC201T`, `21CSS201T`, `21MAB302T`), slots (A through I + LAB), faculty names, credits, and weekly period schedules (Periods 1 through 9, Monday through Friday) are faithfully represented.

---

## 🧮 Mathematical Formulas & Recovery Engine

### 1. Current Attendance
$$\text{Attendance} = \frac{\text{Attended Classes}}{\text{Conducted Classes}} \times 100$$

### 2. Required Future Classes for Target $T$
$$\text{Required Classes} = \max\left(0, \left\lceil \frac{T \cdot \text{Conducted} - \text{Attended}}{1 - T} \right\rceil\right)$$
Where $T \in \{0.75, 0.80, 0.85, 0.90\}$.

### 3. Maximum Achievable Attendance
$$\text{Max Achievable} = \frac{\text{Attended} + \text{Remaining}}{\text{Conducted} + \text{Remaining}} \times 100$$

### 4. Irreversible Detention Alert
Triggered when:
$$\text{Max Achievable} < T \times 100 \quad\text{OR}\quad \text{Required Classes} > \text{Remaining Classes}$$
Alert: *"Even with perfect attendance in every remaining scheduled class, the selected attendance target cannot be reached before the deadline."*

### 5. Safe Bunk Margin
Total classes student can afford to miss across upcoming schedule without dipping below target $T$:
$$\text{Safely Missable} = \max\left(0, \text{Remaining} - \max(0, \lceil T \cdot (\text{Conducted} + \text{Remaining}) - \text{Attended} \rceil)\right)$$

---

## ⚡ Key Features

1. **Cinematic Landing Page**: Futuristic attendance orb with glowing circular progress SVG, floating data chips, and live date telemetry.
2. **Student Setup Wizard**: 4-step initialization protocol (Select Section → Semester Details → Attendance Input with Exact Counts or % → Launch).
3. **Academic Command Center**: Real-time attendance core ring, irreversible detention alert banner, and course-by-course intelligence cards.
4. **Attendance Intelligence Lab**: Futuristic analytics laboratory with overall attendance health ring, subject-wise bar chart with 75% & 90% benchmark lines, actual historical vs simulated prediction trend curves, and scenario comparison matrix.
5. **The Leave Simulator (OD & Medical Leave)**: Plan leave before it impacts the semester. Uses actual timetable dates to count affected subject sessions. Supports Policy A (OD counts as attended with configurable cap), Policy B (OD counts as absent), and Medical Leave policies (approved credit vs ordinary absence vs exempted), with side-by-side policy comparison.
6. **Attendance Advisor AI Chatbot**: Functional floating assistant powered by Gemini 3.8 Flash (`@google/genai` via Express server proxy) with deterministic local calculation engine fallback. Natural language queries for leaves, safe bunks, danger zones, and recovery timelines grounded in real timetable data.
7. **The Recovery Engine**: Trajectory progression simulator showing how attendance climbs step-by-step (+1, +2, +3...) to target, plus formula proofs.
8. **The Time Machine**: Chrono-planner with interactive date scrubber, "PERFECT ATTENDANCE", "WHAT IF I MISS?", and "BUILD MY OWN PLAN" with per-session dispatch toggles.
9. **Live Timetable Intelligence**: Interactive weekly timetable matrix for all 10 SRM sections with period slots, faculty details, and CSV export.
10. **Smart Notification Center**: Dynamic alerts derived directly from real calculations (no fake telemetry).
11. **Data Persistence & Test Suite**: Browser LocalStorage persistence, scenario library, JSON backup & restore, and a built-in mathematical invariant test suite.

---

## 🏛️ Institutional Leave Policies Supported

### On-Duty (OD)
- **Policy A (Approved Credit)**: Eligible OD sessions count towards attended classes up to an administrator-configured cap (default: 12 sessions).
- **Policy B (No Credit)**: Affected sessions count towards total conducted classes without granting attendance credit.
- **Policy C (Exempted)**: Affected sessions are formally excluded from both attended and conducted counts.

### Medical Leave (ML)
- **Approved Credit**: Approved institutional medical leaves count towards attended hours.
- **Ordinary Absence**: Medical leave counts as uncredited absences.
- **Exempted**: Excluded from semester denominator.

---

## 🤖 Attendance Advisor Architecture

The assistant executes deterministic arithmetic through reusable functions:
- `calculateAttendance()`
- `calculateRemainingClasses()`
- `calculateRequiredClasses()`
- `calculateMaximumAchievable()`
- `simulateLeave()`
- `getRecoveryStatus()`

When `GEMINI_API_KEY` is configured in the environment, the server-side proxy `/api/advisor/chat` uses **Gemini 3.8 Flash** with system instructions grounded in the student's exact numerical context. If no API key is present, the deterministic local calculation engine handles queries instantly with zero external dependencies.

---

## 🛠️ Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run full-stack dev server
npm run dev
# Server starts at http://localhost:3000

# 3. Type check & build
npm run build
```
