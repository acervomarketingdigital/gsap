---
name: skill-charts-dataviz-gsap
description: Catalog and implementation guide for building 12+ interactive editorial SVG/CSS data visualization charts (Smooth Cubic-Bezier Area/Line with ticker morphing, Stacked River Stream Chart with channel weight interpolation, Ghost Comparison Bars, 3-Layer Stacked Channel Bars, Bidirectional Flow Bars, Staircase Conversion Funnel, 2D Grid Heatmap, Interactive Shift & Season Gantt with pointer drag/resize and elastic squash-and-stretch, Radial Dials, and Stacked Progress Bars) using React 19, TypeScript, and GSAP.
---

# Data Visualization & Editorial Charts Skill (GSAP)

Use this skill when building or refactoring **analytics charts, KPI sparklines, streamgraphs, conversion funnels, heatmaps, or interactive Gantt timelines** for dashboards and CRMs. All patterns are extracted from the 14 reference demos (`Tolva`, `Veyla`, `Grovia`, `Brisko`, `Calda`, `Halvi`, `Ignara`, `Kavora`, `Marlo`, `Raveno`, `Fragio`, `Groova`, `Levena`, `Kelpo`).

## 1. Non-Negotiable Architecture Rules

1. **Zero Heavy Charting Libraries**: All 14 reference demos build their charts with lightweight native SVG (`viewBox="0 0 680 230"`) and CSS Grid/Flexbox orchestrated by GSAP. Do not pull in Chart.js, Recharts, or D3 for standard product visualizations.
2. **Cardinal / Catmull-Rom to Cubic-Bezier Path Math (`f(pts)`)**:
   - Convert discrete `[x, y]` points into smooth SVG paths using tension `1/6`:
     - `cp1 = [p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6]`
     - `cp2 = [p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6]`
3. **Batched `gsap.ticker` Path Morphing**:
   - When switching between time ranges or metrics of equal point count, never unmount the SVG. Tween a proxy `{ k: 0 → 1, duration: 0.9, ease: "expo.inOut" }`, interpolate `[x, y]` coordinates per frame, and batch `setAttribute("d", ...)` writes on `gsap.ticker`.
4. **Ghost Comparison Context**:
   - Product charts always compare current performance against a benchmark (previous period, target, or record line) using muted `.bars__ghost`, dashed `.area__line--prev`, hatched `.stair__ghost`, or `.stack__best`.
5. **Interactive Physics on Timelines**:
   - Gantt bars (`.gbar` / `.gt__bar`) support pointer drag (`move`) and grip resize (`end`) snapped to `0.25h` (15m) or `1d`, finishing with an elastic squash-and-stretch (`scaleY: 0.78 → 1, scaleX: 1.03 → 1, duration: 0.55, ease: "elastic.out(1, 0.45)"`).

## 2. On-Demand References & Snippets

- **Full 12-Chart Catalog & Mathematical Formulas**: [chart-catalog.md](file:///c:/Users/mathu/Downloads/Novos%20Infoprodutos/SKILL%20GSAP/skill-charts-dataviz-gsap/references/chart-catalog.md)
- **Area Chart + Stacked River Stream Chart**: [area-river-charts.tsx](file:///c:/Users/mathu/Downloads/Novos%20Infoprodutos/SKILL%20GSAP/skill-charts-dataviz-gsap/snippets/area-river-charts.tsx)
- **Ghost Bars, 3-Layer Stacked Bars, Staircase Funnel & 2D Heatmap**: [bars-funnel-heatmap.tsx](file:///c:/Users/mathu/Downloads/Novos%20Infoprodutos/SKILL%20GSAP/skill-charts-dataviz-gsap/snippets/bars-funnel-heatmap.tsx)
- **Interactive Shift & Season Gantt Chart (Drag/Resize + Cascade)**: [interactive-gantt.tsx](file:///c:/Users/mathu/Downloads/Novos%20Infoprodutos/SKILL%20GSAP/skill-charts-dataviz-gsap/snippets/interactive-gantt.tsx)

## 3. Validation Checklist

- [ ] Does SVG path morphing batch `setAttribute("d")` inside `requestAnimationFrame` / `gsap.ticker`?
- [ ] Do vertical bar charts animate `scaleY` with `transform-origin: 50% 100%` instead of `height`?
- [ ] Does the 2D heatmap use `stagger: { each: 0.012, grid: [rows, cols], from: "start" }`?
- [ ] Do all animations bypass or collapse to `duration: 0` when `prefers-reduced-motion: reduce` is active?
