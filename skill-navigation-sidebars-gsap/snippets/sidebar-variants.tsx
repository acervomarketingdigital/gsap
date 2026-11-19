import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import gsap from "gsap";
import { animateClipPathPill } from "../../skill-dashboard-crm-gsap/snippets/useGSAP-setup";
import {
  MOTION_DURATION,
  MOTION_EASE,
  isReducedMotion,
  q,
  type MotionIntensity,
} from "../../skill-dashboard-crm-gsap/assets/motion.config";

export interface NavSubItem {
  id: string;
  label: string;
  meta?: string;
  tone?: "good" | "warn" | "bad" | "info" | "accent";
}

export interface NavItemConfig {
  id: string;
  label: string;
  blurb?: string;
  icon: React.ReactNode;
  count?: number;
  warn?: boolean;
  subs?: readonly NavSubItem[];
}

export interface NavGroupConfig {
  label: string;
  items: readonly NavItemConfig[];
}

/* ==========================================================================
   VARIANT 1: BRISKO FLOATING DARK RAIL + CLIP-PATH EXPAND + HOVER FLYOUT
   ========================================================================== */

export interface BriskoFloatingRailProps {
  brandName: string;
  brandLogo: React.ReactNode;
  primaryItems: readonly NavItemConfig[];
  secondaryItems?: readonly NavItemConfig[];
  activePage: string;
  activeSub?: string;
  user: { name: string; role: string; initials: string };
  initialExpanded?: boolean;
  intensity?: MotionIntensity;
  onNavigate: (pageId: string, subId?: string) => void;
}

