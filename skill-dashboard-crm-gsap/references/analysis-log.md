# Log de Análise Técnica das 14 Páginas de Referência

> **Escopo e Metodologia (`FATO EXTRAÍDO`)**: Todas as 14 URLs (`tolva`, `veyla`, `grovia`, `brisko`, `calda`, `halvi`, `ignara`, `kavora`, `marlo`, `raveno`, `fragio`, `groova`, `levena`, `kelpo` em `https://demo.codeandchill.store/<slug>`) foram inspecionadas diretamente via download e dissecação estática/dinâmica do HTML renderizado, folhas de estilo CSS compiladas (incluindo chunks CSS lazy-loaded por rota) e todos os bundles JavaScript de produção. Nenhum valor neste documento foi estimado por screenshot.

---

## Descoberta Arquitetural Crítica (`FATO EXTRAÍDO`)

1. **Natureza das Páginas**: Nenhuma das 10 referências é landing page promocional de marketing. **Todas as 10 são aplicações web de produto densas (Dashboards, Consoles Operacionais, Mesas de Operação e CRMs)** projetadas por Hasib (*OVERSHOOT*).
2. **Stack de Runtime**:
   - **9 páginas (`tolva`, `veyla`, `brisko`, `calda`, `halvi`, `ignara`, `kavora`, `marlo`, `raveno`)**: Single-Page Applications (SPAs) construídas com **React `19.3.0`** + **Vite** + **GSAP Core `3.15.0`** + **GSAP `Flip` `3.15.0`**. Compartilham um motor central de coreografia e acessibilidade (`kit`/`bits`).
   - **1 página (`grovia`)**: Aplicação multipágina/tabs em **Vanilla JS (ES Modules)** + HTML5 + CSS3 + **GSAP Core `3.15.0`** + **GSAP `Flip` `3.15.0`**.
3. **Ausência Deliberada de `ScrollTrigger`, `SplitText`, `ScrollSmoother` e `Lenis` (`FATO EXTRAÍDO`)**:
   - **Plugins registrados no código**: Exclusivamente `gsap.registerPlugin(Flip)` em todas as 10 páginas.
   - **Plugins ausentes**: `ScrollTrigger`, `ScrollSmoother`, `Observer` e `Lenis` **não existem** em nenhum dos 133 bundles.
   - **Por que (`INFERÊNCIA/RECOMENDAÇÃO` fundamentada no código)**: Interfaces de operação diária usam shells fixos (`min-height: 100dvh`), painéis internos com scroll nativo de baixa latência (`overflow-y: auto`) e transições disparadas por **eventos de estado, rota, filtro, drag-and-drop e ciclo de vida do componente (`useLayoutEffect` + `gsap.context`)**, nunca por scroll-scrubbing ou hijack de rolagem.
   - **Substituição de `SplitText`**: Em vez do plugin pago `SplitText`, todas as 10 páginas implementam um **DOM Splitter próprio leve** (`so` / `io`) que preserva acessibilidade (`aria-label` no pai e `aria-hidden="true"` nos `<span class="word"><span class="ch">`) com máscara CSS `overflow: hidden`.

---

## 1. Tolva (`/tolva`) — Console Financeiro, Autopay & Gestão de Gastos
- **URL**: `https://demo.codeandchill.store/tolva`
- **Domínio de Produto (`FATO EXTRAÍDO`)**: Console financeiro B2B (*Saltmarsh Brewing Co.*) com abas `Overview`, `Autopay`, `Spend`, `Cashflow`, `Cards` e `Exports`, construtor visual de regras de débito automático, simulador de fluxo de caixa e conciliação.
- **Stack & Tipografia (`FATO EXTRAÍDO`)**:
  - React `19.3.0` + GSAP `3.15.0` + `Flip` `3.15.0`.
  - Fonte: `"Urbanist"` (`wght 400..700` auto-hospedada em `/tolva/fonts/urbanist-latin.woff2`), `font-variant-numeric: tabular-nums`.
  - Escala: `--fs-2xs: 11px` até `--fs-display: 34px`; Hero `h1`: `clamp(40px, 4.1vw, 62px)`, `letter-spacing: -.03em`, `line-height: 1.02`.
- **Tokens de Cor e Superfície (`FATO EXTRAÍDO`)**:
  - **Light Mode (Fundo floresta escuro + Cards papel creme)**:
    - `--bg: #435f39`, `--bg-deep: #2c4125`, `--shell: #48663e`
    - `--card: #f1f5ea`, `--card-2: #e6ecdc`, `--card-3: #dce4cf`, `--panel: #ffffff`
    - `--noir: #172014`, `--noir-2: #1f2b1b`, `--noir-line: rgba(255, 255, 255, .09)`
    - `--ink: #141a11`, `--ink-2: #384234`, `--ink-3: #64705e`, `--ink-4: #8a9583`
    - `--accent: #3b7424`, `--accent-2: #2d5c1a`, `--lime: #a9d982`, `--lime-ink: #18260f`
    - `--good: #2d6f1f`, `--warn: #b86b11`, `--bad: #b93829`, `--info: #25647a`
    - `--line: rgba(20, 26, 17, .09)`, `--line-2: rgba(20, 26, 17, .15)`
    - `--shadow-sm: 0 1px 2px rgba(15, 23, 11, .06), 0 6px 18px rgba(15, 23, 11, .06)`
    - `--shadow-lg: 0 24px 60px rgba(9, 16, 6, .28), 0 4px 14px rgba(9, 16, 6, .14)`
  - **Dark Mode (`[data-theme="dark"]`)**:
    - `--bg: #0f140d`, `--card: #1a2117`, `--card-2: #20291c`, `--card-3: #283324`, `--panel: #222b1e`
    - `--ink: #eef3e8`, `--ink-2: #b9c5b1`, `--ink-3: #7f8c78`, `--accent: #9fd677`, `--lime: #9fd677`
- **Grid, Layout e Textura (`FATO EXTRAÍDO`)**:
  - `--max: 1680px`, `--gap: 18px`, `--pad: 28px`, `--r-sm: 10px`, `--r-md: 14px`, `--r-lg: 20px`, `--r-xl: 28px`.
  - Textura global fixa em `body::before`: `background-image: url(/tolva/textures/grain.png); background-size: 220px 220px; opacity: .05; mix-blend-mode: overlay`.
  - Navegação superior horizontal em pílula (`.tnav`) com indicador líquido `clip-path`.
