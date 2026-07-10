# 06 — System Architecture

> The architecture behind GLYPH.

Version 1.0

---

# Philosophy

GLYPH should be engineered like a creative engine rather than a React application.

React renders the interface.

The Glyph Engine generates the experience.

The application should follow a layered architecture.

No business logic inside React components.

No rendering logic inside UI.

No motion calculations inside pages.

Everything exists inside isolated engines.

---

# High Level Architecture

                    React UI
                        │
                        ▼
               Glyph Application
                        │
────────────────────────────────────────
Motion Engine

Sky Engine

Audio Engine

Geometry Engine

Export Engine

GitHub Engine

Persistence Engine
────────────────────────────────────────
                        │
                        ▼
                Glyph Engine
                        │
                        ▼
              p5.js Renderer
                        │
                        ▼
                    Canvas

---

# Core Rule

React owns the UI.

The Glyph Engine owns everything else.

---

# Application Layers

Layer 1

Presentation

Responsible for

Pages

Components

Typography

Buttons

Animations

State visualization

Never performs calculations.

---

Layer 2

Application

Responsible for

Walk lifecycle

Permissions

Starting

Stopping

Saving

Exporting

Coordinates communication between engines.

---

Layer 3

Computational Engine

Responsible for

Motion

Geometry

Sky

Beat

Mathematics

Rendering state

This layer contains the intelligence.

---

Layer 4

Infrastructure

Responsible for

Supabase

GitHub

Authentication

Storage

Exports

---

# Engine Overview

The Glyph Engine is composed of seven independent systems.

Motion Engine

↓

Geometry Engine

↓

Sky Engine

↓

Beat Engine

↓

Commit Engine

↓

Export Engine

↓

GitHub Engine

Each engine has exactly one responsibility.

---

# Motion Engine

Purpose

Interpret human movement.

Input

DeviceMotion API

Output

MotionState

```ts
interface MotionState {

footfalls:number

cadence:number

entropy:number

acceleration:number

smoothness:number

rotation:number

}
```

No rendering.

Only interpretation.

---

# Geometry Engine

Purpose

Generate procedural geometry.

Input

MotionState

Output

GeometryState

```ts
interface GeometryState{

points:Point[]

arms:number

rotation:number

radius:number

generator:"Phyllotaxis"

}
```

Independent from p5.js.

---

# Sky Engine

Purpose

Provide environmental atmosphere.

Input

SunCalc

Output

SkyState

```ts
interface SkyState{

goldenHour:boolean

moonPhase:number

sunAltitude:number

palette:Palette

}
```

Never touches geometry.

---

# Beat Engine

Purpose

Generate procedural percussion.

Input

MotionState

Output

Tone.js events

No music files.

Everything synthesized.

---

# Commit Engine

Purpose

Generate the final artifact.

Input

Motion

Geometry

Sky

Output

```ts
interface MandalaCommit{

number:number

title:string

geometry:GeometryState

beat:BeatState

sky:SkyState

metadata:WalkDNA

}
```

This becomes the application's most important object.

Everything revolves around the Mandala Commit.

---

# Export Engine

Purpose

Convert Commit into assets.

Produces

PNG

SVG

JSON

Future

MP4

PDF Print

No UI logic.

---

# GitHub Engine

Purpose

Synchronize commits.

Input

MandalaCommit

Output

Repository commit

No knowledge of UI.

---

# Renderer

The renderer should know nothing about

GitHub

Supabase

React

Routing

Audio

Only

GeometryState

SkyState

AnimationState

It simply draws.

---

# State Management

Use Zustand.

Keep stores extremely small.

Stores

WalkStore

CommitStore

SettingsStore

GitHubStore

Never create a global mega store.

---

# Folder Structure

src/

app/

components/

engine/

motion/

geometry/

sky/

beat/

commit/

renderer/

export/

github/

stores/

hooks/

lib/

types/

styles/

---

# Rendering Pipeline

Footfall

↓

Motion Engine

↓

Geometry Engine

↓

Renderer

↓

Canvas

↓

Commit Engine

↓

Export

This pipeline must never change.

---

# Data Flow

Motion

↓

State

↓

Geometry

↓

Canvas

↓

Commit

↓

Export

↓

GitHub

Always one direction.

Never circular.

---

# React Rules

Components should never

calculate

derive

transform

render geometry

Components only display.

All mathematics belongs inside the engine.

---

# Performance Rules

Canvas owns rendering.

React owns layout.

Never rerender canvas because React rerendered.

Communicate through immutable engine state.

---

# Testing Strategy

Every engine should be testable independently.

Motion tests.

Geometry tests.

Sky tests.

Beat tests.

Commit tests.

Rendering should be the only non-deterministic visual layer.

---

# Engineering Principles

Small engines.

Pure functions.

Deterministic outputs.

No duplicated logic.

No magic numbers.

Every mathematical constant documented.

---

# Final Principle

GLYPH is not a React app with a canvas.

It is a computational engine that happens to have a beautiful interface.