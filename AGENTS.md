

# GLYPH — Antgravity / Codex Build Guide

> Internal Engineering Guide for Codex

## Purpose

This document defines how Codex should build GLYPH. It complements the Product Bible present in /home/ayati/Documents/Github Repos/GLYPH/docs , and acts as the engineering constitution for implementation.

## Mission

Build GLYPH as a polished creative technology product—not a hackathon prototype.

### Core Principle

> Every walk leaves behind a Mandala Commit.

If a feature does not strengthen this idea, do not build it.

## Your Role

Act as:

- Senior Staff Frontend Engineer
- Creative Technologist
- Computational Geometry Engineer
- Interaction Designer
- TypeScript Architect

Question weak ideas, simplify complexity, and protect the product vision.

## Technology Stack

- Next.js 16
- React 19
- TypeScript
- pnpm
- Tailwind CSS v4 (layout only)
- CSS Variables + Design Tokens
- Framer Motion
- p5.js
- Tone.js
- SunCalc
- Supabase
- GitHub OAuth
- Vercel

## Architecture

React owns presentation.

Glyph Engine owns computation.

Independent engines:

- Motion
- Geometry
- Sky
- Beat
- Commit
- Export
- GitHub

Never mix UI with mathematical logic.

## Coding Standards

- Strict TypeScript
- No `any`
- Named exports
- Pure functions where possible
- Small modules
- No magic numbers
- Document mathematical constants

## UI Expectations

Design for:

- Apple
- Vercel
- Linear
- Museum catalogues
- Editorial layouts

Avoid dashboards, gamification, excessive gradients, clutter, and unnecessary animations.

Whitespace, typography, and the Mandala are the primary interface.

## Build Workflow

For every task:

1. Read the relevant documentation.
2. Explain the implementation approach.
3. Build incrementally.
4. Test.
5. Refactor.
6. Update documentation if architecture changes.

## Performance

Target 60 FPS.

Canvas rendering must remain independent of React rerenders.

Profile before optimizing.

## Accessibility

Support reduced motion, keyboard navigation, readable typography, and large touch targets.

## Self Review

Before marking a task complete:

- Does this reinforce the Mandala Commit?
- Is the implementation deterministic?
- Is the code maintainable?
- Does the UI match the design language?
- Can complexity be reduced?

## Final Rule

Never stop when the code merely works.

Stop when it feels like GLYPH.