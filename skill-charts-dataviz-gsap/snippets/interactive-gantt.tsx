import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

// ============================================================================
// Levena / Fragio Interactive 2D Shift & Season Gantt Chart (.gantt)
// Supports:
//  - Pointer drag (move) & right-edge resize (end) snapped to 0.25h (15m)
//  - Overlap conflict detection with horizontal shake + snap-back
//  - Elastic squash-and-stretch on valid drop: elastic.out(1, 0.45)
//  - Zoom range switching with FLIP position & scaleX interpolation
// ============================================================================

export interface GanttStaffRow {
  id: string;
  name: string;
  role: string;
  color: string;
}

export interface GanttShiftBlock {
  id: string;
  personId: string;
  start: number; // e.g. 8.5 = 08:30
  end: number;   // e.g. 16.0 = 16:00
  station: string;
}

const ZOOM_PRESETS = {
  full: { label: 'Full day (6–24h)', start: 6, end: 24 },
  am: { label: 'Morning (6–15h)', start: 6, end: 15 },
  pm: { label: 'Evening (14–24h)', start: 14, end: 24 },
} as const;

type ZoomKey = keyof typeof ZOOM_PRESETS;

const SNAP = 0.25; // 15-minute increments
const snapTo = (v: number) => Math.round(v / SNAP) * SNAP;

