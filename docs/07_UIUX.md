# 07 — UI / UX Specification

> Designing an experience that disappears behind the Mandala.

Version 1.0

---

# Design Goal

GLYPH should not feel like an application.

It should feel like carrying a beautifully designed scientific instrument in your pocket.

The interface should disappear.

The Mandala should become the experience.

The user should never think

"I'm using an app."

Instead they should think

"I'm watching mathematics emerge."

---

# Experience Principles

Every screen should answer only one question.

Landing

Why does this exist?

Walk

What is happening?

Commit

What did I create?

Gallery (Future)

What have I discovered?

Nothing more.

---

# Navigation Philosophy

GLYPH should have almost no navigation.

Avoid

Sidebar

Bottom navigation

Tabbed layouts

Floating buttons

Nested menus

Instead

Landing

↓

Walk

↓

Commit

↓

Done

One flow.

One story.

---

# Information Architecture

```
Landing

↓

Permissions

↓

Optional GitHub Connect

↓

Walk

↓

Generating Commit

↓

Mandala Commit

↓

Download

↓

Share

↓

Done
```

Everything is linear.

---

# Landing Page

Purpose

Immediately communicate the philosophy.

The landing page should resemble a beautifully typeset editorial cover.

---

## Layout

```
--------------------------------------------------

                            GLYPH


                 Commit to touching grass.


      GitHub records the code you wrote.

      Glyph records the moments
      you chose to step outside.


                 [ Start Walking ]


          (animated blooming mandala)


--------------------------------------------------
```

No feature cards.

No testimonials.

No pricing.

No FAQ.

No screenshots.

The Mandala is the product.

---

# Hero Animation

A procedural Mandala slowly blooms forever.

Very slow.

Almost meditative.

One new stroke every few hundred milliseconds.

Never loops abruptly.

The user should immediately understand

"This artwork is alive."

---

# Scroll

Only one additional section.

"What is a Mandala Commit?"

Minimal editorial explanation.

Then

Start Walking.

Nothing else.

---

# Permissions Screen

Purpose

Explain why permissions exist.

Do not show browser permission dialogs immediately.

Instead

```
----------------------------------

Motion

Required

Allows Glyph to understand
your footsteps.


Sky

Required

Allows Glyph to determine
the atmosphere of your walk.


GitHub

Optional

Turn your walks into
real GitHub contributions.


            Continue

----------------------------------
```

Only after Continue

request browser permissions.

---

# GitHub Connect

Purpose

Feel delightful.

Never required.

```
----------------------------------

Touch Grass Mode

GitHub records code.

Glyph records walks.

Connect GitHub to create one
real contribution for every
Mandala Commit.

[ Connect ]

Skip

----------------------------------
```

---

# Walk Screen

This is the most important screen.

Everything else exists for this.

---

## Layout

```
──────────────────────────────────

                 324

              FOOTFALLS


             (Mandala)


Golden Hour             12 min


            End Walk

──────────────────────────────────
```

---

# Philosophy

The user should forget they are looking at a screen.

The Mandala should occupy approximately 70% of the viewport.

Metadata should fade into the background.

---

# Live Rendering

Every footfall

↓

One new point

↓

One new stroke

↓

Subtle bloom

↓

Beat

Nothing should happen unless the user moves.

The artwork grows because they walk.

---

# Footfall Counter

Large.

Centered above the Mandala.

Not tiny metadata.

Watching the number increase should feel satisfying.

---

# Sky Indicator

Small.

Bottom left.

Examples

Golden Hour

Blue Hour

Night

Morning

Simple text only.

No weather icons.

---

# Walk Timer

Bottom right.

Very small.

Muted.

---

# End Walk Button

Bottom center.

White.

Thin border.

Large radius.

Never bright.

Never red.

---

# Ending Animation

When End Walk is pressed

Everything pauses.

The beat slowly fades.

The Mandala rotates.

The geometry finishes drawing.

Bloom increases.

Metadata fades out.

Silence.

Three second reveal.

Then

Commit.

This should be emotional.

---

# Commit Reveal

This is the climax.

The artwork slowly centers.

Commit number fades in.

Then metadata.

Finally

buttons.

Never reveal everything at once.

---

# Commit Screen

Layout

```
────────────────────────────────────

MANDALA COMMIT

MC-0047

        (Artwork)

────────────────────

Golden Hour

3241 Footfalls

13 Fibonacci Arms

112 BPM

φ = 1.618

June 2026

────────────────────

Download

GitHub Commit

Share

────────────────────
```

---

# Metadata

Always left aligned.

Never centered.

Feels like museum labels.

Use monospace.

```
Generator

Phyllotaxis

Seed

AB72F1

Sky

Golden Hour

Cadence

112 BPM

Entropy

0.27

φ

1.618
```

---

# Download

Options

PNG

SVG

JSON

Future

Video

Print

Each option uses the same component.

No dropdown menus.

---

# GitHub Commit

Button text

```
Commit to GitHub
```

After success

```
✓

Committed

Contribution Graph Updated
```

No confetti.

No celebration.

Just quiet satisfaction.

---

# Share

Generate

1080×1350

Instagram

1080×1080

Square

Wallpaper

Desktop

Print

Everything generated locally.

---

# Loading States

Never show spinners.

Instead

Continue growing the Mandala.

The artwork itself becomes loading.

---

# Error States

Gentle.

Example

```
Motion unavailable.

Try taking a few steps
with your phone in your pocket.
```

No alerts.

No red banners.

---

# Empty States

No previous commits.

```
Every collection
starts with one walk.

Start your first
Mandala Commit.
```

---

# Mobile Design

Everything designed for phones.

Thumb reachable.

Large buttons.

No tiny controls.

Portrait first.

Landscape supported.

---

# Desktop

Desktop is primarily for

Viewing

Printing

Exploring

Walking still happens on mobile.

Desktop should feel like a gallery.

---

# Motion Specification

Landing

Fade + Bloom

Walk

Continuous Growth

Commit

Reveal

Gallery

Gentle Scroll

Never

Bounce

Shake

Elastic

Physics

---

# Transition Choreography

Landing

↓

Fade

↓

Permissions

↓

Fade

↓

Walk

↓

Bloom

↓

Commit

↓

Reveal

↓

Export

↓

Fade

Everything should feel inevitable.

---

# Sound Design

Silence is acceptable.

Beat only.

No button clicks.

No notification sounds.

No reward jingles.

---

# Haptics

Only three.

Walk Starts

Soft.

Walk Ends

Medium.

Commit Generated

Gentle Success.

Nothing else.

---

# Accessibility

Reduced motion.

High contrast.

Keyboard navigation.

Screen reader labels.

Readable typography.

Touch targets

≥ 44px.

---

# Delight Moments

The user notices

the Mandala growing.

The beat evolving.

The reveal.

The GitHub contribution.

The printable artwork.

Not because the app shouted.

Because it quietly respected their attention.

---

# Final Principle

Every interaction should make the user feel as though they are documenting a natural phenomenon rather than using software.

GLYPH should not reward productivity.

It should reward presence.

When the application closes,

the user should remember the walk—

not the interface.