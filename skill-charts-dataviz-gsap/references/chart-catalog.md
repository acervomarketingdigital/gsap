# Data Visualization & Chart Catalog (Extracted from 14 Demos)

Every mathematical formula, SVG structure, CSS variable recipe, and GSAP choreography below was inspected directly from the compiled `charts-*.js`, `gantt-*.js`, `plan-*.js`, and `index-*.css` bundles across the 14 demos.

---

## 1. Smooth Cubic-Bezier Area & Comparison Chart (`.area`)
**Sources**: `Tolva`, `Veyla`, `Grovia`, `Brisko`, `Calda`, `Halvi`, `Ignara`, `Kavora`, `Marlo`, `Fragio`, `Groova`, `Levena`, `Kelpo` (`charts-*.js`)

### Cardinal Spline to Cubic-Bezier Formula (`f(pts)`)
```ts
export function smoothSvgPath(pts: [number, number][]): string {
  if (!pts.length) return '';
  if (pts.length === 1) return `M ${pts[0][0]} ${pts[0][1]}`;
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}
```

### GSAP Choreography
- **Initial Mount**:
  - `.area__line`: `strokeDasharray = totalLength`, `gsap.fromTo(line, { strokeDashoffset: totalLength }, { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" })`
  - `.area__fill`: `gsap.fromTo(fill, { opacity: 0 }, { opacity: 1, duration: 0.9, delay: 0.3, ease: "power2.out" })`
- **Series Switch (Equal Length)**:
  - Tween proxy `{ k: 0 }` to `{ k: 1, duration: 0.9, ease: "expo.inOut" }`.
  - Interpolate each point `x = a.x + (b.x - a.x) * k`, `y = a.y + (b.y - a.y) * k` and update `d` on `line`, `fill`, and dashed `prev` paths inside a batched frame write.
- **Hover Crosshair**:
  - Nearest index calculated from `(clientX - rect.left) / rect.width`.
  - Tooltip `.area__tip` flipped left (`is-right`) when `index > length * 0.68`.

---

## 2. Stacked Multi-Channel River / Stream Chart (`.river`)
**Source**: `Kelpo` (`charts-vtKYPc5s.js` -> `g`, `index-DBW2fdw8.css`)

- **Purpose**: Displays cumulative multi-channel reach over time (`ig`, `tt`, `yt`, `li`, `nl`) with interactive channel filter pills and floating viral-post markers (`.river__pin`).
- **Channel Weight Interpolation (`wt`)**:
  - Each channel `k` has a weight `wt[k]` (`1` when active, `0` when toggled off).
  - Toggling a channel pill tweens `wt` via `gsap.to(proxy, { t: 1, duration: 0.85, ease: "expo.inOut" })`, recalculating the cumulative stacked bands `[low, up]` on every frame so disabled bands smoothly flatten into the stream instead of popping out.
- **Band Path Builder**:
  - Top edge uses `smoothSvgPath(up)`, followed by `L` to the right-most lower point, then `smoothSvgPath(low.slice().reverse())` back to start, closed with `Z`.
- **Viral Post Pins (`.river__pin`)**:
  - Positioned at `left: M(post.i)px`, `top: y(cumulativePeak) - 30px`.
  - Mount animation: `fromTo(".river__pin", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, delay: 0.55, stagger: 0.07, ease: "back.out(2.2)" })`.

---

## 3. Ghost Comparison Vertical Bars (`.bars`)
**Sources**: `Tolva`, `Veyla`, `Grovia`, `Brisko`, `Halvi`, `Fragio` (`charts-*.js` -> `p`)

- **Structure**:
  - `.bars__col`: `height: 170px; position: relative`
  - `.bars__ghost`: `position: absolute; inset: auto 4% 0; height: 100%; background: var(--card-3); border-radius: 6px 6px 2px 2px; transform-origin: 50% 100%` (previous period benchmark)
  - `.bars__bar`: `position: absolute; inset: auto 18% 0; height: 100%; background: var(--data); border-radius: 6px 6px 2px 2px; transform-origin: 50% 100%` (current period)
  - Peak column receives `.is-peak` (`background: var(--accent)`).
- **GSAP Choreography**:
  - Mount: `gsap.fromTo(bar, { scaleY: 0 }, { scaleY: val / max, duration: 1.0, delay: 0.15 + i * 0.04, ease: "expo.out" })`
  - Ghost mount: `gsap.fromTo(ghost, { scaleY: 0 }, { scaleY: prev / max, duration: 0.9, delay: 0.05 + i * 0.03, ease: "expo.out" })`
  - Range update: `gsap.to(bar, { scaleY: val / max, duration: 0.75, delay: i * 0.02, ease: "expo.inOut" })`

---

## 4. 3-Layer Stacked Channel Bars + Record Benchmark (`.stack`)
**Source**: `Groova` (`charts-BnJIUDun.js` -> `p`, `index-CwA40uHP.css`)

- **Purpose**: Breaks down daily revenue across 3 channels (`Counter`, `Web Drop`, `Discogs`) while showing a dashed horizontal record line (`.stack__best`).
- **Layer Stacking Technique**:
  - Instead of stacking flex children that cause layout reflow, all 3 layers are `position: absolute; inset: auto 14% 0; height: 100%; transform-origin: 50% 100%`.
  - Layer 0 (total cumulative `c0 + c1 + c2`) renders at the back; Layer 1 (`c0 + c1`) renders in the middle; Layer 2 (`c0`) renders in front, separated by `box-shadow: inset 0 2px 0 var(--card)`.
  - Each layer animates `scaleY` independently (`duration: 1.05, delay: 0.08 + i * 0.035 + layerIdx * 0.04, ease: "expo.out"`).

