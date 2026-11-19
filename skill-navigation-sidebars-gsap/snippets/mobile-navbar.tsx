import React, { useState, useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { animateClipPathPill } from "../../skill-dashboard-crm-gsap/snippets/useGSAP-setup";
import { DrawerPanel } from "../../skill-dashboard-crm-gsap/snippets/drawer-panel";
import {
  MOTION_DURATION,
  MOTION_EASE,
  isReducedMotion,
  q,
  type MotionIntensity,
} from "../../skill-dashboard-crm-gsap/assets/motion.config";
import type { NavItemConfig } from "./sidebar-variants";

export interface QuickActionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onRun: () => void;
}

export interface MobileNavbarProps {
  appName: string;
  workspaceName: string;
  /** The 4 primary items shown directly on the bottom `.tabbar` */
  primaryTabs: readonly [
    NavItemConfig,
    NavItemConfig,
    NavItemConfig,
    NavItemConfig,
  ];
  /** Full list of all app sections shown inside the `.allpages` sheet */
  allSections: readonly NavItemConfig[];
  /** Top 3 quick creation buttons inside `.allpages__new` */
  quickActions?: readonly QuickActionItem[];
  activePage: string;
  activeSub?: string;
  floatingPillStyle?: boolean;
  darkMode?: boolean;
  intensity?: MotionIntensity;
  onNavigate: (pageId: string, subId?: string) => void;
  onToggleDarkMode?: (nextDark: boolean) => void;
}

/**
 * Mobile Navigation System (`an` + `on` in Fragio / `cn` + `ln` in Groova / `pn` in Kelpo):
 * 1. Bottom `.tabbar` (4 primary tabs + 5th "More" button) with liquid `.tabbar__pill` indicator.
 *    If `activePage` is not among the 4 primary tabs, the pill automatically highlights "More"!
 * 2. `.allpages` Bottom Sheet Drawer with 3-column `.allpages__new` action grid, section list with sub-chips, and theme switch.
 */
