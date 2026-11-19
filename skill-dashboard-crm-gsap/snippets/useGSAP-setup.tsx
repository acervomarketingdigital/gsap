import { useRef, useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";
import {
  MOTION_DURATION,
  MOTION_EASE,
  MOTION_INTENSITY_PRESETS,
  MOTION_OFFSET,
  MOTION_STAGGER,
  hasFinePointer,
  isReducedMotion,
  q,
  type MotionIntensity,
} from "../assets/motion.config";

gsap.registerPlugin(Flip, useGSAP);

export { gsap, Flip, useGSAP };

/**
 * Shared frame-write queue drained once per GSAP ticker frame (`To`/`zn` pattern)
 */
const frameWriteQueue = new Set<() => void>();
let tickerBound = false;

function flushFrameWrites(): void {
  frameWriteQueue.forEach((fn) => fn());
  frameWriteQueue.clear();
}

export function scheduleFrameWrite(fn: () => void): void {
  frameWriteQueue.add(fn);
  if (!tickerBound) {
    tickerBound = true;
    gsap.ticker.add(flushFrameWrites);
  }
}

/**
 * Global load gate (`So.v` pattern) that prevents hover-lift tweens from
 * interrupting the initial card entrance choreography.
 */
export const loadGate = {
  ready: false,
};

/**
 * Accessible DOM text splitter (`so`/`co` pattern).
 * Preserves screen-reader text via `aria-label` on the heading and `aria-hidden="true"` on word spans.
 */
export function splitHeadingChars(heading: HTMLElement): HTMLElement[] {
  if (heading.dataset.splitDone === "true") {
    return Array.from(heading.querySelectorAll<HTMLElement>(".ch"));
  }
  const rawText = heading.textContent?.trim() ?? "";
  if (!rawText) return [];

  heading.setAttribute("aria-label", rawText);
  heading.dataset.splitDone = "true";
  heading.textContent = "";

  const chars: HTMLElement[] = [];
  const words = rawText.split(/\s+/);

  words.forEach((word, wordIdx) => {
    const wordSpan = document.createElement("span");
    wordSpan.className = "word";
    wordSpan.setAttribute("aria-hidden", "true");

    for (const ch of word) {
      const charSpan = document.createElement("span");
      charSpan.className = "ch";
      charSpan.textContent = ch;
      wordSpan.appendChild(charSpan);
      chars.push(charSpan);
    }

    heading.appendChild(wordSpan);
    if (wordIdx < words.length - 1) {
      heading.appendChild(document.createTextNode(" "));
    }
  });

  return chars;
}

/**
 * Standard entrance primitives using exclusively centralized tokens from `motion.config.ts`.
 */
export const motionPrimitives = {
  /** Animate split heading characters (`co`) */
  heading(
    target: HTMLElement | null,
    intensity: MotionIntensity = "default"
  ): gsap.core.Tween | null {
    if (!target || isReducedMotion()) return null;
    if (!MOTION_INTENSITY_PRESETS[intensity].enableSplitHeading) return null;

    const chars = splitHeadingChars(target);
    if (!chars.length) return null;

    return gsap.fromTo(
      chars,
      {
        yPercent: MOTION_OFFSET.splitYPercent,
        rotation: MOTION_OFFSET.splitRotation,
      },
      {
        yPercent: 0,
        rotation: 0,
        duration: q(MOTION_DURATION.splitHeading, intensity),
        ease: MOTION_EASE.splitOut,
        stagger: q(MOTION_STAGGER.splitChar, intensity),
        clearProps: "transform",
      }
    );
  },

  /** Animate cards / KPIs entrance (`lo`) */
  cards(
    targets: gsap.TweenTarget,
    intensity: MotionIntensity = "default"
  ): gsap.core.Tween {
    return gsap.fromTo(
      targets,
      {
        opacity: 0,
        y: MOTION_OFFSET.cardY,
        scale: MOTION_OFFSET.cardScale,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: q(MOTION_DURATION.cardEnter, intensity),
        ease: MOTION_EASE.archOut,
        stagger: q(MOTION_STAGGER.card, intensity),
        clearProps: "transform,opacity",
      }
    );
  },

  /** Animate table rows / list items capped at `maxTableRows` (`uo`) */
  rows(
    targets: Element[] | NodeListOf<Element>,
    intensity: MotionIntensity = "default"
  ): gsap.core.Tween | null {
    const list = Array.from(targets).slice(0, MOTION_STAGGER.maxTableRows);
    if (!list.length) return null;

    return gsap.fromTo(
      list,
      {
        opacity: 0,
        y: MOTION_OFFSET.rowY,
      },
      {
        opacity: 1,
        y: 0,
        duration: q(MOTION_DURATION.rowEnter, intensity),
        ease: MOTION_EASE.uiOut,
        stagger: q(MOTION_STAGGER.row, intensity),
        clearProps: "transform,opacity",
      }
    );
  },

  /** Form validation horizontal shake (`bo`) */
  errorShake(target: HTMLElement | null): gsap.core.Tween | null {
    if (!target || isReducedMotion()) return null;
    return gsap.to(target, {
      keyframes: { x: [...MOTION_OFFSET.shakeKeyframesX] },
      duration: q(MOTION_DURATION.errorShake),
      ease: "power2.out",
      clearProps: "transform",
    });
  },
};

/**
 * Asymmetric liquid `clip-path: inset(t r b l round Rpx)` indicator (`Eo`/`To` pattern).
 * Moves the leading edge faster (`pillLead` = 0.36s `power3.out`) than the trailing edge (`rowEnter` = 0.55s `power3.inOut`).
 */
export function animateClipPathPill(
  container: HTMLElement,
  thumb: HTMLElement,
  activeTarget: HTMLElement,
  borderRadiusPx = 999,
  intensity: MotionIntensity = "default"
): void {
  const cRect = container.getBoundingClientRect();
  const tRect = activeTarget.getBoundingClientRect();
  if (!cRect.width || !cRect.height) return;

  const next = {
    t: Math.max(0, tRect.top - cRect.top),
    r: Math.max(0, cRect.right - tRect.right),
    b: Math.max(0, cRect.bottom - tRect.bottom),
    l: Math.max(0, tRect.left - cRect.left),
  };

  type InsetState = { t: number; r: number; b: number; l: number };
  const existing = (thumb as unknown as { __inset?: InsetState }).__inset;

  const writeClip = (state: InsetState) => {
    thumb.style.clipPath = `inset(${state.t.toFixed(1)}px ${state.r.toFixed(1)}px ${state.b.toFixed(1)}px ${state.l.toFixed(1)}px round ${borderRadiusPx}px)`;
  };

  if (!existing || isReducedMotion()) {
    const initial = { ...next };
    (thumb as unknown as { __inset: InsetState }).__inset = initial;
    writeClip(initial);
    return;
  }

  const movingRight = next.l > existing.l;
  const leadDur = q(MOTION_DURATION.pillLead, intensity);
  const trailDur = q(MOTION_DURATION.rowEnter, intensity);
  const crossDur = q(MOTION_DURATION.pillCross, intensity);

  gsap.killTweensOf(existing);

  gsap.to(existing, {
    r: next.r,
    duration: movingRight ? leadDur : trailDur,
    ease: movingRight ? MOTION_EASE.uiOut : MOTION_EASE.flipInOut,
    onUpdate: () => scheduleFrameWrite(() => writeClip(existing)),
  });

  gsap.to(existing, {
    l: next.l,
    duration: movingRight ? trailDur : leadDur,
    ease: movingRight ? MOTION_EASE.flipInOut : MOTION_EASE.uiOut,
    onUpdate: () => scheduleFrameWrite(() => writeClip(existing)),
  });

  gsap.to(existing, {
    t: next.t,
    b: next.b,
    duration: crossDur,
    ease: MOTION_EASE.flipInOut,
    onUpdate: () => scheduleFrameWrite(() => writeClip(existing)),
  });
}

/**
 * Primary hook for scoping page/panel choreographies (`usePageAnim` pattern).
 * Automatically registers `[data-lift]` and `.magnetic` on fine-pointer devices and cleans up on unmount.
 */
export function useDashboardMotion<T extends HTMLElement = HTMLElement>(
  callback: (scopeEl: T, ctx: gsap.Context) => void,
  deps: readonly unknown[] = [],
  intensity: MotionIntensity = "default"
): RefObject<T | null> {
  const scopeRef = useRef<T | null>(null);

  useLayoutEffect(() => {
    const el = scopeRef.current;
    if (!el) return;

    loadGate.ready = false;
    const preset = MOTION_INTENSITY_PRESETS[intensity];
    const cleanups: Array<() => void> = [];

    const ctx = gsap.context((self) => {
      callback(el, self);

      const gateTimer = gsap.delayedCall(
        q(MOTION_DURATION.loadGateWindow, intensity),
        () => {
          loadGate.ready = true;
        }
      );
      cleanups.push(() => gateTimer.kill());

      if (hasFinePointer() && !isReducedMotion()) {
        // 1. Card Hover Lift (`[data-lift]`)
        if (preset.enableHoverLift) {
          const liftNodes = el.querySelectorAll<HTMLElement>("[data-lift]");
          liftNodes.forEach((node) => {
            const onEnter = () => {
              if (!loadGate.ready) return;
              gsap.to(node, {
                y: MOTION_OFFSET.hoverLiftY,
                duration: q(MOTION_DURATION.pillCross, intensity),
                ease: MOTION_EASE.uiOut,
                overwrite: "auto",
              });
            };
            const onLeave = () => {
              gsap.to(node, {
                y: 0,
                duration: q(MOTION_DURATION.flip, intensity),
                ease: MOTION_EASE.uiOut,
                overwrite: "auto",
                clearProps: "transform",
              });
            };
            node.addEventListener("pointerenter", onEnter);
            node.addEventListener("pointerleave", onLeave);
            cleanups.push(() => {
              node.removeEventListener("pointerenter", onEnter);
              node.removeEventListener("pointerleave", onLeave);
            });
          });
        }

        // 2. Magnetic Pull (`.magnetic`)
        if (preset.enableMagnetic) {
          const magNodes = el.querySelectorAll<HTMLElement>(".magnetic");
          magNodes.forEach((node) => {
            const xTo = gsap.quickTo(node, "x", {
              duration: q(MOTION_DURATION.flip, intensity),
              ease: MOTION_EASE.uiOut,
            });
            const yTo = gsap.quickTo(node, "y", {
              duration: q(MOTION_DURATION.flip, intensity),
              ease: MOTION_EASE.uiOut,
            });
            const onMove = (e: PointerEvent) => {
              const r = node.getBoundingClientRect();
              const dx = e.clientX - (r.left + r.width / 2);
              const dy = e.clientY - (r.top + r.height / 2);
              xTo(dx * MOTION_OFFSET.magneticX);
              yTo(dy * MOTION_OFFSET.magneticY);
            };
            const onLeave = () => {
              xTo(0);
              yTo(0);
            };
            node.addEventListener("pointermove", onMove);
            node.addEventListener("pointerleave", onLeave);
            cleanups.push(() => {
              node.removeEventListener("pointermove", onMove);
              node.removeEventListener("pointerleave", onLeave);
            });
          });
        }
      }
    }, el);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scopeRef;
}
