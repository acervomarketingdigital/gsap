# Vocabulário de Movimento GSAP Extraído

> **Base de Evidência (`FATO EXTRAÍDO`)**: Todos os valores abaixo foram extraídos diretamente do módulo central de animação (`_kit` / `bits`) e dos módulos de página das 10 referências (`GSAP 3.15.0` + `Flip 3.15.0`).

---

## 1. Plugins, Setup e Por Que Não Há `ScrollTrigger` (`FATO EXTRAÍDO`)

### Plugins Registrados no Código Real
```ts
import gsap from "gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);
```
- **Versão exata em todas as 10 páginas**: `gsap@3.15.0` e `Flip@3.15.0`.
- **`ScrollTrigger`, `ScrollSmoother`, `SplitText`, `Observer`, `Lenis`**: **0 ocorrências** nos 133 bundles.
- **Explicação Técnica (`FATO EXTRAÍDO` + `INFERÊNCIA/RECOMENDAÇÃO`)**:
  - Em páginas de marketing, o usuário consome uma narrativa linear controlada pelo scroll (`ScrollTrigger` + `scrub` + `pin`).
  - Em **Dashboards e CRMs**, o usuário escaneia dados não-linearmente, filtra tabelas, alterna períodos, abre gavetas de detalhes e arrasta cartões em múltiplos containers independentes. Atrelar revelações de KPIs ou gráficos ao scroll (`scrub`/`pin`) atrasa a leitura e causa fadiga visual severa.
  - **Quando usar `ScrollTrigger` em produto (`INFERÊNCIA/RECOMENDAÇÃO`)**: Apenas em páginas longas de relatórios analíticos verticais fora do viewport inicial, usando exclusivamente `once: true`, `start: "top 88%"`, `toggleActions: "play none none none"`, **nunca** `scrub` nem `pin` em telas operacionais.

---

## 2. Tabela Completa do Vocabulário de Movimento (`FATO EXTRAÍDO`)

### 2.1. Curvas de Easing Extraídas (Ordenadas por Frequência no Código)

| Easing GSAP | Papel Semântico no Sistema | Onde é Usado no Código Real |
|---|---|---|
| `"expo.out"` | **Desaceleração Arquitetural (Padrão Primário)** | Entrada de cards (`lo`), entrada de página (`nu`), barras (`po`), drawers (`kl`), popovers (`Nl`), mega-menu (`mega`), indicador de tab (`Grovia`) |
| `"power3.out"` | **Resposta Direta de UI & Contadores** | Linhas de tabela/lista (`uo`), contadores numéricos (`vo`), borda líder do `clip-path` (`Eo`), hover lift (`Co`), quickTo magnético (`xo`), filhos do drawer |
| `"power4.out"` | **Corte Editorial Seco (Tipografia)** | Entrada de caracteres e palavras divididas (`co` / `so` no `.phead h1` e `.hero__title`) |
| `"power3.inOut"` | **Transição Simétrica de Layout (`Flip`)** | Reordenação e filtragem de linhas de tabela com `Flip.from`, bordas de acompanhamento do `clip-path` (`Eo`) |
| `"expo.inOut"` | **Morfagem de Séries de Dados** | Interpolação de caminhos SVG (`CashflowChart`, `AreaChart`) e re-escala de barras ao trocar período (`7d`/`30d`/`90d`/`12m`) |
| `"power2.inOut"` | **Traçado Contínuo de Linhas & Grafos** | Desenho inicial de linhas SVG (`strokeDashoffset` em `mo`) e deslocamento de partículas `.cv__bead` em arestas Bezier (`Brisko`) |
| `"power2.in"` | **Saída Rápida e Descarte** | Saída de cards na troca de rota (`nu`, `0.18s`), fechamento de modal (`0.2s`), saída de toast (`0.25s`), descarte de card de revisão (`Veyla`) |
| `"power3.in"` | **Recolhimento de Painel Pesado** | Fechamento de Drawer lateral ou Bottom Sheet (`kl`, `0.32s`) |
| `"back.out(1.4)"` a `"back.out(1.8)"` | **Ancoragem Física com Overshoot Controlado** | Tiles inclinados (`fo`), abertura de modal (`back.out(1.5)`), entrada de toast (`back.out(1.8)`), drop de card Kanban (`back.out(1.5)`), snapback de sheet (`back.out(1.6)`) |
| `"back.out(2)"` a `"back.out(3.2)"` | **Micro-Feedback Tátil / Pop de Ícone** | Clique em botões/ícones (`yo`, `back.out(3)`), thumb de switch (`back.out(2.2)`), contadores de coluna Kanban (`back.out(3)`), nós de leilão (`back.out(2.4)`) |
| `"elastic.out(1, 0.5)"` | **Retorno de Mola Mecânica** | Snapback do controle *Slide-to-Unlock* (`Calda`) e tremor físico de encerramento de leilão (`Kavora`, `elastic.out(1, 0.2)`) |
| `"sine.inOut"` | **Oscilação Ambiental Contínua** | Pulso de chevrons de desbloqueio e barras de equalizador (`Calda`) |
| `cubic-bezier(.22, 1, .36, 1)` | **Transição CSS Nativa (`--ease`)** | Transições CSS de cor, background, opacidade de hover e colapso de largura de sidebar (`--side-w`) |

