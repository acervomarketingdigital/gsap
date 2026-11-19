---
name: appearance-theme-gsap
description: Criar seletores de aparência, cartões de preview de tema (Light/Dark/System), geradores de cor de destaque com contraste automático em OKLab, controles de densidade de tabela (Compact/Comfy), ajuste de desfoque glassmorphic e revelação circular via View Transitions API + GSAP. Acione quando o usuário pedir página de configurações de aparência, troca de tema animada ou customização visual de dashboard/CRM.
---

# Appearance Selector & Dynamic Theme System (GSAP + View Transitions)

Skill especializado na criação de painéis de **Aparência e Personalização Visual** para dashboards e CRMs, extraído diretamente do código de `marlo/#/settings/appearance`, `brisko`, `calda`, `groova`, `levena`, `kelpo`, `tolva`, `veyla` e `ignara`.

---

## 1. Quando Acionar Este Skill

- Construir a aba **`Settings → Appearance`** de um dashboard ou CRM.
- Implementar **cartões visuais de seleção de tema** (`Light`, `Dark`, `Match system`) com miniaturas arquiteturais em CSS puro (`.theme__swatch`, `.themeprev`, `.theme__pic`, `.themecard`, `.themeopt`).
- Adicionar **transição circular de tema** (`::view-transition-new(root)`) que expande a partir do botão clicado.
- Criar **seletor de cor de destaque (Accent Color)** com cálculo automático de contraste WCAG em espaço **OKLab** (padrão `Calda`).
- Adicionar controles de **densidade de linhas (`Comfy` vs. `Compact`)**, **colapso de sidebar (`[` shortcut)** e **intensidade de vidro (`--frost`)**.

---

## 2. Regras Inegociáveis

1. **Miniaturas de Tema em CSS Puro (Zero Imagens Estáticas)**:
   - Os cartões de seleção de tema nunca usam PNG/SVG externos. Eles desenham a miniatura da própria UI (sidebar, cards e pílula de acento) usando `<span>` e `<i>` posicionados com CSS Grid/Absolute (`references/appearance-patterns.md`).
2. **Transição Circular Originada no Clique**:
   - Capture `buttonEl.getBoundingClientRect()` no `onClick`, calcule o centro `(x, y)` e o raio máximo até o canto mais distante com `Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))` e anime `clipPath: ["circle(0px at x y)", "circle(Rpx at x y)"]` em `450ms cubic-bezier(.65, 0, .35, 1)` sobre `::view-transition-new(root)`.
3. **Contraste Garantido em Cores Customizadas (Motor OKLab)**:
   - Ao permitir que o usuário escolha uma cor de acento ou `input[type="color"]`, nunca aplique o hex cru diretamente sobre textos se o contraste for insuficiente. Ajuste a luminosidade `L` em OKLab para garantir razão de contraste `>= 4.5:1` em textos (`--accent-text`) e `>= 3:1` em superfícies (`--accent`), mantendo as cores semânticas (`--good`, `--warn`, `--bad`) intactas.
4. **Feedback Tátil e `prefers-reduced-motion`**:
   - Ao clicar num cartão de tema ou swatch, dispare um pop tátil `gsap.fromTo(target, { scale: 0.94 }, { scale: 1, duration: q(0.45), ease: "back.out(2.4)" })`. Se `prefers-reduced-motion: reduce` estiver ativo, pule a View Transition e aplique `data-theme` instantaneamente.

---

## 3. Referências e Snippets

- [`references/appearance-patterns.md`](./references/appearance-patterns.md) — Anatomia exata das 5 variantes de cartões de tema (`Marlo`/`Ignara`, `Brisko`, `Groova`, `Levena`/`Tolva`, `Kelpo`/`Veyla`), algoritmo OKLab de `Calda`, switch de topbar `.themesw` e toggles de layout.
- [`snippets/appearance-selector.tsx`](./snippets/appearance-selector.tsx) — Componente completo de `AppearanceSettings` em React 19 + TypeScript + GSAP com cartões de tema ilustrados, gerador de acento OKLab, controle de densidade `Comfy`/`Compact`, toggle de sidebar e slider de translucidez `--frost`.