export function formatHour(h: number): string {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

interface InteractiveShiftGanttProps {
  staff: GanttStaffRow[];
  initialShifts: GanttShiftBlock[];
  onShiftsChange?: (shifts: GanttShiftBlock[]) => void;
}

export const InteractiveShiftGantt: React.FC<InteractiveShiftGanttProps> = ({
  staff,
  initialShifts,
  onShiftsChange,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shifts, setShifts] = useState<GanttShiftBlock[]>(initialShifts);
  const [zoom, setZoom] = useState<ZoomKey>('full');
  const [selectedId, setSelectedId] = useState<string | null>(initialShifts[0]?.id ?? null);

  const range = ZOOM_PRESETS[zoom];
  const span = range.end - range.start;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gbar__bg',
        { scaleX: 0, transformOrigin: '0% 50%' },
        { scaleX: 1, duration: 0.85, ease: 'expo.out', stagger: 0.035 }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  const switchZoom = (nextZoom: ZoomKey) => {
    if (nextZoom === zoom || !rootRef.current) return;
    const oldRects = new Map<string, DOMRect>();
    rootRef.current.querySelectorAll<HTMLElement>('.gbar').forEach((b) => {
      if (b.dataset.id) oldRects.set(b.dataset.id, b.getBoundingClientRect());
    });

    setZoom(nextZoom);

    requestAnimationFrame(() => {
      if (!rootRef.current) return;
      rootRef.current.querySelectorAll<HTMLElement>('.gbar').forEach((b) => {
        const id = b.dataset.id;
        const old = id ? oldRects.get(id) : undefined;
        if (!old) return;
        const cur = b.getBoundingClientRect();
        const dx = old.left - cur.left;
        const scaleRatio = cur.width > 0 ? old.width / cur.width : 1;
        gsap.fromTo(b, { x: dx }, { x: 0, duration: 0.7, ease: 'expo.inOut' });
        const bg = b.querySelector('.gbar__bg');
        if (bg) {
          gsap.fromTo(
            bg,
            { scaleX: scaleRatio, transformOrigin: '0% 50%' },
            { scaleX: 1, duration: 0.7, ease: 'expo.inOut' }
          );
        }
      });
    });
  };

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    shift: GanttShiftBlock
  ) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    const barEl = e.currentTarget;
    const trackEl = barEl.parentElement;
    if (!trackEl) return;

    const isGrip = (e.target as HTMLElement).closest('[data-grip="end"]');
    const mode: 'move' | 'end' = isGrip ? 'end' : 'move';
    const trackRect = trackEl.getBoundingClientRect();
    const startClientX = e.clientX;
    const duration = shift.end - shift.start;

    let draftStart = shift.start;
    let draftEnd = shift.end;
    let hasMoved = false;

    setSelectedId(shift.id);
    gsap.to(barEl, { scale: 1.03, duration: 0.18, ease: 'power2.out' });

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startClientX;
      if (Math.abs(dx) > 3) hasMoved = true;
      const deltaHours = (dx / trackRect.width) * span;

      if (mode === 'move') {
        draftStart = snapTo(Math.max(6, Math.min(24 - duration, shift.start + deltaHours)));
        draftEnd = draftStart + duration;
        const pxOffset = ((draftStart - shift.start) / span) * trackRect.width;
        gsap.set(barEl, { x: pxOffset });
      } else {
        draftEnd = snapTo(Math.max(shift.start + 1, Math.min(24, shift.end + deltaHours)));
        const newPct = ((draftEnd - shift.start) / span) * 100;
        barEl.style.width = `${newPct}%`;
      }
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);

      if (!hasMoved) {
        gsap.to(barEl, { scale: 1, duration: 0.2 });
        return;
      }

      // Check overlap on same staff row
      const hasConflict = shifts.some(
        (other) =>
          other.id !== shift.id &&
          other.personId === shift.personId &&
          draftStart < other.end &&
          draftEnd > other.start
      );

      if (hasConflict) {
        gsap
          .timeline()
          .to(barEl, { x: '+=7', duration: 0.05 })
          .to(barEl, { x: '-=14', duration: 0.07 })
          .to(barEl, { x: '+=10', duration: 0.06 })
          .to(barEl, { x: 0, scale: 1, duration: 0.35, ease: 'back.out(1.8)' });
        return;
      }

      const oldRect = barEl.getBoundingClientRect();
      const updated = shifts.map((s) =>
        s.id === shift.id ? { ...s, start: draftStart, end: draftEnd } : s
      );
      setShifts(updated);
      onShiftsChange?.(updated);

      requestAnimationFrame(() => {
        const freshEl = rootRef.current?.querySelector<HTMLElement>(
          `.gbar[data-id="${shift.id}"]`
        );
        if (!freshEl) return;
        const newRect = freshEl.getBoundingClientRect();
        gsap
          .timeline()
          .fromTo(
            freshEl,
            { x: oldRect.left - newRect.left, scale: 1.03 },
            { x: 0, scale: 1, duration: 0.42, ease: 'power3.out' }
          )
          .fromTo(
            freshEl,
            { scaleY: 0.78, scaleX: 1.03 },
            { scaleY: 1, scaleX: 1, duration: 0.55, ease: 'elastic.out(1, 0.45)' },
            0.22
          );
      });
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div ref={rootRef} className="gantt" style={{ userSelect: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'inline-flex', gap: 4, padding: 3, borderRadius: 8, background: 'var(--card-2, #F3EDE3)' }}>
          {(Object.keys(ZOOM_PRESETS) as ZoomKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => switchZoom(k)}
              style={{
                padding: '5px 10px',
                borderRadius: 6,
                border: 'none',
                fontSize: 12,
                fontWeight: 500,
                background: zoom === k ? 'var(--card, #FAF6F0)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              {ZOOM_PRESETS[k].label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ border: '1px solid var(--hairline, rgba(0,0,0,0.08))', borderRadius: 12, overflow: 'hidden' }}>
        {staff.map((person) => {
          const personShifts = shifts.filter((s) => s.personId === person.id);
          return (
            <div
              key={person.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '180px minmax(0, 1fr)',
                borderBottom: '1px solid var(--hairline, rgba(0,0,0,0.08))',
                minHeight: 54,
              }}
            >
              <div style={{ padding: '10px 14px', borderRight: '1px solid var(--hairline)' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{person.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{person.role}</div>
              </div>

              <div style={{ position: 'relative', height: 54 }}>
                {personShifts.map((sh) => {
                  const clStart = Math.max(range.start, sh.start);
                  const clEnd = Math.min(range.end, sh.end);
                  if (clEnd <= range.start || clStart >= range.end) return null;
                  const leftPct = ((clStart - range.start) / span) * 100;
                  const widthPct = ((clEnd - clStart) / span) * 100;
                  const isSelected = selectedId === sh.id;

                  return (
                    <div
                      key={sh.id}
                      data-id={sh.id}
                      className="gbar"
                      onPointerDown={(e) => handlePointerDown(e, sh)}
                      style={{
                        position: 'absolute',
                        top: 8,
                        bottom: 8,
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        cursor: 'grab',
                        zIndex: isSelected ? 3 : 1,
                      }}
                    >
                      <div
                        className="gbar__bg"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: 8,
                          background: `color-mix(in oklab, ${person.color} 22%, var(--card, #FAF6F0))`,
                          border: `1.5px solid ${person.color}`,
                          boxShadow: isSelected ? `0 0 0 2px ${person.color}33` : 'none',
                        }}
                      />
                      <div
                        style={{
                          position: 'relative',
                          padding: '4px 10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          height: '100%',
                          fontSize: 11.5,
                        }}
                      >
                        <strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {sh.station}
                        </strong>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, opacity: 0.75 }}>
                          {formatHour(sh.start)}–{formatHour(sh.end)}
                        </span>
                      </div>
                      <span
                        data-grip="end"
                        style={{
                          position: 'absolute',
                          top: 4,
                          bottom: 4,
                          right: 2,
                          width: 6,
                          cursor: 'ew-resize',
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
