# 04 — Design System

> Designing GLYPH like a timeless computational instrument.

Version 1.0

---

# Philosophy

The interface should feel like it was designed by people who love

mathematics,

books,

paper,

museums,

nature,

and typography.

Not by people trying to maximize engagement.

The interface should disappear.

The Mandala Commit should remain.

---

# Design Keywords

Editorial

Scientific

Natural

Calm

Premium

Intentional

Computational

Museum

Minimal

Swiss

Organic

Soft

Readable

Breathing

---

# Experience Goals

The UI should feel like

opening a beautifully printed field journal.

Every page should feel

thoughtful

quiet

balanced

lightweight

Nothing should scream.

Nothing should compete with the artwork.

---

# Brand Personality

GLYPH is

Curious

Elegant

Calm

Intelligent

Crafted

Minimal

Scientific

Human

GLYPH is not

Corporate

Playful

Loud

Trendy

Cyberpunk

Gamified

Overdesigned

---

# Visual References

Apple Human Interface

Vercel

Linear

Monograph

PaperCache

Stripe Press

National Geographic

MUJI

Botanical Field Notes

Scientific Specimen Sheets

Swiss Editorial Design

Google Creative Lab

The browser itself.

---

# Layout System

Desktop Max Width

1280px

Reading Width

720px

Canvas Width

100%

Mobile First

Always.

---

# Grid

8pt grid

Spacing

4

8

12

16

24

32

48

64

96

128

Never invent arbitrary spacing.

---

# Border Radius

Small

10px

Medium

16px

Large

24px

Canvas

32px

Everything feels soft.

Nothing perfectly sharp.

---

# Border System

Always visible.

Very subtle.

```
1px solid #E8E8E6
```

No heavy outlines.

---

# Shadows

Avoid elevation.

Instead use

```css
0 2px 10px rgba(0,0,0,0.03)
```

Maximum.

Never floating cards.

---

# Color System

## Background

Canvas

```
#FAFAF8
```

Paper

```
#FFFFFF
```

---

## Text

Primary

```
#111111
```

Secondary

```
#555555
```

Muted

```
#8A8A8A
```

---

## Borders

```
#E8E8E6
```

---

## Semantic

Forest

```
#36543B
```

Golden Ratio

```
#D4A937
```

Sky

```
#A8D5F2
```

Lavender

```
#7764D8
```

Mist

```
#EEF4F7
```

---

# Typography

## Display

Instrument Serif

Fallback

Cormorant Garamond

Size

64–96px

Weight

400

Tracking

-0.04em

---

## Heading

Geist

32

40

48

Weight

600

---

## Body

Geist

16

18

20

Weight

400

Line Height

1.7

---

## Mono

Geist Mono

14

16

Weight

400

Used for

Metadata

Commit Numbers

Mathematical Values

Git hashes

Coordinates

Seeds

---

# Type Scale

Hero

96

Display

72

H1

56

H2

40

H3

32

Body Large

20

Body

16

Caption

14

Mono

14

Tiny Metadata

12

---

# Icons

Lucide

Stroke

1.75

Rounded

Never filled.

---

# Component Philosophy

Every component should feel

light

honest

printed

not digital.

---

# Buttons

Primary

White

Thin border

Large padding

Rounded

Subtle hover

No shadows.

---

Primary CTA

```
Start Walking
```

Never

START

GO

BEGIN

---

Secondary

Ghost

Transparent

Borderless

Muted

---

Danger

Never red.

Use text only.

---

# Cards

Cards resemble museum labels.

White

Rounded

Thin border

No gradients.

No drop shadows.

Spacing is more important than decoration.

---

# Navigation

Height

72px

Contains

Logo

About

GitHub

Start

No hamburger until mobile.

Minimal.

---

# Logo

Wordmark only.

GLYPH

Uppercase

Instrument Serif

Large tracking

No icon.

The Mandala is the icon.

---

# Hero

Structure

```
GLYPH

Commit to touching grass.

A computational medium for movement.

[Start Walking]

(animated mandala)
```

Huge whitespace.

Centered.

---

# Walking Screen

Absolutely minimal.

```
-------------------

      Mandala

      growing...

-------------------

3241 Footfalls

Golden Hour

End Walk

-------------------
```

No graphs.

No route.

No progress rings.

---

# Commit Screen

Largest screen.

The artwork occupies 70%.

Metadata occupies 30%.

Hierarchy

Artwork

↓

Commit Number

↓

Title

↓

Metadata

↓

Actions

---

# Metadata Layout

```
MC-0047

Golden Hour

3241 Footfalls

13 Fibonacci Arms

φ 1.618

112 BPM

Generated

June 27

Version 1.0
```

Everything left aligned.

---

# Animations

Use Framer Motion.

Nothing flashy.

Fade

Opacity

Scale

Rotate

Blur

Slow.

Organic.

---

# Motion Timings

Fast

200ms

Normal

400ms

Slow

800ms

Reveal

1200ms

---

# Scroll Behavior

Smooth.

Never snap.

No parallax.

No scroll hijacking.

---

# Microinteractions

Hover

1% scale

Button Press

0.98 scale

Card Hover

Border darkens slightly

No bouncing.

---

# Loading States

Skeletons.

Never spinners.

Mandala slowly blooming is preferable.

---

# Empty States

Beautiful typography.

Large whitespace.

Minimal illustration.

---

# Error States

Gentle.

Never alarming.

Example

```
Couldn't detect motion.

Try stepping outside
and walking a few meters.
```

---

# Sound

No UI sounds.

Only the procedural beat.

Silence is acceptable.

---

# Accessibility

AA contrast

Keyboard navigation

Reduced motion mode

Large touch targets

Readable typography

---

# Mobile

Everything optimized for one hand.

Bottom actions.

Large buttons.

No tiny icons.

The Mandala should remain centered.

---

# Desktop

Centered content.

Maximum width.

Lots of whitespace.

Feels like reading a beautifully typeset article.

---

# Tailwind Tokens

Container

```
max-w-7xl
```

Reading

```
max-w-3xl
```

Padding

```
px-6 md:px-10
```

Rounded

```
rounded-3xl
```

Borders

```
border-neutral-200
```

Background

```
bg-[#FAFAF8]
```

---

# Engineering Rules

Never use component libraries.

Do not use shadcn/ui.

Do not use Material UI.

Do not use Chakra.

Every component should be handcrafted.

The interface itself should become part of the identity.

---

# Codex Design Rules

If a design decision is unclear:

Choose simplicity.

If spacing feels tight:

Increase whitespace.

If color feels excessive:

Remove it.

If typography feels small:

Increase hierarchy.

If animation feels noticeable:

Slow it down.

If a feature competes with the Mandala:

Delete the feature.

---

# Final Principle

The interface should never try to impress the user.

The Mandala should.

Everything else is simply the frame around the artwork.