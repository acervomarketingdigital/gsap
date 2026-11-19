import React, { useRef, useLayoutEffect } from "react";
import { gsap } from "./useGSAP-setup";
import {
  MOTION_DURATION,
  MOTION_EASE,
  isReducedMotion,
  q,
  type MotionIntensity,
} from "../assets/motion.config";

/**
 * WeakMap storing the previous numeric state per DOM node (`vo`/`Ll` pattern).
 * Prevents counters from resetting to 0 when parent components re-render or update incrementally.
 */
const counterMemory = new WeakMap<HTMLElement, { v: number }>();

export interface KpiCounterProps {
  label: string;
  value: number;
  formatter?: (val: number) => string;
  deltaText?: string;
  deltaTone?: "good" | "warn" | "bad" | "info";
  floatingDelta?: string | null;
  sparklinePoints?: readonly number[];
  noir?: boolean;
  intensity?: MotionIntensity;
}

const defaultFormat = (n: number): string =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(
    Math.round(n)
  );

/**
 * Spawns a floating `+R$ ...` delta chip that rises and fades out (`go` pattern).
 */
export function spawnFloatingDelta(
  container: HTMLElement | null,
  text: string
): void {
  if (!container || !text || isReducedMotion()) return;

  const chip = document.createElement("span");
  chip.className = "float-up num";
  chip.textContent = text;
  container.appendChild(chip);

  gsap.fromTo(
    chip,
    { opacity: 0, y: 0, scale: 0.85 },
    {
      keyframes: [
        {
          opacity: 1,
          y: -12,
          scale: 1,
          duration: q(MOTION_DURATION.pillLead),
          ease: MOTION_EASE.springThumb,
        },
        {
          opacity: 0,
          y: -40,
          duration: q(MOTION_DURATION.cardEnter),
          delay: q(MOTION_DURATION.drawerOpen),
          ease: MOTION_EASE.fastIn,
        },
      ],
      onComplete: () => chip.remove(),
    }
  );
}

export const KpiCard: React.FC<KpiCounterProps> = ({
  label,
  value,
  formatter = defaultFormat,
  deltaText,
  deltaTone = "good",
  floatingDelta = null,
  sparklinePoints,
  noir = false,
  intensity = "default",
}) => {
  const cardRef = useRef<HTMLElement | null>(null);
  const liveRef = useRef<HTMLSpanElement | null>(null);
  const badgeRef = useRef<HTMLSpanElement | null>(null);
  const sparkPathRef = useRef<SVGPathElement | null>(null);

  useLayoutEffect(() => {
    const liveEl = liveRef.current;
    if (!liveEl) return;

    const ctx = gsap.context(() => {
      let state = counterMemory.get(liveEl);
      const isInitialMount = !state;

      if (!state) {
        state = { v: 0 };
        counterMemory.set(liveEl, state);
      }

      gsap.killTweensOf(state);
      gsap.to(state, {
        v: value,
        duration: q(MOTION_DURATION.counter, intensity),
        ease: MOTION_EASE.uiOut,
        onUpdate: () => {
          liveEl.textContent = formatter(state!.v);
        },
      });

      if (!isInitialMount && badgeRef.current) {
        gsap.fromTo(
          badgeRef.current,
          { scale: 1.22 },
          {
            scale: 1,
            duration: q(MOTION_DURATION.pillCross, intensity),
            ease: MOTION_EASE.springPop,
            clearProps: "transform",
          }
        );
      }

      if (!isInitialMount && floatingDelta) {
        spawnFloatingDelta(cardRef.current, floatingDelta);
      }

      if (isInitialMount && sparkPathRef.current) {
        const path = sparkPathRef.current;
        const len = path.getTotalLength?.() ?? 120;
        gsap.fromTo(
          path,
          { strokeDasharray: len, strokeDashoffset: len },
          {
            strokeDashoffset: 0,
            duration: q(MOTION_DURATION.counter, intensity),
            ease: MOTION_EASE.drawInOut,
          }
        );
      }
    }, cardRef);

    return () => ctx.revert();
  }, [value, formatter, floatingDelta, intensity]);

  const formattedTarget = formatter(value);

  const buildSparklinePath = (pts: readonly number[]): string => {
    if (pts.length < 2) return "";
    const min = Math.min(...pts);
    const max = Math.max(...pts);
    const range = max - min || 1;
    const width = 120;
    const height = 32;

    return pts
      .map((val, i) => {
        const x = (i / (pts.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

  return (
    <article
      ref={cardRef}
      className={`kpi ${noir ? "card--noir" : ""}`}
      data-lift=""
    >
      <div className="card__head">
        <span className="eyebrow">{label}</span>
        {deltaText && (
          <span ref={badgeRef} className={`badge badge--${deltaTone} num`}>
            {deltaText}
          </span>
        )}
      </div>

      {/* Ghost-sized 1x1 CSS Grid prevents horizontal reflow while counting */}
      <div className="kpi__val num">
        <span className="count">
          <span className="count__size" aria-hidden="true">
            {formattedTarget}
          </span>
          <span ref={liveRef} className="count__live">
            {formattedTarget}
          </span>
        </span>
      </div>

      {sparklinePoints && sparklinePoints.length > 1 && (
        <svg
          width="120"
          height="32"
          viewBox="0 0 120 32"
          fill="none"
          aria-hidden="true"
        >
          <path
            ref={sparkPathRef}
            d={buildSparklinePath(sparklinePoints)}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </article>
  );
};
