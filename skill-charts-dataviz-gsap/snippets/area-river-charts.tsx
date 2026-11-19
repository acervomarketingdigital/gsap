import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';

// ============================================================================
// Shared Cardinal Spline -> Cubic-Bezier Path Generator (from charts-*.js)
// ============================================================================

export function buildSmoothPath(pts: [number, number][]): string {
  if (!pts.length) return '';
  if (pts.length === 1) return `M ${pts[0][0]} ${pts[0][1]}`;
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

function buildBandPath(upper: [number, number][], lower: [number, number][]): string {
  if (!upper.length) return '';
  const topD = buildSmoothPath(upper);
  const revLow = lower.slice().reverse();
  const botD = buildSmoothPath(revLow).replace(/^M [^C]+/, '');
  const lastLow = revLow[0];
  return `${topD} L ${lastLow[0].toFixed(1)} ${lastLow[1].toFixed(1)}${botD} Z`;
}

// ============================================================================
// 1. Smooth Cubic-Bezier Area Chart with Batched Ticker Morphing
// ============================================================================

export interface AreaPoint {
  label: string;
  v: number;
  prev: number;
}

interface SmoothAreaChartProps {
  series: AreaPoint[];
  unit?: string;
  formatValue?: (v: number) => string;
}

export const SmoothAreaChart: React.FC<SmoothAreaChartProps> = ({
  series,
  formatValue = (v) => v.toLocaleString(),
}) => {
  const gradId = useId().replace(/:/g, '');
  const svgRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const fillRef = useRef<SVGPathElement>(null);
  const prevRef = useRef<SVGPathElement>(null);
  const prevCoordsRef = useRef<{
    cur: [number, number][];
    prev: [number, number][];
    baseY: number;
  } | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const W = 680;
  const H = 230;
  const pad = { l: 12, r: 12, t: 18, b: 28 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const baseY = pad.t + plotH;

  const { maxVal, curPts, prevPts } = useMemo(() => {
    const allVals = series.flatMap((d) => [d.v, d.prev]);
    const max = Math.max(...allVals, 1) * 1.08;
    const xAt = (i: number) => pad.l + (i / Math.max(1, series.length - 1)) * plotW;
    const yAt = (v: number) => pad.t + plotH - (v / max) * plotH;
    return {
      maxVal: max,
      curPts: series.map((d, i): [number, number] => [xAt(i), yAt(d.v)]),
      prevPts: series.map((d, i): [number, number] => [xAt(i), yAt(d.prev)]),
    };
  }, [series, plotW, plotH, pad.l, pad.t]);

  useEffect(() => {
    const lineEl = lineRef.current;
    const fillEl = fillRef.current;
    const prevEl = prevRef.current;
    if (!lineEl || !fillEl || !prevEl) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const last = prevCoordsRef.current;

    const applyPaths = (c: [number, number][], p: [number, number][]) => {
      const lineD = buildSmoothPath(c);
      const fillD = `${lineD} L ${c[c.length - 1][0].toFixed(1)} ${baseY} L ${c[0][0].toFixed(1)} ${baseY} Z`;
      const prevD = buildSmoothPath(p);
      lineEl.setAttribute('d', lineD);
      fillEl.setAttribute('d', fillD);
      prevEl.setAttribute('d', prevD);
    };

    if (!last || last.cur.length !== curPts.length || reducedMotion) {
      applyPaths(curPts, prevPts);
      if (!last && !reducedMotion) {
        const len = lineEl.getTotalLength?.() || 1200;
        lineEl.style.strokeDasharray = `${len}`;
        gsap.fromTo(
          lineEl,
          { strokeDashoffset: len },
          {
            strokeDashoffset: 0,
            duration: 1.2,
            ease: 'power2.inOut',
            onComplete: () => {
              lineEl.style.strokeDasharray = '';
            },
          }
        );
        gsap.fromTo(fillEl, { opacity: 0 }, { opacity: 1, duration: 0.9, delay: 0.3, ease: 'power2.out' });
      }
      prevCoordsRef.current = { cur: curPts, prev: prevPts, baseY };
      return;
    }

    const proxy = { k: 0 };
    const tween = gsap.to(proxy, {
      k: 1,
      duration: 0.9,
      ease: 'expo.inOut',
      onUpdate: () => {
        const k = proxy.k;
        const interpCur: [number, number][] = last.cur.map((a, i) => [
          a[0] + (curPts[i][0] - a[0]) * k,
          a[1] + (curPts[i][1] - a[1]) * k,
        ]);
        const interpPrev: [number, number][] = last.prev.map((a, i) => [
          a[0] + (prevPts[i][0] - a[0]) * k,
          a[1] + (prevPts[i][1] - a[1]) * k,
        ]);
        applyPaths(interpCur, interpPrev);
      },
      onComplete: () => {
        prevCoordsRef.current = { cur: curPts, prev: prevPts, baseY };
      },
    });

    return () => {
      tween.kill();
    };
  }, [curPts, prevPts, baseY]);

  const activePoint = hoverIdx !== null ? series[hoverIdx] : null;
  const activeCoord = hoverIdx !== null ? curPts[hoverIdx] : null;
  const activePrevCoord = hoverIdx !== null ? prevPts[hoverIdx] : null;

  return (
    <div
      className="area"
      style={{ position: 'relative', userSelect: 'none' }}
      onMouseMove={(e) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        setHoverIdx(Math.round(ratio * (series.length - 1)));
      }}
      onMouseLeave={() => setHoverIdx(null)}
    >
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`areaGrad-${gradId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--data, #D84A2A)" stopOpacity="0.34" />
            <stop offset="70%" stopColor="var(--data, #D84A2A)" stopOpacity="0.06" />
            <stop offset="100%" stopColor="var(--data, #D84A2A)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((r) => (
          <line
            key={r}
            x1={pad.l}
            x2={W - pad.r}
            y1={pad.t + plotH * r}
            y2={pad.t + plotH * r}
            stroke="var(--hairline, rgba(0,0,0,0.08))"
            strokeDasharray="2 4"
          />
        ))}

        <path ref={fillRef} fill={`url(#areaGrad-${gradId})`} />
        <path
          ref={prevRef}
          fill="none"
          stroke="var(--muted, #7D766C)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.55"
        />
        <path
          ref={lineRef}
          fill="none"
          stroke="var(--data, #D84A2A)"
          strokeWidth="2.25"
          strokeLinecap="round"
        />

        {activeCoord && activePrevCoord && (
          <g>
            <line
              x1={activeCoord[0]}
              x2={activeCoord[0]}
              y1={pad.t}
              y2={baseY}
              stroke="var(--fg, #181614)"
              strokeOpacity="0.2"
              strokeDasharray="2 3"
            />
            <circle cx={activePrevCoord[0]} cy={activePrevCoord[1]} r={3.5} fill="var(--muted, #7D766C)" />
            <circle
              cx={activeCoord[0]}
              cy={activeCoord[1]}
              r={5}
              fill="var(--card, #FAF6F0)"
              stroke="var(--data, #D84A2A)"
              strokeWidth={2.5}
            />
          </g>
        )}

        {series.map((d, i) => {
          const step = Math.max(1, Math.floor(series.length / 6));
          if (i % step !== 0 && i !== series.length - 1) return null;
          return (
            <text
              key={d.label}
              x={curPts[i][0]}
              y={H - 6}
              textAnchor="middle"
              fill="var(--muted, #7D766C)"
              fontSize="10"
              fontFamily="var(--font-mono, monospace)"
            >
              {d.label}
            </text>
          );
        })}
      </svg>

      {activePoint && activeCoord && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: `${(activeCoord[0] / W) * 100}%`,
            transform: hoverIdx! > series.length * 0.68 ? 'translateX(-108%)' : 'translateX(12px)',
            background: 'var(--card, #FAF6F0)',
            border: '1px solid var(--hairline, rgba(0,0,0,0.08))',
            borderRadius: 10,
            padding: '8px 10px',
            boxShadow: '0 10px 24px -8px rgba(0,0,0,0.16)',
            pointerEvents: 'none',
            fontSize: 12,
            minWidth: 132,
          }}
        >
          <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            {activePoint.label}
          </div>
          <div style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
            {formatValue(activePoint.v)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
            Prev: {formatValue(activePoint.prev)}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. Kelpo Stacked Multi-Channel River / Stream Chart (.river)
// ============================================================================

export interface RiverChannelMeta {
  id: string;
  label: string;
  color: string;
}

export interface RiverSeriesRow {
  label: string;
  values: Record<string, number>;
}

interface StackedRiverChartProps {
  channels: RiverChannelMeta[];
  rows: RiverSeriesRow[];
}

export const StackedRiverChart: React.FC<StackedRiverChartProps> = ({ channels, rows }) => {
  const gradPrefix = useId().replace(/:/g, '');
  const bandRefs = useRef<Record<string, SVGPathElement | null>>({});
  const crestRefs = useRef<Record<string, SVGPathElement | null>>({});
  const weightsRef = useRef<Record<string, number>>(
    Object.fromEntries(channels.map((c) => [c.id, 1]))
  );
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(channels.map((c) => [c.id, true]))
  );

  const W = 720;
  const H = 236;
  const pad = { l: 10, r: 10, t: 28, b: 28 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  const maxStack = useMemo(() => {
    const totals = rows.map((r) =>
      channels.reduce((acc, c) => acc + (r.values[c.id] || 0), 0)
    );
    return Math.max(1, ...totals) * 1.08;
  }, [rows, channels]);

  const renderWithWeights = (wt: Record<string, number>) => {
    const xAt = (i: number) => pad.l + (i / Math.max(1, rows.length - 1)) * plotW;
    const yAt = (v: number) => pad.t + plotH - (v / maxStack) * plotH;

    const cumulative = new Array(rows.length).fill(0);
    channels.forEach((ch) => {
      const w = wt[ch.id] ?? 1;
      const lower: [number, number][] = rows.map((_, i) => [xAt(i), yAt(cumulative[i])]);
      const upper: [number, number][] = rows.map((row, i) => {
        cumulative[i] += (row.values[ch.id] || 0) * w;
        return [xAt(i), yAt(cumulative[i])];
      });
      const bandEl = bandRefs.current[ch.id];
      const crestEl = crestRefs.current[ch.id];
      if (bandEl) bandEl.setAttribute('d', buildBandPath(upper, lower));
      if (crestEl) {
        crestEl.setAttribute('d', buildSmoothPath(upper));
        crestEl.style.opacity = w < 0.05 ? '0' : '1';
      }
    });
  };

  useEffect(() => {
    const fromWt = { ...weightsRef.current };
    const toWt = Object.fromEntries(channels.map((c) => [c.id, enabled[c.id] ? 1 : 0]));
    const proxy = { t: 0 };

    const tween = gsap.to(proxy, {
      t: 1,
      duration: 0.85,
      ease: 'expo.inOut',
      onUpdate: () => {
        const cur: Record<string, number> = {};
        channels.forEach((c) => {
          cur[c.id] = fromWt[c.id] + (toWt[c.id] - fromWt[c.id]) * proxy.t;
        });
        weightsRef.current = cur;
        renderWithWeights(cur);
      },
    });

    return () => {
      tween.kill();
    };
  }, [enabled, rows, channels, maxStack]);

  const toggleChannel = (id: string) => {
    setEnabled((prev) => {
      const activeCount = Object.values(prev).filter(Boolean).length;
      if (prev[id] && activeCount <= 1) return prev;
      return { ...prev, [id]: !prev[id] };
    });
  };

  return (
    <div className="river">
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {channels.map((c) => {
          const isOn = enabled[c.id];
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleChannel(c.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 500,
                border: '1px solid var(--hairline, rgba(0,0,0,0.08))',
                background: isOn ? 'var(--card-2, #F3EDE3)' : 'transparent',
                opacity: isOn ? 1 : 0.45,
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 99,
                  background: c.color,
                }}
              />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          {channels.map((c) => (
            <linearGradient key={c.id} id={`${gradPrefix}-${c.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.color} stopOpacity="0.65" />
              <stop offset="100%" stopColor={c.color} stopOpacity="0.22" />
            </linearGradient>
          ))}
        </defs>

        {channels.map((c) => (
          <path
            key={`band-${c.id}`}
            ref={(el) => {
              bandRefs.current[c.id] = el;
            }}
            fill={`url(#${gradPrefix}-${c.id})`}
          />
        ))}

        {channels.map((c) => (
          <path
            key={`crest-${c.id}`}
            ref={(el) => {
              crestRefs.current[c.id] = el;
            }}
            fill="none"
            stroke={c.color}
            strokeWidth="1.6"
          />
        ))}
      </svg>
    </div>
  );
};