---

### 2.2. Matriz Completa de Animações Extraídas (Alvo, Propriedades, Duração, Stagger)

| Primitiva (ID no Código) | Seletor / Alvo | `from` → `to` | `duration` | `ease` | `stagger` / `delay` | `clearProps` |
|---|---|---|---|---|---|---|
| **Split Heading (`co`)** | `.phead h1 .ch` | `{ yPercent: 115, rotation: 6 }` → `{ yPercent: 0, rotation: 0 }` | `0.85s` (`0.8s` Grovia) | `"power4.out"` | `0.022s` por char | `"transform"` |
| **Cards Entrance (`lo`)** | `.card, .kpi` | `{ opacity: 0, y: 26, scale: 0.985 }` → `{ opacity: 1, y: 0, scale: 1 }` | `0.80s` | `"expo.out"` | `0.06s` | `"transform,opacity"` |
| **Rows Entrance (`uo`)** | `tbody tr, .list__row` | `{ opacity: 0, x: 0, y: 12 }` → `{ opacity: 1, x: 0, y: 0 }` | `0.55s` | `"power3.out"` | `0.04s` (máx. 14 linhas) | `"transform,opacity"` |
| **Tilted Tiles (`fo`)** | `.tile, .swatch` | `{ opacity: 0, y: 40, rotation: i => i%2 ? 2.5 : -2.5, scale: 0.95 }` → `{ opacity: 1, y: 0, rotation: 0, scale: 1 }` | `0.85s` | `"back.out(1.4)"` | `0.07s` | `"transform,opacity"` |
| **Bars Scale (`po`)** | `.bars__col, .bar-fill` | `{ scaleY: 0 }` (ou `scaleX: 0`) → `{ scaleY: 1 }` | `0.90s` | `"expo.out"` | `0.03s` | `"transform"` |
| **Bars Data Update (`Do`)** | `.bars__col` | `{ scaleY: current }` → `{ scaleY: nextRatio }` | `0.75s` | `"expo.inOut"` | `delay: i * 0.02s` | — |
| **SVG Line Draw (`mo`)** | `path[data-draw]` | `{ strokeDasharray: len, strokeDashoffset: len }` → `{ strokeDashoffset: 0 }` | `1.20s` | `"power2.inOut"` | — | — |
| **SVG Series Morph** | Proxy `{ k: 0 }` via `gsap.ticker` | `{ k: 0 }` → `{ k: 1 }` (interpola `y` de cada ponto) | `0.85s`–`0.90s` | `"expo.inOut"` | — | — |
| **KPI Counter (`vo`/`Ll`)** | Proxy `{ v }` em `WeakMap` | `{ v: prevValue }` → `{ v: nextValue }` | `1.20s` | `"power3.out"` | — | — |
| **Liquid Pill Indicator (`Eo`)** | `.seg__thumb, .tnav__pill, .tabs__line` | `clipPath: inset(t r b l round Rpx)`: borda líder vs. borda traseira | Líder: `0.36s`<br>Traseira: `0.55s`<br>Lateral: `0.45s` | Líder: `"power3.out"`<br>Traseira: `"power3.inOut"` | — | — |
| **Route Exit (`nu` pt. 1)** | `.card, .kpi, .lane, .tile` no viewport | `{ opacity: 1, y: 0, scale: 1 }` → `{ opacity: 0, y: 8, scale: 0.985 }` + container `x: -dir * 16` | `0.18s` (`.phead`: `0.144s`) | `"power2.in"` | `0.008s` | — |
| **Route Enter (`nu` pt. 2)** | Container da página `.page` | `{ x: dir * 26 }` → `{ x: 0 }` (+ dispara `usePageAnim` interno) | `0.70s` | `"expo.out"` | — | `"transform"` |
| **Table Filter/Sort (`Flip`)** | `tbody tr` / `.rvl__item` | `Flip.from(state, { absolute: false, nested: true })` | `0.50s`–`0.55s` | `"power3.inOut"` | `onEnter`: `0.02s` | Automático pelo Flip |
| **Kanban Drag Lift** | `.kcard` / `.ocard` | `{ scale: 1, rotation: 0 }` → `{ scale: 1.03, rotation: 1.8 }` | `0.20s`–`0.25s` | `"power3.out"` | — | — |
| **Kanban Drop / Cancel** | `.kcard` / `.ocard` | Cancel: `{ x: 0, y: 0, scale: 1, rotation: 0 }`<br>Drop: `Flip.from` ou delta `fromTo` | Cancel: `0.50s`<br>Drop: `0.45s`–`0.70s` | Cancel: `"back.out(1.7)"`<br>Drop: `"expo.out"` / `"back.out(1.5)"` | — | `"transform"` |
| **Drawer Open / Close (`kl`)** | `.drawer__panel` (+ `.drawer__scrim`) | Desktop: `xPercent: 104 → 0`<br>Mobile: `yPercent: 100 → 0` | Open: `0.60s`<br>Close: `0.32s` | Open: `"expo.out"`<br>Close: `"power3.in"` | Filhos: `delay: 0.12s, stagger: 0.04s` | — |
| **Modal Open / Close (`Al`)** | `.modal__panel` (origem no botão clicado) | `{ scale: 0.86, opacity: 0 }` → `{ scale: 1, opacity: 1 }` | Open: `0.50s`<br>Close: `0.20s` | Open: `"back.out(1.5)"`<br>Close: `"power2.in"` | — | — |
| **Toast Enter / Exit (`Tl`)** | `.toast` | `{ y: 30, opacity: 0, scale: 0.94 }` → `{ y: 0, opacity: 1, scale: 1 }` | Enter: `0.50s`<br>Exit: `0.25s` | Enter: `"back.out(1.8)"`<br>Exit: `"power2.in"` | Auto-close: `delayedCall(3.2s / 5.5s)` | — |
| **Error Shake (`bo`)** | Input ou form inválido | `keyframes: { x: [0, -8, 7, -5, 3, 0] }` | `0.42s` | `"power2.out"` | — | `"transform"` |
| **Icon / Button Pop (`yo`)** | `<svg>` ou `.btn` clicado | `{ scale: 0.7 }` → `{ scale: 1 }` | `0.55s` | `"back.out(3)"` | — | `"transform"` |
| **Floating Delta (`go`)** | `<span class="float-up">` | `y: 0 → -12 (0.35s)` depois `y: -40, opacity: 0 (0.8s, delay: 0.6s)` | `1.15s` total | `"back.out(2)"` → `"power2.in"` | — | Remove nó do DOM |
| **Hover Lift (`Co`)** | `[data-lift]` (somente após load `So.v`) | `y: 0` → `y: -4` (leave: `y: 0, duration: 0.5`) | `0.45s` | `"power3.out"` | — | — |
| **Magnetic Pull (`xo`)** | `.magnetic` (fine pointer) | `quickTo(el, "x"\|"y")` com fator `0.2 * dx`, `0.28 * dy` | `0.50s` | `"power3.out"` | — | — |