export const MobileNavbar: React.FC<MobileNavbarProps> = ({
  appName,
  workspaceName,
  primaryTabs,
  allSections,
  quickActions = [],
  activePage,
  activeSub,
  floatingPillStyle = true,
  darkMode = false,
  intensity = "default",
  onNavigate,
  onToggleDarkMode,
}) => {
  const [moreOpen, setMoreOpen] = useState<boolean>(false);
  const barRef = useRef<HTMLElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);
  const didMountRef = useRef<boolean>(false);

  const isPrimaryTab = primaryTabs.some((t) => t.id === activePage);

  // Initial slide-up entrance (`y: 90 -> 0, 0.7s expo.out`) + liquid pill positioning
  useLayoutEffect(() => {
    const barEl = barRef.current;
    const pillEl = pillRef.current;
    if (!barEl || !pillEl) return;

    if (!didMountRef.current) {
      didMountRef.current = true;
      if (!isReducedMotion()) {
        gsap.fromTo(
          barEl,
          { y: 90 },
          {
            y: 0,
            duration: q(MOTION_DURATION.routeEnter, intensity),
            ease: MOTION_EASE.archOut,
            clearProps: "transform",
          }
        );
      }
    }

    const selector = isPrimaryTab
      ? `[data-tab-id="${activePage}"]`
      : `[data-tab-id="__more"]`;
    const targetBtn = barEl.querySelector<HTMLElement>(selector);

    if (targetBtn) {
      animateClipPathPill(
        barEl,
        pillEl,
        targetBtn,
        floatingPillStyle ? 16 : 12,
        intensity
      );
    }
  }, [activePage, isPrimaryTab, floatingPillStyle, intensity]);

  return (
    <>
      <nav
        ref={barRef}
        aria-label="Navegação Rápida Mobile"
        style={
          floatingPillStyle
            ? {
                position: "fixed",
                zIndex: 40,
                left: "10px",
                right: "10px",
                bottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
                background: "var(--panel)",
                borderRadius: "24px",
                padding: "6px",
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                boxShadow:
                  "inset 0 0 0 1px var(--line), var(--shadow-lg)",
              }
            : {
                position: "fixed",
                zIndex: 40,
                left: 0,
                right: 0,
                bottom: 0,
                background: "var(--card)",
                padding:
                  "6px 8px calc(6px + env(safe-area-inset-bottom, 0px))",
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                boxShadow: "0 -1px 0 var(--line)",
              }
        }
      >
        <span
          ref={pillRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: floatingPillStyle
              ? "var(--accent)"
              : "var(--accent-soft)",
            pointerEvents: "none",
          }}
        />

        {primaryTabs.map((tab) => {
          const active = tab.id === activePage;
          return (
            <button
              key={tab.id}
              type="button"
              data-tab-id={tab.id}
              aria-current={active ? "page" : undefined}
              onClick={() => onNavigate(tab.id)}
              style={{
                position: "relative",
                zIndex: 1,
                height: "52px",
                borderRadius: floatingPillStyle ? "18px" : "12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "3px",
                fontSize: "var(--fs-2xs)",
                fontWeight: 600,
                color: active
                  ? floatingPillStyle
                    ? "var(--accent-ink)"
                    : "var(--accent)"
                  : "var(--ink-3)",
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}

        {/* 5th Tab: More (`.tabbar__more`) */}
        <button
          type="button"
          data-tab-id="__more"
          aria-current={!isPrimaryTab ? "page" : undefined}
          onClick={() => setMoreOpen(true)}
          style={{
            position: "relative",
            zIndex: 1,
            height: "52px",
            borderRadius: floatingPillStyle ? "18px" : "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3px",
            fontSize: "var(--fs-2xs)",
            fontWeight: 600,
            color: !isPrimaryTab
              ? floatingPillStyle
                ? "var(--accent-ink)"
                : "var(--accent)"
              : "var(--ink-3)",
          }}
        >
          <span>•••</span>
          <span>Mais</span>
        </button>
      </nav>

      {/* `.allpages` Bottom-Sheet Drawer */}
      <DrawerPanel
        open={moreOpen}
        title={appName}
        subtitle={`${workspaceName} · todas as páginas`}
        onClose={() => setMoreOpen(false)}
        intensity={intensity}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* 3-Column Quick Create Grid (`.allpages__new`) */}
          {quickActions.length > 0 && (
            <div
              role="group"
              aria-label="Ações rápidas"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "6px",
                marginBottom: "6px",
              }}
            >
              {quickActions.slice(0, 3).map((act) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    act.onRun();
                  }}
                  style={{
                    minHeight: "64px",
                    borderRadius: "14px",
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                    fontSize: "var(--fs-2xs)",
                    fontWeight: 700,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    padding: "6px",
                  }}
                >
                  <span>{act.icon}</span>
                  <span>{act.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Full Section & Sub-Route List (`.allpages__area`) */}
          {allSections.map((sec) => {
            const isCurrentArea = sec.id === activePage;
            return (
              <section
                key={sec.id}
                style={{
                  borderRadius: "14px",
                  background: isCurrentArea ? "var(--card-2)" : "transparent",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    onNavigate(sec.id);
                  }}
                  style={{
                    width: "100%",
                    minHeight: "48px",
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "var(--fs-lg)",
                    fontWeight: 600,
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "10px",
                      background: "var(--card-2)",
                      boxShadow: "inset 0 0 0 1px var(--line)",
                      color: "var(--accent)",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {sec.icon}
                  </span>
                  <b style={{ flex: 1 }}>{sec.label}</b>
                  {Boolean(sec.count && sec.count > 0) && (
                    <span className="badge badge--info num">{sec.count}</span>
                  )}
                </button>

                {sec.subs && sec.subs.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      padding: "0 10px 12px 54px",
                    }}
                  >
                    {sec.subs.map((sub) => {
                      const isSubActive =
                        isCurrentArea && activeSub === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => {
                            setMoreOpen(false);
                            onNavigate(sec.id, sub.id);
                          }}
                          style={{
                            minHeight: "38px",
                            padding: "0 12px",
                            borderRadius: "10px",
                            fontSize: "var(--fs-sm)",
                            fontWeight: 600,
                            background: isSubActive
                              ? "var(--accent)"
                              : "var(--card)",
                            color: isSubActive
                              ? "var(--accent-ink)"
                              : "var(--ink-2)",
                            boxShadow: isSubActive
                              ? "none"
                              : "inset 0 0 0 1px var(--line)",
                          }}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}

          {/* Theme Switch Row (`.allpages__theme`) */}
          {onToggleDarkMode && (
            <div
              style={{
                borderTop: "1px solid var(--line)",
                marginTop: "6px",
                padding: "14px 10px 4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontWeight: 600,
              }}
            >
              <span>Modo Escuro</span>
              <button
                type="button"
                role="switch"
                aria-checked={darkMode}
                onClick={() => onToggleDarkMode(!darkMode)}
                className="seg__btn"
                style={{
                  background: darkMode ? "var(--accent)" : "var(--card-3)",
                  color: darkMode ? "var(--accent-ink)" : "var(--ink)",
                }}
              >
                {darkMode ? "Ativado" : "Desativado"}
              </button>
            </div>
          )}
        </div>
      </DrawerPanel>
    </>
  );
};
