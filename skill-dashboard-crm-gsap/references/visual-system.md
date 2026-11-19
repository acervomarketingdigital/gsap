# Sistema Visual Editorial para Dashboards e CRMs

> **Base de Evidência**: Consolidado a partir do CSS real das 10 aplicações de referência (`tolva`, `veyla`, `grovia`, `brisko`, `calda`, `halvi`, `ignara`, `kavora`, `marlo`, `raveno`). Valores marcados como `FATO EXTRAÍDO` vêm diretamente das folhas de estilo inspecionadas; diretrizes de adaptação são marcadas como `INFERÊNCIA/RECOMENDAÇÃO`.

---

## 1. Filosofia Editorial em Interfaces de Dados (`FATO EXTRAÍDO`)

O DNA comum das 10 referências substitui o visual "SaaS genérico" (fundo `#ffffff` puro, bordas `#e5e7eb` de `1px solid`, azul padrão `#3b82f6`) por uma **arquitetura de papelaria técnica e imprensa suíça**:

1. **Contraste de Superfície Quente/Tátil vs. Fundo Atmosférico**: O fundo da janela (`--bg`) é sempre um tom médio ou profundo (papel pedra `#ebebe8`, sálvia `#e7ebe3`, verde floresta `#435f39` ou carvão `#26282c`), enquanto os cards (`--card`) flutuam como folhas de papel claro (`#f5f7f2`, `#f1f5ea`, `#ffffff`) ou vidro fumê (`Calda`).
2. **Card Hero de Alto Contraste (`.noir` / `.inkcard`)**: Toda visão principal possui **exatamente 1 card escuro ancorador** (`--noir: #17181a` ou `#172014`) em meio aos cards claros para destacar o KPI primário, o motor de regras ou a chamada crítica.
3. **Zero `border` CSS Tradicional em Cards**: A separação estrutural usa **hairlines internos via `box-shadow`** (`inset 0 0 0 1px var(--line)`) combinados com aro especular superior (`inset 0 1px 0 rgba(255, 255, 255, .6)`).
4. **Hierarquia Tipográfica Extrema**: Eyebrows microscópicos em caixa alta (`11px`, `letter-spacing: .07em`, `font-weight: 600–700`) contrastam com números display monumentais (`34px` a `62px`, `letter-spacing: -.03em`, `line-height: 1.02`) e corpo compacto (`13.5px`–`14px`).

---

## 2. Tipografia e Disciplina Numérica (`FATO EXTRAÍDO`)

### Famílias Tipográficas Extraídas
- **Padrão Unificado (9 de 10 páginas)**:
  ```css
  --font: "Urbanist", system-ui, -apple-system, "Segoe UI", sans-serif;
  ```
  - Pesos carregados: `400` (Regular), `500` (Medium — peso padrão do `body`), `600` (SemiBold — títulos, botões, células-chave), `700` (Bold — badges, KPIs compactos).
- **Variante Editorial Dupla (`grovia`)**:
  ```css
  --f-display: "Outfit", system-ui, -apple-system, sans-serif; /* 300, 400, 500, 600 */
  --f-sans: "Inter", system-ui, -apple-system, sans-serif;     /* 400, 500, 600 */
  ```

### Escala Tipográfica de 11 Degraus (`FATO EXTRAÍDO`)