---

## 3. Anatomia dos 4 Padrões Mais Sofisticados do Código (`FATO EXTRAÍDO`)

### 3.1. Indicador Líquido Assimétrico com `clip-path` (`Eo` / `To`)
Em vez de mover um elemento com `left` e `width` (que causa *layout recalculation* ou distorce bordas arredondadas com `scaleX`), as referências duplicam a barra ativa ou usam um `.seg__thumb` de largura `100%` recortado por `clip-path: inset(top right bottom left round Rpx)`:
- Quando o usuário clica num item à **direita**, a borda **direita (`right`)** é a borda líder (`duration: 0.36, ease: "power3.out"`) e a borda **esquerda (`left`)** é a borda traseira (`duration: 0.55, ease: "power3.inOut"`).
- Quando clica num item à **esquerda**, `left` vira a borda líder (`0.36s`) e `right` vira a traseira (`0.55s`).
- Resultado visual: a pílula se **estica** em direção ao novo alvo e depois recolhe a cauda, criando elasticidade orgânica a 60fps na GPU.

### 3.2. Batching de Escrita DOM via `gsap.ticker` (`To` / `zn`)
Quando múltiplos gráficos ou clip-paths são interpolados simultaneamente, o código não escreve no DOM dentro de dezenas de callbacks `onUpdate` isolados. Ele agenda uma função num `Set` global drenado uma única vez por frame pelo `gsap.ticker.add`:
```ts
const queue = new Set<() => void>();
let bound = false;
function flush() {
  queue.forEach((fn) => fn());
  queue.clear();
}
export function scheduleFrameWrite(fn: () => void) {
  queue.add(fn);
  if (!bound) {
    bound = true;
    gsap.ticker.add(flush);
  }
}
```

### 3.3. Gate de Hover Durante a Coreografia de Entrada (`So.v`)
Se o cursor do usuário já estiver no meio da tela quando a página carrega, eventos `pointerenter` em cards `[data-lift]` disparariam um tween `y: -4` no meio da animação de entrada (`y: 26 → 0`), truncando a coreografia.
- Solução extraída do código: Uma flag de módulo `loadGate.ready = false` é mantida durante os primeiros `900ms` da montagem da rota e liberada via `gsap.delayedCall(0.9, () => { loadGate.ready = true; })`. Os listeners de `[data-lift]` ignoram eventos enquanto `!loadGate.ready`.

### 3.4. Transição de Tema Circular via View Transitions API (`an`)
Ao alternar entre Light e Dark mode, o código captura as coordenadas `(x, y)` do botão clicado, calcula o raio máximo até o canto mais distante da tela (`Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))`) e anima `::view-transition-new(root)` com `clipPath: ["circle(0px at x y)", "circle(Rpx at x y)"]`, `duration: 450`, `easing: "cubic-bezier(.65, 0, .35, 1)"` (respeitando `prefers-reduced-motion`).
