# Segurança — passos de deploy (Fase 0 da auditoria)

As alterações de segurança tocam nas **regras Firestore** e no **modelo de leitura**.
Uma incompatibilidade entre regras ↔ queries do cliente ↔ dados existentes pode
**bloquear utilizadores legítimos**. Segue esta ordem e testa no emulador antes de produção.

## Resumo das mudanças

- **Papel imutável**: um utilizador já não pode mudar o próprio `role` (fecha a
  escalada para `director`). Auto-registo é sempre `parent` (exceto o email admin
  de bootstrap). Staff é provisionado pela direção (`inviteUser`).
- **Leitura por dono**: dados clínicos/financeiros deixam de ser legíveis por
  qualquer autenticado. As regras autorizam por `parent_user_ids` /
  `professional_ids` **denormalizados em cada documento**. As queries do portal do
  responsável passam a filtrar com `array-contains`.
- **6 coleções sem regra** passam a ter regras explícitas; sem `match /{document=**}`.
- **Cloud Functions**: envio real por defeito, respeitam `notification_prefs`,
  `try/catch` por envio, uma leitura de perfil por destinatário.

## Ordem de deploy (obrigatória)

1. **Testar as regras no emulador**
   ```bash
   firebase emulators:start --only firestore
   # correr a app apontada ao emulador e validar: login parent/professional/director,
   # ver pacientes/notas/pagamentos dos próprios filhos, submeter pedido, cancelar sessão.
   ```
   Confirmar que um `parent` **não** lê pacientes/pagamentos que não são seus, e que
   **não** consegue `updateDoc(profiles/<self>, {role:'director'})`.

2. **Fazer deploy do código do cliente** (já grava owner ids em documentos novos).
   ```bash
   cd app && npm run build   # deploy do dist conforme o vosso fluxo (Vercel)
   ```

3. **Backfill dos documentos existentes** (antes de apertar as regras, para o
   portal do responsável não perder o histórico):
   ```bash
   node scripts/backfill-owner-ids.js            # dry-run — confirma contagens
   APPLY=true node scripts/backfill-owner-ids.js  # aplica
   ```

4. **Deploy das regras e índices**
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```

5. **Deploy das Cloud Functions + variáveis de ambiente**
   ```bash
   firebase deploy --only functions
   # Garantir que REMINDERS_DRY_RUN NÃO está "true" em produção (default agora é envio real).
   # Definir VITE_FCM_VAPID_KEY (Vercel) para o push do cliente funcionar.
   ```

## Ações manuais fora do código

- **f0-9** — Remover os exports reais (`utentes.json`, `sessoes.json`,
  `financeiro_mensal.json`, `firestore_import.json`) da pasta iCloud sincronizada
  após importar, ou mantê-los encriptados/fora de drive de terceiros (RGPD).
- **f0-11** — Ativar **password policy** no Firebase Auth (mínimo ≥ 8, complexidade)
  e verificação de email para contas com email real:
  Firebase Console → Authentication → Settings → Password policy.
- **serviceAccountKey.json** — nunca commitar (já em `.gitignore`); necessário só
  localmente para os scripts de import/backfill.
