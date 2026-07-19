# Road to Beta — Psicomotriclinic Hub

Versão atual: `v2.0.0-alpha.35`. Este documento define o que falta para sair de
alpha, na sequência da auditoria de 2026-07.

## Concluído nesta ronda (Fases 0–7, parcial)

- **Segurança/RGPD**: papel imutável, leitura por dono, regras para todas as
  coleções, validação de creates, signup só-parent, inviteUser sem logout do
  admin, Cloud Functions com envio real + respeito por preferências.
- **Correção**: validação de formulários, mês de pagamento correto, N+1 nas
  functions, sync de versão.
- **Performance**: subscrições scoped por papel, Dashboard lazy, fontes
  não-bloqueantes, SW com prune de cache.
- **Acessibilidade**: labels de formulário, focus trap em modais, contraste AA.
- **Estados**: primitivos Skeleton/EmptyState, Btn loading, erro inline.
- **Qualidade**: lib/format.js, Vitest + 18 testes, CI (GitHub Actions).

## Bloqueadores para Beta (obrigatório)

- [ ] **Testar as regras no emulador** e executar o deploy pela ordem de
      `docs/SECURITY-DEPLOY.md` (rules ↔ queries ↔ backfill).
- [ ] **Ligar o push em produção**: `REMINDERS_DRY_RUN=false` + `VITE_FCM_VAPID_KEY`.
- [ ] **Password policy** no Firebase Auth + verificação de email (f0-11).
- [ ] **Remover exports reais** da pasta iCloud (f0-9).
- [ ] **Backfill** dos owner ids nos documentos existentes (script pronto).

## Melhorias grandes ainda por fazer (Fases 2/3/6/8)

Estas são refactorizações extensas — recomenda-se fazê-las com a app a correr
(dev + emulador) e revisão incremental, não às cegas:

- [ ] **Tokenizar o design system** (f3-1/f3-2): rotear ~1200 hex inline por CSS
      vars e reescrever o dark mode como reatribuição de tokens (elimina a classe
      de bugs de dark-mode/print). Alto valor, mecânico mas volumoso.
- [ ] **Rotas reais nos portais** (f6-1): converter tabs `useState` em rotas
      aninhadas → deep-linking, back-button, push para tab específica.
- [ ] **Deduplicar os portais** (f6-2): `<PortalShell>` + um dispatcher de
      conteúdo em vez de árvores desktop/mobile duplicadas (~2000 linhas).
- [ ] **Firebase SDK lazy** (f2-1): `import()` dinâmico de firestore/messaging
      após o login (tira ~360KB do caminho crítico do /login).
- [ ] **Store: memoizar value + dividir contexto / tirar form do global** (f2-2/3).
- [ ] **Virtualização** de listas longas quando > ~100 linhas (f2-7).
- [ ] **Tabelas responsivas** em Finance/Team/Agenda (f5-1) — aplicar
      `[data-mobile-cards]` a todas as vistas tabulares.
- [ ] **i18n** (f8-1): decidir PT-only (documentar) ou extrair strings.
- [ ] **Consolidar modais** hand-rolled para o `Modal` partilhado (f6-4).
- [ ] **Limpeza de legado** (f6-8): `../src` pré-Vite, `index.html` raiz (192KB),
      `Placeholder.jsx`, `SessionsTab` — confirmar que Firebase Hosting não
      depende do `index.html` raiz antes de apagar.

## Critério de saída de alpha → beta

1. Todos os bloqueadores acima resolvidos e verificados.
2. Regras testadas no emulador com os 3 papéis.
3. Push a funcionar end-to-end (1 lembrete real recebido).
4. CI verde (test + build) em cada PR.
5. Sem dados reais de saúde em drives sincronizados não encriptados.