- **Coreografia GSAP Específica (`FATO EXTRAÍDO`)**:
  - **Hero Card Stacking (`.hcards__card--back`, `--mid`, `--front`)**: Entrada com `opacity: 0, y: 40, rotation: (i - 1) * 8, scale: 0.92` → `rotation: [-6, -2, 3][i]`, `duration: 0.9, delay: 0.25 + i * 0.09, ease: "back.out(1.5)"`. No hover (`.hcards`), expande o leque para `x: [-22, -4, 18][i], y: [-6, -12, -4][i], rotation: [-10, -3, 7][i], duration: 0.45, ease: "power3.out"`.
  - **Rule Builder Spine (`autopay`)**: 3 nós (`WHEN` → `IF` → `THEN`) em superfície `.noir` conectados por `<path class="spine__fill">` desenhado com `strokeDashoffset: len → 0, duration: 1.1, ease: "power2.inOut"` e staggers `y: 18, scale: 0.97, duration: 0.55, stagger: 0.08, ease: "power3.out"`.
  - **Simulador "Run Dry-Run"**: Pulsa nós sequencialmente (`scale: 1 → 1.028 → 1`, `boxShadow: "0 0 0 2px var(--lime), 0 16px 38px rgba(169,217,130,0.28)"`, `duration: 0.22, yoyo: true, repeat: 1, stagger: 0.14`) e anima a barra `.sim-run__bar span` (`scaleX: 0 → 1, duration: 0.75, ease: "power2.out"`).
  - **Gráfico de Fluxo (`CashflowChart`)**: Ao alternar período (`30d`/`90d`/`12m`) com mesma contagem de pontos, interpola os arrays `inflow` e `outflow` via proxy `{ k: 0 } → { k: 1, duration: 0.85, ease: "expo.inOut" }` sincronizado pelo `gsap.ticker`, atualizando o `<path d="...">` da linha e área em tempo real a 60fps.

---

## 2. Veyla (`/veyla`) — Console de Verificação de Identidade (KYC/KYB)
- **URL**: `https://demo.codeandchill.store/veyla`
- **Domínio de Produto (`FATO EXTRAÍDO`)**: Mesa de revisão de identidade e fraude (*Northwick Mutual*) com abas `Overview`, `Checks`, `Reviews`, `Rules`, `Developers` e `Settings`.
- **Stack & Tipografia (`FATO EXTRAÍDO`)**:
  - React `19.3.0` + GSAP `3.15.0` + `Flip` `3.15.0`. Fonte `"Urbanist"` (`wght 400..700` auto-hospedada).
- **Tokens de Cor e Superfície (`FATO EXTRAÍDO`)**:
  - **Light Mode**: `--bg: #ededef`, `--bg-2: #e3e4e7`, `--card: #ffffff`, `--card-2: #f5f5f7`, `--card-3: #ececef`, `--ink: #151112`, `--ink-2: #3d393b`, `--ink-3: #6e6a6c`, `--ink-4: #9a9698`, `--mint: #cce5e2`, `--mint-2: #b5d8d4`, `--mint-ink: #173a36`, `--slate-1: #6f797b`, `--slate-2: #3c4243`, `--peach: #f2dccb`, `--inkcard: #151112`, `--good: #1f7a5c`, `--warn: #b96a16`, `--bad: #c43b3b`.
  - **Dark Mode**: `--bg: #111314`, `--card: #1a1d1e`, `--card-2: #212526`, `--ink: #f3f1f2`, `--mint: #234743`, `--mint-2: #2f5d58`, `--mint-ink: #cde8e4`.
- **Grid e Layout (`FATO EXTRAÍDO`)**:
  - `--max: 1640px`, `--gap: 16px`, `--pad: 24px`, `--side-w: 244px`, `--side-rail: 80px`, `--r-sm: 10px`, `--r-md: 14px`, `--r-lg: 20px`, `--r-xl: 26px`.
  - Sidebar esquerda retrátil (`.side`) que colapsa para rail de `80px` com tooltips no hover.
- **Coreografia GSAP Específica (`FATO EXTRAÍDO`)**:
  - **Stacked Tile Chart (`.tstack__tile`)**: Colunas formadas por blocos empilhados que entram de baixo para cima (`fromTo(tiles, { opacity: 0, scale: 0.7, y: 8 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(1.6)", stagger: { amount: 0.55, from: "start" } })`).
  - **Scanner de Documento KYC (`.cdoc__scan`)**: Linha laser animada continuamente (`background: linear-gradient(90deg, transparent, var(--mint), transparent)`) combinada com barras de biometria `.bars__fill` (`scaleX: 0 → 1, duration: 0.7, stagger: 0.06, ease: "expo.out"`).
  - **Decisão da Fila de Revisão (`Reviews` — Teclas `A` / `D`)**: Ao aprovar/recusar um caso, o card do caso desliza e encolhe (`gsap.to(card, { x: decision === "approved" ? 40 : -40, opacity: 0, scale: 0.96, duration: 0.28, ease: "power2.in" })`), avança automaticamente para o próximo item da fila e re-anima o novo caso (`fromTo(card, { opacity: 0, y: 14, scale: 0.99 }, { opacity: 1, y: 0, scale: 1, duration: 0.38, ease: "expo.out" })`).

---

## 3. Grovia (`/grovia`) — Workspace Bento de RH & Folha de Pagamento
- **URL**: `https://demo.codeandchill.store/grovia`
- **Domínio de Produto (`FATO EXTRAÍDO`)**: Plataforma de People-Ops e Payroll com 3 visões (`Overview`, `People`, `Payroll`), relógio de ponto interativo, matriz de presença de 60 células, funil de contratação e calculadora de folha líquida.
- **Stack & Tipografia (`FATO EXTRAÍDO`)**:
  - **Vanilla JS** + GSAP `3.15.0` + `Flip` `3.15.0`.
  - Dupla tipográfica: `--f-display: "Outfit", system-ui, sans-serif` (pesos `300, 400, 500, 600`) para títulos e números grandes + `--f-sans: "Inter", system-ui, sans-serif` (pesos `400, 500, 600`) para tabelas e controles.
- **Tokens de Cor e Superfície (`FATO EXTRAÍDO`)**:
  - `--backdrop: #5ea86f`, `--backdrop-deep: #3d7d4d`
  - `--app-1: #e2eedd`, `--app-2: #eef4ea`, `--app-3: #f3f5ef` (gradiente diagonal na janela `.app`)
  - `--card: #fafff79e`, `--card-strong: #fbfff9cc`, `--card-solid: #f6faf2`, `--well: #e3ecdebf`
  - `--ink: #1d1d1b`, `--ink-2: #444740`, `--ink-3: #6c7067`, `--ink-4: #94988e`
  - `--honey: #66a05f`, `--honey-2: #52904b`, `--honey-soft: #81b57959`, `--night: #333333`, `--night-2: #222220`
  - `--r-app: 38px`, `--r-card: 28px`, `--r-well: 22px`, `--r-pill: 999px`.
