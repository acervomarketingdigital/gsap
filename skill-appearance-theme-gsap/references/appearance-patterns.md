# Padrões Extraídos de Seletores de Aparência e Temas

> **Evidência de Código (`FATO EXTRAÍDO`)**: Extraído de `marlo/settings-C9CGnKVA.js` + `settings-BYPe6yUg.css`, `brisko/settings-DqwjP1a8.js` + `settings-Clzv8fam.css`, `calda/settings-LYzINS02.js` + `_index_tail.js`, `groova/settings-DnoNbanl.js` + `settings-BYrAYJhw.css`, `levena/settings-BB44lNse.js` + `settings-DKuET9Av.css`, `kelpo/settings-wZfy8d1V.js` + `settings-CUXWPaBp.css`, `tolva/settings-29QPe01B.css` e `veyla/settings-DbHWLVCx.css`.

---

## 1. As 5 Variantes de Cartões de Tema (`Light` / `Dark` / `System`)

Todas as referências usam um grupo acessível (`role="radiogroup"` ou `role="group"` com `aria-pressed` / `aria-checked`) onde cada botão renderiza uma **maquete em miniatura da interface** usando apenas elementos `<i>` dentro de um container de preview:

### Variante A: `Marlo` & `Ignara` (`.theme` + `.theme__swatch` Grid 30%/70% com Pílula Gradiente)
- **URL de Referência**: `https://demo.codeandchill.store/marlo/#/settings/appearance`
- **Estrutura DOM**:
  ```tsx
  <div className="themes" role="group" aria-label="Theme">
    <button type="button" className="theme theme--light" aria-pressed={theme === "light"}>
      <span className="theme__swatch" aria-hidden="true"><i /><i /><i /></span>
      <span className="theme__label"><SunIcon /> Light</span>
    </button>
    {/* dark, system */}
  </div>
  ```
- **CSS Extraído (`marlo/settings-BYPe6yUg.css`)**:
  - `.themes`: `display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;`
  - `.theme`: `box-shadow: inset 0 0 0 1px var(--line-2); border-radius: 16px; padding: 8px; display: flex; flex-direction: column; gap: 8px;`
  - `.theme[aria-pressed="true"]`: `box-shadow: inset 0 0 0 2px var(--accent);`
  - `.theme__swatch`: `border-radius: 11px; grid-template-columns: 30% 1fr; height: 78px; display: grid; position: relative; overflow: hidden;`
  - `.theme--light .theme__swatch`: `background: #e6e7ea;` (`#111213` no dark; `linear-gradient(110deg, #e6e7ea 50%, #111213 50%)` no system).
  - `i:first-child` (sidebar mini): `background: #7f7f7f40; border-radius: 6px; margin: 8px 0 8px 8px;`
  - `i:nth-child(2)` (card principal mini): `background: #fff9; border-radius: 6px; margin: 8px;` (`#1b1c1e` no dark).
  - `i:nth-child(3)` (pílula de acento no canto inferior direito): `background: linear-gradient(135deg, #f8bd57, #ee8420); border-radius: 99px; width: 26px; height: 10px; position: absolute; bottom: 14px; right: 14px;`

### Variante B: `Brisko` (`.themeprev` com Rail Escuro + Bento 2x2 e Barra Lime)
- **Estrutura DOM**: `<span className="themeprev__rail" /><span className="themeprev__body"><i /><i /><i className="is-lime" /></span><b>Light</b>`
- **CSS Extraído (`brisko/settings-Clzv8fam.css`)**:
  - `.themeprev__rail`: `background: #141513; border-radius: 8px; width: 16px; height: 70px; position: absolute; top: 18px; left: 18px;`
  - `.themeprev__body`: `border-radius: 12px; grid-template-columns: 1fr 1fr; gap: 6px; height: 86px; padding: 10px 10px 10px 36px; display: grid;`
  - `.themeprev__body i.is-lime`: `grid-column: span 2; background: #e2f47b !important;`

