---
name: qa-testing-page
description: Página React /testes de QA in-app com checklist estruturado por grupo. Cada teste tem estado (Passa / Falha / N/A) + notas, tudo persistido em localStorage. Ao marcar Falha abre auto o painel e obriga nota. Gera relatório .md das falhas com passos + esperado + nota, pronto a colar num chat de LLM (Claude) para pedir fixes. Portátil para qualquer projeto React + Router.
---

# Página `/testes` — QA in-app com relatório para LLM

Documento vivo de QA embebido na própria aplicação. Substitui checklists dispersos em Google Sheets / Notion e faz o pivot certo entre "encontrei um bug" e "peço ao Claude para corrigir".

## Regra de acesso

Só utilizadores autenticados. A tua camada de router deve redirecionar não-autenticados para `/login` antes desta rota ser resolvida (já é o comportamento típico com um `<AuthGate>` wrapper).

Não expor a `/testes` publicamente — a página lista fluxos internos e o próprio plano de defesa (T6.* Data & security).

## Estrutura de dados

### `GROUPS: Group[]`

Uma constante top-level do ficheiro. Ordem visual = ordem no array.

```js
const GROUPS = [
  {
    id: "auth",                 // slug único (para filter / anchor)
    title: "Autenticação e sessão",
    color: "#8DBF94",           // hex do dot indicador (Brand Aligned tokens)
    tests: [
      {
        id: "T1.1",             // ID visível — convenção T{grupo}.{seq}
        title: "Login com email/password válidos",
        steps: [
          "Abrir /login",
          "Introduzir credenciais válidas",
          "Submeter",
        ],
        expect: "Redirect para o dashboard do role. Sessão persiste no refresh.",
      },
    ],
  },
];
```

Regras de conteúdo:
- **Um teste = um comportamento observável**. Se precisas de "e verifica que…" divide em dois.
- `steps` são atómicos, no imperativo, curtos. 3–6 passos.
- `expect` é um único resultado esperado, verificável olhando para o ecrã, DevTools, Firestore ou email.
- IDs nunca mudam depois de publicados — o localStorage e os relatórios agregam por ID.

### Estado (localStorage)

```
localStorage["psm.tests.state"] = { "T1.1": "pass" | "fail" | "na" | undefined, ... }
localStorage["psm.tests.notes"] = { "T1.1": "string livre", ... }
```

Estado indefinido = por testar. Toggle: clicar 2× no mesmo estado limpa.

## UI mínima

- **Header sticky** com voltar + brand mark.
- **KPIs** (6 cards): Total / Passa / Falha / N/A / Por testar / Taxa (%). Taxa = pass / (pass+fail) — ignora N/A e Por testar.
- **Filtro pill** (Todos / Por testar / Passa / Falha / N/A) + botões acessórios.
- **Grupos**: header com dot cor + contador `X✓ · Y✗ · Z—` + card com linhas expansíveis.
- **Linha de teste**: ID monospaced + título + botões Passa/Falha/N/A à direita.
- **Detalhe (colapsável)**: passos numerados + card creme com resultado esperado + textarea de nota.

## Comportamento crítico — Falha → relatório

Ao clicar **Falha**:
1. Marca o estado.
2. `setOpenId(t.id)` — abre o painel de detalhe automaticamente, para que a nota fique à mão.
3. Textarea muda: cor de borda vermelha + placeholder muda para "O que aconteceu? O que se pretende alterar?".
4. Callout amarelo abaixo da nota: "Esta nota entra no relatório para o Claude".

Botão **Copiar relatório (N)** aparece no topo quando `counts.fail > 0`. Gera markdown estruturado e escreve para o clipboard (fallback: download `.md`).

## Formato do relatório

Layout do `.md` que a página produz:

```markdown
# Relatório de falhas — <APP_VERSION>

Data: dd/mm/yyyy · Total falhas: **N**

Contexto para o Claude corrigir. Cada falha inclui: ID, título, passos, resultado esperado e nota do QA.

## <Group title>

### <T-ID> — <Test title>

**Passos:**
1. …
2. …

**Esperado:** …

**Nota do QA:** … (ou "_(sem nota)_" se em branco)

**Ação pretendida:** _(descrever fix esperado)_

---
```

Este é o formato que o Claude ingere melhor:
- ID + título como âncora.
- Passos + esperado dão contexto de reprodução.
- Nota do QA descreve o defeito real.
- "Ação pretendida" é a linha que o utilizador humano preenche antes de enviar (opcional).

## Tokens visuais (Brand Aligned)

Reutilizar o design system do resto da app:
- `#152741` — navy (títulos)
- `#E8A13C` — âmbar (accents, warning)
- `#8DBF94` — sage (pass)
- `#B83A3A` — vermelho (fail)
- `#D9D3C5` — beige (N/A)
- `#F7F9FB` — page body
- `#FFFFFF` — cards
- `#F5F2EC` — inset (backgrounds sutis)
- `#EAE6DD` — border

Serif (`class="serif"`) para números grandes e headings. Mono (`class="mono"`) para eyebrows e IDs.

## Extensões (opcional)

- **Print CSS**: adicionar `@media print` que oculta pill filters + botões e mantém só a lista.
- **Export/import JSON** do estado: útil para partilhar sessões QA entre pessoas.
- **Firestore backend**: para QA colaborativo, guardar em `qa_runs/{userId}/{testId}` em vez de localStorage. Mantém localStorage como offline mirror.
- **Auto-tests**: injectar assertions Playwright/Cypress lidas do mesmo array `GROUPS` — cada teste tem um `run: async () => { ... }` opcional.

## Adaptar a outro projeto — checklist

Ao portar esta página:

1. Colar `Testes.jsx` no `pages/`.
2. Substituir imports de `Icon`, `Btn`, `Card`, `Eyebrow` pelos equivalentes do design system alvo.
3. Trocar `APP_VERSION` pelo constante local.
4. Rescrever `GROUPS` para os fluxos da app alvo. Manter a estrutura `{ id, title, color, tests: [{ id, title, steps, expect }] }`.
5. Adicionar rota `/testes` (autenticada).
6. Adicionar entrada na sidebar admin (icon `check`, ex.: secção SISTEMA).
7. Verificar que o placeholder do Sel não colide com o teu design system (se não usares Sel, ignorar).
8. Ajustar formato do relatório se o LLM alvo preferir schema diferente (ex.: JSON em vez de markdown).

## Anti-padrões

- ❌ Meter passos vagos ("Verifica que tudo funciona"). Se não sabes o que verificas, não é teste.
- ❌ IDs semânticos (`login-with-google`). Usar T{grupo}.{seq} — imunes a rename.
- ❌ Duplicar planos em Notion. Este ficheiro é a fonte única.
- ❌ Marcar Passa sem correr o teste. O botão só deve ser clicado depois do resultado real.
- ❌ Guardar `undefined` como string. `setResult` remove a chave inteira para o toggle funcionar.