- **Coreografia GSAP Específica (`FATO EXTRAÍDO`)**:
  - **Timeline Master de Entrada (`tl = gsap.timeline({ defaults: { ease: "expo.out" } })`)**:
    1. `.app` shell: `opacity: 0, y: 24, scale: 0.985 → 1, 0, 1 (duration: 0.9)`
    2. `.brand, .tabs, .top__actions > *`: `opacity: 0, y: -12 → 1, 0 (duration: 0.6, stagger: 0.06)` na posição `-=0.55`
    3. `.hero__title .ch` (Split chars): `yPercent: 110 → 0 (duration: 0.8, stagger: 0.022, ease: "power4.out")` na posição `-=0.45`
    4. `.strip__group` + `.stat`: `opacity: 0, y: 16 → 1, 0 (duration: 0.6, stagger: 0.06)`
    5. `.bento > .card`: `opacity: 0, y: 28, scale: 0.98 → 1, 0, 1 (duration: 0.75, stagger: 0.06)`
    6. `[data-Seg]`: barras de progresso horizontais `scaleX: 0 → 1 (duration: 0.9, stagger: 0.08, ease: "expo.out", transformOrigin: "left center")`
    7. `.bars__col`: colunas `scaleY: 0 → 1 (duration: 0.7, stagger: 0.035, ease: "back.out(1.6)", transformOrigin: "50% 100%")`
    8. `.dots__cell`: matriz 60 células `scale: 0, opacity: 0 → 1, 1 (duration: 0.4, stagger: { amount: 0.55, from: "random" }, ease: "back.out(2)")`.
  - **3-Part Morphing Tab Pill (`positionPill`)**: O indicador da navbar é dividido em `.tabs__cap--l`, `.tabs__mid` e `.tabs__cap--r` com conectores SVG côncavos (`.tabs__Bridge`), movendo-se via `gsap.to(pill, { x, width, duration: 0.55, ease: "expo.out" })`.
  - **Rolling Digit Timer (`.dg__col`)**: Cada dígito do cronômetro (`HH:MM:SS`) é uma fita vertical de `0..9` animada com `gsap.to(col, { y: -digit * 1.15 + "em", duration: 0.42, ease: "back.out(1.6)" })` + ponteiro SVG `.dial__hand` (`rotation: deg, duration: 0.4, ease: "back.out(1.6)"`).
  - **3D Profile Card Tilt**: No `pointermove` sobre `.card--profile`, calcula `dx` e `dy` relativos ao centro e aplica `gsap.to(photo, { x: dx * 6, y: dy * 6, scale: 1.02, duration: 0.5, ease: "power2.out" })`.
  - **Filtro de Diretório com `Flip`**: `const state = Flip.getState(".pcard"); render(); Flip.from(state, { duration: 0.5, ease: "expo.out", stagger: 0.02, absolute: false, onEnter: els => gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.35 }) })`.

---

## 4. Brisko (`/brisko`) — Automação de Back-Office, Workflows & Faturas
- **URL**: `https://demo.codeandchill.store/brisko`
- **Domínio de Produto (`FATO EXTRAÍDO`)**: Console de operações financeiras e automação por grafos (*Tallow & Fern*) com visões `Dashboard`, `Workflows` (editor de nós), `Invoices`, `Vendors`, `Runs` e `Settings`.
- **Stack & Tipografia (`FATO EXTRAÍDO`)**: React `19.3.0` + GSAP `3.15.0` + `Flip` `3.15.0` + `"Urbanist"` (`400..700`).
- **Tokens de Cor e Superfície (`FATO EXTRAÍDO`)**:
  - **Light Mode**: `--bg: #e7ebe3`, `--bg-2: #dfe5da`, `--card: #f5f7f2`, `--card-2: #edf1e8`, `--card-3: #e3e9dc`, `--rail: #171916`, `--rail-2: #222620`, `--ink: #141513`, `--ink-2: #3b3f38`, `--ink-3: #6a7066`, `--lime: #e2f47b`, `--lime-2: #d2ea52`, `--lime-ink: #15190c`, `--forest: #1f3b28`, `--forest-2: #2d5238`, `--good: #2a7a45`, `--warn: #c47a1c`, `--bad: #c43e2f`.
  - **Dark Mode**: `--bg: #0e100d`, `--card: #171a15`, `--card-2: #1e221b`, `--ink: #eef2ea`, `--lime: #d9ef62`, `--forest: #2b4f36`.
- **Grid e Layout (`FATO EXTRAÍDO`)**:
  - `--max: 1680px`, `--gap: 16px`, `--pad: 24px`, `--rail-w: 76px`, `--rail-w-open: 232px`, `--r-xl: 26px`.
  - Rail escuro flutuante à esquerda (`background: var(--rail); border-radius: var(--r-xl); height: calc(100dvh - 32px)`).
- **Coreografia GSAP Específica (`FATO EXTRAÍDO`)**:
  - **Canvas de Workflow e Simulação de Execução (`workflows.js`)**:
    - Nós `.cv__node` entram com `opacity: 0, scale: 0.88, y: 12 → 1, 1, 0 (duration: 0.55, stagger: 0.06, ease: "back.out(1.4)")`.
    - Arestas Bezier `.cv__edge` são desenhadas via `strokeDashoffset: len → 0 (duration: 0.7, stagger: 0.06, ease: "power2.out")`.
    - Durante o "Test Run", cria uma esfera SVG `<circle class="cv__bead" r="5">` que percorre cada curva Bezier usando `path.getPointAtLength(len * p.t)` (`gsap.to(p, { t: 1, duration: 0.42, ease: "power2.inOut" })`) enquanto cada nó pulsa (`scale: 1 → 1.04 → 1, duration: 0.36`).
  - **Carimbo de Fatura (`Invoices`)**: Carimbo `.inv-preview__stamp` entra com `scale: 1.8, opacity: 0, rotation: -18 → scale: 1, opacity: 1, rotation: -8, duration: 0.45, ease: "back.out(2)"`.

---

