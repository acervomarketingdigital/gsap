# Tradução de Padrões para Dashboards e CRMs

> **Regra Central de Produto**: Em interfaces operacionais de uso diário e prolongado, **o movimento existe exclusivamente para preservar continuidade espacial, confirmar ações e guiar o olho após mudanças de estado**. Tudo que atrasa a leitura do dado é ruído.

---

## 1. Fronteira Inegociável: Motion de Marketing vs. Motion de Produto

| Dimensão | Motion de Marketing (PROIBIDO em Telas Operacionais) | Motion de Produto (PADRÃO Extraído das 10 Referências) |
|---|---|---|
| **Gatilho Principal** | Posição do scroll (`ScrollTrigger` com `scrub: 1`, `pin: true`) | Montagem de rota (`useLayoutEffect`), mutação de dados, clique, filtro ou drag |
| **Smooth Scroll** | Hijack de scroll com inércia artificial (`Lenis`, `ScrollSmoother`) | Scroll nativo imediato do navegador (`overflow-y: auto`) para precisão em tabelas longas |
| **Tipografia Split** | Em todos os parágrafos, subtítulos e seções ao rolar | **Exclusivamente** no título `h1` da visão (`.phead h1`), 1 vez na entrada (`0.85s`, `power4.out`) |
| **Duração de Entrada** | `1.4s` a `2.5s` com delays longos | `0.35s` a `0.85s`, com saída ultrarrápida (`0.18s` a `0.32s`) |
| **Parallax** | Imagens e blocos flutuando em velocidades diferentes no scroll | **Zero parallax de scroll**; no máximo inclinação sutil `pointermove` (`dx * 6px`) em 1 card de perfil isolado |
| **Re-animação** | Re-dispara toda vez que o usuário sobe e desce a página | Dispara apenas na entrada da visão ou quando os dados mudam de fato |

---

## 2. Escala de Intensidade de Movimento (`INFERÊNCIA/RECOMENDAÇÃO` Baseada no Código)

Defina a intensidade por tela ou contexto usando o preset em `assets/motion.config.ts`:

1. **`subtle` (Uso Diário Intenso / Mesas de Operação / Back-Office — ex.: `Raveno`, `Veyla`)**:
   - Sem split de caracteres em títulos; durações reduzidas em `25%` (`card: 0.55s`, `row: 0.4s`); overshoot desativado (`power3.out` em vez de `back.out`); zero efeito magnético.
2. **`default` (Dashboards Executivos, CRMs, Finanças & Analytics — ex.: `Tolva`, `Ignara`, `Marlo`)**:
   - Vocabulário padrão extraído: split no `h1` (`0.85s`), entrada de cards (`0.8s expo.out`), contadores tabulares (`1.2s`), `Flip` em tabelas/Kanban (`0.5s`), pílula líquida `clip-path`.
3. **`expressive` (Salas Ao Vivo, Overview Inaugural, Demonstrações — ex.: `Grovia`, `Kavora`, `Calda`)**:
   - Adiciona tiles com leve rotação (`back.out(1.4)`), carimbos físicos (`SOLD` / `PAID` com `back.out(1.8..2)`), deltas flutuantes (`float-up`) e botões magnéticos (`.magnetic`).

---

## 3. Mapeamento Completo por Componente de Produto

### 3.1. Shell: Sidebar, Topbar, Navegação e Troca de Rotas

- **Padrão de Origem (`FATO EXTRAÍDO`)**:
  - `Eo`/`To` (Liquid Clip-Path Pill em `Tolva`/`Kavora`), Sidebar retrátil `--side-w: 244px → 80px` (`Veyla`/`Ignara`), Transição direcional de rota `nu` (saída `0.18s power2.in` + entrada `0.7s expo.out`), e View Transition circular para troca de tema (`an`).
- **Componente de Destino**:
  - App Shell (`.shell`), navegação primária lateral/superior, seletor de workspace e toggle Light/Dark.
