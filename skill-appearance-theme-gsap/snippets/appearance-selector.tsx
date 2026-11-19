import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import {
  MOTION_DURATION,
  MOTION_EASE,
  isReducedMotion,
  q,
  type MotionIntensity,
} from "../../skill-dashboard-crm-gsap/assets/motion.config";

export type ThemeMode = "light" | "dark" | "system";
export type RowDensity = "comfy" | "compact";
export type ThemeCardVariant = "marlo" | "brisko" | "groova" | "levena";

export interface AccentPreset {
  id: string;
  label: string;
  hex: string;
}

export const DEFAULT_ACCENT_PRESETS: readonly AccentPreset[] = [
  { id: "amber", label: "Âmbar (Marlo)", hex: "#f29b23" },
  { id: "ember", label: "Brasa (Ignara)", hex: "#ee5230" },
  { id: "cobalt", label: "Cobalto (Groova)", hex: "#2348d0" },
  { id: "forest", label: "Floresta (Tolva)", hex: "#3b7424" },
  { id: "berry", label: "Framboesa (Kelpo)", hex: "#c8285e" },
  { id: "teal", label: "Turquesa (Calda)", hex: "#14b8a6" },
] as const;

/* ==========================================================================
   OKLAB & WCAG CONTRAST-SAFE ACCENT ENGINE (Extracted from Calda)
   ========================================================================== */

const toLinear = (c: number): number =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

const fromLinear = (c: number): number =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;

function hexToRgb01(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : clean;
  return [
    parseInt(full.slice(0, 2), 16) / 255,
    parseInt(full.slice(2, 4), 16) / 255,
    parseInt(full.slice(4, 6), 16) / 255,
  ];
}

function rgb01ToHex(rgb: [number, number, number]): string {
  return (
    "#" +
    rgb
      .map((v) =>
        Math.round(Math.min(1, Math.max(0, v)) * 255)
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}

function relativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(
  a: [number, number, number],
  b: [number, number, number]
): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x
  );
  return (hi + 0.05) / (lo + 0.05);
}

function rgbToOklch([r, g, b]: [number, number, number]): [
  number,
  number,
  number,
] {
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360];
}

function oklchToRgb([L, C, H]: [number, number, number]): [
  number,
  number,
  number,
] {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

export function computeAccessibleAccentTokens(hex: string) {
  const lch = rgbToOklch(hexToRgb01(hex));
  const white: [number, number, number] = [1, 1, 1];
  const ink: [number, number, number] = hexToRgb01("#15181b");

  const adjustForSurface = (
    bgHex: string,
    dir: 1 | -1
  ): Record<string, string> => {
    const bg = hexToRgb01(bgHex);
    let L = lch[0];
    let candidate = oklchToRgb([L, lch[1], lch[2]]);
    for (let i = 0; i < 80; i++) {
      candidate = oklchToRgb([L, lch[1], lch[2]]);
      if (contrastRatio(candidate, bg) >= 2.2) break;
      L = Math.min(0.92, Math.max(0.18, L + dir * 0.01));
    }
    const onAccent =
      contrastRatio(white, candidate) >= 3.0 ? "#ffffff" : "#15181b";

    let textL = L;
    let textRgb = candidate;
    for (let i = 0; i < 80; i++) {
      textRgb = oklchToRgb([textL, lch[1], lch[2]]);
      if (contrastRatio(textRgb, bg) >= 4.5) break;
      textL = Math.min(0.95, Math.max(0.15, textL + dir * 0.01));
    }

    const [r, g, b] = candidate.map((v) =>
      Math.round(Math.min(1, Math.max(0, v)) * 255)
    );

    return {
      "--accent": rgb01ToHex(candidate),
      "--accent-ink": onAccent,
      "--accent-text": rgb01ToHex(textRgb),
      "--accent-soft": `rgba(${r}, ${g}, ${b}, ${dir < 0 ? 0.14 : 0.22})`,
    };
  };

  return {
    light: adjustForSurface("#ebebe8", -1),
    dark: adjustForSurface("#1b1c1e", 1),
    inkFallback: rgb01ToHex(ink),
  };
}

/**
 * Triggers a circular View Transition reveal from the clicked element (`an` pattern)
 */
export function runCircularViewTransition(
  mutateDom: () => void,
  originEl?: HTMLElement | null
): void {
  type DocWithVT = Document & {
    startViewTransition?: (cb: () => void) => { ready: Promise<void> };
  };
  const doc = document as DocWithVT;

  if (
    typeof doc.startViewTransition !== "function" ||
    isReducedMotion() ||
    !originEl
  ) {
    mutateDom();
    return;
  }

  const rect = originEl.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const maxRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  doc
    .startViewTransition(() => {
      mutateDom();
    })
    .ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: MOTION_DURATION.themeRevealMs,
          easing: MOTION_EASE.viewTransition,
          pseudoElement: "::view-transition-new(root)",
        }
      );
    })
    .catch(() => {});
}