## 5. Calda (`/calda`) — Console Glassmorphic de Automação Residencial & Energia
- **URL**: `https://demo.codeandchill.store/calda`
- **Domínio de Produto (`FATO EXTRAÍDO`)**: Sistema de controle ambiental residencial (*22 Wren Terrace — Firmware 4.18*) com visões `Home`, `Rooms`, `Climate`, `Energy`, `Security` e `Scenes`.
- **Stack & Tipografia (`FATO EXTRAÍDO`)**: React `19.3.0` + GSAP `3.15.0` + `Flip` `3.15.0` + `"Urbanist"` (`400..700`).
- **Tokens de Cor e Superfície (`FATO EXTRAÍDO`)**:
  - **Glassmorphism Parametrizado (`--frost: .5`)**:
    - Light: `--bg: #c9cbce`, `--glass: rgba(242, 241, 238, calc(.42 + var(--frost) * .36))`, `--glass-2: rgba(255, 255, 255, calc(.38 + var(--frost) * .38))`, `--well: rgba(22, 23, 26, .065)`, `--ink: #17181b`, `--sig: #1e9bf0` (azul sinal), `--warm: #e8823a` (aquecimento), `--good: #249b63`, `--warn: #d88924`, `--bad: #d94841`.
    - Dark: `--bg: #2a2c2f`, `--glass: rgba(44, 46, 50, calc(.46 + var(--frost) * .36))`, `--ink: #f4f4f6`, `--sig: #29a1f7`.
    - Backdrop: `.scene-bg__img` com fotografia real do cômodo + `.scene-bg__veil` (`backdrop-filter: blur(calc(12px + var(--frost) * 24px)) saturate(112%)`).
    - Superfície `.card`: `backdrop-filter: blur(22px) saturate(105%)`, `box-shadow: inset 0 1px 0 var(--top-light), inset 0 0 0 1px var(--line), var(--shadow-sm)`.
- **Coreografia GSAP Específica (`FATO EXTRAÍDO`)**:
  - **Termostato Radial 270° (`climate.js`)**: Dial SVG interativo com arraste angular via `atan2`. Na entrada, anima o arco ativo (`strokeDashoffset: arcLen → targetOffset, duration: 1.1, ease: "expo.out"`), o thumb (`scale: 0 → 1, duration: 0.6, delay: 0.35, ease: "back.out(2.2)"`) e os 41 ticks perimetrais (`opacity: 0 → 1, duration: 0.3, stagger: 0.008, ease: "power2.out"`).
  - **Slide-to-Unlock (`slock`)**: Chevrons `.slock__chev i` em onda contínua (`opacity: 0.2 → 0.85, x: 4, duration: 0.9, stagger: 0.12, repeat: -1, yoyo: true, ease: "sine.inOut"`). Se o usuário soltar antes de `82%` da trilha, retorna com mola elástica `gsap.to(knob, { x: 0, duration: 0.55, ease: "elastic.out(1, 0.5)" })`. Ao destravar/travar, pulsa o container (`scale: 0.985 → 1, duration: 0.45, ease: "back.out(2)"`).
  - **Equalizador de Áudio (`.eqbars i`)**: Barras animadas em loop (`scaleY: () => 0.25 + Math.random() * 0.75, duration: 0.35, repeat: -1, yoyo: true, stagger: 0.05, ease: "sine.inOut"`), pausadas imediatamente quando `paused === true`.

---

## 6. Halvi (`/halvi`) — Console de Saúde Pessoal, Biomarcadores & Nutrição
- **URL**: `https://demo.codeandchill.store/halvi`
- **Domínio de Produto (`FATO EXTRAÍDO`)**: Painel clínico/biométrico individual com abas `Overview`, `Activity`, `Nutrition`, `Sleep`, `Vitals` e `Labs`.
- **Stack & Tipografia (`FATO EXTRAÍDO`)**: React `19.3.0` + GSAP `3.15.0` + `Flip` `3.15.0` + `"Urbanist"` (`400..700`).
- **Tokens de Cor e Superfície (`FATO EXTRAÍDO`)**:
  - **Light Mode**: `--bg: #e7e8ea`, `--bg-2: #dedfe2`, `--card: #f9f9f9`, `--card-2: #f1f2f4`, `--card-3: #e8e9ec`, `--ink: #141416`, `--ink-2: #3c3d42`, `--ink-3: #6e7077`, `--accent: #f0412b` (coral clínico), `--accent-2: #d8311c`, `--good: #1f8a5b`, `--warn: #d07b1a`, `--bad: #d93829`, `--info: #2c6bed`.
  - **Dark Mode**: `--bg: #0f0f11`, `--card: #18181b`, `--card-2: #1f2024`, `--ink: #f3f3f5`, `--accent: #ff5a43`.
- **Grid e Layout (`FATO EXTRAÍDO`)**:
  - `--max: 1480px`, `--gap: 16px`, `--pad: 22px`, `--dock-w: 60px`, `--r-lg: 22px`, `--r-xl: 28px`.
  - Dock vertical flutuante em formato de pílula à esquerda (`width: 60px; border-radius: 999px`) + topbar superior.
- **Coreografia GSAP Específica (`FATO EXTRAÍDO`)**:
  - **Barras Hachuradas (`.bars--hatch`)**: Preenchimento diagonal editorial `repeating-linear-gradient(135deg, rgba(20,20,22,.28) 0 2px, transparent 2px 6px)` combinado com a coluna ativa em `--accent`, animadas com `scaleY: 0 → 1, duration: 0.9, ease: "expo.out", stagger: 0.03`.
  - **Copos de Hidratação (`.cup`)**: Ao clicar num copo, anima o nível de água `.cup__fill` (`scaleY: 0 → 1, duration: 0.45, ease: "back.out(1.6)"`) e dá pop no container (`scale: 0.88 → 1, duration: 0.4, ease: "back.out(2.2)"`).
  - **Marcadores de Exames Laboratoriais (`.rbar__pin`)**: Pinos de faixa de referência clínica entram deslizando da esquerda (`left: "0%" → target%, duration: 0.9, ease: "expo.out", stagger: 0.05`).

---

## 7. Ignara (`/ignara`) — Console de Vendas & Despacho Industrial (E-commerce / Manufatura)
- **URL**: `https://demo.codeandchill.store/ignara`
- **Domínio de Produto (`FATO EXTRAÍDO`)**: Operação comercial e logística de fundição (*Hearthwell Ironworks*) com abas `Overview`, `Orders` (Tabela + Kanban de despacho), `Products` (Catálogo SKU), `Customers` (CRM), `Analytics` e `Settings`.
- **Stack & Tipografia (`FATO EXTRAÍDO`)**: React `19.3.0` + GSAP `3.15.0` + `Flip` `3.15.0` + `"Urbanist"` (`400..700`).
- **Tokens de Cor e Superfície (`FATO EXTRAÍDO`)**:
  - **Dark-First por padrão na marca, com suporte Light/Dark completo**:
    - Light: `--bg: #e7e6e4`, `--card: #f7f6f4`, `--card-2: #efeeeb`, `--card-3: #e5e3df`, `--ink: #18181a`, `--accent: #ee5230` (laranja brasa), `--accent-2: #d84322`, `--grad: linear-gradient(140deg, #ff7b3a 0%, #ee5230 50%, #de3424 100%)`.
    - Dark: `--bg: #26282c`, `--bg-2: #1f2125`, `--card: #2f3135`, `--card-2: #36393e`, `--card-3: #282a2e`, `--ink: #f4f3f0`, `--accent: #f0552f`, `--good: #3cc68a`, `--warn: #f2a93b`, `--bad: #f05545`.
