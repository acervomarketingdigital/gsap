/**
 * CENTRALIZED GSAP MOTION VOCABULARY & CONFIGURATION
 * Extracted from the 10 reference dashboards/CRMs (GSAP 3.15.0 + Flip 3.15.0).
 * Every snippet and component MUST consume constants exclusively from this file.
 */

export type MotionIntensity = "subtle" | "default" | "expressive";

/**
 * Extracted GSAP Easing Vocabulary
 */
export const MOTION_EASE = {
  /** Primary architectural deceleration for cards, panels, bars, and route enter */
  archOut: "expo.out",
  /** Snappy UI response for table rows, counters, leading pill edge, and hover lift */
  uiOut: "power3.out",
  /** Crisp editorial cut for split heading characters */
  splitOut: "power4.out",
  /** Symmetric layout transition for Flip table sort/filter and trailing pill edge */
  flipInOut: "power3.inOut",
  /** Data series morphing (SVG paths and bar ratio updates across periods) */
  morphInOut: "expo.inOut",
  /** Continuous SVG stroke drawing and Bezier workflow bead motion */
  drawInOut: "power2.inOut",
  /** Fast exit for route leave, modal close, toast dismiss, and card discard */
  fastIn: "power2.in",
  /** Heavy panel exit for Drawer and Bottom Sheet dismissal */
  panelIn: "power3.in",
  /** Controlled physical overshoot for tilted tiles */
  springTile: "back.out(1.4)",
  /** Origin-scaled modal entrance and Kanban drop settlement */
  springModal: "back.out(1.5)",
  /** Bottom sheet drag snapback and Kanban cancel return */
  springSnap: "back.out(1.7)",
  /** Toast entrance and stamp impact */
  springToast: "back.out(1.8)",
  /** Switch thumb, floating delta pop, and bead pop */
  springThumb: "back.out(2.2)",
  /** High-energy tactile pop for clicked icons, buttons, and lane count badges */
  springPop: "back.out(3)",
  /** Mechanical elastic snapback (slide-to-unlock / auction room tremor) */
  elasticSnap: "elastic.out(1, 0.5)",
  /** Ambient sine wave for active indicators */
  ambientSine: "sine.inOut",
  /** Native CSS / WAAPI View Transition curve */
  viewTransition: "cubic-bezier(0.65, 0, 0.35, 1)",
} as const;

/**
 * Extracted Durations (in seconds)
 */
export const MOTION_DURATION = {
  /** Instant micro-feedback (hover crosshair, tooltip fade) */
  micro: 0.15,
  /** Delay before Drawer body children begin staggering in */
  drawerChildDelay: 0.12,
  /** Fast route exit of viewport-visible cards */
  routeExit: 0.18,
  /** Fast header exit on route change (0.18 * 0.8) */
  routeHeadExit: 0.144,
  /** Modal close and Kanban drag pickup */
  modalClose: 0.2,
  /** Kanban card lift on drag start */
  dragLift: 0.22,
  /** Toast exit */
  toastExit: 0.25,
  /** Scrim fade-in */
  scrimIn: 0.3,
  /** Drawer / Bottom Sheet close */
  drawerClose: 0.32,
  /** Leading edge of asymmetric clip-path pill */
  pillLead: 0.36,
  /** Form validation horizontal shake */
  errorShake: 0.42,
  /** Cross-axis edge of clip-path pill and hover lift */
  pillCross: 0.45,
  /** Modal entrance, Toast entrance, Flip table/kanban transition, and sheet snapback */
  flip: 0.5,
  /** Table row entrance, button click pop, and trailing edge of clip-path pill */
  rowEnter: 0.55,
  /** Drawer / Bottom Sheet entrance */
  drawerOpen: 0.6,
  /** Route container directional slide-in and Kanban delta drop */
  routeEnter: 0.7,
  /** Data bar ratio morph when switching time periods */
  barMorph: 0.75,
  /** Primary card / KPI entrance */
  cardEnter: 0.8,
  /** Split heading character reveal and tilted tile entrance */
  splitHeading: 0.85,
  /** Initial bar scaleY/scaleX reveal and SVG series morph */
  barEnter: 0.9,
  /** SVG stroke-dashoffset line draw and KPI tabular counter */
  counter: 1.2,
  /** Theme circular View Transition duration in milliseconds */
  themeRevealMs: 450,
  /** Load choreography gate window before hover lift is enabled (seconds) */
  loadGateWindow: 0.85,
  /** Toast auto-dismiss delay (standard / with undo action) in seconds */
  toastHold: 3.2,
  toastHoldWithAction: 5.5,
} as const;

