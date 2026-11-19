# Acessibilidade, Performance e Limites Operacionais

> **Base de Evidência (`FATO EXTRAÍDO`)**: Todas as regras abaixo foram extraídas da implementação real das 10 páginas de referência, que combinam coreografia GSAP intensa com conformidade rigorosa a `prefers-reduced-motion`, `prefers-contrast`, `forced-colors`, gerenciamento de foco e orçamento de GPU.

---

## 1. Tratamento Obrigatório de `prefers-reduced-motion` (`FATO EXTRAÍDO`)

A regra mais importante extraída do código (`_kit`): **toda duração e todo stagger passam pelo wrapper `q(value)`**.

### 1.1. Wrapper JavaScript (`q`)
```ts
const RM = typeof window !== "undefined"
  ? window.matchMedia("(prefers-reduced-motion: reduce)")
  : { matches: false };

/** Retorna 0 imediatamente se o usuário solicitou redução de movimento */
export const q = (seconds: number): number => (RM.matches ? 0 : seconds);
```
- **Por que `q(duration)` = `0` é superior a `if (RM.matches) return;` (`FATO EXTRAÍDO`)**:
  - Se você simplesmente abortar a função de animação com `return`, elementos que dependiam do estado final do tween (ex.: contador numérico `vo`, `scaleY` de barra `Do`, `clip-path` do indicador ativo `Eo` ou remoção de atributos temporários em `onComplete`) podem ficar congelados no estado inicial ou invisíveis.
  - Passando `duration: q(0.8)` e `stagger: q(0.06)`, o GSAP aplica o **estado final exato no frame 0**, executa `clearProps` e dispara `onComplete` instantaneamente sem movimento físico.
- Em animações puramente decorativas (ex.: `splitHeading`, `hoverLift`, `magnetic`, `floatDelta`), verifique `if (isReducedMotion()) return;` logo no início para evitar até mesmo a criação de spans ou listeners.

### 1.2. Fallback CSS Global Obrigatório (`FATO EXTRAÍDO`)
Presente em todas as 10 folhas de estilo:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 2. Contraste, Cores Forçadas e Transparência (`FATO EXTRAÍDO`)

As páginas de referência incluem três media queries de acessibilidade visual que devem acompanhar todo dashboard editorial:

```css
/* 1. Alto Contraste Solicitado pelo SO */
@media (prefers-contrast: more) {
  :root {
    --line: rgba(0, 0, 0, .28);
    --line-2: rgba(0, 0, 0, .45);
    --ink-3: var(--ink-2);
  }
  [data-theme="dark"] {
    --line: rgba(255, 255, 255, .32);
    --line-2: rgba(255, 255, 255, .52);
  }
}

/* 2. Redução de Transparência ( essencial para variantes Glassmorphic como Calda/Grovia ) */
@media (prefers-reduced-transparency: reduce) {
  .card, .panel, .drawer__panel, .modal__panel, .toast {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background: var(--card-solid, var(--card)) !important;
  }
}

/* 3. Windows High Contrast / Forced Colors */
@media (forced-colors: active) {
  .card, .kpi, .btn, .pill, .badge, .drawer__panel, .modal__panel {
    border: 1px solid CanvasText;
  }
}
```

---

## 3. Foco, Teclado e Semântica de Sobreposição (`FATO EXTRAÍDO`)

1. **Skip Link Operacional**:
   - Primeiro filho do `<body>`: `<a href="#main" class="skip-link">Pular para o conteúdo principal</a>`, invisível até receber `:focus-visible` (`top: 12px; left: 12px; z-index: 9999`).
2. **Isolamento de Fundo com `inert` (`kl` / `Al`)**:
   - Sempre que um `Drawer`, `Modal` ou `Command Palette` estiver aberto, o container `.shell` recebe o atributo HTML nativo `inert` (`shellEl.setAttribute("inert", "")`), impedindo que `Tab` ou leitores de tela escapem para a tabela ou sidebar ao fundo.
