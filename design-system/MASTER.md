# Psicomotriclinic Hub — Design System (MASTER)

Fonte de verdade do design system, **extraída do código real** (`app/src/index.css`,
`app/src/lib/ui.jsx`) e verificada em tema claro e escuro. Versão máquina em
`tokens.json`. Página visual: artifact "Design System" (claude.ai/code).

Identidade: **navy · cream · âmbar** — sensação clínica, calma, confiável. Uma cor
de destaque (âmbar) usada com parcimónia sobre um sistema navy/cream sóbrio.

---

## 0. Marca

**Essência** — "A Casa · Clínica · Formação": o **corpo que pensa**. Psicomotricidade
com rigor clínico e proximidade humana.

**Personalidade** — serena (não fria) · rigorosa (não burocrática) · próxima (não
informal) · confiável e discreta.

**Tagline** — *Uma casa para o corpo que pensa.* · mono: `A CASA · CLÍNICA · FORMAÇÃO`.

**Wordmark** — `PSICOMOTRICLINIC` (PSICOMOTRI a 700 + CLINIC a 400), tracking -0.01em.
Sobre navy usa creme `#F7F4EE`; sobre claro usa navy. Margem mínima = altura do "P".
Não distorcer, recolorir fora da paleta, nem aplicar sombras.

**Voz & tom** — pt-PT, voz ativa, específica. O botão diz o que acontece ("Guardar" →
"Guardado"). Erros explicam causa + como corrigir. Nomear pelo que as pessoas reconhecem.
✓ "Sessão amanhã às 15:00. Toque para confirmar." ✗ "Operação concluída com sucesso."

---

## 1. Cor

### Rampas (50 → 900)
**Navy:** `#EAEEF3 · #D5DCE6 · #AAB9CC · #7E95B0 · #4C6684 · #2E4A6B · #1E3556 · #152741 · #0E1B30 · #08111F`
**Âmbar:** `#FDF3E3 · #FAE4C2 · #F5D9A8 · #EFC178 · #E8A13C · #C97A1F · #A5620F · #8A5011 · #6B3E0D · #4A2B0A`
**Neutros quentes (0→800):** `#FFFFFF · #FBFAF7 · #F5F2EC · #EAE6DD · #D9D3C5 · #B8B2A4 · #8A8A86 · #6E6E68 · #55554F · #3C3C3B`

### Gradientes
- Avatar/logo âmbar: `radial-gradient(circle at 30% 30%, #E8A13C, #C9791A)`
- Superfície navy: `linear-gradient(135deg, #152741, #0E1B30)`
- Progresso: `linear-gradient(90deg, #E8A13C, #F2B65C)`

### Marca
| Nome | Hex | Uso |
|---|---|---|
| Navy | `#152741` | Primária — fundo de botões/sidebar; texto de títulos |
| Cream | `#F5F2EC` | Superfície subtil / fundos secundários |
| Paper | `#FBFAF7` | Fundo de página (off-white quente) |
| Âmbar (accent) | `#E8A13C` | Destaques, indicadores ativos, avatares. **Nunca** como texto sobre claro |
| Sage | `#8DBF94` | Acento secundário verde |
| Sky | `#B9CDE0` | Acento secundário azul |

### Tokens semânticos (a camada que os componentes usam)
Reatribuídos no dark mode (não invertidos). **Regra central:** navy tem dois papéis —
como **texto** (`--text-strong`, inverte para claro no escuro) e como **fundo**
(`--brand-bg`, mantém-se escuro). Nunca o mesmo token para os dois.

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--surface` | `#FFFFFF` | `#1A2A44` | Fundo de Card/Modal/Input |
| `--surface-2` | `#F5F2EC` | `#152741` | Fundo subtil / realces |
| `--border` | `#EAE6DD` | `#2A3D5C` | Linha padrão |
| `--border-strong` | `#D9D3C5` | `#3A4D6C` | Borda de inputs |
| `--text` | `#3C3C3B` | `#D8D3C7` | Corpo |
| `--text-2` | `#55554F` | `#A9A39A` | Secundário |
| `--text-muted-2` | `#6E6E68` | `#8A9AAE` | Terciário (AA) |
| `--text-strong` | `#152741` | `#E8E3D7` | Títulos (navy-como-texto) |
| `--brand-bg` | `#152741` | `#0E1B30` | Navy-como-fundo (botões/sidebar) |
| `--brand-bg-hover` | `#1E3556` | `#16233A` | Hover de fundo navy |
| `--brand-contrast` | `#F7F4EE` | `#E8E3D7` | Texto sobre navy |
| page bg | `#FBFAF7` | `#0E1A2C` | Fundo geral |

### Estado (pares fundo/texto — verificados AA para texto pequeno)
| Estado | Fundo | Texto | Usado em |
|---|---|---|---|
| Sucesso | `#DDEADE` | `#2F6139` | realizada, pago, sage |
| Erro | `#F4E0E0` | `#A82E2E` | falta |
| Aviso | `#F5E5CD` | `#8A5011` | pendente, amber |
| Info | `#DCE7F0` | `#1E3556` | agendada, parent |
| Neutro | `#F5F2EC` | `#3C3C3B` | default |

---

## 2. Tipografia
- **Display + corpo:** DM Sans (pesos 300 / 400 / 500 / 600 / 700).
- **Mono (labels, dados, eyebrows):** JetBrains Mono (400 / 500), uppercase, `letter-spacing: .08em`.
- **Base:** 15px / line-height 1.55.