/**
 * Extracted Staggers & Caps
 */
export const MOTION_STAGGER = {
  /** Ultra-fast stagger for viewport cards exiting on route transition */
  routeExit: 0.008,
  /** Flip onEnter stagger for newly filtered rows */
  flipEnter: 0.02,
  /** Bar update delay multiplier per bar index */
  barUpdate: 0.02,
  /** Split heading character stagger */
  splitChar: 0.022,
  /** Initial bar chart column stagger */
  barCol: 0.03,
  /** Table row and Drawer body child stagger */
  row: 0.04,
  /** Primary card and KPI grid stagger */
  card: 0.06,
  /** Tilted tile stagger */
  tile: 0.07,
  /** Workflow spine step stagger */
  spineStep: 0.08,
  /** Maximum number of table rows to stagger on initial mount */
  maxTableRows: 14,
  /** Maximum number of cards to stagger on initial mount */
  maxCards: 12,
} as const;

/**
 * Extracted Spatial Offsets & Thresholds
 */
export const MOTION_OFFSET = {
  /** Split character initial yPercent */
  splitYPercent: 115,
  /** Split character initial rotation (degrees) */
  splitRotation: 6,
  /** Card entrance initial y (px) */
  cardY: 26,
  /** Card entrance initial scale */
  cardScale: 0.985,
  /** Table row entrance initial y (px) */
  rowY: 12,
  /** Drawer body child initial y (px) */
  drawerChildY: 14,
  /** Route exit card y drop (px) */
  routeExitCardY: 8,
  /** Route exit header y lift (px) */
  routeExitHeadY: -6,
  /** Route exit container horizontal shift (px) */
  routeExitShiftX: 16,
  /** Route enter container horizontal slide (px) */
  routeEnterSlideX: 26,
  /** Hover lift y translation (px) */
  hoverLiftY: -4,
  /** Magnetic button pull multipliers */
  magneticX: 0.2,
  magneticY: 0.28,
  /** Kanban pointer drag activation threshold (px) */
  dragThresholdPx: 6,
  /** Kanban card scale & rotation while dragging */
  dragScale: 1.03,
  dragRotation: 1.8,
  /** Validation error horizontal shake keyframes (px) */
  shakeKeyframesX: [0, -8, 7, -5, 3, 0] as readonly number[],
  /** Mobile breakpoint matching tokens.css */
  mobileMaxWidthPx: 760,
} as const;

/**
 * Intensity Presets for Product Contexts
 */
export const MOTION_INTENSITY_PRESETS: Record<
  MotionIntensity,
  {
    durationScale: number;
    enableSplitHeading: boolean;
    enableMagnetic: boolean;
    enableHoverLift: boolean;
    overshootEase: string;
  }
> = {
  subtle: {
    durationScale: 0.75,
    enableSplitHeading: false,
    enableMagnetic: false,
    enableHoverLift: false,
    overshootEase: MOTION_EASE.uiOut,
  },
  default: {
    durationScale: 1,
    enableSplitHeading: true,
    enableMagnetic: false,
    enableHoverLift: true,
    overshootEase: MOTION_EASE.springModal,
  },
  expressive: {
    durationScale: 1,
    enableSplitHeading: true,
    enableMagnetic: true,
    enableHoverLift: true,
    overshootEase: MOTION_EASE.springToast,
  },
};

/**
 * Live prefers-reduced-motion query & duration wrapper `q(seconds)`
 */
const reducedMotionQuery =
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

const finePointerQuery =
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(hover: hover) and (pointer: fine)")
    : null;

export function isReducedMotion(): boolean {
  return Boolean(reducedMotionQuery?.matches);
}

export function hasFinePointer(): boolean {
  return Boolean(finePointerQuery?.matches);
}

/**
 * Returns `0` immediately when `prefers-reduced-motion: reduce` is active,
 * allowing GSAP tweens to jump to their final state on frame 0 and run `clearProps`.
 */
export function q(
  seconds: number,
  intensity: MotionIntensity = "default"
): number {
  if (isReducedMotion()) return 0;
  return seconds * MOTION_INTENSITY_PRESETS[intensity].durationScale;
}