- **Intensidade Recomendada**: `default` (Indicador de aba e troca de rota) / `subtle` (Colapso de sidebar).
- **Receita de Implementação**:
  1. Ao clicar em outra rota, calcule a direção (`dir = nextIdx > prevIdx ? 1 : -1`).
  2. Anime apenas os elementos **visíveis no viewport** (`getBoundingClientRect().top < innerHeight`) para fora em `0.18s` (`power2.in`, `y: 8, opacity: 0, scale: 0.985`).
  3. Troque o estado da rota e deslize o novo container de `x: dir * 26` para `0` em `0.7s` (`expo.out`, `clearProps: "transform"`).
  4. Mova o indicador da aba ativa com `clip-path: inset(...)` assimétrico (`0.36s` borda líder / `0.55s` borda traseira).
- **O Que NÃO Fazer**:
  - Nunca espere uma saída lenta (`> 0.25s`) antes de trocar a rota — o usuário sente que o clique travou.
  - Nunca anime `width` de colunas de grid via JS frame-a-frame sem necessidade; use variável CSS `--side-w` com `transition: grid-template-columns .38s cubic-bezier(.22, 1, .36, 1)`.

---

### 3.2. KPIs e Cards de Métrica (Contadores, Entrada Escalonada, Deltas)

- **Padrão de Origem (`FATO EXTRAÍDO`)**:
  - `lo` (Cards entrance `y: 26, scale: 0.985 → 0, 1, duration: 0.8, ease: "expo.out", stagger: 0.06`), `vo`/`Ll` (Contador `WeakMap` `duration: 1.2, ease: "power3.out"` com `.count__size`), `go` (Delta flutuante `float-up`).
- **Componente de Destino**:
  - Fileira de 4 KPIs no topo do dashboard, cards de resumo de pipeline CRM, cabeçalhos de carteira financeira.
- **Intensidade Recomendada**: `default`.
- **Receita de Implementação**:
  1. Renderize cada valor numérico dentro de `<span class="count num"><span class="count__size" aria-hidden="true">{formatted}</span><span class="count__live">{formatted}</span></span>`.
  2. Armazene o último valor numérico num `WeakMap<HTMLElement, { v: number }>`. Na montagem, anime de `0` (ou de `target * 0.85` em atualizações incrementais) até `target` em `1.2s` (`power3.out`).
  3. Quando o valor mudar por ação do usuário (ex.: novo negócio ganho ou lance), dispare `spawnFloatingDelta(el, "+R$ 12.400")` e pulse o badge de delta (`fromTo(badge, { scale: 1.2 }, { scale: 1, duration: 0.4, ease: "back.out(2.5)" })`).
- **O Que NÃO Fazer**:
  - Nunca anime um contador sem `font-variant-numeric: tabular-nums` e sem o elemento fantasma `.count__size` (causa tremedeira horizontal no layout).
  - Nunca reinicie o contador do `0` quando o usuário apenas filtrar uma tabela secundária na mesma tela; anime a partir do valor anterior armazenado no `WeakMap`.

---

### 3.3. Gráficos (Entrada, Transição Entre Períodos, Hover)

- **Padrão de Origem (`FATO EXTRAÍDO`)**:
  - `po` (`scaleY: 0 → 1, duration: 0.9, ease: "expo.out", stagger: 0.03`), `Do` (Morfagem de barras `scaleY: ratio, duration: 0.75, ease: "expo.inOut"`), `mo` (`strokeDashoffset` `1.2s power2.inOut`), interpolação de arrays SVG via proxy `{ k: 0 → 1 }` no `gsap.ticker` (`Tolva`, `Ignara`, `Kavora`).
- **Componente de Destino**:
  - Gráficos de fluxo de caixa, receita recorrente (MRR), funis de conversão, séries de pedidos e histogramas.