---

## 5. Bidirectional Cashflow Bars (`.flow`)
**Source**: `Halvi` (`charts-D3mN08hB.js` -> `m`)

- **Structure**: Zero baseline across the vertical center (`50%`).
- **Inflow (`.flow__in`)**: Grows upward from baseline (`bottom: 50%; transform-origin: 50% 100%`).
- **Outflow (`.flow__out`)**: Grows downward from baseline (`top: 50%; transform-origin: 50% 0%`).

---

## 6. Staircase Conversion Funnel with Drop-Off Badges (`.stair`)
**Source**: `Groova` (`charts-BnJIUDun.js`, `index-CwA40uHP.css`)

- **Structure**:
  - N columns (`grid-template-columns: repeat(N, 1fr); gap: 14px`).
  - `.stair__plot`: `height: 178px; background: linear-gradient(180deg, transparent, color-mix(in oklab, var(--card-2) 60%, transparent)); border-bottom: 1px solid var(--hairline)`.
  - `.stair__ghost`: Hatched full-funnel reference (`background: repeating-linear-gradient(135deg, color-mix(in oklab, var(--fg) 5%, transparent) 0 6px, transparent 6px 12px)`).
  - `.stair__bar`: Gradient column (`background: linear-gradient(180deg, var(--stair-c), color-mix(in oklab, var(--stair-c) 72%, var(--card)))`).
  - `.stair__prev`: Dashed horizontal benchmark line (`border-top: 1.5px dashed color-mix(in oklab, var(--fg) 38%, transparent)`).
  - `.stair__conv`: Conversion percentage pill straddling the gap between column `i-1` and `i` (`position: absolute; left: -7px; top: 58%; translate: -50% -50%; z-index: 3`).

---

## 7. 2D Grid Heatmap with Peak Ring (`.heat`)
**Sources**: `Groova`, `Fragio`, `Kelpo`, `Kavora` (`charts-*.js` -> `x` / `m`)

- **Color Formula**:
  - `background: color-mix(in oklab, var(--data) ${Math.round(14 + (val / max) * 86)}%, var(--card-3))`
  - Peak cell receives `.is-peak` (`box-shadow: 0 0 0 2px var(--card), 0 0 0 4px var(--data)`).
- **GSAP 2D Grid Stagger**:
  ```ts
  gsap.fromTo(
    cells,
    { scale: 0, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: 0.6,
      ease: 'back.out(2.2)',
      stagger: { each: 0.012, grid: [rows, cols], from: 'start' },
    }
  );
  ```

---

## 8. Interactive 2D Shift & Season Gantt Chart (`.gantt` / `.gt`)
**Sources**: `Levena` (`gantt-uQfIaT4v.js`) & `Fragio` (`plan-BWpkmSaM.js`)

- **Features**:
  1. **Zoom Modes**: `Full day (6–24h)` / `Morning` / `Evening` (in `Levena`) or `Full year` / `H1` / `H2` / `Quarter` (in `Fragio`). Switching zoom captures `getBoundingClientRect()` before state update and FLIP-animates `x` and `.gbar__bg` `scaleX` (`duration: 0.7, ease: "expo.inOut"`).
  2. **Coverage Histogram Strip (`.gcov`)**: Mini bar strip above the timeline showing staff/batch coverage per slot (`is-under` turns `--danger`, `is-over` turns `--warn`).
  3. **Pointer Drag (`move`) & Grip Resize (`end`)**:
     - Snaps to `0.25` (15 min) or `1` day.
     - In `Fragio`, dragging a phase (`Maceration`, `Maturation`, `Filling`, `Launch`) automatically cascades `+delta` days to all downstream phases in the same fragrance line and redraws orthogonal rounded SVG dependency connectors (`M x1 y1 L mx y1 Q ...`).
  4. **Drop Physics**:
     - Valid drop: Tweens from pointer offset to `0` (`duration: 0.42, ease: "power3.out"`) + elastic squash-and-stretch (`fromTo(bar, { scaleY: 0.78, scaleX: 1.03 }, { scaleY: 1, scaleX: 1, duration: 0.55, ease: "elastic.out(1, 0.45)" }, 0.28)`).
     - Conflict (overlap on same person): Shakes horizontally and snaps back (`back.out(1.8)`).

---

## 9. Additional Specialized Micro-Charts
- **Stacked Proportional Bar (`.tstack` in `Veyla`, `.aging__bar` in `Halvi`, `. funnel__bar` in `Fragio`)**: Flex row of segments with `flexGrow` animated via GSAP (`duration: 0.9, ease: "expo.out", stagger: 0.06`).
- **Beads Matrix (`.beads` in `Ignara`)**: Multi-row dot matrix where each bead scales in with `back.out(2)` based on intensity threshold.
- **270° Radial Dial & Ring Gauge (`.dial` & `.ring` in `Calda`, `Marlo`, `Fragio`)**: SVG `<circle>` with `strokeDasharray` and `strokeDashoffset` tweened from circumference to `circ * (1 - pct)`.