- **Coreografia GSAP Específica (`FATO EXTRAÍDO`)**:
  - **Gráfico Stem-and-Bead (`.beads`)**: Hastes verticais `.beads__stem` crescem da base (`scaleY: 0 → 1, transformOrigin: "50% 100%", duration: 0.7, stagger: 0.025, ease: "expo.out"`) seguidas pelo pop das esferas `.beads__bead` no topo (`scale: 0 → 1, duration: 0.45, delay: 0.15, stagger: 0.025, ease: "back.out(2.2)"`).
  - **Kanban de Pedidos (`orders.js`)**: Arraste de pedidos entre `Packed` → `Paid` → `Shipped` → `Delivered`. Ao soltar em nova coluna, calcula o delta `dx = oldRect.left - newRect.left`, `dy = oldRect.top - newRect.top` e executa `gsap.fromTo(card, { x: dx, y: dy, rotation: 3, scale: 1.04 }, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.7, ease: "back.out(1.5)" })`, além de animar os contadores de coluna (`scale: 1.35 → 1, duration: 0.45, ease: "back.out(3)"`).

---

## 8. Kavora (`/kavora`) — Mesa de Trading de Commodities & Leilão ao Vivo
- **URL**: `https://demo.codeandchill.store/kavora`
- **Domínio de Produto (`FATO EXTRAÍDO`)**: Plataforma de negociação de café verde especial com abas `Overview`, `Lots`, `Auctions` (sala de lances ao vivo), `Positions`, `Logistics` e `Reports`.
- **Stack & Tipografia (`FATO EXTRAÍDO`)**: React `19.3.0` + GSAP `3.15.0` + `Flip` `3.15.0` + `"Urbanist"` (`400..700`).
- **Tokens de Cor e Superfície (`FATO EXTRAÍDO`)**:
  - **Light Mode**: `--bg: #ebebe8`, `--bg-2: #e2e2de`, `--card: #ffffff`, `--card-2: #f5f5f2`, `--card-3: #ecece7`, `--noir: #171716`, `--ink: #161615`, `--accent: #f47a53` (coral torra), `--accent-2: #e0623b`, `--mint: #57d9a6`, `--good: #1f9d6a`, `--warn: #d4881c`, `--bad: #d6453a`.
  - **Dark Mode**: `--bg: #111110`, `--card: #1b1b1a`, `--card-2: #222220`, `--ink: #f4f4f0`, `--accent: #ff8a63`, `--mint: #57d9a6`.
- **Grid e Layout (`FATO EXTRAÍDO`)**:
  - `--max: 1840px` (maior largura máxima das 10 páginas para acomodar book de ofertas + ticker), `--gap: 18px`, `--pad: 26px`.
  - Topbar horizontal com **Mega-Menu** (`.mega`) animado (`y: -10, opacity: 0, scale: 0.985 → 0, 1, 1, duration: 0.38, ease: "expo.out"` + cards internos com `stagger: 0.045`) e barra inferior de cotações ao vivo (`.wire`).
- **Coreografia GSAP Específica (`FATO EXTRAÍDO`)**:
  - **Sala de Leilão ao Vivo (`auctions.js`)**:
    - Escada de lances SVG (`.ladder__step`, `.ladder__node`): quando entra um novo lance, a linha e o nó surgem com `fromTo(node, { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.45, ease: "back.out(2.4)" })`, o preço principal pulsa (`scale: 1.09 → 1, duration: 0.45, ease: "back.out(2.2)"`) e sobe um delta flutuante `+$0.05/lb` (`floatDelta`).
    - **Carimbo de Encerramento (`SOLD` / `PASSED`)**: Ao zerar o cronômetro, aplica `fromTo(stamp, { scale: 2.2, opacity: 0, rotation: -24 }, { scale: 1, opacity: 1, rotation: -11, duration: 0.55, ease: "back.out(1.8)" })` + tremor físico na sala (`gsap.fromTo(room, { x: -4 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.2)" })`).

---

## 9. Marlo (`/marlo`) — Desk de Pós-Produção de Vídeo, Kanban & Alocação de Estúdio
- **URL**: `https://demo.codeandchill.store/marlo`
- **Domínio de Produto (`FATO EXTRAÍDO`)**: Gestão de projetos criativos e tarefas de pós-produção (*Northbank Post*) com abas `Today`, `Tasks` (Kanban + Lista), `Schedule`, `Projects`, `Team` e `Focus`.
- **Stack & Tipografia (`FATO EXTRAÍDO`)**: React `19.3.0` + GSAP `3.15.0` + `Flip` `3.15.0` + `"Urbanist"` (`400..700`).
- **Tokens de Cor e Superfície (`FATO EXTRAÍDO`)**:
  - **Light Mode**: `--bg: #e6e7ea`, `--bg-2: #dcdee2`, `--card: #f5f5f6`, `--card-2: #ededf0`, `--card-3: #e3e4e8`, `--noir: #17181a`, `--ink: #151619`, `--accent: #f29b23` (âmbar estúdio), `--accent-2: #dc8610`, `--good: #1f9a60`, `--warn: #d98218`, `--bad: #d84339`, `--info: #3b6ff5`.
  - **Dark Mode**: `--bg: #111213`, `--card: #1b1c1e`, `--card-2: #222427`, `--ink: #f2f3f5`, `--accent: #f4a43a`.
- **Grid e Layout (`FATO EXTRAÍDO`)**:
  - `--max: 1680px`, `--gap: 16px`, `--pad: 24px`, `--side-w: 236px`, `--side-rail: 72px`, `--r-xl: 28px`.
  - Sidebar flutuante como card destacado (`position: fixed; top: 16px; bottom: 16px; left: 16px; border-radius: 28px`) + widget de cronômetro de sessão na topbar (`.timer`).
- **Coreografia GSAP Específica (`FATO EXTRAÍDO`)**:
  - **Kanban com `Flip.from` (`tasks.js`)**:
    - Ao iniciar arraste (`Math.hypot(dx, dy) > 6`): `gsap.to(card, { scale: 1.03, rotation: 1.8, duration: 0.2, ease: "power2.out" })`.
    - Ao soltar em outra raia (`lane`): captura `const state = Flip.getState(board.querySelectorAll(".kcard"))` antes de atualizar o estado React e no `requestAnimationFrame` seguinte executa `Flip.from(state, { duration: 0.45, ease: "expo.out", absolute: false })`.
  - **Troca de Projeto Ativo (`projects.js`)**: Ao selecionar outro projeto na lista lateral, o painel principal executa micro-transição `fromTo(".proj-detail", { opacity: 0.4, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out", clearProps: "all" })`.

---

