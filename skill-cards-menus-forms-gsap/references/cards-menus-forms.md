# Cards, Menus & Forms Reference (Extracted from 14 Demos)

All CSS tokens, layout grids, and GSAP choreographies below were inspected directly from `Fragio`, `Groova`, `Levena`, `Kelpo`, and the original 10 reference demos.

---

## PART 1: EDITORIAL CARDS

### 1.1 Tinted Pastel KPI Tiles with Sparklines (`.kpi--1..4`)
**Sources**: `Fragio`, `Groova`, `Levena`, `Kelpo` (`index-*.css`)

| Token | Light Mode (`.kpi--1..4`) | Dark Mode (`[data-theme="dark"]`) |
|---|---|---|
| `--tile-1` | `#F6DCE0` / `#F3E4F8` (Blush / Lilac) | `#2B1E23` / `#261E2E` |
| `--tile-2` | `#DCEEE2` / `#DCF2E4` (Sage / Mint) | `#1D2A22` / `#192922` |
| `--tile-3` | `#F8E9CE` / `#FBF0CF` (Ochre / Butter) | `#2C2618` / `#2B2516` |
| `--tile-4` | `#E3DFF6` / `#DDEBF8` (Lavender / Sky) | `#231F2D` / `#1B2430` |

- **Anatomy**:
  - `.kpi__head`: Eyebrow label (`font-size: 12.5px; font-weight: 500`) + circular `.kpi__ico` (`width: 30px; height: 30px; border-radius: 8px; background: #ffffff8c`).
  - `.kpi__val`: Display metric (`font-size: clamp(26px, 2.5vw, 34px); letter-spacing: -0.03em; font-variant-numeric: tabular-nums`).
  - `.kpi__foot`: Translucent delta pill (`.delta`, `background: #ffffff9e; border-radius: 999px; padding: 3px 8px; font-size: 11.5px`) + SVG sparkline (`.spark`, `width: 92px; height: 30px`).
- **GSAP Choreography**:
  - Staggered card entrance: `fromTo(cards, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.06, ease: "power3.out" })`.
  - Value counter: Tween proxy `{ val: 0 → target, duration: 1.1, ease: "power2.out" }`.
  - Sparkline draw: `strokeDashoffset: len → 0 (duration: 1.0, delay: 0.2, ease: "power2.out")`.

### 1.2 Noir Contrast Hero Card (`.card--noir`)
**Sources**: `Tolva`, `Veyla`, `Brisko`, `Halvi`
- Always renders with dark ink surface (`background: var(--noir, #181614); color: var(--noir-fg, #FAF6F0)`) even in light mode, providing visual anchor weight for primary treasury/runway/SLA metrics.

### 1.3 Vinyl Sleeve & Media Thumb Cards (`.sleeve` in `Groova`, `.thumb` in `Kelpo`)
- **`.sleeve`**: Square album jacket (`border-radius: 8px`) with a radial-gradient vinyl disc (`.sleeve__disc`) peeking out `right: -14%` that slides out further (`translateX(8px) rotate(24deg)`) on card hover.

---

## PART 2: MENUS, COMMAND PALETTES & POPOVERS

### 2.1 Global Command Palette `⌘K` with `Shift+Enter` Quick Actions (`.finder`)
**Sources**: All 13 React dashboard demos (`_app_tail.js`)

- **Trigger**: `⌘K` / `Ctrl+K` or clicking `.searchbtn` in the topbar.
- **Open Animation**:
  - Backdrop: `opacity: 0 → 1 (0.2s)`
  - Panel: `fromTo(panel, { y: -18, scale: 0.97, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.6)" })`
- **Search Filter Stagger**:
  - On query change, staggers first 8 `.finder__item` rows (`fromTo(items, { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.22, stagger: 0.02, ease: "power2.out" })`).
- **Dual-Action Keyboard Contract**:
  - `Enter`: Runs primary action (navigates to entity/page or opens detail drawer).
  - `Shift+Enter`: Runs secondary inline quick action (`item.alt.run()`, e.g., `Restock +10`, `Log 20m break`, `Duplicate post`) displayed as a `.finder__quick` button inside the focused row.

### 2.2 Notification Bell Shake & `.notices` Popover (`Xt` / `Qt`)
**Sources**: `Fragio`, `Groova`, `Levena`, `Kelpo`

- **Bell Ring Keyframes** (triggered whenever unread count increases):
  ```ts
  gsap.to(bellSvg, {
    keyframes: { rotation: [0, 16, -14, 10, -6, 0] },
    duration: 0.8,
    ease: 'power2.out',
    transformOrigin: '50% 10%',
  });
  gsap.fromTo(badgeEl, { scale: 0.4 }, { scale: 1, duration: 0.6, ease: 'back.out(3)' });
  ```
- **Popover Entrance**:
  - `.notices`: `fromTo(pop, { y: -8, scale: 0.96, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.35, ease: "back.out(1.8)" })`
  - `.notices__item`: `fromTo(items, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out", stagger: 0.04 })`

### 2.3 Live Time-Clock Topbar Pill & Popover (`.clockpill` + `.clockpop`)
**Source**: `Levena` (`index-DGb1a-7p.js`, `index-C6Mde3L_.css`)

- **States**: `on` (green pulsing dot `05:42 · On shift`), `break` (amber dot `On break`), `out` (accent dot `Clocked out`).
- **Popover (`.clockpop`)**: `280px` floating card with 3-column `.clockpop__stats` (`Worked today`, `Break`, `In since`) and context-aware action buttons (`Start break` / `End break`, `Clock out` / `Clock in`).

---

## PART 3: FORMS & INTERACTIVE CONTROLS

### 3.1 Multi-Channel Composer with Live Social Card Preview (`.compose` + `.pv`)
**Source**: `Kelpo` (`index-DGb1a-7p.js`, `index-DBW2fdw8.css`)

- **Layout**: `grid-template-columns: minmax(0, 1fr) 248px; gap: 22px`.
- **Dynamic Character Limit**: Computes `maxChars = Math.min(...selectedChannels.map(c => c.limit))` (e.g., X/Twitter `280`, LinkedIn `1300`, Instagram `2200`). Counter turns `--warn` at `>85%` and `--danger` when exceeded.
- **Sticky Live Preview (`.pv`)**: Updates channel badge, handle, caption, media aspect ratio (`4:5`, `9:16`, `16:9`, `1:1`), and scheduled timestamp in real time as the user types.

### 3.2 Dynamic Line-Item Picker & Stepper (`.olines` / `.sale`)
**Sources**: `Fragio` (Wholesale Order Modal), `Groova` (Record Counter Sale Modal)

- **Stepper Control (`.stepper`)**: `−` / `qty` / `+` pill (`border: 1px solid var(--hairline); border-radius: 8px`) with tabular numerals and live row subtotal + order grand total calculation.
- **Empty/Invalid Shake**: Submitting with 0 items or empty required input shakes the container (`keyframes: { x: [0, -7, 7, -5, 5, -2, 0] }, duration: 0.36`).

### 3.3 Responsive Role Permission Matrix (`.perm`)
**Source**: `Levena` (`settings-BF8A8u2u.js`, `settings-cL29hW-R.css`)

- **Desktop**: CSS Grid `grid-template-columns: 220px repeat(N, minmax(84px, 1fr))` with role header badges and `.switch` toggles per cell.
- **Mobile (`<=760px`)**: Hides `.perm__head`, turns each `.perm__row` into a stacked card, and injects role names via `.perm__cell::before { content: attr(data-label) }`.