### Variante C: `Groova` (`.theme__pic` Aspect-Ratio 16:9 com 4 Blocos + Selo Check `.theme__tick`)
- **Estrutura DOM**: 4 elementos `<i>` simulando sidebar com logo azul (`i:first-child::after`), painel central de `50%` e 2 cards empilhados à direita (`i:nth-child(3)` e `i:nth-child(4)`), mais um selo circular `.theme__tick` (`24px x 24px`, `background: var(--accent)`) no canto superior direito do cartão ativo.

### Variante D: `Levena` & `Tolva` (`.themecard__pv` / `.theme__art` Grid 2 Linhas × 2 Colunas)
- `grid-template-rows: 1fr 1fr; grid-template-columns: 14px 1fr; height: 64px; padding: 6px; gap: 4px;` onde `i:first-child` ocupa `grid-row: 1 / -1` com a cor `--accent` (`#f2b01e`).

### Variante E: `Kelpo` & `Veyla` (`.themeopt__art` / `.themec__pic` com Subtítulo Descritivo)
- Inclui descrição atmosférica abaixo do título (`"Olive-grey paper, graphite"` vs `"Near-black, chartreuse glow"`) e foco duplo `box-shadow: inset 0 0 0 2px var(--focus), 0 0 0 4px var(--accent-soft)`. Em mobile (`<= 760px` em `Veyla`), `.themec` muda para `flex-direction: row` com miniatura `96px x 56px` à esquerda.

---

## 2. Gerador de Cor de Destaque OKLab com Contraste WCAG Automático (`Calda`)

Extraído de `calda/_index_tail.js` (`Ft`, `It`, `Kt`, `qt`, `nn`):
1. Converte o hex escolhido (preset `Sky #1e9bf0`, `Teal #14b8a6`, `Green #34c26b`, `Amber #f5a524`, `Coral #f2694c`, `Rose #ec4f7c` ou `<input type="color">` customizado) de `sRGB` linear para **OKLab / OKLCH** (`[L, C, H]`).
2. Para o tema **Light** (fundo `#dcdcde`), ajusta `L` em passos de `-0.01` até atingir contraste `>= 2:1` para a superfície `--sig` e `>= 4.5:1` para o texto `--sig-text`.
3. Para o tema **Dark** (fundo `#66686b`), ajusta `L` em passos de `+0.01` com as mesmas garantias de contraste.
4. Calcula a luminância relativa WCAG (`0.2126*R + 0.7152*G + 0.0722*B`) para decidir automaticamente se o texto sobre o botão (`--sig-ink`) deve ser `#ffffff` ou `#15181b`.
5. Injeta as variáveis CSS num `<style id="accent">` e executa a mesma revelação circular `startViewTransition` a partir do swatch clicado!

---

## 3. Controles Complementares de Aparência e Layout (`FATO EXTRAÍDO`)

1. **Densidade de Tabela (`Groova` & `Brisko` — `html.is-compact`)**:
   - Segmented control (`Comfy` vs. `Compact`) ou Switch (`Compact tables`) que alterna `document.documentElement.classList.toggle("is-compact", isCompact)`.
   - No CSS: `html.is-compact .table td { padding-top: 7px; padding-bottom: 7px; font-size: var(--fs-sm); }`.
2. **Modo da Sidebar (`Icons only` / `Pin the sidebar open` — Tecla `[`)**:
   - Switch sincronizado com `document.documentElement.classList.contains("is-rail")`.
   - Se `window.innerWidth < 1280`, exibe aviso contextual (`"The window is narrow, so the sidebar is folded anyway"`) e desabilita a fixação aberta em telas estreitas.
3. **Controle de Translucidez Glassmorphic (`Calda` — `.glasspop` / `--frost`)**:
   - Slider contínuo (`0` a `100%`) que atualiza `--frost` no `:root`, controlando simultaneamente a opacidade do card `rgba(242, 241, 238, calc(.42 + var(--frost) * .36))` e o raio do `backdrop-filter: blur(calc(12px + var(--frost) * 24px))`.
4. **Indicador de `prefers-reduced-motion` do Sistema (`Kelpo`)**:
   - Linha informativa em `Settings → Appearance` que lê `matchMedia("(prefers-reduced-motion: reduce)").matches` e mostra um badge `On` / `Off` confirmando que todas as animações pousam diretamente no estado final quando ativado.
