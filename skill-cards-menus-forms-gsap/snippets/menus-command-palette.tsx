import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';

// ============================================================================
// 1. Global Command Palette ⌘K with Shift+Enter Secondary Quick Action (.finder)
// ============================================================================

export interface CommandPaletteItem {
  id: string;
  group: string;
  title: string;
  subtitle?: string;
  onRun: () => void;
  quickAction?: {
    label: string;
    onQuickRun: () => void;
  };
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  items: CommandPaletteItem[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose, items }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        (it.subtitle && it.subtitle.toLowerCase().includes(q)) ||
        it.group.toLowerCase().includes(q)
    );
  }, [items, query]);

  useEffect(() => {
    setActiveIndex(0);
    if (!open || !listRef.current) return;
    const rows = listRef.current.querySelectorAll('.finder__item');
    gsap.fromTo(
      Array.from(rows).slice(0, 8),
      { y: 6, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.22, stagger: 0.02, ease: 'power2.out' }
    );
  }, [query, open]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    requestAnimationFrame(() => inputRef.current?.focus());
    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { y: -18, scale: 0.97, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.42, ease: 'back.out(1.6)' }
      );
    }
  }, [open]);

  if (!open) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filtered[activeIndex];
      if (!target) return;
      if (e.shiftKey && target.quickAction) {
        target.quickAction.onQuickRun();
      } else {
        target.onRun();
      }
      onClose();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(18, 16, 14, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '11vh',
        zIndex: 90,
      }}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        style={{
          width: 'min(580px, 92vw)',
          background: 'var(--card, #FAF6F0)',
          border: '1px solid var(--hairline, rgba(0,0,0,0.1))',
          borderRadius: 16,
          boxShadow: '0 24px 60px -12px rgba(0,0,0,0.28)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 16px',
            borderBottom: '1px solid var(--hairline, rgba(0,0,0,0.08))',
          }}
        >
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to page, item, or run quick action…"
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: 14,
              outline: 'none',
              color: 'inherit',
            }}
          />
          <kbd style={{ fontSize: 10, fontFamily: 'var(--font-mono)', opacity: 0.6 }}>ESC</kbd>
        </div>

        <div ref={listRef} style={{ maxHeight: 340, overflowY: 'auto', padding: 8 }}>
          {filtered.map((item, idx) => {
            const isFocused = idx === activeIndex;
            return (
              <div
                key={item.id}
                className="finder__item"
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => {
                  item.onRun();
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: isFocused ? 'var(--card-2, #F3EDE3)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{item.title}</div>
                  {item.subtitle && (
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.subtitle}</div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {isFocused && item.quickAction && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        item.quickAction!.onQuickRun();
                        onClose();
                      }}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        border: '1px solid var(--hairline)',
                        background: 'var(--card, #FAF6F0)',
                        fontSize: 11,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      ⇧↵ {item.quickAction.label}
                    </button>
                  )}
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                    {item.group}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. Notification Bell with Keyframe Shake & Popover (.notices)
// ============================================================================

export interface NoticeItem {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

export const NotificationBellPopover: React.FC<{
  notices: NoticeItem[];
  onMarkAllRead: () => void;
}> = ({ notices, onMarkAllRead }) => {
  const [open, setOpen] = useState(false);
  const bellSvgRef = useRef<SVGSVGElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const prevUnreadRef = useRef(0);

  const unreadCount = notices.filter((n) => n.unread).length;

  useEffect(() => {
    if (unreadCount > prevUnreadRef.current && bellSvgRef.current) {
      gsap.to(bellSvgRef.current, {
        keyframes: { rotation: [0, 16, -14, 10, -6, 0] },
        duration: 0.8,
        ease: 'power2.out',
        transformOrigin: '50% 10%',
      });
      if (badgeRef.current) {
        gsap.fromTo(badgeRef.current, { scale: 0.4 }, { scale: 1, duration: 0.6, ease: 'back.out(3)' });
      }
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    if (!open || !popRef.current) return;
    gsap.fromTo(
      popRef.current,
      { y: -8, scale: 0.96, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.8)' }
    );
    const items = popRef.current.querySelectorAll('.notices__item');
    gsap.fromTo(
      items,
      { y: 8, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.42, ease: 'power3.out', stagger: 0.04 }
    );
  }, [open]);

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        style={{
          position: 'relative',
          width: 36,
          height: 36,
          borderRadius: 10,
          border: '1px solid var(--hairline, rgba(0,0,0,0.08))',
          background: 'var(--card, #FAF6F0)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <svg ref={bellSvgRef} width={16} height={16} viewBox="0 0 16 16" fill="none">
          <path
            d="M4 6.5a4 4 0 0 1 8 0c0 2.5 1 3.8 1.5 4.5h-11C3 10.3 4 9 4 6.5Z"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path d="M6.5 13a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        {unreadCount > 0 && (
          <span
            ref={badgeRef}
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 16,
              height: 16,
              borderRadius: 99,
              background: 'var(--accent, #D84A2A)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={popRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 320,
            background: 'var(--card, #FAF6F0)',
            border: '1px solid var(--hairline, rgba(0,0,0,0.1))',
            borderRadius: 14,
            boxShadow: '0 18px 40px -10px rgba(0,0,0,0.2)',
            padding: 12,
            zIndex: 50,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <strong style={{ fontSize: 13 }}>Notifications</strong>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: 11,
                  color: 'var(--accent, #D84A2A)',
                  cursor: 'pointer',
                }}
              >
                Mark all read
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {notices.map((n) => (
              <div
                key={n.id}
                className="notices__item"
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: n.unread ? 'var(--card-2, #F3EDE3)' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600 }}>
                  <span>{n.title}</span>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                    {n.time}
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{n.body}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
