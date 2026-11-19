---
name: navigation-sidebars-gsap
description: Criar sidebars retráteis com coreografia FLIP e clip-path, rails escuros flutuantes (estilo Brisko), sidebars em cartão flutuante (estilo Marlo/Groova/Levena), docks verticais em pílula (estilo Halvi), flyouts de sub-rotas no modo rail, topbars horizontais com mega-menu e navbars mobile (.tabbar + .allpages bottom-sheet drawer) com GSAP. Acione sempre que o usuário pedir navegação lateral, menu responsivo mobile ou arquitetura de shell para dashboards e CRMs.
---

# Sidebars, Floating Rails & Mobile Navbars (GSAP Choreography)

Catálogo arquitetural e snippets de navegação desktop e mobile extraídos dos 14 consoles de referência (`brisko`, `marlo`, `fragio`, `groova`, `levena`, `kelpo`, `halvi`, `tolva`, `kavora`, `veyla`, `ignara`, `calda`, `raveno`, `grovia`).

---

## 1. Quando Acionar Este Skill

- Construir ou refatorar a **Sidebar Desktop** (fixa na borda, cartão flutuante, rail escuro ou dock em pílula).
- Coreografar a **transição entre Sidebar Expandida (`236px`–`248px`) e Rail de Ícones (`72px`–`84px`)** com o atalho `[` sem salto visual.
- Adicionar **Flyouts flutuantes (`.flyout`)** ao passar o mouse sobre ícones no modo rail, ou **Submenus Acordeão (`.snav__subs`)** no modo expandido.
- Construir a **Navegação Mobile (`<= 760px`)**: barra inferior `.tabbar` (fixa ou pílula flutuante) com indicador líquido `.tabbar__pill` + gaveta **"More / All Pages" (`.allpages`)** em Bottom Sheet.

---

## 2. Regras Inegociáveis

1. **Proibido Animar `width` da Sidebar Frame-a-Frame no DOM**:
   - Nos 14 demos, o recolhimento da sidebar (`rn` em `Brisko`, `Jt`/`Yt`/`$t` em `Fragio`/`Groova`/`Levena`/`Kelpo`) **nunca** faz tween de `width`. Ele alterna a classe `html.is-rail`, anima o recorte da superfície com `clipPath: "inset(0 ${diff}px 0 0 round ${radius}px)"` (`0.42s power3.inOut` ao fechar; `0.5s expo.out` ao abrir) e interpola as coordenadas `(x, y)` de cada ícone âncora usando deltas de `getBoundingClientRect()`.
2. **Indicador Ativo com `clip-path` Assimétrico (`.snav__pill`, `.rail__pill`, `.tabbar__pill`)**:
   - Tanto na sidebar quanto na `.tabbar` mobile, o fundo do item ativo é uma única camada absoluta recortada via `clip-path: inset(t r b l round Rpx)`, onde a borda líder corre em `0.36s power3.out` e a borda traseira acompanha em `0.55s power3.inOut`.
3. **Flyout no Modo Rail vs. Acordeão no Modo Expandido**:
   - Quando `html.is-rail` está ativo, `.snav__subs` é ocultado (`display: none`) e substituído por um `.flyout` fixo ao lado do rail (`left: calc(var(--side-rail) + var(--side-inset) + 10px)`), animado com `opacity: 0, x: -10, scale: 0.97 → 1, 0, 1, duration: 0.32, ease: "back.out(1.6)"` e delay de fechamento de `0.16s` (`gsap.delayedCall(0.16, close)`) para permitir que o cursor atravesse a ponte invisível `.flyout::before`.
4. **Transformação Mobile Automática em `<= 760px` (e Paisagem Curta `height <= 500px`)**:
   - A sidebar desktop oculta-se (`display: none`), o conteúdo principal ganha `padding-bottom: calc(96px + env(safe-area-inset-bottom))` e surge a `.tabbar` com 4 destinos primários + 1 botão **`More`** que abre a gaveta `.allpages`.

---

## 3. Referências e Snippets

- [`references/navigation-patterns.md`](./references/navigation-patterns.md) — Especificação técnica completa dos 6 estilos de Sidebar/Topbar Desktop e das 2 arquiteturas de Navbar Mobile extraídas.
- [`snippets/sidebar-variants.tsx`](./snippets/sidebar-variants.tsx) — Implementações prontas em React 19 + GSAP:
  1. `BriskoFloatingRail`: Rail escuro flutuante (`76px` ↔ `232px`) com `clip-path` + `.flyout` lateral.
  2. `EditorialCollapsibleSidebar`: Sidebar com rastreamento FLIP de ícones (`Fragio`/`Groova`/`Levena`/`Kelpo`), acordeão `.snav__subs`, card de progresso semanal `.side__wk` e atalho `[`.
- [`snippets/mobile-navbar.tsx`](./snippets/mobile-navbar.tsx) — Barra inferior `.tabbar` (variante pílula flutuante `Groova`/`Kelpo` e variante borda-a-borda `Fragio`/`Levena`) com `.tabbar__pill` líquida + Bottom Sheet `.allpages` completo.
