import React, { useState, useRef, useLayoutEffect } from "react";
import { gsap, Flip } from "./useGSAP-setup";
import {
  MOTION_DURATION,
  MOTION_EASE,
  MOTION_OFFSET,
  isReducedMotion,
  q,
  type MotionIntensity,
} from "../assets/motion.config";

export type KanbanStageId = "lead" | "discovery" | "proposal" | "won";

export interface KanbanCardItem {
  id: string;
  title: string;
  company: string;
  value: number;
  stage: KanbanStageId;
}

export interface KanbanLaneConfig {
  id: KanbanStageId;
  label: string;
}

const DEFAULT_LANES: readonly KanbanLaneConfig[] = [
  { id: "lead", label: "01 / Entrada" },
  { id: "discovery", label: "02 / Diagnóstico" },
  { id: "proposal", label: "03 / Proposta" },
  { id: "won", label: "04 / Fechado" },
];

export interface KanbanBoardProps {
  initialItems: readonly KanbanCardItem[];
  lanes?: readonly KanbanLaneConfig[];
  intensity?: MotionIntensity;
  onCardClick?: (item: KanbanCardItem) => void;
  onStageChange?: (itemId: string, nextStage: KanbanStageId) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  initialItems,
  lanes = DEFAULT_LANES,
  intensity = "default",
  onCardClick,
  onStageChange,
}) => {
  const [items, setItems] = useState<KanbanCardItem[]>([...initialItems]);
  const [hoverLane, setHoverLane] = useState<KanbanStageId | null>(null);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const flipStateRef = useRef<Flip.FlipState | null>(null);
  const changedLanesRef = useRef<KanbanStageId[]>([]);

  // Run Flip.from after React commits the card's new lane in the DOM (`Marlo` / `Ignara` pattern)
  useLayoutEffect(() => {
    if (!flipStateRef.current || !boardRef.current) return;
    const state = flipStateRef.current;
    flipStateRef.current = null;

    const ctx = gsap.context(() => {
      const cards = boardRef.current!.querySelectorAll(".kcard[data-flip-id]");
      Flip.from(state, {
        targets: cards,
        duration: q(MOTION_DURATION.flip, intensity),
        ease: MOTION_EASE.archOut,
        absolute: false,
      });

      // Pop the count badges of the affected columns (`back.out(3)`)
      changedLanesRef.current.forEach((laneId) => {
        const badge = boardRef.current!.querySelector<HTMLElement>(
          `[data-lane-badge="${laneId}"]`
        );
        if (badge) {
          gsap.fromTo(
            badge,
            { scale: 1.35 },
            {
              scale: 1,
              duration: q(MOTION_DURATION.pillCross, intensity),
              ease: MOTION_EASE.springPop,
              clearProps: "transform",
            }
          );
        }
      });
      changedLanesRef.current = [];
    }, boardRef);

    return () => ctx.revert();
  }, [items, intensity]);

  const moveItemToLane = (
    itemId: string,
    fromStage: KanbanStageId,
    toStage: KanbanStageId
  ) => {
    if (fromStage === toStage) return;
    if (boardRef.current && !isReducedMotion()) {
      flipStateRef.current = Flip.getState(
        boardRef.current.querySelectorAll(".kcard[data-flip-id]")
      );
      changedLanesRef.current = [fromStage, toStage];
    }

    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, stage: toStage } : it))
    );
    onStageChange?.(itemId, toStage);
  };

  /**
   * Pointer-capture drag choreography (`Marlo` + `Ignara` pattern).
   * Preserves normal click if pointer moves less than `dragThresholdPx` (6px).
   */
  const handlePointerDown = (
    e: React.PointerEvent<HTMLElement>,
    item: KanbanCardItem
  ) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button, select, a")) return;

    const cardEl = e.currentTarget;
    const startX = e.clientX;
    const startY = e.clientY;
    let dragging = false;

    const detectLaneUnderPointer = (
      clientX: number,
      clientY: number
    ): KanbanStageId | null => {
      if (!boardRef.current) return null;
      const laneEls =
        boardRef.current.querySelectorAll<HTMLElement>("[data-lane-id]");
      for (const laneEl of laneEls) {
        const r = laneEl.getBoundingClientRect();
        if (
          clientX >= r.left &&
          clientX <= r.right &&
          clientY >= r.top &&
          clientY <= r.bottom
        ) {
          return laneEl.dataset.laneId as KanbanStageId;
        }
      }
      return null;
    };

    const onPointerMove = (moveEvt: PointerEvent) => {
      const dx = moveEvt.clientX - startX;
      const dy = moveEvt.clientY - startY;

      if (!dragging && Math.hypot(dx, dy) > MOTION_OFFSET.dragThresholdPx) {
        dragging = true;
        cardEl.setPointerCapture(moveEvt.pointerId);
        cardEl.classList.add("is-dragging");

        gsap.to(cardEl, {
          scale: MOTION_OFFSET.dragScale,
          rotation: MOTION_OFFSET.dragRotation,
          duration: q(MOTION_DURATION.dragLift, intensity),
          ease: MOTION_EASE.uiOut,
        });
      }

      if (dragging) {
        gsap.set(cardEl, { x: dx, y: dy });
        setHoverLane(detectLaneUnderPointer(moveEvt.clientX, moveEvt.clientY));
      }
    };

    const onPointerUp = (upEvt: PointerEvent) => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      if (!dragging) {
        onCardClick?.(item);
        return;
      }

      cardEl.classList.remove("is-dragging");
      setHoverLane(null);
      const targetLane = detectLaneUnderPointer(upEvt.clientX, upEvt.clientY);

      if (targetLane && targetLane !== item.stage) {
        // Clear inline drag transform before capturing Flip state so Flip measures from dragged spot
        gsap.set(cardEl, { clearProps: "transform" });
        moveItemToLane(item.id, item.stage, targetLane);
      } else {
        // Spring snapback to original slot (`back.out(1.7)`)
        gsap.to(cardEl, {
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          duration: q(MOTION_DURATION.flip, intensity),
          ease: MOTION_EASE.springSnap,
          clearProps: "transform",
        });
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  const brl = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

  return (
    <div ref={boardRef} className="board" role="region" aria-label="Quadro Kanban de Negócios">
      {lanes.map((lane) => {
        const laneItems = items.filter((it) => it.stage === lane.id);
        const laneTotal = laneItems.reduce((acc, it) => acc + it.value, 0);

        return (
          <section
            key={lane.id}
            data-lane-id={lane.id}
            className={`lane ${hoverLane === lane.id ? "is-drop-target" : ""}`}
            aria-label={lane.label}
          >
            <header className="card__head" style={{ marginBottom: "6px" }}>
              <div>
                <span className="eyebrow">{lane.label}</span>
                <div className="num" style={{ fontSize: "var(--fs-sm)", color: "var(--ink-3)" }}>
                  {brl.format(laneTotal)}
                </div>
              </div>
              <span
                data-lane-badge={lane.id}
                className="badge badge--info num"
              >
                {laneItems.length}
              </span>
            </header>

            {laneItems.map((item) => {
              const laneIdx = lanes.findIndex((l) => l.id === item.stage);
              const nextLane = lanes[(laneIdx + 1) % lanes.length];

              return (
                <article
                  key={item.id}
                  data-flip-id={item.id}
                  className="kcard"
                  onPointerDown={(e) => handlePointerDown(e, item)}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--ink)" }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: "var(--fs-xs)", color: "var(--ink-3)" }}>
                        {item.company}
                      </div>
                    </div>

                    {/* Keyboard-accessible stage advance fallback */}
                    <button
                      type="button"
                      className="seg__btn"
                      title={`Avançar para ${nextLane.label}`}
                      aria-label={`Mover ${item.title} para ${nextLane.label}`}
                      onClick={() =>
                        moveItemToLane(item.id, item.stage, nextLane.id)
                      }
                    >
                      →
                    </button>
                  </div>

                  <div
                    className="num"
                    style={{
                      marginTop: "10px",
                      fontSize: "var(--fs-md)",
                      fontWeight: 600,
                      color: "var(--ink-2)",
                    }}
                  >
                    {brl.format(item.value)}
                  </div>
                </article>
              );
            })}
          </section>
        );
      })}
    </div>
  );
};
