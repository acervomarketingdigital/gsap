import React, { useRef, useState } from 'react';
import gsap from 'gsap';

// ============================================================================
// 1. Kelpo Multi-Channel Composer with Sticky Live Social Card Preview (.compose)
// ============================================================================

export interface SocialChannelOption {
  id: string;
  label: string;
  limit: number;
  color: string;
}

const DEFAULT_CHANNELS: SocialChannelOption[] = [
  { id: 'ig', label: 'Instagram', limit: 2200, color: '#E1306C' },
  { id: 'x', label: 'X / Twitter', limit: 280, color: '#181614' },
  { id: 'li', label: 'LinkedIn', limit: 1300, color: '#0A66C2' },
];

export const MultiChannelComposer: React.FC<{
  onSchedule: (payload: { title: string; copy: string; channels: string[] }) => void;
}> = ({ onSchedule }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [selected, setSelected] = useState<string[]>(['ig', 'x']);
  const [title, setTitle] = useState('');
  const [copy, setCopy] = useState('');

  const activeChannels = DEFAULT_CHANNELS.filter((c) => selected.includes(c.id));
  const charLimit = Math.min(...activeChannels.map((c) => c.limit));
  const overLimit = copy.length > charLimit;

  const toggleChannel = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((k) => k !== id) : prev) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || overLimit) {
      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { x: 0 },
          { keyframes: { x: [0, -7, 7, -5, 5, -2, 0] }, duration: 0.36, ease: 'power2.out' }
        );
      }
      return;
    }
    onSchedule({ title: title.trim(), copy: copy.trim(), channels: selected });
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="compose"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 248px',
        gap: 22,
        alignItems: 'start',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DEFAULT_CHANNELS.map((c) => {
            const isOn = selected.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleChannel(c.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: `1.5px solid ${isOn ? c.color : 'var(--hairline, rgba(0,0,0,0.1))'}`,
                  background: isOn ? `${c.color}14` : 'transparent',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Campaign working title…"
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid var(--hairline, rgba(0,0,0,0.12))',
            background: 'var(--card-2, #F3EDE3)',
            fontSize: 13.5,
          }}
        />

        <div>
          <textarea
            rows={4}
            value={copy}
            onChange={(e) => setCopy(e.target.value)}
            placeholder="Write caption copy…"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid var(--hairline, rgba(0,0,0,0.12))',
              background: 'var(--card-2, #F3EDE3)',
              fontSize: 13,
              resize: 'vertical',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: overLimit ? 'var(--danger, #B8332A)' : 'var(--muted)',
              marginTop: 4,
            }}
          >
            <span>Stricter channel limit applied</span>
            <span>
              {copy.length} / {charLimit}
            </span>
          </div>
        </div>

        <button
          type="submit"
          style={{
            alignSelf: 'flex-start',
            padding: '9px 16px',
            borderRadius: 10,
            border: 'none',
            background: 'var(--accent, #D84A2A)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Schedule post
        </button>
      </div>

      {/* Live Preview Card (.pv) */}
      <aside
        className="pv"
        style={{
          background: 'var(--card-2, #F3EDE3)',
          border: '1px solid var(--hairline, rgba(0,0,0,0.08))',
          borderRadius: 14,
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
          LIVE PREVIEW · {activeChannels[0]?.label.toUpperCase()}
        </div>
        <div
          style={{
            aspectRatio: '4 / 3',
            borderRadius: 10,
            background: 'linear-gradient(135deg, #D84A2A, #F3B34C)',
            display: 'flex',
            alignItems: 'flex-end',
            padding: 10,
            color: '#fff',
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {title || 'Untitled drop'}
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.45 }}>
          {copy || 'Your caption preview updates live here as you type…'}
        </p>
      </aside>
    </form>
  );
};

// ============================================================================
// 2. Levena Responsive Role Permission Matrix (.perm)
// ============================================================================

export interface PermissionRow {
  id: string;
  label: string;
  description: string;
  roles: Record<string, boolean>;
}

export const RolePermissionMatrix: React.FC<{
  roleColumns: { id: string; label: string }[];
  rows: PermissionRow[];
  onToggle: (rowId: string, roleId: string) => void;
}> = ({ roleColumns, rows, onToggle }) => {
  return (
    <div
      className="perm"
      style={{
        border: '1px solid var(--hairline, rgba(0,0,0,0.08))',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `220px repeat(${roleColumns.length}, minmax(84px, 1fr))`,
          background: 'var(--card-2, #F3EDE3)',
          padding: '10px 14px',
          borderBottom: '1px solid var(--hairline)',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span>CAPABILITY</span>
        {roleColumns.map((r) => (
          <span key={r.id} style={{ textAlign: 'center' }}>
            {r.label}
          </span>
        ))}
      </div>

      {rows.map((row) => (
        <div
          key={row.id}
          style={{
            display: 'grid',
            gridTemplateColumns: `220px repeat(${roleColumns.length}, minmax(84px, 1fr))`,
            padding: '12px 14px',
            borderBottom: '1px solid var(--hairline, rgba(0,0,0,0.06))',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{row.label}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{row.description}</div>
          </div>

          {roleColumns.map((role) => {
            const on = !!row.roles[role.id];
            return (
              <div key={role.id} style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  onClick={() => onToggle(row.id, role.id)}
                  style={{
                    width: 36,
                    height: 20,
                    borderRadius: 99,
                    border: 'none',
                    padding: 2,
                    background: on ? 'var(--accent, #D84A2A)' : 'var(--card-3, #E5DDD0)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: on ? 'flex-end' : 'flex-start',
                  }}
                >
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#fff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  />
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
