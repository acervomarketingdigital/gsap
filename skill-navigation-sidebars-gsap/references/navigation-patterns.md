# Catálogo de Sidebars, Rails, Docks e Navbars Mobile Extraídos

> **Base de Evidência (`FATO EXTRAÍDO`)**: Extraído diretamente de `brisko/_index_tail.js`, `fragio/_app_tail.js`, `groova/_app_tail.js`, `levena/_app_tail.js`, `kelpo/_app_tail.js`, `marlo/_index_tail.js`, `halvi/index-CWx52U9K.css`, `tolva/index-C0-E0m5L.css` e `kavora/index-DFW0tW5w.css`.

---

## 1. Os 6 Estilos de Navegação Desktop Extraídos

### Estilo 1: Floating Dark Rail com Expansão `clip-path` (`Brisko` — `https://demo.codeandchill.store/brisko/`)
- **Geometria e Tokens**:
  - Rail escuro (`--rail: #171916`) flutuando a `16px` da borda esquerda/topo/base com `border-radius: 26px`.
  - Largura padrão: `--rail-w: 76px` (apenas ícones centralizados + logo `.brand__mark`).
  - Largura expandida (`html.is-wide`): `--rail-w-open: 232px`.
- **Coreografia de Expansão/Colapso (`rn` em `brisko/_index_tail.js`)**:
  - Diferença de largura: `c = 232 - 76 = 156px`.
  - **Ao expandir (`e === true`)**:
    1. `.rail` anima `clipPath` de `"inset(0 156px 0 0 round 26px)"` para `"inset(0 0px 0 0 round 26px)"` (`0.42s power3.inOut`).
    2. `.main` desliza de `x: -156` para `x: 0` (`0.42s power3.inOut`).
    3. `.rail__label` entra com `fromTo({ opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.28, stagger: 0.012, ease: "power2.out" })` na posição `0.14s`.
  - **Ao recolher (`e === false`)**:
    1. `.rail__label` some em `0.14s power1.in`.
    2. `.rail` anima `clipPath` de `0px` para `156px` enquanto `.main` compensa de `x: 156` para `0` (`0.42s power3.inOut`).
- **Flyout no Modo Compacto (`on`)**:
  - Ao apontar o mouse sobre `.rail__item` quando fechado, abre `.flyout` na coordenada vertical `top: Math.max(12, Math.min(itemRect.top - 8, innerHeight - flyoutHeight - 12))` com `fromTo(flyout, { opacity: 0, x: -10, scale: 0.97 }, { opacity: 1, x: 0, scale: 1, duration: 0.32, ease: "back.out(1.8)", transformOrigin: "0 20px" })`.

---

### Estilo 2: Floating Card Sidebar com Rastreamento FLIP de Ícones (`Groova` & `Levena`)
- **Geometria e Tokens**:
  - Sidebar destacada como um card flutuante (`position: fixed; left: 12px; top: 12px; bottom: 12px; border-radius: 22px–24px; background: var(--side-bg); box-shadow: inset 0 0 0 1px var(--line), var(--shadow)`).
  - Largura aberta: `236px` (`Levena`) a `244px` (`Groova`). Largura rail: `72px` a `76px`.
  - `.main` usa `margin-left: calc(var(--side-w) + var(--side-inset) * 2)`.
- **Coreografia FLIP Manual dos Ícones (`Yt` em `groova` e `levena`)**:
  - Como o cabeçalho `.side__head` muda de `flex-direction: row` (logo + texto + botão `.collapse` à direita) para `flex-direction: column` no modo rail (logo em cima, botão `.collapse` embaixo), uma simples transição de largura faria o botão `.collapse` pular abruptamente.
  - **Solução extraída do código**:
    1. Antes de alternar `html.is-rail`, captura `getBoundingClientRect()` de cada ícone âncora (`Kt = [[".side__head .brand", ".mark"], [".side__head .collapse", ""], [".side__log", ".ico"], [".snav__item", ".ico"], [".side__me", ":scope > :first-child"]]`).
    2. Alterna a classe `is-rail`, mede os novos retângulos e anima cada elemento de `{ x: oldLeft - newLeft, y: oldTop - newTop }` para `{ x: 0, y: 0 }` (`0.36s` ao fechar / `0.45s power3.out` ao abrir) sincronizado com `clipPath: inset(0 ${diff}px 0 0 round 22px)` na `.side`!

---

### Estilo 3: Flush Edge Sidebar com Submenu Acordeão e Widget Sazonal (`Fragio` & `Kelpo`)
- **Geometria e Tokens**:
  - Fixa na borda (`top: 0; bottom: 0; left: 0; width: 244px–248px; box-shadow: inset -1px 0 0 var(--line-2)`), recolhendo para `80px–84px`.
- **Submenu Acordeão Vertical (`.snav__subs` em `Fragio` / `Groova` / `Levena`)**:
  - Linha vertical guia à esquerda: `border-left: 1.5px solid var(--line-2); margin: 2px 0 6px 22px; padding-left: 12px;`.
  - Na abertura, anima `clipPath: "inset(0 0 100% 0)" → "inset(0 0 0% 0)"` (`0.45s power3.out`) enquanto recalcula a posição da `.snav__pill` a cada frame (`onUpdate`), e escalona os links filhos (`opacity: 0, x: -6 → 1, 0, duration: 0.35, stagger: 0.03`).