## 10. Raveno (`/raveno`) — CRM & Inbox de Moderação de Marketplace
- **URL**: `https://demo.codeandchill.store/raveno`
- **Domínio de Produto (`FATO EXTRAÍDO`)**: Mesa de operação de marketplace de serviços (*Handwell*) com abas `Overview`, `Reviews` (Master-Detail Inbox), `Providers`, `Bookings`, `Payouts` e `Disputes`.
- **Stack & Tipografia (`FATO EXTRAÍDO`)**: React `19.3.0` + GSAP `3.15.0` + `Flip` `3.15.0` + `"Urbanist"` (`400..700`).
- **Tokens de Cor e Superfície (`FATO EXTRAÍDO`)**:
  - **Paleta Monocromática Editorial (Papel & Grafite)**:
    - Light: `--bg: #f2f3f5`, `--bg-2: #eaecf0`, `--card: #ffffff`, `--card-2: #f6f7f9`, `--card-3: #eef0f4`, `--noir: #18191d`, `--ink: #18191d`, `--ink-2: #3c3e45`, `--ink-3: #6c707a`, `--accent: #18191d`, `--pill: linear-gradient(90deg, #18191d 0%, #2b2c31 55%, #9a9da5 100%)`, `--good: #178a52`, `--warn: #c87619`, `--bad: #cf3730`, `--info: #2e5ce5`.
    - Dark: `--bg: #0e0f11`, `--card: #18191c`, `--card-2: #1f2125`, `--ink: #f3f4f6`, `--accent: #f3f4f6`, `--pill: linear-gradient(90deg, #f3f4f6 0%, #c8cbd2 55%, #555963 100%)`.
- **Coreografia GSAP Específica (`FATO EXTRAÍDO`)**:
  - **Master-Detail Inbox (`reviews.js`)**:
    - Filtragem da lista esquerda (`.rvl__item`) usa `Flip.from(state, { duration: 0.45, ease: "power3.inOut", stagger: 0.015, absolute: false })`.
    - Troca do item selecionado re-anima o painel de detalhe direito (`.rvd`): `fromTo(pane, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out", clearProps: "transform,opacity" })`.
    - Inserção de template de resposta rápida aplica highlight táctil no `<textarea>`: `fromTo(textarea, { scale: 0.99 }, { scale: 1, duration: 0.3, ease: "back.out(2)" })`.

---

## 11. Fragio (`/fragio`) — Gestão Agrícola de Estufas, Colheita & Planejamento Sazonal
- **URL**: `https://demo.codeandchill.store/fragio/`
- **Domínio de Produto (`FATO EXTRAÍDO`)**: Mesa de operação agrícola (*Wyebank Fruit*) com abas `Overview`, `Glasshouses` (sub-itens expansíveis por estufa), `Harvest`, `Season plan` (Gantt de 52 semanas + Kanban + Rota de equipes), `Insights`, `Orders & pay`, `Team` e `Settings`.
- **Stack & Tipografia (`FATO EXTRAÍDO`)**: React `19.3.0` + GSAP `3.15.0` + `Flip` `3.15.0` + `"Urbanist"` (`400..700`).
- **Tokens de Cor e Superfície (`FATO EXTRAÍDO`)**:
  - **Light Mode**: `--bg: #f3efeb`, `--side-bg: #f3efeb`, `--card: #fdfbfb`, `--card-2: #f6f1f1`, `--ink: #1c1517`, `--muted: #685b5f`, `--accent: #d4502a` (terracota fruto), `--data-2: #2c7a6e`, KPI tiles pastel (`--tile-1: #f8ded2`, `--tile-2: #d9ebe0`, `--tile-3: #f3e6c8`, `--tile-4: #dbe5f3`), cores de fase de cultivo `--k1..k6`.
  - **Dark Mode**: `--bg: #141112`, `--card: #1e1a1b`, `--card-2: #262122`, `--ink: #f4eff0`, `--accent: #ff8a5c`, `--tile-1: #3a2117`, `--tile-2: #18302a`, `--tile-3: #33291a`, `--tile-4: #1a2537`.
- **Coreografia GSAP Específica (`FATO EXTRAÍDO`)**:
  - **Colapso de Sidebar com Rastreamento FLIP Manual (`Jt`)**: Ao alternar `html.is-rail`, mede o `getBoundingClientRect()` dos ícones âncora (`.mark`, `.collapse`, `.side__search .ico`, `.snav__item .ico`, `.side__wk .ico`, `.side__me`), aplica `clipPath: inset(0 ${l-d}px 0 0)` (`0.42s power3.inOut` no fechamento / `0.5s expo.out` na abertura) e interpola a posição `(x, y)` de cada ícone e da `.snav__pill`.
  - **Submenu Acordeão na Sidebar (`.snav__subs`)**: Revela sub-rotas das estufas com `fromTo(e, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.45, ease: "power3.out" })` + filhos com `opacity: 0, x: -6 → 1, 0, duration: 0.35, stagger: 0.03`.
  - **Gantt Sazonal de 52 Semanas (`plan-BWpkmSaM.js`)**: Barras de fase (`.gt__bar`) arrastáveis horizontalmente (move a fase e empurra automaticamente todas as fases subsequentes da mesma estufa) e redimensionáveis pela borda `.gt__grip`. No `pointerup`, aplica bounce vertical elástico `fromTo(el, { scaleY: 0.78 }, { scaleY: 1, duration: 0.6, ease: "elastic.out(1, 0.45)" })` e desenha setas ortogonais SVG `.gt__links path` com cantos arredondados quadráticos (`Q`).

---

## 12. Groova (`/groova`) — POS, Estoque, E-commerce & CRM de Loja de Discos
- **URL**: `https://demo.codeandchill.store/groova/`
- **Domínio de Produto (`FATO EXTRAÍDO`)**: Sistema de ponto de venda (PDV/Till) e back-office (*Low Tide Records*) com abas `Overview`, `Insights`, `Transactions`, `Payments`, `Catalogue`, `Customers`, `Messages` e `Settings`.
- **Stack & Tipografia (`FATO EXTRAÍDO`)**: React `19.3.0` + GSAP `3.15.0` + `Flip` `3.15.0` + `"Urbanist"` (`400..700`).
- **Tokens de Cor e Superfície (`FATO EXTRAÍDO`)**:
  - **Light Mode**: `--bg: #f1f1f0`, `--card: #fbfbfa`, `--panel: #fdfdfc`, `--ink: #16181d`, `--accent: #2348d0` (azul cobalto vinil), `--ch-counter: #2348d0`, `--ch-web: #17867a`, `--ch-events: #d9940f`, `--tile-1: #dfe6fa`, `--tile-2: #d6ece7`, `--tile-3: #f4e8c8`, `--tile-4: #f5ddd3`.
  - **Dark Mode**: `--bg: #0f1012`, `--card: #18191d`, `--panel: #1c1d22`, `--ink: #eceef3`, `--accent: #5b82ff`.
