# GLYPH — Product Requirement Document (PRD)

> **"A computational camera for movement. Every walk becomes a deterministic mathematical mandala — generated from your footsteps, shaped by the sky, committed to GitHub."**

---

## 1. Executive Summary & Vision

### 1.1 The Manifesto
Modern software developers spend thousands of hours creating digital artifacts (repositories, commits, pull requests, APIs). Every hour inside the editor is permanently recorded on a green contribution graph. Yet one of the most valuable activities for creativity, mental clarity, and problem-solving — **stepping outside and walking** — leaves behind nothing. 

GLYPH is a computational medium designed to preserve movement. It asks a simple question: *What if movement deserved its own medium?*

GLYPH is not a fitness app, a walking tracker, or an AI art generator. It introduces a new digital artifact: the **Mandala Commit**. Every walk outside becomes a deterministic mathematical composition generated entirely from human movement.

```
Motion (Body, Footfalls, Gait)
  + 
Sky (Universe, Solar Elevation, Moon Phase)
  + 
Time (Timestamp, Duration)
  ↓
Mathematics (Phyllotaxis, Fibonacci Symmetry)
  ↓
Mandala Commit (Immutable digital specimen)
```

---

## 2. Core Concepts & Mathematical Engine

The core principle of GLYPH is **determinism**. The visual artwork is generated entirely through mathematical equations. If two individuals perform the exact same walk under the same sky at the exact same time, the system will output the identical Mandala Commit.

### 2.1 The Three Signals
The engine restricts itself to exactly three inputs to maximize meaning through constraint:
1. **Motion (The Body):** Footfalls, cadence (BPM), smoothness, turning velocity, acceleration, and rhythm entropy. Motion provides the **geometry and structure**.
2. **Sky (The Atmosphere):** Calculated via SunCalc based on time and approximate latitude/longitude (never tracked as a path, only parsed at start/end). Sky provides the **color palette, glow, and uniforms**.
3. **Time (The Context):** Duration and timestamp. Time provides **temporal metadata** and guides animation playback speed.

### 2.2 Mathematical Formulations
The visual representation is generated using a modified **Phyllotaxis spiral** (radial sunflower seed growth pattern), mapping individual steps to geometric blooms:

*   **Phyllotaxis Equation:**
    $$\theta = n \times 137.507764^\circ$$
    $$r = c \times \sqrt{n}$$
    $$x = c_x + r \cos(\theta)$$
    $$y = c_y + r \sin(\theta)$$
    Where:
    *   $n$ is the footfall index ($n \ge 0$, incremented by $1$ per detected step).
    *   $c$ is the spacing constant, dynamically scaled by the user's walk duration and cadence.
    *   $\theta$ is the golden angle.
    *   $r$ is the radius from the origin.

*   **Fibonacci Symmetry Progression:**
    The complexity of the radial symmetry increases as the user walks, unlocking new symmetry arms at Fibonacci thresholds. This creates a natural "blooming" progression:
    
    | Footfalls | Symmetry Arms | Visual Representation |
    | :--- | :--- | :--- |
    | **1 – 89** | 3 Arms | Minimal trilobal structure |
    | **90 – 233** | 5 Arms | Pentagonal geometry |
    | **234 – 610** | 8 Arms | Octagonal complexity |
    | **611 – 1597** | 13 Arms | Detailed spiral patterns |
    | **1598 – 4181** | 21 Arms | Full botanical bloom |
    | **4182+** | 34 Arms | Complex museum-grade mandala |

*   **Signal Mapping Matrix:**
    *   **Cadence (BPM) $\rightarrow$ Dot/Line Spacing ($c$):** Faster walking pushes points further apart, slower walking condenses them.
    *   **Acceleration $\rightarrow$ Stroke Weight & Scale:** Sudden bursts of speed create thicker, more pronounced strokes.
    *   **Turning Velocity $\rightarrow$ Global Rotation:** Changing direction slowly rotates the canvas plane.
    *   **Rhythm Entropy $\rightarrow$ Noise Offset:** Uneven gait (stumbling, pauses) introduces organic distortion via deterministic Simplex noise.
    *   **Gait Smoothness $\rightarrow$ Bezier Curvature:** Smooth walks produce flowing curves; irregular gaits produce angular, crystalline shapes.

