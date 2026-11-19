import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

// ============================================================================
// 1. Tinted Pastel KPI Tile with Animated Counter & Sparkline (.kpi--1..4)
// ============================================================================

export type KpiTintVariant = 1 | 2 | 3 | 4;

export interface KpiTileProps {
  variant: KpiTintVariant;
  eyebrow: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  deltaText: string;
  deltaPositive?: boolean;
  sparkPoints: number[];
  icon?: React.ReactNode;
}

const TINT_SURFACES: Record<KpiTintVariant, string> = {
  1: 'var(--tile-1, #F6DCE0)',
  2: 'var(--tile-2, #DCEEE2)',
  3: 'var(--tile-3, #F8E9CE)',
  4: 'var(--tile-4, #E3DFF6)',
};

export const TintedKpiTile: React.FC<KpiTileProps> = ({
  variant,
  eyebrow,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  deltaText,
  deltaPositive = true,
  sparkPoints,
  icon,
}) => {
  const numRef = useRef<HTMLSpanElement>(null);
  const sparkRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = numRef.current;
    if (!el) return;
    const proxy = { v: 0 };
    const tween = gsap.to(proxy, {
      v: value,
      duration: 1.05,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = `${prefix}${proxy.v.toFixed(decimals)}${suffix}`;
      },
    });
    return () => {
      tween.kill();
    };
  }, [value, prefix, suffix, decimals]);

  useEffect(() => {
    const path = sparkRef.current;
    if (!path) return;
    const len = path.getTotalLength?.() || 140;
    path.style.strokeDasharray = `${len}`;
    gsap.fromTo(
      path,
      { strokeDashoffset: len },
      { strokeDashoffset: 0, duration: 0.95, delay: 0.15, ease: 'power2.out' }
    );
  }, [sparkPoints]);

  const sparkD = (() => {
    if (!sparkPoints.length) return '';
    const W = 92;
    const H = 28;
    const min = Math.min(...sparkPoints);
    const max = Math.max(...sparkPoints, min + 1);
    return sparkPoints
      .map((pt, i) => {
        const x = (i / Math.max(1, sparkPoints.length - 1)) * (W - 4) + 2;
        const y = H - 3 - ((pt - min) / (max - min)) * (H - 6);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  })();

  return (
    <article
      className={`kpi kpi--${variant}`}
      style={{
        background: TINT_SURFACES[variant],
        borderRadius: 16,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 14,
        border: '1px solid rgba(24,22,20,0.06)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12.5, fontWeight: 500, opacity: 0.78 }}>{eyebrow}</span>
        {icon && (
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.58)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </span>
        )}
      </div>

      <div
        style={{
          fontSize: 'clamp(26px, 2.4vw, 34px)',
          fontWeight: 600,
          letterSpacing: '-0.03em',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.05,
        }}
      >
        <span ref={numRef}>
          {prefix}
          {value.toFixed(decimals)}
          {suffix}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 8px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.62)',
            fontSize: 11.5,
            fontWeight: 600,
            fontFamily: 'var(--font-mono, monospace)',
            color: deltaPositive ? 'var(--ok, #2A6F4E)' : 'var(--danger, #B8332A)',
          }}
        >
          {deltaPositive ? '↑' : '↓'} {deltaText}
        </span>

        <svg width={92} height={28} viewBox="0 0 92 28" style={{ overflow: 'visible' }}>
          <path
            ref={sparkRef}
            d={sparkD}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.65"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </article>
  );
};

// ============================================================================
// 2. Groova Vinyl Sleeve Catalog Card (.sleeve)
// ============================================================================

export interface VinylRecordCardProps {
  code: string;
  title: string;
  artist: string;
  genre: string;
  price: string;
  stock: number;
  sleeveColorA: string;
  sleeveColorB: string;
}

export const VinylSleeveCard: React.FC<VinylRecordCardProps> = ({
  code,
  title,
  artist,
  genre,
  price,
  stock,
  sleeveColorA,
  sleeveColorB,
}) => {
  const discRef = useRef<HTMLDivElement>(null);

  const onEnter = () => {
    if (discRef.current) {
      gsap.to(discRef.current, { x: 10, rotation: 28, duration: 0.45, ease: 'power3.out' });
    }
  };

  const onLeave = () => {
    if (discRef.current) {
      gsap.to(discRef.current, { x: 0, rotation: 0, duration: 0.4, ease: 'power2.out' });
    }
  };

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        background: 'var(--card, #FAF6F0)',
        border: '1px solid var(--hairline, rgba(0,0,0,0.08))',
        borderRadius: 14,
        padding: 14,
        display: 'flex',
        gap: 16,
        alignItems: 'center',
      }}
    >
      <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0, marginRight: 8 }}>
        {/* Vinyl disc peeking from sleeve */}
        <div
          ref={discRef}
          style={{
            position: 'absolute',
            top: 4,
            bottom: 4,
            right: -10,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, #E85D2A 0 16%, #181614 17% 100%)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.22)',
          }}
        />
        {/* Jacket cover */}
        <div
          style={{
            position: 'relative',
            width: 64,
            height: 64,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${sleeveColorA}, ${sleeveColorB})`,
            boxShadow: '0 6px 14px rgba(0,0,0,0.14)',
          }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
          {code} · {genre}
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{artist}</div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {price}
        </div>
        <div
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: stock <= 3 ? 'var(--warn, #C87A19)' : 'var(--muted)',
          }}
        >
          {stock} in bin
        </div>
      </div>
    </div>
  );
};