| Token | Valor Extraído | Line-Height | Letter-Spacing | Peso | Uso Exato no Código |
|---|---|---|---|---|---|
| `--fs-2xs` | `11px` (`0.6875rem`) | `1.15` | `.06em` a `.08em` (`uppercase`) | `600`–`700` | Eyebrows (`.eyebrow`), cabeçalhos de coluna `th`, `<kbd>`, badges de status, eixos SVG |
| `--fs-xs` | `12px` (`0.75rem`) | `1.25` | `.01em` a `.04em` | `500`–`600` | Metadados secundários, timestamps, legendas de gráficos, contadores de raia Kanban |
| `--fs-sm` | `12.5px` (`0.78125rem`) | `1.35` | `0` | `500` | Subtítulos de card (`.card__sub`), chips de filtro, descrições curtas |
| `--fs-md` | `13.5px` (`0.84375rem`) | `1.4` | `-.003em` | `500`–`600` | Células de tabela `td`, itens de navegação, botões `.btn`, inputs de busca |
| `--fs-base` | `14px` (`0.875rem`) | `1.45` | `-.005em` | `500` | Corpo padrão do documento (`body`), parágrafos de detalhe |
| `--fs-lg` | `15px` (`0.9375rem`) | `1.3` | `-.008em` | `600` | Títulos de card (`.card__title`, `h2`, `h3`) |
| `--fs-xl` | `17px` (`1.0625rem`) | `1.25` | `-.012em` | `600` | Sub-seções, input da Command Palette (`.finder__input`), valores de resumo |
| `--fs-2xl` | `20px` (`1.25rem`) | `1.18` | `-.015em` | `600`–`700` | Títulos de modal (`.modal__head h2`), valores secundários de card |
| `--fs-3xl` | `22px` (`1.375rem`) | `1.12` | `-.02em` | `600` | Títulos de Drawer (`.drawer__head h2`), métricas de grupo |
| `--fs-4xl` | `26px` (`1.625rem`) | `1.08` | `-.022em` | `600` | Valores principais de KPI (`.kpi__val`) em grids de 4 colunas |
| `--fs-display` | `34px` (`2.125rem`) | `1.04` | `-.025em` | `600` | Números protagonistas (`.big`, saldos, totais de leilão/folha) |
| **Page `h1`** | `clamp(28px, 2.6vw, 38px)` | `1.04` | `-.025em` | `600` | Título da visão ativa (`.phead h1`) |
| **Hero `h1`** | `clamp(40px, 4.1vw, 62px)` | `1.02` | `-.03em` | `600` | Manchete de abertura em consoles executivos (`tolva`, `grovia`) |

### Regras Inegociáveis de Tipografia Numérica (`FATO EXTRAÍDO`)
1. **`font-variant-numeric: tabular-nums`**: Aplicado globalmente no `body` e reforçado em `.num`, `.kpi__val`, `.count`, `td`, `.timer` e eixos de gráficos. Impede que números mudem de largura durante animações de contagem ou atualizações em tempo real.
2. **Ghost Sizing para Contadores (`.count`)**:
   ```css
   .count { display: inline-grid; align-items: baseline; }
   .count > * { grid-area: 1 / 1; }
   .count__size { visibility: hidden; pointer-events: none; user-select: none; }
   ```
   O elemento `.count__size` contém o valor final formatado (ex.: `R$ 1.482.900,00`), reservando a largura exata no grid `1/1` enquanto `.count__live` anima de `0` até o alvo sem causar *reflow* nos elementos vizinhos.

---

## 3. Arquitetura de Cores e Tokens Semânticos (`FATO EXTRAÍDO`)

Cada página organiza suas variáveis em **5 camadas semânticas**:

### Camada 1: Fundos e Superfícies de Elevação
- `--bg`: Fundo base da viewport (ex.: `#ebebe8` em Kavora, `#e7ebe3` em Brisko, `#435f39` em Tolva).
- `--bg-2`: Tom secundário para gradientes sutis de fundo ou áreas rebaixadas.
- `--card`: Superfície primária de card (ex.: `#ffffff`, `#f5f7f2`, `#f1f5ea`).
- `--card-2`: Superfície aninhada dentro de um card (ex.: sub-painel, linha de resumo, hover de linha).
- `--card-3` / `--well`: Poço rebaixado para trilhas de segmented control (`.seg`), barras de progresso vazias e inputs.
- `--panel`: Superfície elevada para Drawers, Modals, Popovers e Command Palette (`#ffffff` no light, `#222428` no dark).
- `--noir` / `--inkcard`: Superfície invertida escura (`#151619` / `#172014`) com texto claro garantido mesmo no tema Light.

### Camada 2: Tinta (Hierarquia de Texto em 4 Níveis)
- `--ink`: Texto primário e títulos (`#141513` a `#18191d` no light; `#eef3e8` a `#f4f4f6` no dark).
- `--ink-2`: Corpo de texto secundário e células de tabela (`#384234` a `#3d393b` no light; `#b9c5b1` no dark).
- `--ink-3`: Rótulos, eyebrows, cabeçalhos `th` e legendas (`#64705e` a `#6e7077`).
- `--ink-4`: Placeholders, estados desabilitados e divisores de texto (`#8a9583` a `#9a9698`).