- **Coreografia GSAP Específica (`FATO EXTRAÍDO`)**:
  - **Sidebar Flutuante com Flyout de Rail (`.flyout`)**: Sidebar destacada (`top/bottom/left: 12px; border-radius: 24px`). Quando recolhida (`html.is-rail`), apontar para um ícone abre um `.flyout` lateral (`opacity: 0, x: -8, scale: 0.98 → 1, 0, 1, duration: 0.32, ease: "power3.out"`) com itens escalonados (`stagger: 0.03s`).
  - **Gráficos Exclusivos (`charts-BnJIUDun.js` & CSS)**:
    - **Stacked Channel Bars (`.stack`)**: Colunas empilhadas de 3 camadas (`.stack__layer--0..2`) animadas com `scaleY` (`1.05s expo.out` na entrada, `0.8s expo.inOut` na atualização) + linha tracejada de recorde `.stack__best`.
    - **Bidirectional Flow Chart (`.flow`)**: Barras `.flow__in` crescendo para cima (`transform-origin: 50% 100%`) e `.flow__out` crescendo para baixo (`transform-origin: 50% 0`) + linha líquida `.flow__net path`.
    - **Staircase Funnel (`.stair`)**: Colunas de funil com preenchimento gradiente e pílulas de taxa de conversão `.stair__conv` entre etapas.
  - **Capas de Vinil CSS (`.sleeve` + `.sleeve__disc`)**: Componente visual de álbum com disco de vinil radial projetando-se `right: -10%` para fora da capa.

---

## 13. Levena (`/levena`) — Gestão de Turnos (Rota), RH, Folha & Recrutamento Multi-Loja
- **URL**: `https://demo.codeandchill.store/levena/`
- **Domínio de Produto (`FATO EXTRAÍDO`)**: Plataforma de gestão de equipes e escalas (*Fenwick & Rye Bakers — 37 pessoas em 6 unidades*) com abas `Today`, `Rota` (Gantt diário de turnos por hora), `People`, `Hiring`, `Pay`, `Reviews`, `Kit`, `Tools` e `Settings`.
- **Stack & Tipografia (`FATO EXTRAÍDO`)**: React `19.3.0` + GSAP `3.15.0` + `Flip` `3.15.0` + `"Urbanist"` (`400..700`).
- **Tokens de Cor e Superfície (`FATO EXTRAÍDO`)**:
  - **Light Mode**: `--bg: #f2f2f1`, `--card: #fcfcfb`, `--card-2: #f4f4f2`, `--ink: #19191a`, `--accent: #f2b01e` (ouro açafrão), `--accent-ink: #1f1603`, `--data-2: #2f6fd1`, cores por loja `--s1..s6`.
  - **Dark Mode**: `--bg: #121212`, `--card: #1b1b1a`, `--ink: #f2f1ee`, `--accent: #f5bb3d`.
- **Coreografia GSAP Específica (`FATO EXTRAÍDO`)**:
  - **Gantt de Turnos Interativo (`gantt-uQfIaT4v.js`)**:
    - Permite arrastar um turno (`.gbar`) horizontalmente (muda horário em incrementos de `15min` = `0.25h`) E verticalmente entre funcionários (`.gantt__row`), ou redimensionar o fim pelo `.gbar__grip`.
    - Detecta conflitos de horário ou férias em tempo real: se inválido, aplica shake (`u(s)`) e retorna com mola `gsap.to(s, { x: 0, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.8)" })`.
    - Quando válido, anima do retângulo antigo para a nova linha/horário (`duration: 0.42, ease: "power3.out"`) seguido de squash-and-stretch elástico `fromTo(t, { scaleY: 0.78, scaleX: 1.03 }, { scaleY: 1, scaleX: 1, duration: 0.55, ease: "elastic.out(1, 0.45)" })` aos `0.28s`, e pulsa as células de cobertura horária `.gcov i` (`scaleY: 0.55 → 1, duration: 0.5, ease: "back.out(3)"`).
  - **Relógio de Ponto ao Vivo (`.clockpill` + `.clockpop`)**: Pílula na topbar com status `On shift` / `On break` / `Clock in` que abre popover `.clockpop` com estatísticas do turno e ações imediatas.
  - **Matriz de Permissões Responsiva (`.perm`)**: Em desktop é uma grade de `Role × 7 Permissões` com switches; em mobile (`<=760px`) transforma cada linha num card empilhado usando `content: attr(data-label)` antes de cada célula.

---

## 14. Kelpo (`/kelpo`) — Mesa de Social Media, Calendário de Conteúdo, Inbox & Campanhas
- **URL**: `https://demo.codeandchill.store/kelpo/`
- **Domínio de Produto (`FATO EXTRAÍDO`)**: Console de gestão de redes sociais e criadores (*Porthcove Surf Co.*) com abas `Overview`, `Content` (Calendário semanal drag-and-drop + Fila + Quadro de Ideias), `Inbox`, `Analytics`, `Campaigns`, `Bio link`, `Reports` e `Settings`.
- **Stack & Tipografia (`FATO EXTRAÍDO`)**: React `19.3.0` + GSAP `3.15.0` + `Flip` `3.15.0` + `"Urbanist"` (`400..700`).
- **Tokens de Cor e Superfície (`FATO EXTRAÍDO`)**:
  - **Light Mode**: `--bg: #f2f0ec`, `--card: #fcfbf9`, `--card-2: #f5f3ef`, `--ink: #1c1718`, `--accent: #c8285e` (magenta framboesa), `--pill: #1c1718`, `--pill-ink: #f7f2f2`, `--pill-ico: #ff7aa2`, cores por rede social `--c1..c6`.
  - **Dark Mode**: `--bg: #121011`, `--card: #1a1718`, `--ink: #f3eeee`, `--accent: #ff6f9a`, `--pill: #ff6f9a`, `--pill-ink: #2a0612`.
- **Coreografia GSAP Específica (`FATO EXTRAÍDO`)**:
  - **Gráfico Stacked River / Stream (`.river` em `charts-vtKYPc5s.js`)**: Bandas empilhadas suaves (`.river__band` + `.river__crest`) que interpolam pesos `wt[n]` (`0 → 1`) quando o usuário liga/desliga canais sociais (`duration: 0.85, ease: "expo.inOut"` via `gsap.ticker`), acompanhadas de pinos clicáveis de posts virais (`.river__pin`) flutuando sobre a crista da curva.
  - **Calendário Semanal com `Flip` + Squash Elástico (`content-wkY_0j8v.js`)**: Ao mover um post agendado (`.wk__card`) entre dias da semana (via drag ou setas `←`/`→`), executa `Flip.from(state, { duration: 0.6, ease: "power3.inOut" })` e no `onComplete` aplica `fromTo(card, { scaleX: 1.07, scaleY: 0.88 }, { scaleX: 1, scaleY: 1, duration: 0.7, ease: "elastic.out(1, 0.45)" })`.
  - **Composer Multi-Canal com Preview Ao Vivo (`.compose` + `.pv`)**: Modal largo (`760px`) com seletor de canais `.chpick`, contador de limite de caracteres dinâmico por rede e preview em tempo real `.compose__preview`.