---

## 3. UI/UX Design & Aesthetic Specification

GLYPH is designed as an editorial, museum-quality experience. The layout draws inspiration from botanical specimen sheets, scientific field journals, and premium light-mode digital publications (e.g., Stripe Press, wrot, and Cofounder).

### 3.1 Visual Themes & Styling Rules
*   **The Theme:** Light mode, natural, and tactile. The UI should resemble a physical piece of paper.
*   **Primary Background:** Paper Ivory (`#FAFAF8`).
*   **Surface Panels:** Pure White (`#FFFFFF`).
*   **Primary Text:** Ink Charcoal (`#111111`).
*   **Borders:** Soft Grey (`1px solid #E8E8E6`).
*   **Typography Hierarchy:**
    *   *Display (Headers, Titles):* **Instrument Serif** (or Cormorant Garamond), weight 400, large and elegant, tracking `-0.04em`.
    *   *Body text:* **Geist**, weight 400, line height 1.7, highly readable.
    *   *Metadata & Code annotations:* **Geist Mono**, weight 400, used for coordinates, walk numbers, and mathematical equations.
*   **Component Design:** Rounded corners (small `10px`, medium `16px`, canvas/cards `24px–32px`). Generous margins, clean borders, and heavy whitespace. No complex shadows (max `0 2px 10px rgba(0,0,0,0.03)`), no glassmorphism, and no gamified elements.
*   **Vibrant Nature Palettes (Sky-Driven):**
    *   *Golden Hour:* Warm amber bloom, soft yellow-gold accent (`#D4A937`), ivory canvas.
    *   *Blue Hour:* Purplish-blue accent (`#7764D8`), soft mist backgrounds (`#EEF4F7`).
    *   *Forest/Daytime:* Moss/Deep green (`#36543B`), sky blue (`#A8D5F2`).
    *   *Night:* Deep indigo bloom, dark charcoal text, ivory borders.

### 3.2 Homepage Layout & Structure
The homepage functions as a premium editorial showcase of the computational camera. It is divided into four distinct scroll-down sections:

```
+--------------------------------------------------+
|                  [ Pill Header ]                 |
|                                                  |
|                      GLYPH                       |
|            Commit to touching grass.             |
|                                                  |
|                [ Start Walking ]                 |
+--------------------------------------------------+
|                                                  |
|                   [ Demo Video ]                 |
|                                                  |
+--------------------------------------------------+
|                                                  |
|                  [ Scan to Try ]                 |
|                  (QR Code for Mobile)            |
|                                                  |
+--------------------------------------------------+
|                                                  |
|               [ Live Feet Demo ]                 |
|            (Interactive Step Simulator)          |
|                                                  |
+--------------------------------------------------+
```

#### Section 1: Hero Area
*   **Pill Navigation:** A floating, pill-shaped black navigation bar at the top: `* GLYPH  Products v Docs Research Sign in [Try Now]`, floating elegantly over the light ivory background.
*   **Vibrant Wordmark Hover Effect:** A large display title saying **GLYPH** in `Instrument Serif`. On mouse hover, the wordmark dynamically transitions into a rich gradient of vibrant nature colors (Moss Green, Sun Yellow, Sky Blue, and Lavender) with subtle organic wave motions inside the letters, indicating that the wordmark itself is alive.
*   **Subheader:** *"Commit to touching grass. A computational medium for movement."*
*   **Primary CTA Button:** A large, rounded white button with a thin border: `Start Walking`. On tap, this starts the walk session (triggers motion and location permissions).
*   **Floating Background Mandala:** A slow, continuous p5.js canvas rendering a mathematical mandala blooming in the background at 0.05x speed.