- **Intensidade Recomendada**: `default`.
- **Receita de Implementação**:
  1. **Barras Verticais/Horizontais**: Defina `transform-origin: 50% 100%` (vertical) ou `0% 50%` (horizontal) no CSS. Na primeira montagem, anime `scaleY: 0 → 1`. Na troca de período (`7d` / `30d` / `90d`), mantenha os nós DOM e anime `scaleY` para a nova razão com `expo.inOut` (`0.75s`).
  2. **Linhas e Áreas SVG**: Quando o número de pontos entre dois períodos for igual (ex.: 12 pontos mensais vs. 12 semanas), interpole `y[i] = prev[i] + (next[i] - prev[i]) * proxy.k` em `0.85s` (`expo.inOut`) agendando a atualização do atributo `d` no `gsap.ticker`. Se a quantidade de pontos mudar, re-execute o reveal de `strokeDashoffset` (`0.75s`).
  3. **Hover Crosshair / Tooltip**: Use transição instantânea de opacidade (`0.15s`) e posicione o tooltip sem lag.
- **O Que NÃO Fazer**:
  - Nunca destrua e recrie o `<svg>` inteiro ao alternar entre abas de período (`7d`/`30d`/`90d`) — isso perde a referência visual de quais barras subiram ou caíram.
  - Nunca anime `height` ou `width` de barras em HTML/CSS; anime exclusivamente `transform: scaleY()` ou `scaleX()`.

---

### 3.4. Tabelas e Listas Densa (Carregamento, Ordenação/Filtro com `Flip`, Linhas Novas/Removidas)

- **Padrão de Origem (`FATO EXTRAÍDO`)**:
  - `uo` (`tbody tr` entrance `opacity: 0, y: 12 → 1, 0, duration: 0.55, ease: "power3.out", stagger: 0.04` limitado a `.slice(0, 14)`), e `Flip.getState` / `Flip.from` (`duration: 0.5, ease: "power3.inOut", absolute: false, nested: true`) em `Grovia`, `Veyla`, `Ignara`, `Raveno`.
- **Componente de Destino**:
  - Tabelas de contatos CRM, faturas, pedidos, logs de auditoria e filas de tickets.
- **Intensidade Recomendada**: `subtle` a `default`.
- **Receita de Implementação**:
  1. **Limite de Stagger na Entrada**: Se a tabela tiver 100 linhas, selecione apenas `rows.slice(0, 14)` para o stagger de entrada (`14 * 0.04s = 0.56s`). Linhas abaixo da dobra aparecem imediatamente sem delay acumulado.
  2. **Ordenação, Busca e Filtro por Status**:
     - Antes de chamar `setFilter` / `setSort`, capture `flipStateRef.current = Flip.getState(tbody.querySelectorAll("tr[data-row-id]"))`.
     - No `useLayoutEffect` pós-render, execute `Flip.from(flipStateRef.current, { targets: tbody.querySelectorAll("tr[data-row-id]"), duration: 0.5, ease: "power3.inOut", absolute: false, scale: false, onEnter: els => gsap.fromTo(els, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.02 }) })`.
  3. **Mobile (`<= 760px`)**: Aplique `.table--stack` para transformar cada `<tr>` num card compacto com `grid-template-areas: "main end" "sub tag"`.
- **O Que NÃO Fazer**:
  - Nunca use `absolute: true` no `Flip.from` de elementos `<tr>` de tabela HTML nativa (quebra o colapso de larguras de coluna da `<table>`).
  - Nunca aplique stagger com delay cumulativo acima de `14` itens.

---

### 3.5. Kanban e Pipeline de CRM (Drag, Drop, Reordenação, Mudança de Coluna)

- **Padrão de Origem (`FATO EXTRAÍDO`)**:
  - Kanban de `Marlo` (`tasks.js`) e `Ignara` (`orders.js`): Pointer Events (`setPointerCapture`), threshold de `6px`, elevação física no pickup (`scale: 1.03, rotation: 1.8, duration: 0.2, ease: "power2.out"`), snapback elástico no cancelamento (`back.out(1.7)`) e acomodação na nova coluna com `Flip.from` (`0.45s expo.out`) + pop no contador da coluna (`back.out(3)`).