/* ==========================================================================
   APPEARANCE SETTINGS COMPONENT (Marlo + Calda + Groova + Brisko Combined)
   ========================================================================== */

export interface AppearanceSelectorProps {
  initialTheme?: ThemeMode;
  initialAccentHex?: string;
  initialDensity?: RowDensity;
  initialRail?: boolean;
  initialFrost?: number;
  cardVariant?: ThemeCardVariant;
  intensity?: MotionIntensity;
  onToggleSidebarRail?: (isRail: boolean) => void;
}

export const AppearanceSelector: React.FC<AppearanceSelectorProps> = ({
  initialTheme = "light",
  initialAccentHex = DEFAULT_ACCENT_PRESETS[0].hex,
  initialDensity = "comfy",
  initialRail = false,
  initialFrost = 0.5,
  cardVariant = "marlo",
  intensity = "default",
  onToggleSidebarRail,
}) => {
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);
  const [accentHex, setAccentHex] = useState<string>(initialAccentHex);
  const [density, setDensity] = useState<RowDensity>(initialDensity);
  const [isRail, setIsRail] = useState<boolean>(initialRail);
  const [frost, setFrost] = useState<number>(initialFrost);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const resolveEffectiveTheme = (mode: ThemeMode): "light" | "dark" => {
    if (mode === "system" && typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return mode === "dark" ? "dark" : "light";
  };

  const applyAccentStyleSheet = (hex: string) => {
    const tokens = computeAccessibleAccentTokens(hex);
    let styleEl = document.getElementById(
      "editorial-accent-vars"
    ) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "editorial-accent-vars";
      document.head.appendChild(styleEl);
    }
    const toCssRules = (obj: Record<string, string>) =>
      Object.entries(obj)
        .map(([k, v]) => `${k}:${v}`)
        .join(";");
    styleEl.textContent = `:root{${toCssRules(tokens.light)}}[data-theme="dark"]{${toCssRules(tokens.dark)}}`;
  };

  useEffect(() => {
    applyAccentStyleSheet(accentHex);
  }, [accentHex]);

  const handleThemeSelect = (
    nextMode: ThemeMode,
    btnEl: HTMLButtonElement
  ) => {
    // Tactile pop (`yo` pattern)
    if (!isReducedMotion()) {
      gsap.fromTo(
        btnEl,
        { scale: 0.95 },
        {
          scale: 1,
          duration: q(MOTION_DURATION.pillCross, intensity),
          ease: MOTION_EASE.springPop,
          clearProps: "transform",
        }
      );
    }

    setTheme(nextMode);
    const effective = resolveEffectiveTheme(nextMode);
    runCircularViewTransition(() => {
      document.documentElement.setAttribute("data-theme", effective);
    }, btnEl);
  };

  const handleAccentSelect = (
    hex: string,
    btnEl?: HTMLElement | null
  ) => {
    if (btnEl && !isReducedMotion()) {
      gsap.fromTo(
        btnEl,
        { scale: 0.85 },
        {
          scale: 1,
          duration: q(MOTION_DURATION.pillCross, intensity),
          ease: MOTION_EASE.springPop,
          clearProps: "transform",
        }
      );
    }
    runCircularViewTransition(() => {
      setAccentHex(hex);
      applyAccentStyleSheet(hex);
    }, btnEl);
  };

  const handleDensityChange = (nextDensity: RowDensity) => {
    setDensity(nextDensity);
    document.documentElement.classList.toggle(
      "is-compact",
      nextDensity === "compact"
    );
  };

  const handleRailToggle = () => {
    const next = !isRail;
    setIsRail(next);
    document.documentElement.classList.toggle("is-rail", next);
    onToggleSidebarRail?.(next);
  };

  const handleFrostChange = (value: number) => {
    setFrost(value);
    document.documentElement.style.setProperty("--frost", value.toFixed(2));
  };

  const THEME_OPTIONS: ReadonlyArray<{
    id: ThemeMode;
    label: string;
    sub: string;
  }> = [
    {
      id: "light",
      label: "Light",
      sub: "Papel quente e cartões claros",
    },
    {
      id: "dark",
      label: "Dark",
      sub: "Grafite profundo para turnos noturnos",
    },
    {
      id: "system",
      label: "Match system",
      sub: "Acompanha o sistema operacional",
    },
  ];

  return (
    <div
      ref={rootRef}
      className="grid2"
      style={{ display: "grid", gap: "var(--gap)", alignItems: "start" }}
    >
      {/* 1. Theme Cards Section (Marlo / Groova / Brisko / Levena miniature architecture) */}
      <section className="card" aria-labelledby="app-theme-heading">
        <div className="card__head">
          <div>
            <h2 id="app-theme-heading" className="card__title">
              Tema Visual
            </h2>
            <p className="card__sub">
              Salvo neste dispositivo · transição circular via View Transitions
            </p>
          </div>
          <span className="badge badge--info">{cardVariant}</span>
        </div>

        <div
          role="radiogroup"
          aria-label="Tema"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "10px",
          }}
        >
          {THEME_OPTIONS.map((opt) => {
            const active = theme === opt.id;
            const isDarkPreview = opt.id === "dark";
            const isSystemPreview = opt.id === "system";

            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={(e) => handleThemeSelect(opt.id, e.currentTarget)}
                style={{
                  textAlign: "left",
                  background: "var(--card-2)",
                  borderRadius: "16px",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  boxShadow: active
                    ? "inset 0 0 0 2px var(--accent)"
                    : "inset 0 0 0 1px var(--line-2)",
                  position: "relative",
                }}
              >
                {/* Miniature UI Preview (`theme__swatch` / `theme__pic`) */}
                <span
                  aria-hidden="true"
                  style={{
                    width: "100%",
                    height: "78px",
                    borderRadius: "11px",
                    display: "grid",
                    gridTemplateColumns: "28% 1fr",
                    position: "relative",
                    overflow: "hidden",
                    background: isSystemPreview
                      ? "linear-gradient(110deg, #e6e7ea 50%, #111213 50%)"
                      : isDarkPreview
                        ? "#111213"
                        : "#e6e7ea",
                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
                  }}
                >
                  {/* Mini Sidebar Rail */}
                  <i
                    style={{
                      background: isDarkPreview
                        ? "rgba(255,255,255,0.12)"
                        : "rgba(127,127,127,0.25)",
                      borderRadius: "6px",
                      margin: "8px 0 8px 8px",
                      display: "block",
                    }}
                  />
                  {/* Mini Main Card Surface */}
                  <i
                    style={{
                      background: isDarkPreview
                        ? "#1b1c1e"
                        : "rgba(255,255,255,0.82)",
                      borderRadius: "6px",
                      margin: "8px",
                      display: "block",
                    }}
                  />
                  {/* Mini Accent Pill */}
                  <i
                    style={{
                      background: "var(--accent)",
                      borderRadius: "99px",
                      width: "26px",
                      height: "10px",
                      position: "absolute",
                      bottom: "14px",
                      right: "14px",
                    }}
                  />
                </span>

                <b style={{ fontSize: "var(--fs-md)", fontWeight: 600 }}>
                  {opt.label}
                </b>
                <small
                  style={{
                    fontSize: "var(--fs-xs)",
                    color: "var(--ink-3)",
                    lineHeight: 1.3,
                  }}
                >
                  {opt.sub}
                </small>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Highlight Colour (Calda OKLab Contrast Engine) & Layout Density */}
      <section className="card" aria-labelledby="app-accent-heading">
        <div className="card__head">
          <div>
            <h2 id="app-accent-heading" className="card__title">
              Cor de Destaque & Layout
            </h2>
            <p className="card__sub">
              Ajustada automaticamente em OKLab para contraste legível
            </p>
          </div>
        </div>

        {/* Swatches */}
        <div
          role="radiogroup"
          aria-label="Cor de destaque"
          style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "18px" }}
        >
          {DEFAULT_ACCENT_PRESETS.map((preset) => {
            const active =
              accentHex.toLowerCase() === preset.hex.toLowerCase();
            return (
              <button
                key={preset.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={(e) =>
                  handleAccentSelect(preset.hex, e.currentTarget)
                }
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 12px 6px 8px",
                  borderRadius: "var(--r-pill)",
                  background: "var(--card-2)",
                  boxShadow: active
                    ? "inset 0 0 0 2px var(--ink)"
                    : "inset 0 0 0 1px var(--line)",
                  fontSize: "var(--fs-xs)",
                  fontWeight: 600,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: preset.hex,
                  }}
                />
                {preset.label}
              </button>
            );
          })}

          {/* Custom Color Input */}
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 12px",
              borderRadius: "var(--r-pill)",
              background: "var(--card-2)",
              boxShadow: "inset 0 0 0 1px var(--line)",
              fontSize: "var(--fs-xs)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <input
              type="color"
              value={accentHex}
              aria-label="Cor de destaque personalizada"
              onChange={(e) => handleAccentSelect(e.target.value)}
              style={{ width: "18px", height: "18px", border: 0, padding: 0, background: "transparent" }}
            />
            Custom
          </label>
        </div>

        {/* Row 1: Compact Sidebar (`[`) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 0",
            borderTop: "1px solid var(--line)",
          }}
        >
          <div>
            <b style={{ display: "block", fontSize: "var(--fs-md)" }}>
              Sidebar compacta (Apenas ícones)
            </b>
            <small style={{ color: "var(--ink-3)", fontSize: "var(--fs-xs)" }}>
              Rótulos aparecem em tooltips ao apontar · Atalho: <kbd className="kbd">[</kbd>
            </small>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isRail}
            onClick={handleRailToggle}
            className="seg__btn"
            style={{
              background: isRail ? "var(--accent)" : "var(--card-3)",
              color: isRail ? "var(--accent-ink)" : "var(--ink)",
            }}
          >
            {isRail ? "Ativo" : "Expandida"}
          </button>
        </div>

        {/* Row 2: Table Row Density (`Comfy` vs `Compact`) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 0",
            borderTop: "1px solid var(--line)",
          }}
        >
          <div>
            <b style={{ display: "block", fontSize: "var(--fs-md)" }}>
              Espaçamento de linhas
            </b>
            <small style={{ color: "var(--ink-3)", fontSize: "var(--fs-xs)" }}>
              Compacto exibe mais registros nas tabelas operacionais
            </small>
          </div>
          <div className="seg" role="group" aria-label="Espaçamento de linhas">
            {(["comfy", "compact"] as const).map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={density === d}
                className={`seg__btn ${density === d ? "is-active" : ""}`}
                onClick={() => handleDensityChange(d)}
              >
                {d === "comfy" ? "Confortável" : "Compacto"}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Glass Frost Slider (`Calda` pattern) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            padding: "12px 0 0",
            borderTop: "1px solid var(--line)",
          }}
        >
          <div>
            <b style={{ display: "block", fontSize: "var(--fs-md)" }}>
              Translucidez de superfície (--frost)
            </b>
            <small className="num" style={{ color: "var(--ink-3)", fontSize: "var(--fs-xs)" }}>
              {Math.round(frost * 100)}% opacidade de vidro
            </small>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={frost}
            aria-label="Translucidez de superfície"
            onChange={(e) => handleFrostChange(Number(e.target.value))}
            style={{ width: "140px", accentColor: "var(--accent)" }}
          />
        </div>
      </section>
    </div>
  );
};
