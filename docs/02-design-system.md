# Fin-Twin (Financial Twin) — Design System ("Zelt" Warm Editorial Style)

Applied to the **Fin-Twin** finance dashboard app. Full original reference was a style guide for an
HR platform called Zelt — the tokens below are the same system, adapted for this app's needs.

## Core feel
Warm, editorial, paper-like. Not a cold enterprise dashboard. Cream/parchment canvas,
near-black ink text, a single honey-amber accent reserved for primary actions only.
Flat surfaces, hairline borders, no drop shadows anywhere.

## Colors
| Token | Value | Use |
|---|---|---|
| `--color-ink` | `#121718` | primary text, icon strokes, hairline borders |
| `--color-paper` | `#ffffff` | elevated card surfaces, button text on amber |
| `--color-linen` | `#f6f3ef` | card backgrounds, soft inset panels |
| `--color-parchment` | `#e4e0dd` | page canvas background |
| `--color-graphite` | `#2f2f2f` | inverted dark surface, used sparingly (e.g. one contrast section) |
| `--color-slate` | `#444444` | muted secondary utility surfaces |
| `--color-honey` | `#ffcd6d` | THE single accent — primary action buttons only |
| `--color-apricot` | `#ffe2aa` | soft highlight backgrounds, tags/badges — never the primary CTA |

**Rule: Honey appears on exactly one element per view — the primary action.** Everything
else stays in the ink/paper/linen/parchment neutral range. Do not introduce a second
saturated color (no blue/green/red for charts — see chart guidance below).

## Typography
- Font: system sans (Inter as substitute), weights 300/400/500/700
- Body text: 16px, weight 400, line-height 1.4
- Headings: weight 500/700, tight negative letter-spacing at larger sizes
- Scale: caption 12px → body 16px → subheading 18px → heading-sm 24px → heading 32px → heading-lg 43px → display 76px (display size likely unused in a dashboard app — reserve for a marketing/landing page only, if one exists)

## Shape & spacing
- Border radius: **12px on buttons, cards, nav, tags**; 4px only for tiny elements; never below 8px on any interactive element
- No drop shadows, anywhere — elevation is communicated by surface fill progression (Parchment → Linen → Paper) plus a 1px Ink hairline border at ~8% opacity
- Base spacing unit: 4px. Card padding 24–32px. Section gaps generous (this is a spacious, not dense, layout)

## Components (as applied to this app)

**Primary button** (e.g. "Save entry", "Send reminder"): Honey fill, Ink text, 16px weight 500, 12px radius, 16px/24px padding, no border, no shadow.

**Secondary/ghost button** (e.g. "Cancel", "Edit"): transparent fill, 1px Ink border, Ink text, 12px radius.

**Card** (dashboard stat cards, dump confirmation cards, people list items): White or Linen fill, 12px radius, 1px Ink hairline border at low opacity, 24–32px padding, no shadow.

**Pill tag/badge** (category labels): Apricot background, Ink text, 13px weight 500, 12px radius, 4px/12px padding.

**Icons:** outlined, 1.5px stroke, Ink color, 16–24px, no fill, no multicolor.

## Charts (dashboard-specific — not in the original Zelt reference, extrapolated to match its rules)
- Use shadcn/ui's chart components (a themed wrapper around Recharts) so charts inherit the same neutral palette
- Category breakdown / trend charts should stay within the ink/parchment/linen/apricot family for bars or lines — reserve Honey for highlighting one specific data point if needed (e.g. the current month vs. faded prior months), not for a full multi-color category palette
- Avoid introducing a rainbow palette per category — if categories need to be visually distinguished, use varying opacity/shades of Ink or a light Apricot/Linen alternation rather than saturated hues

## Do
- Use Honey for exactly one primary action per view
- 12px radius everywhere interactive, hairline borders instead of shadows for elevation
- Keep body text 16–18px, generous spacing, editorial not dense

## Don't
- No second saturated color (no blue/purple/green accents)
- No drop shadows on any surface
- No corners below 8px on interactive elements