3. **Ciclo de Vida do Foco**:
   - Na abertura de um modal/drawer: armazene ` const prevFocus = document.activeElement as HTMLElement | null` e foque `[data-autofocus]` (ou o primeiro elemento interativo dentro do painel).
   - No fechamento: remova `inert` do `.shell` e chame `prevFocus?.focus()`.
4. **Acessibilidade do Text Splitter (`so` / `co`)**:
   - Quando um `<h1>` é dividido em palavras e caracteres:
     - O elemento `<h1>` recebe `aria-label={originalText}`.
     - Cada `<span class="word" aria-hidden="true">` oculta os caracteres fragmentados dos leitores de tela, evitando que o NVDA/VoiceOver soletre letra por letra.
5. **Ponteiro Fino vs. Toque (`FATO EXTRAÍDO`)**:
   - Efeitos `.magnetic` e `[data-lift]` só são registrados se `window.matchMedia("(hover: hover) and (pointer: fine)").matches` for `true`.
   - Em dispositivos de toque (`@media (pointer: coarse)`), botões `.icon-btn`, `.seg__btn` e `.chip` expandem automaticamente para `min-height: 44px; min-width: 44px`.

---

## 4. Engenharia de Performance e Orçamento GSAP (`FATO EXTRAÍDO`)

### 4.1. Propriedades Permitidas vs. Proibidas em Tweens

| Permitido (Composto na GPU / Zero Layout Reflow) | Proibido em Tweens GSAP (Causa Layout Thrashing) |
|---|---|
| `x`, `y`, `xPercent`, `yPercent` | `top`, `left`, `right`, `bottom`, `margin`, `padding` |
| `scale`, `scaleX`, `scaleY`, `rotation` | `width`, `height` (exceto no indicador 3-partes isolado com `position: absolute`) |
| `opacity` | `border-width`, `font-size`, `line-height` |
| `clipPath: "inset(... round ...)"` | `box-shadow` animado continuamente em dezenas de cards |
| `strokeDashoffset` e atributo SVG `d` (via `gsap.ticker`) | Leitura de `getBoundingClientRect()` dentro de `onUpdate` |

### 4.2. Limpeza Obrigatória de Contexto e Propriedades (`clearProps`)
1. **`gsap.context` / `useGSAP`**:
   - Todo conjunto de animações de uma página ou componente deve rodar dentro de `useGSAP(() => { ... }, { scope: containerRef, dependencies: [...] })` (ou `gsap.context(fn, scopeRef)` dentro de `useLayoutEffect` retornando `() => ctx.revert()`).
2. **`clearProps: "transform,opacity"`**:
   - Um elemento com `transform: translate(0px, 0px)` residual cria um novo **stacking context** e **containing block** no CSS, o que quebra `position: fixed` de tooltips/modais filhos e borra textos em telas não-Retina.
   - Por isso, todas as funções de entrada (`lo`, `uo`, `fo`, `co`, `po`, `nu`) passam `clearProps: "transform,opacity"` (ou `"transform"`).

### 4.3. Limites Operacionais por Tela (`FATO EXTRAÍDO` + `INFERÊNCIA/RECOMENDAÇÃO`)
- **Máximo de linhas de tabela animadas no stagger inicial**: `14 linhas` (`rows.slice(0, 14)`).
- **Máximo de cards simultâneos no stagger de entrada**: `12 cards` (`stagger: 0.06s` → janela máxima de `0.72s`).
- **Gate de Hover (`loadGate`)**: Desabilitar tweens de `pointerenter` (`[data-lift]`) durante os primeiros `850ms` após a montagem da rota para evitar colisão entre o tween de entrada (`y: 26 → 0`) e o tween de hover (`y: -4`).
- **Batching de Ticker**: Se mais de 1 componente atualizar o DOM por frame (ex.: 2 gráficos interpolando séries + 1 clip-path), agende as escritas num `Set` único drenado por `gsap.ticker`.