| Papel | Tamanho / peso |
|---|---|
| Display (títulos de página) | 30–36px / 300, `letter-spacing -0.025em` |
| Title (secções) | 24px / 300 |
| Title-sm | 18px / 500 |
| Body | 14–15px / 400 |
| Body-sm | 13px / 400 |
| Caption | 12px |
| Eyebrow | 11px mono uppercase |

---

## 3. Forma, elevação, espaço, movimento
- **Raios:** sm 8 · md 10 · card 14 · modal 18 · pill 999.
- **Sombras:** card `0 4px 14px rgba(21,39,65,.06)` · modal `0 24px 64px rgba(21,39,65,.18)` · toast `0 12px 36px rgba(21,39,65,.25)`.
- **Espaço:** ritmo 4 / 8 px. Card pad 22 (desktop) / 16 (mobile). Page pad `28px 40px 60px` / `16px 16px 60px`.
- **Breakpoint:** 900px — `<900` bottom-tab (mobile), `≥900` sidebar (desktop).
- **Movimento:** 150–300ms micro; ≤400ms transições; easing `cubic-bezier(.32,.72,0,1)`; respeita `prefers-reduced-motion`.

---

## 4. Componentes (em `app/src/lib/ui.jsx`)
- **Btn** — 5 variantes: primary (navy), secondary (surface+border), ghost, accent (âmbar), danger. Suporta `loading` (spinner + aria-busy) e `disabled` (opacidade .6).
- **Card** — surface + border, raio 14, hover eleva (border strong + sombra).
- **Stat** — KPI: eyebrow + valor grande (36/300) + barra de acento opcional.
- **Tag** — badge de estado (pares AA acima).
- **Field** — label ligado (`htmlFor`), `aria-describedby` (hint/erro), `aria-invalid`, prop `error` (borda + mensagem).
- **Modal** — focus trap, autofocus, restauro de foco, Escape; título `<h2>` com `aria-labelledby`.
- **EmptyState** — ícone + título + mensagem + ação (CTA).
- **Skeleton / SkeletonCard** — placeholder shimmer (respeita reduced-motion).
- **Toast** — canto inferior, auto-dismiss 3s, `aria-live`.
- **PortalSidebar** — sidebar navy partilhada (Responsável/Profissional).

---

## 5. Dark mode & acessibilidade
- **Dark mode:** reatribuição de tokens (não inversão). Componentes usam só o token; em `html.dark` os tokens mudam de valor. Testar cada tema separadamente.
- **Contraste:** texto ≥ 4.5:1 (AA); ícones/texto grande ≥ 3:1. Todos os pares de estado verificados.
- **Foco:** anel visível 2px accent.
- **Cor não é o único sinal:** estado ativo/erro usa também forma/ícone (ex.: barra de acento na tab-bar mobile, não só cor).

### Do / Don't
**✓ Fazer:** usar tokens (não hex à solta) · contraste AA · foco visível · forma + cor para estado · SVG para ícones.
**✗ Evitar:** âmbar como texto sobre claro · estado só por cor · inverter cores no dark · emoji como ícones estruturais · o mesmo token para navy-texto e navy-fundo.

---

## 6. Iconografia
Set SVG próprio, um só estilo (traço ~1.5–2px). Tamanhos: 13–16 (inline/botões), 17–20
(navegação), 22 (tab-bar/KPIs). Alvo de toque ≥ 44×44 (hitSlop se o ícone for menor).
Alinhar à baseline do texto. **Nunca** emoji como ícone estrutural, PNG, ou misturar
filled/outline no mesmo nível.

## 7. Layout, grelha & z-index
- Container máx ~1180px · sidebar 260px · `main` com `min-width:0` (nunca scroll horizontal).
- Breakpoint 900px: `<900` bottom-tab, `≥900` sidebar.
- Z-index: 0 base · 10 sticky (header/rail) · 200 modal/overlay · 999 toast.

## 8. Movimento
Micro-interações 150–300ms; transições ≤400ms (evitar >500ms). Easing
`cubic-bezier(.32,.72,0,1)`. Entrada ease-out, saída ease-in (~60–70% da entrada).
Animar só transform/opacity. Cada animação exprime causa→efeito. Respeitar
`prefers-reduced-motion`. Skeleton em vez de spinner para >1s.

## 9. Padrões
- **Loading:** skeleton (não "sem dados") enquanto `hydrated` é falso.
- **Empty:** ícone + título + mensagem + **CTA** ("Ainda sem X. Comece por…").
- **Erro:** causa + caminho de saída (retry/editar/ajuda); `role=alert`.
- **Navegação:** desktop sidebar (item ativo = barra âmbar esquerda + fundo subtil);
  mobile bottom-tab (ativo = barra âmbar topo + texto navy AA, nunca só cor).
  Deep-linking por URL (portais `?tab=`).
- **Dados:** KPIs com barra de acento; tabelas com números tabulares e scroll interno.

## 10. Microcopy (pt-PT)
| Contexto | Escrever |
|---|---|
| Confirmar | "Guardar" → toast "Guardado" |
| Destrutivo | "Eliminar paciente" + confirmação "Não é reversível" |
| Vazio | "Ainda sem X. Comece por…" + CTA |
| Erro de campo | Causa + correção: "NIF inválido — 9 dígitos" |
| Estados | Realizada · Falta · Pago · Pendente · Cancelado |

## 11. Imagem & formas
Formas orgânicas (círculos/elipses) em navy com toques âmbar/sage/sky — em fundos de
marca (ex.: painel de login). Discretas, `opacity` baixa, nunca competem com o conteúdo.