#### Section 2: Demo Video & Philosophy
*   **Layout:** High-contrast two-column editorial layout.
    *   *Left:* "What is a Mandala Commit?" — an explanation of the philosophy (GitHub records code, GLYPH records walks).
    *   *Right:* A looping, cinematic demo video framed inside a rounded card (`rounded-3xl`) showing a developer shutting their laptop, putting their phone in their pocket, walking through a forest during sunset, and reviewing their finalized mandala.

#### Section 3: "Scan Now" to Try
*   **Context:** Mobile browsers contain the hardware sensors (DeviceMotion API) necessary to calculate step cadence and acceleration.
*   **Layout:** A centered, printable-style specimen card featuring a clean, scannable QR Code.
*   **Copy:** *"Take GLYPH with you. Scan this code with your phone to install the Progressive Web App and step outside to generate your first Mandala Commit."*

#### Section 4: Live Footsteps Playground (Desktop Demo)
*   **Layout:** An interactive p5.js canvas taking up the full width of the content area.
*   **Interactive Simulation:** Desktop users can "walk" virtually by clicking or tapping inside the canvas or moving their mouse. 
    *   Every click/mouse interaction is registered as a **footfall event** ($n++$).
    *   A miniature mandala begins to bloom live based on the position and frequency of their clicks.
    *   The **Tone.js Beat Engine** plays a live procedural percussion synth event (soft kick or snare) synchronized with each click, matching the rhythm of their manual footsteps.
    *   Monospace metadata updates in real-time on the side of the canvas: `Steps: 12`, `Symmetry: 5 Arms`, `Cadence: 86 BPM (Simulated)`.

---

## 4. System Architecture & Component Design

GLYPH is designed as an independent computational core (the Glyph Engine) wrapped in a Next.js/React presentation layer.

```
       React Presentation (Pages, Components, Framer Motion)
                               │
                               ▼
        Zustand Stores (WalkStore, CommitStore, GitHubStore)
                               │
                               ▼
    ┌──────────────────── Glyph Engine ────────────────────┐
    │                                                      │
    │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
    │  │ Motion Engine│  │Geometry Engine│  │ Sky Engine │  │
    │  └──────────────┘  └──────────────┘  └────────────┘  │
    │         │                  │               │         │
    │         ▼                  ▼               ▼         │
    │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
    │  │ Beat Engine  │  │Commit Engine │  │Renderer    │  │
    │  └──────────────┘  └──────────────┘  └────────────┘  │
    │                            │                         │
    │                            ▼                         │
    │                    ┌──────────────┐                  │
    │                    │Export Engine │                  │
    │                    └──────────────┘                  │
    └────────────────────────────┬─────────────────────────┘
                                 │
                                 ▼
         Infrastructure (Supabase OAuth, GitHub API, Vercel)
```

### 4.1 Engine Specifications
The system is divided into seven isolated engines:
1.  **Motion Engine:** Subscribes to browser `DeviceMotionEvent` and `DeviceOrientationEvent`. Implements a low-pass filter to clean sensor noise and detects footsteps by tracking peak acceleration thresholds. Compiles acceleration vectors into a unified `MotionState`.
2.  **Geometry Engine:** Pure mathematical engine. Computes Phyllotaxis point coordinates, Bezier control points, and noise values from `MotionState`. It knows nothing about drawing tools (p5.js) or UI libraries.
3.  **Sky Engine:** Uses `SunCalc` to determine solar altitude and moon phase at the start/end coordinates and time. Generates the procedural color palette (Forest, Sky, Lavender, Gold, Night) and passes atmospheric parameters to the WebGL shaders.
4.  **Beat Engine:** Uses **Tone.js** to synthesize percussion. Footfalls trigger kick, snare, or hi-hat synthesis dynamically. Cadence modulates the underlying synthesizers' envelope times and filters, creating an evolving ambient techno layer.
5.  **Commit Engine:** Serializes the finished walk into an immutable JSON artifact containing the complete **Walk DNA** (seed, timestamps, points list, sky state, version).
6.  **Export Engine:** Converts the active WebGL canvas into SVG paths, high-resolution PNG, and Walk DNA JSON files for local download.
7.  **GitHub Engine:** Connects to the GitHub API via Supabase OAuth. Automatically creates a private/public repository named `glyph-walks` and commits the SVG and JSON metadata, creating one contribution mark per walk.

