---
name: skill-cards-menus-forms-gsap
description: Catalog and implementation guide for building editorial Cards (Tinted Pastel KPI tiles with sparklines, Noir Hero cards, Vinyl Sleeve & Gradient Media cards), Menus (Command Palette ⌘K with Shift+Enter quick actions, Notification Bell with keyframe ring + popover, Live Time-Clock Pill & Popover, Context Menus), and Forms (Multi-Channel Composer with live preview, POS Sale Cart & Line-Item Stepper, Responsive Role Permission Matrix, Custom GSAP Sliders, and Validation Shake) using React 19, TypeScript, and GSAP.
---

# Cards, Menus & Forms Skill (GSAP)

Use this skill when building or refactoring **metric KPI cards, media/catalog cards, command palettes (`⌘K`), notification popovers, time-clock widgets, multi-step composers, POS line-item forms, or permission matrices** for dashboards and CRMs. All patterns are extracted from the 14 reference demos (`Tolva`, `Veyla`, `Grovia`, `Brisko`, `Calda`, `Halvi`, `Ignara`, `Kavora`, `Marlo`, `Raveno`, `Fragio`, `Groova`, `Levena`, `Kelpo`).

## 1. Non-Negotiable Architecture Rules

1. **Tinted Pastel KPI Tiles (`.kpi--1..4`)**:
   - In light mode, KPI cards use warm editorial pastel surfaces (`--tile-1` blush/rose, `--tile-2` sage/mint, `--tile-3` butter/ochre, `--tile-4` lavender/plum) with translucent white delta pills (`#ffffff9e`). In dark mode, they shift to deep muted jewel tones (`#2b1e23`, `#1d2a22`, `#2c2618`, `#231f2d`) with `#00000040` delta pills.
2. **Command Palette (`⌘K` `.finder`) with `Shift+Enter` Secondary Action**:
   - Opens with `fromTo(panel, { y: -18, scale: 0.97, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.6)" })`.
   - Active row exposes both `Enter` (navigate/open) and `Shift+Enter` (inline quick action button `.finder__quick`, e.g. `Log waste`, `Restock +10`, `Clock in`).
3. **Notification Bell Keyframe Ring (`Xt`)**:
   - When unread count increments, ring the bell SVG using `keyframes: { rotation: [0, 16, -14, 10, -6, 0] }, duration: 0.8, ease: "power2.out", transformOrigin: "50% 10%"` and pop `.ibtn__badge` with `back.out(3)`.
4. **Live-Preview & Validation Physics on Forms**:
   - Forms with external impact (social post composer, POS checkout, batch creation) pair the left input column with a sticky live-preview card on the right (`grid-template-columns: minmax(0, 1fr) 248px`).
   - Invalid submission triggers a horizontal keyframe shake (`[0, -7, 7, -5, 5, -2, 0]`, `0.36s`) on the offending field or empty cart—never `window.alert()`.

## 2. On-Demand References & Snippets

- **Full Component Reference (Cards, Menus, Forms)**: [cards-menus-forms.md](file:///c:/Users/mathu/Downloads/Novos%20Infoprodutos/SKILL%20GSAP/skill-cards-menus-forms-gsap/references/cards-menus-forms.md)
- **Cards Showcase (Tinted KPI Tiles, Noir Card, Vinyl Sleeve Card)**: [cards-showcase.tsx](file:///c:/Users/mathu/Downloads/Novos%20Infoprodutos/SKILL%20GSAP/skill-cards-menus-forms-gsap/snippets/cards-showcase.tsx)
- **Menus & Popovers (`⌘K` Command Palette, Bell + Notices Popover, Time-Clock Popover)**: [menus-command-palette.tsx](file:///c:/Users/mathu/Downloads/Novos%20Infoprodutos/SKILL%20GSAP/skill-cards-menus-forms-gsap/snippets/menus-command-palette.tsx)
- **Forms & Interactive Controls (Multi-Channel Composer + Live Preview, Line-Item Stepper, Permission Matrix)**: [forms-controls.tsx](file:///c:/Users/mathu/Downloads/Novos%20Infoprodutos/SKILL%20GSAP/skill-cards-menus-forms-gsap/snippets/forms-controls.tsx)

## 3. Validation Checklist

- [ ] Are KPI numbers using `font-variant-numeric: tabular-nums` and animated via a proxy object on mount/range change?
- [ ] Does the Command Palette support `⌘K` / `Ctrl+K`, `↑`/`↓`, `Enter`, `Shift+Enter`, and `Escape`?
- [ ] Do popovers and modals close on outside click and `Escape` with exit tweens (`duration: 0.18, ease: "power2.in"`)?
- [ ] Are all user notifications rendered via non-blocking Toasts or inline validation shakes (zero `window.alert`)?