- **Componente de Destino**:
  - Pipeline de negócios (Deals CRM), quadro de despacho de pedidos, triagem de candidatos e quadros de tarefas.
- **Intensidade Recomendada**: `default`.
- **Receita de Implementação**:
  1. No `pointerdown`, registre `(startX, startY)` mas **não** inicie o drag até que `Math.hypot(dx, dy) > 6` (preserva cliques normais para abrir o Drawer do negócio).
  2. Ao cruzar `6px`, chame `el.setPointerCapture(e.pointerId)`, adicione `.is-dragging` (`z-index: 40; box-shadow: var(--shadow-lg)`) e anime `scale: 1.03, rotation: 1.8` (`0.2s power3.out`).
  3. Durante `pointermove`, atualize `gsap.set(el, { x: dx, y: dy })` e destaque a coluna alvo `[data-lane-id]` sob o ponteiro com `.is-drop-target`.
  4. No `pointerup`:
     - Se soltou na **mesma coluna** (ou fora): anime `gsap.to(el, { x: 0, y: 0, scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.7)", clearProps: "transform" })`.
     - Se soltou em **nova coluna**: capture `Flip.getState(".kcard")`, limpe o `transform` inline do card arrastado, mova o item no state do React e no `useLayoutEffect` rode `Flip.from(state, { duration: 0.48, ease: "expo.out" })` + pop nos badges de contagem e total monetário das duas colunas (`scale: 1.3 → 1, duration: 0.45, ease: "back.out(3)"`).
  5. **Acessibilidade Obrigatória**: Todo card Kanban deve ter um botão de ação rápida ou atalho de teclado ("Mover para etapa...") que dispara a mesma animação `Flip.from` sem exigir arraste com mouse.
- **O Que NÃO Fazer**:
  - Nunca use a HTML5 Drag and Drop API nativa (`draggable="true"`, `ondragstart`) se quiser animar escala, rotação e retorno elástico suaves — o fantasma translúcido nativo do SO não pode ser coreografado pelo GSAP. Use Pointer Events.

---

### 3.6. Drawers, Modais e Painéis de Detalhe do Contato/Negócio

- **Padrão de Origem (`FATO EXTRAÍDO`)**:
  - `kl` (Drawer lateral `xPercent: 104 → 0, duration: 0.6, ease: "expo.out"` no desktop; Bottom Sheet `yPercent: 100 → 0` no mobile `<= 760px` com gesto drag-to-dismiss `El`), `Al` (Modal escalando a partir do `transformOrigin` do botão gatilho com `back.out(1.5)`).
- **Componente de Destino**:
  - Ficha 360° do cliente/lead, inspeção de fatura/pedido, edição de regra de automação, confirmação de ação destrutiva.
- **Intensidade Recomendada**: `default`.
- **Receita de Implementação**:
  1. Ao abrir o Drawer, aplique `inert` no `.shell` de fundo, trave o scroll do `body`, anime o `.drawer__scrim` (`opacity: 0 → 1, duration: 0.3`) e o `.drawer__panel` (`xPercent: 104 → 0` no desktop ou `yPercent: 100 → 0` em `<=760px`, `duration: 0.6, ease: "expo.out"`).
  2. Escalone as seções internas do corpo do Drawer (`.drawer__body > *`) com `opacity: 0, y: 14 → 1, 0, duration: 0.5, delay: 0.12, stagger: 0.04, ease: "power3.out"`.
  3. No fechamento (`Escape`, clique no scrim ou botão fechar), anime em metade do tempo (`duration: 0.32, ease: "power3.in"`) e devolva o foco ao elemento que abriu o painel (`triggerRef.current?.focus()`).
  4. Em modais centralizados, calcule o centro do botão que disparou a abertura e defina `transformOrigin: "${ox}px ${oy}px"` no painel antes de animar `scale: 0.86 → 1, duration: 0.5, ease: "back.out(1.5)"`.
