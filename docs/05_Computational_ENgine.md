# 05 — Computational Engine

> The mathematics behind every Mandala Commit.

Version 1.0

---

# Overview

The Computational Engine is the heart of GLYPH.

Unlike traditional digital artwork, the visuals are never painted manually.

Nothing is generated using AI.

Nothing is random.

Every Mandala Commit is a deterministic mathematical computation derived from human movement.

The engine transforms three inputs

Motion

Sky

Time

into one permanent computational artifact.

The rendering engine is built entirely using

- p5.js
- WebGL
- GLSL shaders
- deterministic procedural geometry

The engine should feel closer to scientific visualization than illustration.

---

# Design Philosophy

Every pixel should have a reason.

Nothing decorative.

Nothing arbitrary.

Nothing exists because it "looks cool."

Every visual decision should be mathematically explainable.

The artwork should feel discovered rather than designed.

---

# The Three Signals

The engine receives only three sources.

## Motion

Primary input.

Provides

- footfalls
- cadence
- acceleration
- orientation
- gait

---

## Sky

Provides

- sun elevation
- golden hour
- blue hour
- moon phase

Never affects geometry.

Only atmosphere.

---

## Time

Provides

- timestamp
- walk duration

Used only for metadata and subtle animation timing.

---

# Rendering Pipeline

```
Footfall

↓

Motion Compiler

↓

Geometry Generator

↓

Procedural Noise

↓

Symmetry Engine

↓

Shader Engine

↓

Canvas

↓

Mandala Commit
```

Every stage should be isolated.

---

# Motion Compiler

The Motion Compiler converts raw device motion into stable parameters.

Input

Accelerometer

Gyroscope

Output

```ts
interface MotionState {

    cadence: number

    acceleration: number

    entropy: number

    smoothness: number

    turningVelocity: number

    totalFootfalls: number

}
```

Everything downstream depends on this object.

---

# Step Detection

Every detected footfall creates one rendering event.

The renderer never runs independently.

Movement drives rendering.

If the user stops walking,

the artwork stops growing.

This makes the artwork feel alive.

---

# Geometry Engine

The geometry engine is deterministic.

The primary generator is

Phyllotaxis.

Formula

```
θ = n × 137.507764°

r = c × √n
```

Position

```
x = cx + r cos(θ)

y = cy + r sin(θ)
```

Each footfall increments

```
n++
```

This guarantees natural growth.

---

# Fibonacci Symmetry

Geometry complexity increases using Fibonacci thresholds.

| Footfalls | Arms |
|-----------|------|
| 1–89 | 3 |
| 90–233 | 5 |
| 234–610 | 8 |
| 611–1597 | 13 |
| 1598–4181 | 21 |
| 4182+ | 34 |

The user should visually feel progression.

No abrupt transitions.

Everything blooms naturally.

---

# Mapping Motion

Cadence

↓

Spacing

Acceleration

↓

Stroke Thickness

Turning Velocity

↓

Global Rotation

Entropy

↓

Organic Distortion

Smoothness

↓

Bezier Curvature

Duration

↓

Scale

No parameter should affect more than one visual property unless absolutely necessary.

---

# Noise Engine

Randomness should never be used.

Instead,

use deterministic noise.

Preferred

Simplex Noise

Perlin Noise

Curl Noise

Seed

Generated from

Motion Hash

Example

```
seed = SHA256(

cadence +

duration +

timestamp

)
```

Same walk

↓

Same artwork

Forever.

---

# Shader Engine

WebGL shaders provide atmosphere.

Never geometry.

Allowed shader effects

Glow

Bloom

Soft Grain

Vignette

Subtle Chromatic Aberration

Depth Fog

Noise

Forbidden

Lens Flare

Heavy Blur

Glitch

CRT

RGB Split

The artwork should remain timeless.

---

# Sky Engine

The sky modifies atmosphere.

Golden Hour

↓

Warm amber bloom

Blue Hour

↓

Purple bloom

Night

↓

Deep indigo

Moon Phase

↓

Halo intensity

Sun Elevation

↓

Light direction

Sky should never change geometry.

---

# Color Engine

Generate a palette procedurally.

Never use random colors.

Every palette begins with

Paper

↓

Ivory

Accent

↓

Forest

Sky

↓

Atmospheric

Gold

↓

Golden Ratio

Only one accent color should dominate.

---

# The Mandala

The Mandala is not a picture.

It is a computational object.

Every point knows

its index

its angle

its radius

its symmetry group

its noise offset

This allows replay.

Animation.

SVG export.

Future editing.

---

# Commit DNA

Every Mandala stores

Generator

Golden Angle

Fibonacci Arms

Noise Seed

Cadence

Entropy

Sky

Duration

Version

Every artifact becomes reproducible.

---

# Audio Engine

Tone.js

No music generation.

No AI.

Only procedural percussion.

Every footfall

↓

One percussion event.

Cadence

↓

Tempo

Turning

↓

Stereo movement

Entropy

↓

Human swing

Long walks

↓

Additional harmonic layers

The soundtrack should sound like

walking,

not EDM.

---

# Export Engine

Exports

PNG

SVG

JSON

Future

MP4

The JSON should completely reproduce the artwork.

---

# Performance

60 FPS

WebGL accelerated

Minimal allocations

Reuse buffers

Avoid rerendering React components.

The p5 canvas should own rendering.

React owns UI.

---

# Engineering Principles

Geometry is deterministic.

Shaders are atmospheric.

Motion drives rendering.

The user creates the artwork.

The engine only reveals it.

---

# Final Principle

GLYPH should never feel like it generated art.

It should feel like it uncovered mathematics that had been hidden inside the walk all along.