import React, { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';

// ============================================================================
// 1. Ghost Comparison Vertical Bars (.bars)
// ============================================================================

export interface GhostBarDatum {
  label: string;
  value: number;
  prev: number;
}

export const GhostComparisonBars: React.FC<{ data: GhostBarDatum[] }> = ({ data }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  const { max, peakIdx } = useMemo(() => {
    const m = Math.max(1, ...data.flatMap((d) => [d.value, d.prev]));
    let pIdx = 0;
    data.forEach((d, i) => {
      if (d.value > data[pIdx].value) pIdx = i;
    });
    return { max: m, peakIdx: pIdx };
  }, [data]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const bars = el.querySelectorAll<HTMLElement>('.bars__bar');
    const ghosts = el.querySelectorAll<HTMLElement>('.bars__ghost');

    if (!mountedRef.current) {
      mountedRef.current = true;
      bars.forEach((b, i) => {
        const ratio = data[i].value / max;
        gsap.fromTo(
          b,
          { scaleY: 0, transformOrigin: '50% 100%' },
          { scaleY: ratio, duration: 1.0, delay: 0.15 + i * 0.04, ease: 'expo.out' }
        );
      });
      ghosts.forEach((g, i) => {
        const ratio = data[i].prev / max;
        gsap.fromTo(
          g,
          { scaleY: 0, transformOrigin: '50% 100%' },
          { scaleY: ratio, duration: 0.9, delay: 0.05 + i * 0.03, ease: 'expo.out' }
        );
      });
    } else {
      bars.forEach((b, i) => {
        gsap.to(b, {
          scaleY: data[i].value / max,
          duration: 0.75,
          delay: i * 0.02,
          ease: 'expo.inOut',
        });
      });
      ghosts.forEach((g, i) => {
        gsap.to(g, {
          scaleY: data[i].prev / max,
          duration: 0.75,
          delay: i * 0.02,
          ease: 'expo.inOut',
        });
      });
    }
  }, [data, max]);

  return (
    <div
      ref={wrapRef}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`,
        gap: 8,
        alignItems: 'end',
      }}
    >
      {data.map((d, i) => (
        <div key={d.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', width: '100%', height: 168 }}>
            <div
              className="bars__ghost"
              style={{
                position: 'absolute',
                inset: 'auto 6% 0',
                height: '100%',
                background: 'var(--card-3, #EAE2D6)',
                borderRadius: '6px 6px 2px 2px',
              }}
            />
            <div
              className="bars__bar"
              style={{
                position: 'absolute',
                inset: 'auto 20% 0',
                height: '100%',
                background: i === peakIdx ? 'var(--accent, #D84A2A)' : 'var(--data, #2A6F62)',
                borderRadius: '6px 6px 2px 2px',
              }}
            />
          </div>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// 2. Groova Staircase Conversion Funnel (.stair)
// ============================================================================

export interface FunnelStep {
  id: string;
  label: string;
  count: number;
  prevRatio: number;
  color: string;
}

export const StaircaseFunnel: React.FC<{ steps: FunnelStep[] }> = ({ steps }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const topCount = Math.max(1, steps[0]?.count || 1);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const bars = el.querySelectorAll<HTMLElement>('.stair__bar');
    bars.forEach((b, i) => {
      const ratio = steps[i].count / topCount;
      gsap.fromTo(
        b,
        { scaleY: 0, transformOrigin: '50% 100%' },
        { scaleY: ratio, duration: 1.0, delay: 0.1 + i * 0.08, ease: 'expo.out' }
      );
    });
  }, [steps, topCount]);

  return (
    <div
      ref={rootRef}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
        gap: 14,
      }}
    >
      {steps.map((s, i) => {
        const sharePct = Math.round((s.count / topCount) * 100);
        const stepConv = i > 0 ? Math.round((s.count / steps[i - 1].count) * 100) : null;
        return (
          <div key={s.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
                0{i + 1}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600 }}>
                {sharePct}%
              </span>
            </div>

            <div
              style={{
                position: 'relative',
                height: 178,
                borderRadius: '10px 10px 4px 4px',
                borderBottom: '1px solid var(--hairline)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'repeating-linear-gradient(135deg, rgba(0,0,0,0.04) 0 6px, transparent 6px 12px)',
                }}
              />
              <div
                className="stair__bar"
                style={{
                  position: 'absolute',
                  inset: 'auto 0 0',
                  height: '100%',
                  borderRadius: '10px 10px 3px 3px',
                  background: s.color,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: `${s.prevRatio * 100}%`,
                  borderTop: '1.5px dashed rgba(24,22,20,0.38)',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {stepConv !== null && (
              <div
                style={{
                  position: 'absolute',
                  left: -7,
                  top: '54%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 3,
                  padding: '3px 6px',
                  borderRadius: 999,
                  background: 'var(--card, #FAF6F0)',
                  border: '1px solid var(--hairline)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              >
                → {stepConv}%
              </div>
            )}

            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {s.count.toLocaleString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// 3. 2D Grid Heatmap with Peak Highlight (.heat)
// ============================================================================

interface GridHeatmapProps {
  rows: string[];
  cols: string[];
  matrix: number[][]; // [row][col]
}

export const GridHeatmap: React.FC<GridHeatmapProps> = ({ rows, cols, matrix }) => {
  const gridRef = useRef<HTMLDivElement>(null);

  const { maxVal, peakR, peakC } = useMemo(() => {
    let m = 1;
    let pr = 0;
    let pc = 0;
    matrix.forEach((r, ri) =>
      r.forEach((v, ci) => {
        if (v > m) {
          m = v;
          pr = ri;
          pc = ci;
        }
      })
    );
    return { maxVal: m, peakR: pr, peakC: pc };
  }, [matrix]);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const cells = el.querySelectorAll('.heat__dot');
    gsap.fromTo(
      cells,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: 'back.out(2.2)',
        stagger: { each: 0.012, grid: [rows.length, cols.length], from: 'start' },
      }
    );
  }, [rows.length, cols.length, matrix]);

  return (
    <div
      ref={gridRef}
      style={{
        display: 'grid',
        gridTemplateColumns: `48px repeat(${cols.length}, minmax(0, 1fr))`,
        gap: 6,
        alignItems: 'center',
      }}
    >
      <span />
      {cols.map((c) => (
        <span
          key={c}
          style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            color: 'var(--muted)',
            textAlign: 'center',
          }}
        >
          {c}
        </span>
      ))}

      {rows.map((rLabel, ri) => (
        <React.Fragment key={rLabel}>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
            {rLabel}
          </span>
          {cols.map((cLabel, ci) => {
            const val = matrix[ri]?.[ci] ?? 0;
            const ratio = val / maxVal;
            const isPeak = ri === peakR && ci === peakC;
            const mixPct = Math.round(14 + ratio * 86);
            return (
              <div
                key={`${ri}-${ci}`}
                title={`${rLabel} · ${cLabel}: ${val}`}
                style={{ aspectRatio: '1.35 / 1', display: 'flex' }}
              >
                <i
                  className="heat__dot"
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    borderRadius: 6,
                    background: `color-mix(in oklab, var(--data, #D84A2A) ${mixPct}%, var(--card-3, #EAE2D6))`,
                    boxShadow: isPeak
                      ? '0 0 0 2px var(--card, #FAF6F0), 0 0 0 4px var(--data, #D84A2A)'
                      : 'none',
                  }}
                />
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};