- **Widgets de Rodapé da Sidebar**:
  - Em `Fragio`: `.side__wk` exibe a semana da safra (`Season week 15 of 52`) com mini barra de progresso `.side__wkbar i`.
  - Em `Kelpo`: `.side__theme` embute o switch de Dark Mode diretamente acima do perfil `.side__me`.

---

### Estilo 4: Floating Studio Sidebar + Cronômetro de Sessão (`Marlo`)
- Card lateral flutuante (`top/bottom/left: 16px`, `border-radius: 28px`, `--side-w: 236px` / `--rail-w: 72px`) combinado com botão primário de criação com sombra projetada (`.side__new`) e cronômetro de estúdio ao vivo na topbar.

---

### Estilo 5: Floating Vertical Pill Dock (`Halvi`)
- Dock minimalista em formato de cápsula (`border-radius: 999px; padding: 8px; gap: 4px; height: fit-content; margin: auto 0; position: fixed; top: 0; bottom: 0; left: max(16px, calc((100vw - var(--app-max))/2 + 16px))`).
- Botões circulares de `44px x 44px` (`.dock__btn`) com ponto indicador ativo e tooltips laterais.

---

### Estilo 6: Top Horizontal Pill Nav + Mega-Menu (`Tolva`, `Calda` & `Kavora`)
- Sem sidebar lateral; toda a largura da tela pertence aos dados (`--max: 1680px`–`1840px`).
- `.tnav` centralizada na topbar com `.tnav__pill` movida por `clip-path` assimétrico.
- Em `Kavora`, itens com sub-rotas abrem um `.mega` (`width: 600px; border-radius: 26px`) dividido em 2 colunas (`.mega__links` à esquerda + `.mega__side` com métricas ao vivo à direita).

---

## 2. Arquitetura de Navegação Mobile (`<= 760px` e `height <= 500px`)

Todas as 13 aplicações React compartilham um sistema mobile de 2 camadas:

### Camada 1: Bottom `.tabbar` com Indicador Líquido `.tabbar__pill`
Duas variantes visuais extraídas do CSS:
1. **Floating Pill Tabbar (`Groova`, `Kelpo`, `Marlo`, `Tolva`)**:
   ```css
   .tabbar {
     position: fixed;
     z-index: 40;
     left: 10px;
     right: 10px;
     bottom: calc(10px + env(safe-area-inset-bottom));
     background: var(--panel);
     border-radius: 20px; /* 24px em Groova/Marlo */
     padding: 5px;
     display: grid;
     grid-template-columns: repeat(5, 1fr);
     box-shadow: inset 0 0 0 1px var(--line), var(--shadow-lg);
   }
   ```
2. **Docked Edge-to-Edge Tabbar (`Fragio`, `Levena`)**:
   ```css
   .tabbar {
     position: fixed;
     z-index: 40;
     bottom: 0;
     left: 0;
     right: 0;
     padding: 6px 8px calc(6px + env(safe-area-inset-bottom));
     background: var(--card);
     box-shadow: 0 -1px 0 var(--line);
     display: grid;
     grid-template-columns: repeat(5, 1fr);
   }
   ```
- **Comportamento da `.tabbar__pill`**:
  - Renderiza os **4 destinos mais usados** + o 5º botão **`.tabbar__more` ("More")**.
  - Se a rota atual não for um dos 4 destinos primários, a `.tabbar__pill` move-se automaticamente para destacar o botão **More** (`aria-current="page"`)!
  - Na montagem em viewport mobile (`<= 760px`), a `.tabbar` entra deslizando de baixo (`fromTo(".tabbar", { y: 90 }, { y: 0, duration: 0.7, ease: "expo.out", clearProps: "transform" })`).

### Camada 2: Gaveta `.allpages` (Bottom-Sheet Menu Completo)
Ao tocar em **More** na `.tabbar` (ou no botão `.top__menu` no topo esquerdo), abre um `Drawer` em modo Bottom Sheet (`border-radius: 20px 20px 0 0; max-height: 92dvh`) contendo `.allpages`:
1. **Grade de Ações Rápidas (`.allpages__new`)**: 3 botões grandes no topo (`grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; min-height: 64px; background: var(--accent-soft); color: var(--accent-text); border-radius: 12px–16px`) para criar os objetos principais do app com 1 toque.
2. **Lista Completa de Áreas e Sub-rotas (`.allpages__area`)**: Cada seção mostra ícone `.allpages__ico`, título, badge de contagem e chips clicáveis de sub-páginas (`.allpages__subs a` com `min-height: 40px`).
3. **Rodapé de Conta e Tema (`.allpages__theme` / `.allpages__acct`)**: Switch rápido de Dark Mode (ou Segmented Control `Light / Dark / System`) + perfil do usuário logado.
