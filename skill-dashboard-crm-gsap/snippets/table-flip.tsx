import React, { useState, useRef, useLayoutEffect } from "react";
import {
  gsap,
  Flip,
  animateClipPathPill,
  motionPrimitives,
} from "./useGSAP-setup";
import {
  MOTION_DURATION,
  MOTION_EASE,
  MOTION_STAGGER,
  isReducedMotion,
  q,
  type MotionIntensity,
} from "../assets/motion.config";

export interface DealRow {
  id: string;
  account: string;
  owner: string;
  stage: "qualified" | "proposal" | "negotiation" | "closed";
  amount: number;
  updatedAt: string;
}

export interface TableFlipProps {
  rows: readonly DealRow[];
  intensity?: MotionIntensity;
  onSelectRow?: (row: DealRow) => void;
}

const STAGE_FILTERS = [
  { key: "all", label: "Todos" },
  { key: "qualified", label: "Qualificados" },
  { key: "proposal", label: "Proposta" },
  { key: "negotiation", label: "Negociação" },
  { key: "closed", label: "Fechados" },
] as const;

type FilterKey = (typeof STAGE_FILTERS)[number]["key"];

export const TableFlip: React.FC<TableFlipProps> = ({
  rows,
  intensity = "default",
  onSelectRow,
}) => {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const tbodyRef = useRef<HTMLTableSectionElement | null>(null);
  const segRef = useRef<HTMLDivElement | null>(null);
  const thumbRef = useRef<HTMLSpanElement | null>(null);
  const pendingFlipState = useRef<Flip.FlipState | null>(null);
  const didInitialMount = useRef<boolean>(false);

  const captureTableFlipState = () => {
    if (!tbodyRef.current || isReducedMotion()) return;
    const rowNodes = tbodyRef.current.querySelectorAll("tr[data-flip-id]");
    pendingFlipState.current = Flip.getState(rowNodes);
  };

  const handleFilterChange = (nextFilter: FilterKey) => {
    if (nextFilter === filter) return;
    captureTableFlipState();
    setFilter(nextFilter);
  };

  const handleToggleSort = () => {
    captureTableFlipState();
    setSortAsc((prev) => !prev);
  };

  const visibleRows = React.useMemo(() => {
    const filtered =
      filter === "all" ? [...rows] : rows.filter((r) => r.stage === filter);
    return filtered.sort((a, b) =>
      sortAsc ? a.amount - b.amount : b.amount - a.amount
    );
  }, [rows, filter, sortAsc]);

  // 1. Initial table row stagger capped at `maxTableRows` (14 rows)
  useLayoutEffect(() => {
    if (didInitialMount.current || !tbodyRef.current) return;
    didInitialMount.current = true;

    const ctx = gsap.context(() => {
      const trs = tbodyRef.current!.querySelectorAll("tr");
      motionPrimitives.rows(trs, intensity);
    }, tbodyRef);

    return () => ctx.revert();
  }, [intensity]);

  // 2. Flip layout transition on filter/sort + asymmetric clip-path pill update
  useLayoutEffect(() => {
    if (segRef.current && thumbRef.current) {
      const activeBtn = segRef.current.querySelector<HTMLElement>(
        `[data-filter="${filter}"]`
      );
      if (activeBtn) {
        animateClipPathPill(
          segRef.current,
          thumbRef.current,
          activeBtn,
          999,
          intensity
        );
      }
    }

    if (!pendingFlipState.current || !tbodyRef.current) return;
    const state = pendingFlipState.current;
    pendingFlipState.current = null;

    const ctx = gsap.context(() => {
      const currentTargets =
        tbodyRef.current!.querySelectorAll("tr[data-flip-id]");

      Flip.from(state, {
        targets: currentTargets,
        duration: q(MOTION_DURATION.flip, intensity),
        ease: MOTION_EASE.flipInOut,
        absolute: false, // Never use absolute: true on native <tr> elements
        scale: false,
        nested: true,
        onEnter: (elements) =>
          gsap.fromTo(
            elements,
            { opacity: 0, y: 8 },
            {
              opacity: 1,
              y: 0,
              duration: q(MOTION_DURATION.pillLead, intensity),
              ease: MOTION_EASE.uiOut,
              stagger: q(MOTION_STAGGER.flipEnter, intensity),
              clearProps: "transform,opacity",
            }
          ),
      });
    }, tbodyRef);

    return () => ctx.revert();
  }, [visibleRows, filter, intensity]);

  const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

  const stageBadgeTone: Record<DealRow["stage"], string> = {
    qualified: "info",
    proposal: "warn",
    negotiation: "warn",
    closed: "good",
  };

  return (
    <section ref={wrapRef} className="card">
      <div className="card__head">
        <div>
          <h2 className="card__title">Negócios Ativos no Pipeline</h2>
          <p className="card__sub num">{visibleRows.length} registros exibidos</p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div ref={segRef} className="seg" role="tablist" aria-label="Filtrar por estágio">
            <span ref={thumbRef} className="seg__thumb" aria-hidden="true" />
            {STAGE_FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                data-filter={item.key}
                aria-selected={filter === item.key}
                className={`seg__btn ${filter === item.key ? "is-active" : ""}`}
                onClick={() => handleFilterChange(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="seg__btn"
            onClick={handleToggleSort}
            aria-label="Ordenar por valor"
          >
            Valor {sortAsc ? "↑" : "↓"}
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table table--stack">
          <thead>
            <tr>
              <th>Conta</th>
              <th>Responsável</th>
              <th>Estágio</th>
              <th>Valor</th>
              <th>Atualizado</th>
            </tr>
          </thead>
          <tbody ref={tbodyRef}>
            {visibleRows.map((row) => (
              <tr
                key={row.id}
                data-flip-id={row.id}
                onClick={() => onSelectRow?.(row)}
                style={{ cursor: onSelectRow ? "pointer" : "default" }}
              >
                <td style={{ gridArea: "main", fontWeight: 600, color: "var(--ink)" }}>
                  {row.account}
                </td>
                <td style={{ gridArea: "sub" }}>{row.owner}</td>
                <td style={{ gridArea: "tag" }}>
                  <span className={`badge badge--${stageBadgeTone[row.stage]}`}>
                    {row.stage}
                  </span>
                </td>
                <td className="num" style={{ gridArea: "end", fontWeight: 600 }}>
                  {currencyFormatter.format(row.amount)}
                </td>
                <td className="num">{row.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