---

## Matriz Comparativa Consolidada (`FATO EXTRAÍDO`)

| Página | Domínio | Stack | Fonte | `--bg` (Light / Dark) | `--card` (Light / Dark) | `--accent` (Light / Dark) | Navegação Principal | Assinatura de Motion Única |
|---|---|---|---|---|---|---|---|---|
| **Tolva** | Autopay & Cashflow | React 19 + GSAP/Flip 3.15 | Urbanist | `#435f39` / `#0f140d` | `#f1f5ea` / `#1a2117` | `#3b7424` (`#a9d982`) / `#9fd677` | Topbar Pill Horizontal (`.tnav`) | Leque de cartões 3D, Rule Spine SVG, Dry-Run pulse |
| **Veyla** | KYC & Fraud Review | React 19 + GSAP/Flip 3.15 | Urbanist | `#ededef` / `#111314` | `#ffffff` / `#1a1d1e` | `#cce5e2` (mint) / `#234743` | Sidebar Retrátil (`244px`/`80px`) | Stacked tile chart, scanner KYC, fila `A`/`D` |
| **Grovia** | HR & Payroll Bento | Vanilla JS + GSAP/Flip 3.15 | Outfit + Inter | `#5ea86f` (app `#e2eedd`) | `#fafff79e` | `#66a05f` (honey) | Top Morphing Pill (3 partes) | Relógio de rolos `.dg__col`, matriz 60 dots random |
| **Brisko** | Back-Office & Grafo | React 19 + GSAP/Flip 3.15 | Urbanist | `#e7ebe3` / `#0e100d` | `#f5f7f2` / `#171a15` | `#e2f47b` (lime) / `#d9ef62` | Floating Dark Rail (`76px`/`232px`) | Grafo Bezier com `.cv__bead` via `getPointAtLength` |
| **Calda** | Smart Home Glass | React 19 + GSAP/Flip 3.15 | Urbanist | `#c9cbce` / `#2a2c2f` | Glass `rgba(242,241,238,.6)` | `#1e9bf0` / `#29a1f7` | Sidebar Glass + Slider `--frost` | Dial 270° SVG, Slide-to-Unlock `elastic.out(1, 0.5)` |
| **Halvi** | Saúde & Biomarcadores | React 19 + GSAP/Flip 3.15 | Urbanist | `#e7e8ea` / `#0f0f11` | `#f9f9f9` / `#18181b` | `#f0412b` / `#ff5a43` | Left Floating Pill Dock (`60px`) | Barras hachuradas, copos `.cup__fill`, pinos de exame |
| **Ignara** | Pedidos & Despacho | React 19 + GSAP/Flip 3.15 | Urbanist | `#e7e6e4` / `#26282c` | `#f7f6f4` / `#2f3135` | `#ee5230` / `#f0552f` | Sidebar Retrátil (`248px`/`84px`) | Stem-and-bead chart, Kanban com delta `back.out(1.5)` |
| **Kavora** | Trading & Leilão | React 19 + GSAP/Flip 3.15 | Urbanist | `#ebebe8` / `#111110` | `#ffffff` / `#1b1b1a` | `#f47a53` / `#ff8a63` | Topbar + Mega-Menu + Wire Ticker | Leilão ao vivo, escada SVG, carimbo `SOLD` + shake |
| **Marlo** | Pós-Produção & Tasks | React 19 + GSAP/Flip 3.15 | Urbanist | `#e6e7ea` / `#111213` | `#f5f5f6` / `#1b1c1e` | `#f29b23` / `#f4a43a` | Floating Card Sidebar + Timer | Kanban `Flip.from` + ponteiro capturado |
| **Raveno** | CRM & Review Inbox | React 19 + GSAP/Flip 3.15 | Urbanist | `#f2f3f5` / `#0e0f11` | `#ffffff` / `#18191c` | `#18191d` / `#f3f4f6` (grafite) | Sidebar + Master-Detail Split | Inbox com `Flip.from`, flash de inserção de template |
| **Fragio** | Estufas & Safra Agrícola | React 19 + GSAP/Flip 3.15 | Urbanist | `#f3efeb` / `#141112` | `#fdfbfb` / `#1e1a1b` | `#d4502a` / `#ff8a5c` | Sidebar c/ Acordeão `.snav__subs` + FLIP fold | Gantt 52 semanas c/ cascata de fases e `elastic.out(1, 0.45)` |
| **Groova** | PDV & Loja de Discos | React 19 + GSAP/Flip 3.15 | Urbanist | `#f1f1f0` / `#0f1012` | `#fbfbfa` / `#18191d` | `#2348d0` / `#5b82ff` | Floating Sidebar (`inset: 12px`) + Rail `.flyout` | Gráficos `.stack`, `.flow` bidirecional, funil `.stair`, capas `.sleeve` |
| **Levena** | Turnos (Rota) & RH | React 19 + GSAP/Flip 3.15 | Urbanist | `#f2f2f1` / `#121212` | `#fcfcfb` / `#1b1b1a` | `#f2b01e` / `#f5bb3d` | Floating Sidebar (`gap: 12px`) + Rail `.flyout` + `.clockpill` | Gantt de turnos 2D drag/resize + squash `elastic.out(1, 0.45)`, matriz `.perm` |
| **Kelpo** | Social Media & Creator Desk | React 19 + GSAP/Flip 3.15 | Urbanist | `#f2f0ec` / `#121011` | `#fcfbf9` / `#1a1718` | `#c8285e` / `#ff6f9a` | Sidebar c/ `.side__theme` switch + `.snav__pill` | Gráfico `.river` empilhado c/ pinos, calendário semanal `Flip` + squash |

---

## O Que Não Foi Possível Verificar (`FATO EXTRAÍDO`)

1. **Arquivos `.map` (Source Maps originais TypeScript)**: Não publicados no servidor de produção (`HTTP 404`); toda a lógica foi extraída diretamente dos bundles ES2022 minificados (que preservam nomes semânticos de exports, variáveis CSS, seletores e configurações GSAP).
2. **Backend / Persistência Remota**: Nenhuma das 10 páginas realiza chamadas `fetch`/`WebSocket` para APIs externas de dados — todas operam sobre engines de estado determinístico in-memory e `localStorage` no cliente (`FATO EXTRAÍDO`).