---

## 5. Technical Requirements & Implementation Details

### 5.1 Tech Stack
*   **Framework:** Next.js 16 (App Router) + React 19
*   **Language:** TypeScript (Strict mode, no `any`)
*   **Styling:** Vanilla CSS + CSS variables + Tailwind CSS v4 (used strictly for grid layout and spacing only)
*   **State Management:** Zustand (multiple tiny, isolated stores)
*   **Libraries:** p5.js (rendering), Tone.js (synthesized audio), SunCalc (astronomy calculations), Framer Motion (page transitions)
*   **Database & Auth:** Supabase (GitHub OAuth & session management)

### 5.2 Folder Structure Spec
```
src/
├── app/                  # Next.js pages & router
├── components/           # UI elements (Button, Card, spec sheets)
├── engine/               # Core computational engines
│   ├── motion/           # Step detection & low-pass filtering
│   ├── geometry/         # Phyllotaxis & symmetry calculations
│   ├── sky/              # SunCalc atmospheric parsing
│   ├── beat/             # Tone.js synthesizers
│   ├── commit/           # Walk DNA serialization
│   ├── renderer/         # p5.js WebGL & shader configuration
│   └── export/           # SVG/PNG assets export
├── hooks/                # React custom hooks (useMotion, useBeat)
├── stores/               # Zustand state stores (WalkStore, GitHubStore)
├── styles/               # Global CSS tokens & custom fonts
└── types/                # Strict TypeScript definitions
```

### 5.3 Shared Interface Structures
```ts
// Walk DNA representation
interface WalkDNA {
  commitNumber: number;
  seed: string;
  timestamp: string;
  duration: number;
  totalFootfalls: number;
  averageCadence: number;
  entropy: number;
  smoothness: number;
  skyState: {
    sunAltitude: number;
    moonPhase: number;
    solarPeriod: "goldenHour" | "blueHour" | "day" | "night";
  };
  version: string;
}

// Unified state for Zustand WalkStore
interface WalkState {
  isWalking: boolean;
  footfalls: number;
  cadence: number;
  smoothness: number;
  duration: number;
  startWalk: () => void;
  endWalk: () => void;
}
```

---

## 6. Functional Checklists

### 6.1 Hackathon MVP Scope
*   [ ] **Motion Permission Flow:** Custom modal explaining why device motion is requested before invoking browser sensor dialogs.
*   [ ] **Footstep Detection:** Acceleration peak threshold step detection working in background/pocket.
*   [ ] **Deterministic Geometry:** Mandala growth calculated exactly from Phyllotaxis and Fibonacci thresholds.
*   [ ] **Tone.js Soundscape:** Footfall percussion events synthesized dynamically in the browser (no audio files).
*   [ ] **Sky Atmosphere:** SunCalc integration reading time/location and feeding color variables to canvas.
*   [ ] **Local Download Engine:** Exporting high-res PNG, editable SVG, and raw Walk DNA JSON.
*   [ ] **GitHub Commit Flow:** Supabase auth + automated repo creation + file commit to `glyph-walks` repository.

### 6.2 Out of Scope (For Future Releases)
*   *Social features:* No user feeds, followers, likes, comments, or competitive leaderboards.
*   *AI Imagery:* Absolutely no neural network generators or text prompts.
*   *Tracking maps:* No GPS mapping, calorie counting, or distance gauges (preserves privacy).

---

## 7. Definition of Success
The ultimate metric of success for GLYPH is the **emotional reaction of the user**. 
A walk completes, the music fades to absolute silence, the mandala settles into its permanent geometry, and the specimen sheet reveals the walk's mathematical DNA. The user downloads a museum-ready print and updates their green GitHub grid, leaving behind a lasting record of their decision to step away from code and touch grass.