- **O Que NÃO Fazer**:
  - Nunca desmonte o componente do DOM no exato milissegundo em que `open` passa para `false` — aguarde o `onComplete` do tween de saída (`0.32s` no drawer, `0.2s` no modal).

---

### 3.7. Formulários, Validação, Toasts e Estados Vazios/Loading/Erro

- **Padrão de Origem (`FATO EXTRAÍDO`)**:
  - `bo` (Shake horizontal de erro `keyframes: { x: [0, -8, 7, -5, 3, 0] }, duration: 0.42, ease: "power2.out"`), `Tl` (Toast stack `y: 30, opacity: 0, scale: 0.94 → 0, 1, 1, duration: 0.5, ease: "back.out(1.8)"`), `yo` (Switch thumb e botão pop `back.out(2.2..3)`).
- **Componente de Destino**:
  - Criação de negócios/contatos, filtros avançados, configurações de conta, feedback de mutações CRUD.
- **Intensidade Recomendada**: `default`.
- **Receita de Implementação**:
  1. **Erro de Validação**: Quando o usuário submeter um campo inválido, aplique `[aria-invalid="true"]` (borda `--bad`), foque o primeiro campo com erro e execute o shake `keyframes: { x: [0, -8, 7, -5, 3, 0] }, duration: 0.42, ease: "power2.out"`.
  2. **Feedback de Sucesso/Erro (Toast)**: Jamais use `window.alert()`, `window.confirm()` ou `window.prompt()`. Empilhe um `.toast` em `aria-live="polite"` com entrada `back.out(1.8)` (`0.5s`), botão opcional de **Desfazer (Undo)** (`5.5s` de timeout; `3.2s` sem ação) e saída `y: 16, opacity: 0, duration: 0.25, ease: "power2.in"`.
  3. **Ações Destrutivas**: Exija confirmação via **Modal** coreografado (`Al`), nunca diálogo nativo do browser.
- **O Que NÃO Fazer**:
  - Nunca use `window.alert`, `window.confirm` ou `window.prompt`.
  - Nunca dependa apenas da cor vermelha ou apenas do shake para indicar erro — exiba sempre a mensagem textual associada via `aria-describedby`.

---

### 3.8. Timeline de Atividades, Workflows e Feeds Ao Vivo

- **Padrão de Origem (`FATO EXTRAÍDO`)**:
  - Spine SVG de regras em `Tolva` (`autopay.js`), grafo Bezier com partícula `.cv__bead` em `Brisko` (`workflows.js`), barra de etapas `.steps__fill` (`scaleX: 0 → 1, duration: 0.5, stagger: 0.08, ease: "expo.out"`) e inserção de novos eventos no topo do feed com `Flip` + highlight.
- **Componente de Destino**:
  - Histórico de interações do cliente (e-mails, chamadas, mudanças de estágio), logs de execução de webhook/automação, rastreamento de pedido.
- **Intensidade Recomendada**: `subtle` (leitura de histórico) / `default` (chegada de novo evento ao vivo).
- **Receita de Implementação**:
  1. Conecte itens da timeline com uma linha vertical SVG ou pseudo-elemento `.spine` que desenha de cima para baixo (`scaleY: 0 → 1, transformOrigin: "50% 0%", duration: 0.8, ease: "expo.out"`).
  2. Ao inserir uma nova nota ou atividade no topo da timeline, capture `Flip.getState` dos itens existentes para que deslizem suavemente para baixo enquanto o novo item entra com `fromTo(newItem, { opacity: 0, y: -12, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "expo.out" })`.
- **O Que NÃO Fazer**:
  - Nunca rode partículas infinitas em loop contínuo em telas de histórico estático; reserve partículas em movimento (`.cv__bead`) para quando o usuário clicar explicitamente em "Testar Fluxo / Simular" ou quando um job estiver em execução real.
