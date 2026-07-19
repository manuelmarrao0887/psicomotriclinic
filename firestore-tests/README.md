# Testes das regras Firestore

Verificam as garantias de segurança da **Fase 0** da auditoria (RGPD) contra o
emulador Firestore — o passo de verificação obrigatório antes de fazer deploy das
regras (ver `docs/SECURITY-DEPLOY.md`).

## Cobertura (22 asserções)

- **Papel / privilégios**: parent não escala o próprio `role`; auto-registo como
  director/professional negado; parent permitido; bootstrap do email admin.
- **Leitura clínica por dono**: dono lê os seus; outro parent não lê alheio;
  staff lê tudo.
- **Financeiro**: dono lê o próprio pagamento; não-dono não; overheads só staff.
- **Validação de create**: nota de cancelamento só pelo dono; `schedule_requests`
  exige `requested_by_id == uid`.
- **Coleções restritas**: waitlist e audit_log negadas a parent.

## Correr

Precisa de Java (o emulador Firestore corre em JVM).

```bash
cd firestore-tests
npm install
npm test        # arranca o emulador, corre rules.test.mjs, encerra
```

Ou, com um emulador já a correr noutro terminal:

```bash
FIRESTORE_EMULATOR_PORT=8080 node rules.test.mjs
```

Sai com código ≠ 0 se alguma asserção falhar (usável em CI).

## Desenvolver contra o emulador (com dados)

```bash
# terminal 1 — emulador
firebase emulators:start --only firestore,auth --project psicomotriclinic-app
# terminal 2 — popular dados de exemplo (3 contas)
cd firestore-tests && npm run seed
# terminal 3 — app apontada ao emulador
cd app && VITE_USE_EMULATOR=1 npm run dev
```

Entrar com `dir@test.pt`, `pai@test.pt` ou `prof@test.pt` (password `test123`)
para ver os portais Diretor / Responsável / Profissional com dados.

