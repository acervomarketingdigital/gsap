import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { gsap } from "./useGSAP-setup";
import {
  MOTION_DURATION,
  MOTION_EASE,
  MOTION_OFFSET,
  MOTION_STAGGER,
  q,
  type MotionIntensity,
} from "../assets/motion.config";

export interface DrawerPanelProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  shellSelector?: string;
  intensity?: MotionIntensity;
  children: React.ReactNode;
}

/**
 * Accessible Editorial Drawer / Mobile Bottom Sheet (`kl` + `El` pattern).
 * - Desktop (`> 760px`): slides horizontally from right (`xPercent: 104 -> 0`, `0.6s expo.out`).
 * - Mobile (`<= 760px`): rises as a Bottom Sheet (`yPercent: 100 -> 0`) with velocity drag-to-dismiss on `.sheet__grip`.
 * - Sets `inert` on `.shell`, traps Escape key, staggers `.drawer__body > *`, and restores focus on close.
 */
export const DrawerPanel: React.FC<DrawerPanelProps> = ({
  open,
  title,
  subtitle,
  onClose,
  shellSelector = ".shell",
  intensity = "default",
  children,
}) => {
  const [rendered, setRendered] = useState<boolean>(open);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const scrimRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const isMobileViewport = (): boolean =>
    typeof window !== "undefined" &&
    window.innerWidth <= MOTION_OFFSET.mobileMaxWidthPx;

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      setRendered(true);
    }
  }, [open]);

  // Animate Open / Close lifecycle + Shell `[inert]` management
  useLayoutEffect(() => {
    if (!rendered || !panelRef.current || !scrimRef.current) return;

    const shellEl = document.querySelector<HTMLElement>(shellSelector);
    const mobile = isMobileViewport();

    const ctx = gsap.context(() => {
      if (open) {
        shellEl?.setAttribute("inert", "");
        document.body.style.overflow = "hidden";

        gsap.fromTo(
          scrimRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: q(MOTION_DURATION.scrimIn, intensity),
            ease: MOTION_EASE.uiOut,
          }
        );

        gsap.fromTo(
          panelRef.current,
          mobile ? { yPercent: 100, xPercent: 0 } : { xPercent: 104, yPercent: 0 },
          {
            xPercent: 0,
            yPercent: 0,
            duration: q(MOTION_DURATION.drawerOpen, intensity),
            ease: MOTION_EASE.archOut,
            clearProps: "transform",
          }
        );

        if (bodyRef.current && bodyRef.current.children.length > 0) {
          gsap.fromTo(
            bodyRef.current.children,
            { opacity: 0, y: MOTION_OFFSET.drawerChildY },
            {
              opacity: 1,
              y: 0,
              duration: q(MOTION_DURATION.flip, intensity),
              delay: q(MOTION_DURATION.drawerChildDelay, intensity),
              stagger: q(MOTION_STAGGER.row, intensity),
              ease: MOTION_EASE.uiOut,
              clearProps: "transform,opacity",
            }
          );
        }

        const autoFocusEl =
          panelRef.current!.querySelector<HTMLElement>("[data-autofocus]") ??
          panelRef.current!.querySelector<HTMLElement>(
            "button, [href], input, select, textarea"
          );
        autoFocusEl?.focus();
      } else {
        gsap.to(scrimRef.current, {
          opacity: 0,
          duration: q(MOTION_DURATION.toastExit, intensity),
          ease: MOTION_EASE.fastIn,
        });

        gsap.to(panelRef.current, {
          ...(mobile ? { yPercent: 100 } : { xPercent: 104 }),
          duration: q(MOTION_DURATION.drawerClose, intensity),
          ease: MOTION_EASE.panelIn,
          onComplete: () => {
            shellEl?.removeAttribute("inert");
            document.body.style.overflow = "";
            setRendered(false);
            previousFocusRef.current?.focus?.();
          },
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, [open, rendered, shellSelector, intensity]);

  // Escape key listener
  useEffect(() => {
    if (!rendered || !open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [rendered, open, onClose]);

  /**
   * Mobile Bottom-Sheet Drag-to-Dismiss with Velocity Check (`El` pattern)
   */
  const handleGripPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!panelRef.current || !isMobileViewport()) return;
    const panel = panelRef.current;
    const startY = e.clientY;
    let lastY = startY;
    let lastTime = performance.now();
    let velocityY = 0;

    e.currentTarget.setPointerCapture(e.pointerId);

    const onMove = (moveEvt: PointerEvent) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const dy = Math.max(0, moveEvt.clientY - startY);
      velocityY = (moveEvt.clientY - lastY) / dt; // px per ms
      lastY = moveEvt.clientY;
      lastTime = now;

      gsap.set(panel, { y: dy });
    };

    const onUp = (upEvt: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);

      const totalDy = Math.max(0, upEvt.clientY - startY);
      const panelHeight = panel.offsetHeight || 400;

      if (totalDy > panelHeight / 3 || (totalDy > 40 && velocityY > 0.6)) {
        onClose();
      } else {
        gsap.to(panel, {
          y: 0,
          duration: q(MOTION_DURATION.flip, intensity),
          ease: MOTION_EASE.springSnap,
          clearProps: "transform",
        });
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  if (!rendered) return null;

  return (
    <div
      ref={rootRef}
      className="drawer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div
        ref={scrimRef}
        className="drawer__scrim"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside ref={panelRef} className="drawer__panel">
        <div
          className="sheet__grip"
          onPointerDown={handleGripPointerDown}
          aria-hidden="true"
        />

        <header className="drawer__head">
          <div>
            {subtitle && <span className="eyebrow">{subtitle}</span>}
            <h2
              id="drawer-title"
              style={{
                margin: 0,
                fontSize: "var(--fs-3xl)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </h2>
          </div>

          <button
            type="button"
            className="seg__btn"
            onClick={onClose}
            aria-label="Fechar painel"
          >
            ✕
          </button>
        </header>

        <div ref={bodyRef} className="drawer__body">
          {children}
        </div>
      </aside>
    </div>
  );
};
