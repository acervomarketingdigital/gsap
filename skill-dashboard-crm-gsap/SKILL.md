---
name: dashboard-crm-gsap
description: Criar ou refatorar dashboards, CRMs, painéis administrativos, mesas de operação, quadros Kanban e telas de dados densos com estética editorial e movimento coreografado em GSAP + Flip. Acione sempre que o usuário pedir interfaces de produto analíticas ou operacionais com identidade editorial, transições fluidas de layout, contadores tabulares ou coreografia GSAP de alta precisão.
---

# Dashboard & CRM Editorial Motion System (GSAP + Flip)

Sistema completo de engenharia visual e coreografia GSAP destilado da inspeção de código real de **14 consoles de produto de referência** (`tolva`, `veyla`, `grovia`, `brisko`, `calda`, `halvi`, `ignara`, `kavora`, `marlo`, `raveno`, `fragio`, `groova`, `levena`, `kelpo`).

---

## 0. Ecossistema de Skills Especializadas (Sub-Skills de Componentes)

Para implementações específicas de componentes extraídos das 14 demos, acione também as skills irmãs neste workspace:
- **Seletor de Aparência, Temas, OKLab Accent & Densidade**: [skill-appearance-theme-gsap/SKILL.md](file:///c:/Users/mathu/Downloads/Novos%20Infoprodutos/SKILL%20GSAP/skill-appearance-theme-gsap/SKILL.md)
- **Sidebars Desktop (Brisko, Fragio/Groova/Levena/Kelpo, Marlo, Halvi) & Mobile Navbars**: [skill-navigation-sidebars-gsap/SKILL.md](file:///c:/Users/mathu/Downloads/Novos%20Infoprodutos/SKILL%20GSAP/skill-navigation-sidebars-gsap/SKILL.md)
- **Catálogo de 12+ Gráficos & Gantt Interativo (Area, River, Stack, Stair Funnel, Heatmap, Gantt)**: [skill-charts-dataviz-gsap/SKILL.md](file:///c:/Users/mathu/Downloads/Novos%20Infoprodutos/SKILL%20GSAP/skill-charts-dataviz-gsap/SKILL.md)
- **Cards Pastel/Noir/Sleeve, Command Palette `⌘K`, Bell Popover & Forms com Live Preview**: [skill-cards-menus-forms-gsap/SKILL.md](file:///c:/Users/mathu/Downloads/Novos%20Infoprodutos/SKILL%20GSAP/skill-cards-menus-forms-gsap/SKILL.md)

---

## 1. Quando Acionar Este Skill

Acione imediatamente quando a tarefa envolver:
- Criar ou redesenhar **Dashboards executivos, CRMs, ERPs, painéis B2B, mesas de revisão (KYC/Inbox), plataformas financeiras ou quadros Kanban**.
- Substituir estética SaaS genérica por um **sistema visual editorial** (papelaria técnica, tipografia contrastante, hairlines internos `inset 0 0 0 1px`, superfícies multi-tom e card protagonista `.card--noir`).
- Coreografar animações de produto com **GSAP (`gsap` + `Flip`)** onde o movimento serve à continuidade espacial, leitura rápida e resposta tátil.

---

## 2. Regras Inegociáveis

1. **Zero Motion de Marketing em Telas Operacionais**:
   - **Proibido** usar `ScrollTrigger` com `scrub`, `pin: true`, parallax de scroll ou hijack de rolagem (`Lenis` / `ScrollSmoother`) em shells de dashboards e CRMs.
   - Em produto, toda animação é disparada por **montagem de rota (`useLayoutEffect`), mudança de estado/filtro (`Flip`), mutação de dados ou gesto direto do usuário (`pointerdown`)**.
2. **Centralização Estrita de Tokens**:
   - **Proibido** espalhar strings de easing, durações ou números mágicos soltos nos componentes. Importe exclusivamente de [`assets/motion.config.ts`](./assets/motion.config.ts) e [`assets/tokens.css`](./assets/tokens.css).
3. **Disciplina Numérica e Layout Estável**:
   - Aplique `font-variant-numeric: tabular-nums` globalmente e use o grid `1/1` com elemento fantasma `.count__size` ([`snippets/kpi-counter.tsx`](./snippets/kpi-counter.tsx)) para que contadores nunca alterem a largura do layout.
   - Use `box-shadow: inset 0 1px 0 var(--top-light), inset 0 0 0 1px var(--line), var(--shadow-sm)` em vez de `border` CSS tradicional.
4. **Limpeza de Contexto e Stacking Context**:
   - Escopo obrigatório via `gsap.context` / `useDashboardMotion` ([`snippets/useGSAP-setup.tsx`](./snippets/useGSAP-setup.tsx)) com `ctx.revert()` no unmount.
   - Passe `clearProps: "transform,opacity"` (ou `"transform"`) ao final dos tweens de entrada para não corromper `position: fixed` de filhos nem criar stacking contexts residuais.
5. **Acessibilidade Obrigatória**:
   - Passe toda duração/stagger pela função `q(seconds, intensity)` de [`assets/motion.config.ts`](./assets/motion.config.ts), que retorna `0` quando `prefers-reduced-motion: reduce` está ativo.
   - Aplique `inert` no `.shell` ao abrir Drawers ou Modais e restaure o foco ao elemento gatilho no fechamento.
   - **Proibido** usar `window.alert()`, `window.confirm()` ou `window.prompt()` — use sempre `Toast` empilhado (`aria-live="polite"`) ou `Modal` coreografado.

---

## 3. Workflow Passo a Passo

Siga esta sequência exata ao construir ou refatorar uma tela:

1. **Selecionar Identidade Visual e Intensidade**:
   - Consulte [`references/visual-system.md`](./references/visual-system.md) e escolha a paleta editorial em [`assets/tokens.css`](./assets/tokens.css) (`default` pedra/brasa, `tolva` floresta/creme, `brisko` sálvia/lima, `marlo` estúdio/âmbar ou `raveno` papel/grafite).
   - Defina o nível de intensidade (`"subtle"` para back-office intensivo, `"default"` para dashboards/CRMs, `"expressive"` para salas ao vivo) conforme [`references/dashboard-patterns.md`](./references/dashboard-patterns.md).
2. **Estruturar o App Shell e Navegação**:
   - Monte `.shell` + `.shell__main` com cabeçalho `.phead` (`.eyebrow` `11px` uppercase + `h1` `clamp(28px, 2.6vw, 38px)`).
   - Conecte a troca de rotas com [`snippets/page-transition.tsx`](./snippets/page-transition.tsx) (saída rápida de `0.18s power2.in` apenas nos cards visíveis no viewport + entrada direcional de `0.7s expo.out`).
   - Use `animateClipPathPill` de [`snippets/useGSAP-setup.tsx`](./snippets/useGSAP-setup.tsx) para indicadores líquidos de abas e segmented controls (`.seg__thumb`).
3. **Implementar KPIs e Gráficos**:
   - Use [`snippets/kpi-counter.tsx`](./snippets/kpi-counter.tsx) para a fileira `.kpis` (4 colunas no desktop, 2 em `<=1279px`, 1 em `<=760px`), destacando **1 card protagonista** com `.card--noir`.
   - Para gráficos, consulte [`references/motion-vocabulary.md`](./references/motion-vocabulary.md): escale barras com `scaleY` (`0.9s expo.out`) e interpole mudanças de período (`7d`/`30d`/`90d`) com `expo.inOut` (`0.75s`–`0.85s`) via `scheduleFrameWrite`.
4. **Implementar Tabelas, Kanban e Painéis Laterais**:
   - **Tabelas densas**: Use [`snippets/table-flip.tsx`](./snippets/table-flip.tsx). Limite o stagger de entrada às primeiras `14` linhas (`MOTION_STAGGER.maxTableRows`) e use `Flip.getState` / `Flip.from` (`absolute: false`) ao filtrar ou ordenar.
   - **Kanban / Pipeline CRM**: Use [`snippets/kanban-motion.tsx`](./snippets/kanban-motion.tsx) com Pointer Events (`setPointerCapture` após `6px`), inclinação `scale: 1.03, rotation: 1.8`, acomodação via `Flip.from` e botão acessível de avanço por teclado.
   - **Ficha do Cliente / Detalhe do Negócio**: Use [`snippets/drawer-panel.tsx`](./snippets/drawer-panel.tsx), que opera como Drawer lateral no desktop e converte automaticamente em Bottom Sheet com *drag-to-dismiss* por velocidade em `<=760px`.
5. **Validar Acessibilidade e Performance**:
   - Audite a tela contra [`references/accessibility-performance.md`](./references/accessibility-performance.md) e o checklist final abaixo.

---

## 4. Mapa de Referências Carregadas Sob Demanda

Leia apenas o documento necessário para a subtarefa atual:
- [`references/visual-system.md`](./references/visual-system.md) — Tokens extraídos, escala tipográfica de 11 degraus, contraste de superfícies, hairlines e breakpoints responsivos.
- [`references/motion-vocabulary.md`](./references/motion-vocabulary.md) — Tabelas exatas de easings, durações, staggers, clip-path assimétrico, batching no `gsap.ticker` e gate de hover.
- [`references/dashboard-patterns.md`](./references/dashboard-patterns.md) — Mapeamento `Padrão de origem → Componente de destino → Intensidade → O que NÃO fazer` para os 8 subsistemas de produto.
- [`references/accessibility-performance.md`](./references/accessibility-performance.md) — Regras de `prefers-reduced-motion`, `prefers-contrast`, `forced-colors`, foco, `inert` e orçamento de GPU.
- [`references/analysis-log.md`](./references/analysis-log.md) — Dossiê página por página das 10 referências inspecionadas (`FATO EXTRAÍDO` vs. `INFERÊNCIA/RECOMENDAÇÃO`).

---

## 5. Stack Padrão e Adaptação para Outros Frameworks

### Stack Padrão dos Snippets
- **React 19 + TypeScript + Vite + `gsap@3.15+` (`Flip`) + `@gsap/react` (`useGSAP`)**.

### Como Adaptar para Outros Ambientes
- **Next.js (App Router)**: Adicione `"use client";` no topo dos snippets interativos (`useGSAP-setup.tsx`, `kpi-counter.tsx`, `table-flip.tsx`, `kanban-motion.tsx`, `drawer-panel.tsx`, `page-transition.tsx`). O registro `gsap.registerPlugin(Flip)` já é seguro para SSR quando executado no cliente.
- **Vue 3 / Nuxt 3 (Composition API)**: Substitua `useLayoutEffect` por `onMounted` + `onUnmounted` mantendo `const ctx = gsap.context(() => { ... }, scopeRef.value)` e `ctx.revert()` no `onUnmounted`. Antes de mutar arrays filtrados em tabelas/Kanban, capture `const state = Flip.getState(...)` e execute `Flip.from(state, ...)` dentro de `await nextTick()`.
- **Vanilla JS / Web Components (padrão `Grovia`)**: Importe `MOTION_EASE`, `MOTION_DURATION`, `MOTION_STAGGER` e `q()` de [`assets/motion.config.ts`](./assets/motion.config.ts) e execute a timeline master no evento `DOMContentLoaded`.

---

## 6. Checklist de Validação Antes da Entrega

- [ ] `assets/tokens.css` importado e `font-variant-numeric: tabular-nums` ativo em todos os números, tabelas, timers e eixos.
- [ ] Zero valores de duração, easing ou stagger hardcoded fora de `assets/motion.config.ts`.
- [ ] Todas as chamadas GSAP usam `q(duration, intensity)` e respeitam `prefers-reduced-motion: reduce`.
- [ ] Todos os contadores numéricos usam a estrutura `.count > .count__size + .count__live` e `WeakMap` para não causar *layout shift* nem resetar para zero.
- [ ] Nenhum `ScrollTrigger` com `scrub`/`pin` ou `Lenis` foi introduzido em views operacionais de dashboard/CRM.
- [ ] Stagger inicial de tabelas está limitado a no máximo `14` linhas (`MOTION_STAGGER.maxTableRows`).
- [ ] `Flip.from` em linhas `<tr>` usa `absolute: false` e `clearProps` limpa `transform,opacity` após animações de entrada.
- [ ] Drawers e Modais aplicam `inert` no `.shell`, fecham com `Escape`, restauram o foco ao elemento de origem e viram Bottom Sheet em `<= 760px`.
- [ ] Nenhum `window.alert`, `window.confirm` ou `window.prompt` existe no código.
- [ ] Verificação de tipos (`npx tsc --noEmit`), lint (`npx eslint`) e build (`npm run build`) executados sem erros (quando em projeto configurado).