export const BriskoFloatingRail: React.FC<BriskoFloatingRailProps> = ({
  brandName,
  brandLogo,
  primaryItems,
  secondaryItems = [],
  activePage,
  activeSub,
  user,
  initialExpanded = false,
  intensity = "default",
  onNavigate,
}) => {
  const [expanded, setExpanded] = useState<boolean>(initialExpanded);
  const [flyout, setFlyout] = useState<{
    item: NavItemConfig;
    top: number;
  } | null>(null);

  const railRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);
  const flyoutRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<gsap.core.Tween | null>(null);

  const RAIL_COLLAPSED_W = 76;
  const RAIL_EXPANDED_W = 232;

  // Update active pill via asymmetric clip-path
  useLayoutEffect(() => {
    if (!trackRef.current || !pillRef.current) return;
    const activeEl = trackRef.current.querySelector<HTMLElement>(
      `[data-nav-id="${activePage}"]`
    );
    if (activeEl) {
      animateClipPathPill(
        trackRef.current,
        pillRef.current,
        activeEl,
        16,
        intensity
      );
    }
  }, [activePage, expanded, intensity]);

  // Animate flyout entrance (`on` in brisko/_index_tail.js)
  useLayoutEffect(() => {
    if (!flyout || !flyoutRef.current || isReducedMotion()) return;
    const el = flyoutRef.current;
    const h = el.offsetHeight || 160;
    const safeTop = Math.max(
      12,
      Math.min(flyout.top - 8, window.innerHeight - h - 12)
    );
    gsap.set(el, { top: safeTop });

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, x: -10, scale: 0.97 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: q(MOTION_DURATION.drawerClose, intensity),
          ease: MOTION_EASE.springToast,
          transformOrigin: "0 20px",
          clearProps: "transform,opacity",
        }
      );
    }, el);

    return () => ctx.revert();
  }, [flyout, intensity]);

  // Clip-path expand/collapse choreography (`rn` in brisko/_index_tail.js)
  const toggleRailExpanded = (nextExpanded: boolean) => {
    if (nextExpanded === expanded) return;
    const rail = railRef.current;
    setFlyout(null);

    if (!rail || isReducedMotion() || window.innerWidth < 1280) {
      setExpanded(nextExpanded);
      return;
    }

    const diff = RAIL_EXPANDED_W - RAIL_COLLAPSED_W; // 156px
    const insetCollapsed = `inset(0 ${diff}px 0 0 round 26px)`;
    const insetExpanded = `inset(0 0px 0 0 round 26px)`;
    const labels = rail.querySelectorAll<HTMLElement>(".rail__label");

    setExpanded(nextExpanded);

    requestAnimationFrame(() => {
      const tl = gsap.timeline({
        defaults: {
          duration: q(MOTION_DURATION.errorShake, intensity),
          ease: MOTION_EASE.flipInOut,
        },
        onComplete: () => {
          gsap.set(rail, { clearProps: "clipPath" });
          gsap.set(labels, { clearProps: "opacity,transform" });
        },
      });

      if (nextExpanded) {
        tl.fromTo(rail, { clipPath: insetCollapsed }, { clipPath: insetExpanded }, 0);
        tl.fromTo(
          labels,
          { opacity: 0, x: -6 },
          {
            opacity: 1,
            x: 0,
            duration: q(0.28, intensity),
            stagger: q(0.012, intensity),
            ease: "power2.out",
          },
          q(0.14, intensity)
        );
      } else {
        tl.to(
          labels,
          { opacity: 0, duration: q(0.14, intensity), ease: "power1.in" },
          0
        );
        tl.fromTo(rail, { clipPath: insetExpanded }, { clipPath: insetCollapsed }, 0);
      }
    });
  };

  // Keyboard shortcut `[`
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "[" && window.innerWidth >= 1000) {
        toggleRailExpanded(!expanded);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const handleItemPointerEnter = (
    item: NavItemConfig,
    target: HTMLElement
  ) => {
    if (expanded || window.innerWidth <= 760) return;
    closeTimerRef.current?.kill();
    const rect = target.getBoundingClientRect();
    setFlyout({ item, top: rect.top });
  };

  const scheduleFlyoutClose = () => {
    closeTimerRef.current?.kill();
    closeTimerRef.current = gsap.delayedCall(0.16, () => setFlyout(null));
  };

  const renderRailItem = (item: NavItemConfig) => {
    const isActive = item.id === activePage;
    return (
      <button
        key={item.id}
        type="button"
        data-nav-id={item.id}
        aria-current={isActive ? "page" : undefined}
        aria-label={!expanded ? item.label : undefined}
        onPointerEnter={(e) =>
          e.pointerType === "mouse" &&
          handleItemPointerEnter(item, e.currentTarget)
        }
        onPointerLeave={scheduleFlyoutClose}
        onFocus={(e) => handleItemPointerEnter(item, e.currentTarget)}
        onBlur={scheduleFlyoutClose}
        onClick={() => {
          setFlyout(null);
          onNavigate(item.id);
        }}
        style={{
          position: "relative",
          zIndex: 2,
          height: "44px",
          width: "100%",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: expanded ? "flex-start" : "center",
          gap: "12px",
          padding: expanded ? "0 14px" : "0",
          color: isActive ? "#15190c" : "#eef2ea",
          fontWeight: 600,
          fontSize: "var(--fs-md)",
        }}
      >
        <span style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
          {item.icon}
        </span>
        {expanded && (
          <span className="rail__label" style={{ flex: 1, textAlign: "left" }}>
            {item.label}
          </span>
        )}
        {Boolean(item.count && item.count > 0) && (
          <span
            className="num"
            style={{
              minWidth: expanded ? "20px" : "8px",
              height: expanded ? "20px" : "8px",
              borderRadius: "99px",
              background: isActive ? "#15190c" : "#e2f47b",
              color: isActive ? "#e2f47b" : "#15190c",
              fontSize: expanded ? "var(--fs-2xs)" : "0px",
              fontWeight: 700,
              display: "inline-grid",
              placeItems: "center",
              padding: expanded ? "0 6px" : "0",
              position: expanded ? "static" : "absolute",
              top: "9px",
              right: "14px",
            }}
          >
            {expanded ? item.count : ""}
          </span>
        )}
      </button>
    );
  };

  const allItems = [...primaryItems, ...secondaryItems];

  return (
    <nav
      ref={railRef}
      aria-label="Navegação Principal"
      style={{
        position: "fixed",
        top: "16px",
        bottom: "16px",
        left: "16px",
        zIndex: 30,
        width: expanded ? `${RAIL_EXPANDED_W}px` : `${RAIL_COLLAPSED_W}px`,
        background: "#171916",
        color: "#eef2ea",
        borderRadius: "26px",
        padding: "14px 12px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        boxShadow: "var(--shadow-lg), inset 0 0 0 1px rgba(255,255,255,0.08)",
      }}
    >
      {/* Brand */}
      <button
        type="button"
        onClick={() => onNavigate(allItems[0]?.id ?? "overview")}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: expanded ? "flex-start" : "center",
          gap: "10px",
          padding: expanded ? "4px 6px" : "4px 0",
        }}
      >
        <span
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "14px",
            background: "#e2f47b",
            color: "#15190c",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {brandLogo}
        </span>
        {expanded && (
          <b
            className="rail__label"
            style={{ fontSize: "20px", letterSpacing: "-0.02em" }}
          >
            {brandName}
          </b>
        )}
      </button>

      {/* Main Track with Liquid Pill */}
      <div
        ref={trackRef}
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <span
          ref={pillRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "#e2f47b",
            borderRadius: "16px",
            pointerEvents: "none",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {primaryItems.map(renderRailItem)}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {secondaryItems.map(renderRailItem)}
        </div>
      </div>

      {/* Pin / Collapse Button (`[`) */}
      <button
        type="button"
        aria-pressed={expanded}
        aria-keyshortcuts="["
        title={expanded ? "Recolher [" : "Expandir ["}
        onClick={() => toggleRailExpanded(!expanded)}
        style={{
          height: "40px",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: expanded ? "flex-start" : "center",
          gap: "10px",
          padding: expanded ? "0 12px" : "0",
          color: "rgba(238,242,234,0.7)",
        }}
      >
        <span>⇄</span>
        {expanded && (
          <span className="rail__label" style={{ fontSize: "var(--fs-sm)" }}>
            Recolher
          </span>
        )}
      </button>

      {/* User Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: expanded ? "flex-start" : "center",
          gap: "10px",
          padding: "6px",
          borderRadius: "16px",
          background: "rgba(255,255,255,0.06)",
        }}
      >
        <span
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            background: "#2d5238",
            color: "#e2f47b",
            display: "grid",
            placeItems: "center",
            fontSize: "var(--fs-xs)",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {user.initials}
        </span>
        {expanded && (
          <span className="rail__label" style={{ minWidth: 0 }}>
            <b style={{ display: "block", fontSize: "var(--fs-sm)" }}>
              {user.name}
            </b>
            <small style={{ color: "rgba(238,242,234,0.6)", fontSize: "var(--fs-2xs)" }}>
              {user.role}
            </small>
          </span>
        )}
      </div>

      {/* Hover Flyout when Rail is Collapsed */}
      {!expanded && flyout && (
        <div
          ref={flyoutRef}
          role="menu"
          aria-label={flyout.item.label}
          onPointerEnter={() => closeTimerRef.current?.kill()}
          onPointerLeave={scheduleFlyoutClose}
          style={{
            position: "fixed",
            left: `${RAIL_COLLAPSED_W + 26}px`,
            zIndex: 45,
            minWidth: "228px",
            background: "var(--panel)",
            color: "var(--ink)",
            borderRadius: "18px",
            padding: "8px",
            boxShadow: "var(--shadow-lg), inset 0 0 0 1px var(--line-2)",
          }}
        >
          <div style={{ padding: "6px 10px 8px" }}>
            <b style={{ display: "block", fontSize: "var(--fs-lg)" }}>
              {flyout.item.label}
            </b>
            {flyout.item.blurb && (
              <small style={{ color: "var(--ink-3)", fontSize: "var(--fs-xs)" }}>
                {flyout.item.blurb}
              </small>
            )}
          </div>

          {flyout.item.subs?.length ? (
            flyout.item.subs.map((sub) => (
              <button
                key={sub.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  setFlyout(null);
                  onNavigate(flyout.item.id, sub.id);
                }}
                style={{
                  width: "100%",
                  height: "36px",
                  padding: "0 10px",
                  borderRadius: "9px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "var(--fs-md)",
                  fontWeight: 600,
                  background:
                    activePage === flyout.item.id && activeSub === sub.id
                      ? "var(--accent-soft)"
                      : "transparent",
                }}
              >
                <span>{sub.label}</span>
                {sub.meta && (
                  <small className="num" style={{ color: "var(--ink-3)" }}>
                    {sub.meta}
                  </small>
                )}
              </button>
            ))
          ) : (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setFlyout(null);
                onNavigate(flyout.item.id);
              }}
              style={{
                width: "100%",
                height: "36px",
                padding: "0 10px",
                borderRadius: "9px",
                textAlign: "left",
                fontSize: "var(--fs-md)",
                fontWeight: 600,
              }}
            >
              Abrir {flyout.item.label} →
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

/* ==========================================================================
   VARIANT 2: EDITORIAL COLLAPSIBLE SIDEBAR WITH FLIP ICON TRACKING & ACCORDION
   (Extracted from Fragio / Groova / Levena / Kelpo)
   ========================================================================== */

export interface EditorialSidebarProps {
  brandTitle: string;
  brandSubtitle: string;
  brandMark: React.ReactNode;
  groups: readonly NavGroupConfig[];
  activePage: string;
  activeSub?: string;
  floatingCard?: boolean;
  seasonProgress?: { label: string; badge: string; ratio: number };
  intensity?: MotionIntensity;
  onNavigate: (pageId: string, subId?: string) => void;
  onOpenCommandPalette?: () => void;
}

export const EditorialCollapsibleSidebar: React.FC<EditorialSidebarProps> = ({
  brandTitle,
  brandSubtitle,
  brandMark,
  groups,
  activePage,
  activeSub,
  floatingCard = true,
  seasonProgress,
  intensity = "default",
  onNavigate,
  onOpenCommandPalette,
}) => {
  const [isRail, setIsRail] = useState<boolean>(false);
  const sideRef = useRef<HTMLElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);
  const subsRef = useRef<HTMLDivElement | null>(null);

  // Sync asymmetric clip-path pill on activePage or rail toggle
  useLayoutEffect(() => {
    if (!navRef.current || !pillRef.current) return;
    const activeEl = navRef.current.querySelector<HTMLElement>(
      `[data-snav-id="${activePage}"]`
    );
    if (activeEl) {
      animateClipPathPill(
        navRef.current,
        pillRef.current,
        activeEl,
        12,
        intensity
      );
    }
  }, [activePage, isRail, intensity]);

  // Animate accordion submenu `.snav__subs` (`Fragio` pattern)
  useLayoutEffect(() => {
    const el = subsRef.current;
    if (!el || isRail || isReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { clipPath: "inset(0 0 100% 0)" },
        {
          clipPath: "inset(0 0 0% 0)",
          duration: q(MOTION_DURATION.pillCross, intensity),
          ease: MOTION_EASE.uiOut,
          clearProps: "clipPath",
        }
      );
      gsap.fromTo(
        el.children,
        { opacity: 0, x: -6 },
        {
          opacity: 1,
          x: 0,
          duration: q(0.35, intensity),
          stagger: q(MOTION_STAGGER_SUB, intensity),
          ease: MOTION_EASE.uiOut,
          clearProps: "transform,opacity",
        }
      );
    }, el);

    return () => ctx.revert();
  }, [activePage, isRail, intensity]);

  /**
   * Manual FLIP icon-tracking fold (`Jt` in Fragio / `Yt` in Groova & Levena)
   */
  const handleToggleRail = (nextRail: boolean) => {
    const sideEl = sideRef.current;
    if (!sideEl || isReducedMotion()) {
      setIsRail(nextRail);
      return;
    }

    const anchors = Array.from(
      sideEl.querySelectorAll<HTMLElement>("[data-flip-anchor]")
    );
    const beforeRects = anchors.map((a) => a.getBoundingClientRect());
    const startW = sideEl.offsetWidth;

    setIsRail(nextRail);

    requestAnimationFrame(() => {
      const endW = sideEl.offsetWidth;
      const diff = Math.abs(startW - endW);

      anchors.forEach((anchor, i) => {
        const before = beforeRects[i];
        const after = anchor.getBoundingClientRect();
        const dx = before.left - after.left;
        const dy = before.top - after.top;
        if (Math.abs(dx) + Math.abs(dy) > 0.5) {
          gsap.fromTo(
            anchor,
            { x: dx, y: dy },
            {
              x: 0,
              y: 0,
              duration: q(nextRail ? 0.36 : 0.45, intensity),
              ease: MOTION_EASE.uiOut,
              clearProps: "transform",
            }
          );
        }
      });

      gsap.fromTo(
        sideEl,
        {
          clipPath: nextRail
            ? "inset(0 0px 0 0 round 22px)"
            : `inset(0 ${diff}px 0 0 round 22px)`,
        },
        {
          clipPath: nextRail
            ? `inset(0 ${diff}px 0 0 round 22px)`
            : "inset(0 0px 0 0 round 22px)",
          duration: q(nextRail ? 0.42 : 0.5, intensity),
          ease: nextRail ? MOTION_EASE.flipInOut : MOTION_EASE.archOut,
          clearProps: "clipPath",
        }
      );
    });
  };

  return (
    <aside
      ref={sideRef}
      aria-label="Sidebar"
      style={{
        position: "fixed",
        zIndex: 30,
        top: floatingCard ? "12px" : "0",
        bottom: floatingCard ? "12px" : "0",
        left: floatingCard ? "12px" : "0",
        width: isRail ? "76px" : "244px",
        background: "var(--card)",
        borderRadius: floatingCard ? "24px" : "0",
        boxShadow: floatingCard
          ? "inset 0 0 0 1px var(--line), var(--shadow-sm)"
          : "inset -1px 0 0 var(--line-2)",
        padding: isRail ? "16px 12px" : "16px 14px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexDirection: isRail ? "column" : "row",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <button
          type="button"
          onClick={() => onNavigate(groups[0]?.items[0]?.id ?? "overview")}
          style={{
            flex: isRail ? "none" : 1,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textAlign: "left",
          }}
        >
          <span
            data-flip-anchor=""
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "12px",
              background: "var(--accent)",
              color: "var(--accent-ink)",
              display: "grid",
              placeItems: "center",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {brandMark}
          </span>
          {!isRail && (
            <span>
              <b style={{ display: "block", fontSize: "20px", lineHeight: 1 }}>
                {brandTitle}
              </b>
              <small style={{ color: "var(--ink-3)", fontSize: "var(--fs-2xs)" }}>
                {brandSubtitle}
              </small>
            </span>
          )}
        </button>

        <button
          type="button"
          data-flip-anchor=""
          onClick={() => handleToggleRail(!isRail)}
          aria-label={isRail ? "Expandir sidebar" : "Recolher sidebar"}
          title={isRail ? "Expandir [" : "Recolher ["}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "10px",
            background: "var(--card-2)",
            boxShadow: "inset 0 0 0 1px var(--line-2)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <span style={{ transform: isRail ? "scaleX(-1)" : "none" }}>⇤</span>
        </button>
      </div>

      {/* Quick Search Button (`⌘K`) */}
      {onOpenCommandPalette && (
        <button
          type="button"
          onClick={onOpenCommandPalette}
          style={{
            height: "40px",
            borderRadius: "11px",
            background: "var(--card-2)",
            boxShadow: "inset 0 0 0 1px var(--line)",
            padding: isRail ? "0" : "0 8px 0 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: isRail ? "center" : "space-between",
            color: "var(--ink-3)",
            fontSize: "var(--fs-md)",
          }}
        >
          <span data-flip-anchor="">⌕</span>
          {!isRail && (
            <>
              <span style={{ flex: 1, textAlign: "left", marginLeft: "8px" }}>
                Buscar…
              </span>
              <kbd className="kbd">⌘K</kbd>
            </>
          )}
        </button>
      )}

      {/* Navigation Track */}
      <nav
        ref={navRef}
        aria-label="Principal"
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          overflowY: "auto",
        }}
      >
        <span
          ref={pillRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--accent-soft)",
            borderRadius: "12px",
            pointerEvents: "none",
          }}
        />

        {groups.map((group) => (
          <div
            key={group.label}
            style={{ display: "flex", flexDirection: "column", gap: "2px" }}
          >
            {!isRail ? (
              <span
                style={{
                  fontSize: "var(--fs-2xs)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--ink-3)",
                  padding: "8px 12px 3px",
                }}
              >
                {group.label}
              </span>
            ) : (
              <hr
                style={{
                  border: 0,
                  height: "1px",
                  background: "var(--line-2)",
                  margin: "6px 14px",
                }}
              />
            )}

            {group.items.map((item) => {
              const active = item.id === activePage;
              const showSubs = active && Boolean(item.subs?.length) && !isRail;

              return (
                <div key={item.id} style={{ display: "flex", flexDirection: "column" }}>
                  <button
                    type="button"
                    data-snav-id={item.id}
                    aria-current={active ? "page" : undefined}
                    onClick={() => onNavigate(item.id)}
                    style={{
                      position: "relative",
                      zIndex: 1,
                      height: isRail ? "44px" : "38px",
                      borderRadius: "11px",
                      padding: isRail ? "0" : "0 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: isRail ? "center" : "flex-start",
                      gap: "12px",
                      color: active ? "var(--accent)" : "var(--ink-2)",
                      fontWeight: 600,
                      fontSize: "var(--fs-md)",
                    }}
                  >
                    <span data-flip-anchor="">{item.icon}</span>
                    {!isRail && (
                      <span style={{ flex: 1, textAlign: "left" }}>
                        {item.label}
                      </span>
                    )}
                    {!isRail && Boolean(item.count && item.count > 0) && (
                      <span
                        className={`badge ${item.warn ? "badge--warn" : "badge--info"} num`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>

                  {/* Accordion Submenu (`.snav__subs`) */}
                  {showSubs && (
                    <div
                      ref={subsRef}
                      style={{
                        borderLeft: "1.5px solid var(--line-2)",
                        margin: "2px 0 6px 22px",
                        paddingLeft: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      {item.subs!.map((sub) => {
                        const subActive = sub.id === activeSub;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => onNavigate(item.id, sub.id)}
                            style={{
                              height: "32px",
                              borderRadius: "9px",
                              padding: "0 10px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              fontSize: "var(--fs-sm)",
                              fontWeight: 600,
                              color: subActive ? "var(--ink)" : "var(--ink-3)",
                              background: subActive
                                ? "var(--card-2)"
                                : "transparent",
                            }}
                          >
                            <span>{sub.label}</span>
                            {sub.meta && (
                              <small className="num">{sub.meta}</small>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Season / Quota Progress Widget (`.side__wk` from Fragio) */}
      {seasonProgress && !isRail && (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: "12px",
            background: "var(--card-2)",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "6px",
            fontSize: "var(--fs-xs)",
            fontWeight: 600,
          }}
        >
          <span>{seasonProgress.label}</span>
          <b className="num" style={{ color: "var(--ink-3)" }}>
            {seasonProgress.badge}
          </b>
          <div
            style={{
              gridColumn: "1 / -1",
              height: "4px",
              borderRadius: "4px",
              background: "var(--card-3)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(100, Math.max(0, seasonProgress.ratio * 100))}%`,
                background: "var(--accent)",
              }}
            />
          </div>
        </div>
      )}
    </aside>
  );
};

const MOTION_STAGGER_SUB = 0.03;