### Camada 3: Acento de Marca e Acento Secundário
- `--accent`: Cor de ação principal, indicadores ativos e foco (ex.: `#ee5230` brasa em Ignara, `#f29b23` âmbar em Marlo, `#1e9bf0` azul sinal em Calda, `#f0412b` coral em Halvi).
- `--accent-ink`: Cor do texto sobre `--accent` (garantindo contraste WCAG AA/AAA).
- `--lime` / `--mint` / `--peach`: Acento tático para chips de destaque em fundos `.noir`.

### Camada 4: Estados Semânticos de Produto (`FATO EXTRAÍDO`)
Todos os estados usam um par **cor sólida + fundo suave translúcido (`*-soft`)**:
- **Positivo / Aprovado / Concluído**:
  - Light: `--good: #1f8a5b` (varia de `#178a52` a `#2d6f1f`), `--good-soft: rgba(31, 138, 91, .12)`
  - Dark: `--good: #3cc68a`, `--good-soft: rgba(60, 198, 138, .16)`
- **Atenção / Pendente / Em Risco**:
  - Light: `--warn: #c87619` (varia de `#b86b11` a `#d98218`), `--warn-soft: rgba(200, 118, 25, .13)`
  - Dark: `--warn: #f2a93b`, `--warn-soft: rgba(242, 169, 59, .16)`
- **Crítico / Erro / Recusado / Atrasado**:
  - Light: `--bad: #cf3730` (varia de `#b93829` a `#d94841`), `--bad-soft: rgba(207, 55, 48, .12)`
  - Dark: `--bad: #f05545`, `--bad-soft: rgba(240, 85, 69, .16)`
- **Informativo / Em Andamento**:
  - Light: `--info: #2c6bed` (varia de `#25647a` a `#3b6ff5`), `--info-soft: rgba(44, 107, 237, .12)`

### Camada 5: Linhas, Aros Especulares e Sombras
- `--line`: `rgba(20, 22, 25, .08)` (Light) / `rgba(255, 255, 255, .08)` (Dark)
- `--line-2`: `rgba(20, 22, 25, .14)` (Light) / `rgba(255, 255, 255, .15)` (Dark)
- `--top-light`: `rgba(255, 255, 255, .65)` (Light) / `rgba(255, 255, 255, .06)` (Dark)
- `--shadow-sm`: `0 1px 2px rgba(15, 18, 22, .05), 0 6px 18px rgba(15, 18, 22, .05)`
- `--shadow-md`: `0 12px 32px rgba(15, 18, 22, .10), 0 2px 6px rgba(15, 18, 22, .05)`
- `--shadow-lg`: `0 24px 60px rgba(10, 12, 16, .24), 0 4px 14px rgba(10, 12, 16, .12)`

---

## 4. Grid, Layout, Raios e Bordas (`FATO EXTRAÍDO`)

### Tokens Estruturais
- **Largura máxima (`.shell__main`)**: `--max: 1640px` a `1680px` (`1480px` em Halvi, `1840px` em Kavora).
- **Espaçamento de Grid (`--gap`)**: `16px` padrão (`18px` em Tolva/Ignara/Kavora, `14px` em Grovia, reduzido para `12px` em `<=760px`).
- **Padding de Container (`--pad`)**: `24px` a `28px` no desktop, `16px` no mobile (`<=760px`).
- **Raios de Borda (`--r-*`)**:
  - `--r-xs: 6px` (badges internos, `<kbd>`)
  - `--r-sm: 10px` (botões secundários, inputs, células selecionadas, chips)
  - `--r-md: 14px` (sub-cards `.card-2`, itens de Kanban `.kcard`, toasts)
  - `--r-lg: 20px` a `22px` (cards principais `.card`, modais)
  - `--r-xl: 26px` a `28px` (cards hero `.noir`, sidebars flutuantes, drawers)
  - `--r-pill: 999px` (botões primários em pílula, segmented controls, tabs, badges de status)

### Assimetria Bento e Proporções de Coluna (`FATO EXTRAÍDO`)
Em vez de grades simétricas monótonas (`1fr 1fr`), as 10 páginas usam **proporções editoriais assimétricas**:
- ** fileira de KPIs (`.kpis`)**: `grid-template-columns: repeat(4, minmax(0, 1fr))` no desktop → `repeat(2, minmax(0, 1fr))` em `<=1279px` → `1fr` ou `repeat(2, 1fr)` compacto em `<=760px`.
- **Split Principal + Painel Tático**: `grid-template-columns: minmax(0, 1.65fr) minmax(320px, 1fr)` ou `minmax(0, 7fr) minmax(0, 5fr)`.
- **Master-Detail Inbox (`Raveno` / `Veyla`)**: `grid-template-columns: 360px minmax(0, 1fr)` com alturas travadas e scroll independente.
- **Bento 12 Colunas**: Cards ocupam `span 8` + `span 4`, `span 5` + `span 7` ou `span 4` + `span 4` + `span 4`.

