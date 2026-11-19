import React, { useState, useRef, useLayoutEffect } from "react";
import { gsap } from "./useGSAP-setup";
import {
  MOTION_DURATION,
  MOTION_EASE,
  MOTION_OFFSET,
  MOTION_STAGGER,
  isReducedMotion,
  q,
  type MotionIntensity,
} from "../assets/motion.config";

export interface PageTransitionProps {
  /** Current route key or tab identifier */
  routeKey: string;
  /** Numeric index of the route to compute directional motion (`dir = 1 | -1`) */
  routeIndex: number;
  intensity?: MotionIntensity;
  children: React.ReactNode;
}

/**
 * Directional Route Transition (`nu` pattern extracted from the 9 React 19 consoles):
 * 1. Exit (`0.18s power2.in`): Only viewport-visible `.card, .kpi, .lane, .tile` drop by `8px` and fade out,
 *    while `.phead` lifts `-6px` and the container shifts `-dir * 16px`.
 * 2. Enter (`0.70s expo.out`): New route view slides from `dir * 26px` -> `0` with `clearProps: "transform"`.
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  routeKey,
  routeIndex,
  intensity = "default",
  children,
}) => {
  const [displayedKey, setDisplayedKey] = useState<string>(routeKey);
  const [displayedChildren, setDisplayedChildren] =
    useState<React.ReactNode>(children);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const prevIndexRef = useRef<number>(routeIndex);
  const directionRef = useRef<1 | -1>(1);
  const pendingSwapRef = useRef<boolean>(false);

  // Step 1: Trigger ultra-fast 180ms exit on routeKey change
  useLayoutEffect(() => {
    if (routeKey === displayedKey) {
      setDisplayedChildren(children);
      return;
    }

    const dir: 1 | -1 = routeIndex >= prevIndexRef.current ? 1 : -1;
    prevIndexRef.current = routeIndex;
    directionRef.current = dir;

    const el = stageRef.current;
    if (!el || isReducedMotion()) {
      pendingSwapRef.current = true;
      setDisplayedKey(routeKey);
      setDisplayedChildren(children);
      return;
    }

    const viewportH = window.innerHeight;
    const isInViewport = (node: Element): boolean => {
      const r = node.getBoundingClientRect();
      return r.bottom > 0 && r.top < viewportH;
    };

    const visibleCards = Array.from(
      el.querySelectorAll(".card, .kpi, .lane, .tile")
    ).filter(isInViewport);
    const visibleHeaders = Array.from(
      el.querySelectorAll(".phead, .tabs, .toolbar")
    ).filter(isInViewport);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          pendingSwapRef.current = true;
          setDisplayedKey(routeKey);
          setDisplayedChildren(children);
        },
      });

      if (visibleCards.length > 0) {
        tl.to(
          visibleCards,
          {
            opacity: 0,
            y: MOTION_OFFSET.routeExitCardY,
            scale: MOTION_OFFSET.cardScale,
            duration: q(MOTION_DURATION.routeExit, intensity),
            ease: MOTION_EASE.fastIn,
            stagger: q(MOTION_STAGGER.routeExit, intensity),
          },
          0
        );
      }

      if (visibleHeaders.length > 0) {
        tl.to(
          visibleHeaders,
          {
            opacity: 0,
            y: MOTION_OFFSET.routeExitHeadY,
            duration: q(MOTION_DURATION.routeHeadExit, intensity),
            ease: "power1.in",
          },
          0
        );
      }

      tl.to(
        el,
        {
          x: -dir * MOTION_OFFSET.routeExitShiftX,
          duration: q(MOTION_DURATION.routeExit, intensity),
          ease: MOTION_EASE.fastIn,
        },
        0
      );
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey, routeIndex, intensity]);

  // Step 2: Slide new view in (`0.7s expo.out`) once displayedKey updates
  useLayoutEffect(() => {
    if (!pendingSwapRef.current || !stageRef.current) return;
    pendingSwapRef.current = false;

    const el = stageRef.current;
    const dir = directionRef.current;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { x: dir * MOTION_OFFSET.routeEnterSlideX, opacity: 1 },
        {
          x: 0,
          duration: q(MOTION_DURATION.routeEnter, intensity),
          ease: MOTION_EASE.archOut,
          clearProps: "transform",
        }
      );
    }, el);

    return () => ctx.revert();
  }, [displayedKey, intensity]);

  return (
    <div ref={stageRef} className="page-stage" data-route={displayedKey}>
      {displayedChildren}
    </div>
  );
};

/**
 * Circular View Transition Theme Switch (`an` pattern extracted from all 9 React 19 consoles).
 * Expands a circular clip-path from the clicked toggle button across the viewport.
 */
export function toggleEditorialThemeWithReveal(
  nextTheme: "light" | "dark",
  clickEvent?: { clientX: number; clientY: number }
): void {
  const applyTheme = () => {
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  type DocWithVT = Document & {
    startViewTransition?: (cb: () => void) => { ready: Promise<void> };
  };
  const doc = document as DocWithVT;

  if (
    typeof doc.startViewTransition !== "function" ||
    isReducedMotion() ||
    !clickEvent
  ) {
    applyTheme();
    return;
  }

  const x = clickEvent.clientX;
  const y = clickEvent.clientY;
  const maxRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  const transition = doc.startViewTransition(() => {
    applyTheme();
  });

  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: MOTION_DURATION.themeRevealMs,
          easing: MOTION_EASE.viewTransition,
          pseudoElement: "::view-transition-new(root)",
        }
      );
    })
    .catch(() => {
      // Fallback if ViewTransition is aborted
    });
}
