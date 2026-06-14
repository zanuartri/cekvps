---
version: alpha
name: CekVPS Dark
description: A dark, high-contrast VPS-comparison experience with vivid purple accents and rounded, utility-first components. Adapted from the Hostinger Dark system.
colors:
  primary: "#673DE6"
  primary-hover: "#7B66FF"
  secondary: "#FFFFFF"
  tertiary: "#222225"
  neutral: "#121212"
  surface: "#FFFFFF"
  surface-raised: "#1A1A1A"
  on-surface: "#FFFFFF"
  on-surface-muted: "#B7B7BD"
  outline: "#7B66FF"
  success: "#30A46C"
  error: "#E5484D"
typography:
  headline-display:
    fontFamily: "DM Sans"
    fontSize: "56px"
    fontWeight: 700
    lineHeight: "60px"
    letterSpacing: "-0.5px"
  headline-lg:
    fontFamily: "DM Sans"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: "42px"
    letterSpacing: "-0.3px"
  headline-md:
    fontFamily: "DM Sans"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: "30px"
    letterSpacing: "-0.2px"
  body-lg:
    fontFamily: "DM Sans"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: "28px"
  body-md:
    fontFamily: "DM Sans"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  body-sm:
    fontFamily: "DM Sans"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  label-md:
    fontFamily: "DM Sans"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: "20px"
  mono:
    fontFamily: "JetBrains Mono"
    note: "Reserved for prices, specs, and tabular numbers."
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 24px
  full: 9999px
spacing:
  xs: 6px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 64px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.secondary}"
    hover: "{colors.primary-hover}"
    rounded: "{rounded.md}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    border: "{colors.outline}"
    rounded: "{rounded.md}"
  card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-surface}"
    border: "rgba(255,255,255,0.10)"
    rounded: "{rounded.xl}"
    padding: "24px"
  card-emphasis:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.xl}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-surface}"
    focusOutline: "{colors.outline}"
    rounded: "{rounded.lg}"
  chip:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-surface}"
    activeBackground: "{colors.primary}"
    rounded: "{rounded.full}"
  logo-tile:
    backgroundColor: "{colors.surface}"
    note: "White contrast island so provider logos read on dark surfaces."
    rounded: "{rounded.xl} | full"
---

# CekVPS Dark

## Overview
CekVPS Dark is a developer-first comparison tool that feels fast, focused, and low-friction. The audience is "vibe coder" engineers who want to find the cheapest VPS that fits their app in seconds, then deploy. The mood is confident and modern: a dark neutral canvas, crisp white text, and a vivid purple accent that drives every primary action. Density lives where it matters (the comparison list); everything else breathes.

## Colors
- **Primary (#673DE6):** Brand purple for primary buttons, active states, emphasis cards, and the logomark. Energetic and tech-forward without going neon.
- **Primary hover (#7B66FF):** Lighter violet for hover states, focus outlines, and secondary emphasis. Gives interactive elements a subtle lift.
- **Neutral (#121212):** The dominant page background; the dark-mode foundation that makes accents pop.
- **Surface raised (#1A1A1A):** Cards, list containers, tools, and inputs sit on this lifted dark panel, separated by hairline outlines instead of heavy shadows.
- **Tertiary (#222225):** Spec chips and inset surfaces.
- **On-surface (#FFFFFF) / muted (#B7B7BD):** Pure white for headings and key data; muted gray for helper text, labels, and secondary copy.
- **Outline (#7B66FF):** Borders/focus accents keep brand violet even on transparent elements.
- **Success (#30A46C) / Error (#E5484D):** "Termurah"/"Gratis" use success-tinted accents; errors reserved for validation. Used sparingly so purple stays dominant.
- **White as a contrast island:** Pure white is reserved for provider **logo tiles** and the donate button on purple cards — small, bright islands on the dark canvas.

## Typography
**DM Sans** across headings, body, navigation, and buttons. Headlines are large and slightly tightened with negative tracking; body stays at 16px/24px for comfortable reading. **JetBrains Mono** is reserved for prices, specs, and any tabular number, reinforcing the technical, data-driven feel. Hierarchy comes from size, weight, and contrast — not uppercase or wide tracking.

## Layout & Spacing
A wide marketing-style top (sticky nav + two-column hero) flows into a single dense comparison surface, then tools (calculator, deploy cost), donate, and FAQ. Spacing follows a 6 / 16 / 24 / 32 / 64 rhythm: tight gaps for icon+text and chips, larger steps between major sections. Content respects a max width (~1152px) with generous side gutters.

## Elevation & Depth
Depth comes from tonal layering and hairline outlines, not shadows. Raised surfaces (#1A1A1A) on the #121212 canvas, framed by `rgba(255,255,255,0.10)` borders and rounded corners, do the hierarchy work. The hero uses a faint purple grid + radial haze behind an animated SVG network; the donate block uses a saturated purple emphasis card.

## Shapes
Rounded and friendly: **8px** for interactive controls (buttons, small cards), **12px** for inputs, **24px** for large surfaces/cards, full-pill for chips, badges, and logo avatars. Nothing sharp or utilitarian.

## Components
- **Primary button:** purple fill, white text, 8px radius, roomy padding; hover → #7B66FF.
- **Outline button:** transparent with violet border/text; clearly actionable but secondary.
- **Cards:** #1A1A1A, 24px radius, hairline border, minimal shadow. Use the purple **emphasis card** for promotional/donate moments.
- **Search input:** raised dark field, 12px radius, muted placeholder, violet focus ring — treated as a primary utility object.
- **Chips / filter pills:** compact, pill-shaped; active = purple fill, idle = raised dark with muted text.
- **Spec chips:** tertiary surface, mono text, for vCPU/RAM/disk/bandwidth.
- **Provider logo tile:** white rounded island holding the brand logo (`object-contain`), with automatic fallback to a gradient initial.
- **Navigation:** DM Sans at body size, restrained; logo left, links centered, currency toggle + purple Dukung CTA right.

## Do's and Don'ts
- Do keep primary actions purple and highly legible on both dark and white surfaces.
- Do rely on contrast and tonal layering instead of heavy shadows.
- Do keep prices/specs in JetBrains Mono for fast scanning.
- Do reserve white surfaces for logo tiles and on-purple buttons (contrast islands).
- Don't introduce warm/saturated secondary hues that compete with brand purple.
- Don't make controls small, sharp, or dense; keep tap targets generous.
- Don't overuse borders on dark surfaces unless they serve structure.
- Don't shift typography into serif/condensed styles; the brand depends on friendly sans-serif clarity.