### Técnica de Borda e Textura (`FATO EXTRAÍDO`)
```css
.card {
  background: var(--card);
  border-radius: var(--r-lg);
  padding: 20px 22px;
  box-shadow:
    inset 0 1px 0 var(--top-light),
    inset 0 0 0 1px var(--line),
    var(--shadow-sm);
}
```
- **Divisores Internos**: Linhas horizontais usam `border-bottom: 1px solid var(--line)` ou `background: linear-gradient(90deg, transparent, var(--line-2) 12%, var(--line-2) 88%, transparent)` para acabamento editorial.
- **Textura de Papel/Grão Opcional (`Tolva`)**: Overlay fixo com `pointer-events: none; z-index: 9999; opacity: .045; mix-blend-mode: overlay` para quebrar banding em fundos sólidos profundos.

---

## 5. Padrões de Composição de Componentes (`FATO EXTRAÍDO`)

1. **Cabeçalho de Página (`.phead`)**:
   - Composto por `.eyebrow` em caixa alta (`11px`, `color: var(--ink-3)`, frequentemente precedido por um ponto colorido `.dot` de `6px` ou índice numerado `01 / OVERVIEW`), título `h1` (`clamp(28px, 2.6vw, 38px)`) à esquerda e cluster de ações rápidas (`.phead__actions`: seletor de período `.seg`, botão de exportação e CTA primário) à direita.
2. **Cabeçalho de Card (`.card__head`)**:
   - `display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 16px`.
   - Título `.card__title` (`15px`, SemiBold) + `.card__sub` (`12.5px`, `--ink-3`) à esquerda; badge, menu `...` ou controle `.seg` à direita.
3. **Índices Numerados e Monoespaçamento Tático**:
   - Listas de regras, etapas de workflow e rankings usam índices tabulares (`01`, `02`, `03`) em pílulas `.idx` (`24px x 24px`, `border-radius: 50%` ou `8px`, `font-size: 11px`, `font-weight: 700`, `background: var(--card-3)`).
4. **Barras Hachuradas e Preenchimentos Técnicos (`Halvi`, `Tolva`, `Ignara`)**:
   - Valores de comparação (meta vs. realizado, período anterior vs. atual) usam hachura diagonal CSS (`repeating-linear-gradient(135deg, var(--line-2) 0 2px, transparent 2px 6px)`) para a série histórica e preenchimento sólido `--accent` ou `--ink` para a série ativa.

---

## 6. Responsividade Estrutural em 3 Breakpoints (`FATO EXTRAÍDO`)

| Breakpoint | Transformação de Shell e Navegação | Transformação de Grids, Tabelas e Painéis |
|---|---|---|
| **`> 1279px` (Desktop Full)** | Sidebar expandida (`236px`–`248px`) ou Topbar Pill completa | KPIs em 4 colunas; splits assimétricos `7:5` / `8:4`; tabelas completas |
| **`<= 1279px` (Compact Desktop / Tablet Landscape)** | Sidebar recolhe automaticamente para rail de ícones (`72px`–`84px`) | KPIs mudam para `repeat(2, minmax(0, 1fr))`; grids de 3 colunas passam para 2 colunas |
| **`<= 999px` (Tablet Portrait)** | Rail mantido ou convertido em barra superior compacta | Splits assimétricos (`7:5`, Master-Detail) empilham em `1fr` |
| **`<= 760px` (Mobile Operacional)** | Sidebar oculta; surge **Bottom `.tabbar`** fixa com `padding-bottom: env(safe-area-inset-bottom)` | `.table--stack` converte `<tr>` em cards CSS Grid (`grid-template-areas: "main end" "sub tag"`); `.drawer` e `.modal` viram **Bottom Sheets** (`border-radius: 24px 24px 0 0; max-height: 92dvh`) com alça `.sheet__grip` para arraste vertical |
