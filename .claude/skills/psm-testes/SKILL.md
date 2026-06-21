---
name: psm-testes
description: Use ao mexer no testes.html (plano de testes / mapa de dados / relatório de segurança do Psicomotriclinic Hub) ou quando uma mudança de comportamento/feature exige atualizar a doc de QA. Garante que a página fica sempre acessível só com login (Firebase Auth), nunca pública.
---

# Manutenção do `testes.html` (Psicomotriclinic Hub)

`testes.html` é o documento vivo de QA da app, em `app/public/testes.html`. Vite copia
ficheiros de `app/public/` para `app/dist/` no build → Vercel serve em
`app.acasadapsicomotricidade.pt/testes.html`. É um único ficheiro HTML auto-contido
(CSS + JS embebidos).

**Nota path**: o skill original do Proof. Finance diz "raiz do repo" porque era um
projecto single-folder. Aqui o build é em subpasta (`app/`), por isso o ficheiro vive
em `app/public/`. Para o utilizador final continua a ser servido em `/testes.html`
no domínio.

## Regra de acesso (OBRIGATÓRIA)

**Página tem de estar OCULTA para clientes públicos — só acessível com sessão
iniciada.** Mecanismo implementado:

- `<html class="locked">` por defeito + CSS `html.locked body > *:not(#gate){display:none}`.
- Overlay `#gate` ("Acesso restrito") visível enquanto bloqueado.
- No fim do `<body>`: Firebase Auth (compat, mesmo projeto `psicomotriclinic-app`
  da app) com `onAuthStateChanged` → se houver `user`, remove `locked`; senão mantém.
- Como é o mesmo origin da app e persistência `LOCAL`, basta ter sessão iniciada
  na app (mesmo browser) para o conteúdo aparecer.

Ao editar o ficheiro **nunca** remover este gate. Se o Firebase falhar a carregar,
a página deve **manter-se bloqueada** (o `catch` força `locked`).

## Três tabs, dirigidas por estruturas de dados no `<script>` principal

1. **Plano de testes** — array `GROUPS` (`T1..T20`): `{ id, title, tests:[{id,title,steps[],expect}] }`.
   Estado por teste (Passou/Falhou/N/A) + nota em `localStorage`; contador, filtro, imprimir.
   Grupos cobrem: Auth & Roles, Pacientes, Anamnese, Plano Intervenção, Notas Sessão,
   Agenda, Pagamentos, Pedidos Troca, Anúncios, Portais (Parent/Pro), PWA & Push,
   Acessibilidade, Performance & Cache.
2. **Mapa de dados** — `LAYERS` (Entradas→Dados→Derivações→Ecrãs), `LINKS` (FK entre
   entidades), `ENTITIES` (colecções Firestore com campos e ligações).
   Colecções core: `profiles`, `professionals`, `patients`, `session_notes`,
   `intervention_plans`, `anamnesis`, `payments`, `schedule_requests`, `announcements`,
   `audit_log`, `visits`, `reminders`, `overheads`, `variable_costs`, `sessions`.
3. **Segurança** — array `SECURITY` (`{sev, status:'fixed'|'rec', title, loc, risk, fix}`)
   + `SEC_GOOD` (controlos já implementados) + `SEC_ACTIONS` (próximas).

## Como atualizar

- **Nova feature / mudança de comportamento** → adicionar/editar casos no `GROUPS`
  do grupo certo (ou criar grupo `Tn`). Manter linguagem PT, passos concretos,
  resultado esperado verificável.
- **Mudou modelo de dados** → atualizar `LAYERS`/`LINKS`/`ENTITIES`. Tipicamente
  acompanha alteração em `app/src/lib/store.jsx` ou `firestore.rules`.
- **Fix/risco de segurança** → atualizar entrada em `SECURITY` (mudar `status`
  para `'fixed'` quando resolvido). Adicionar nova entrada se descoberta nova
  vulnerabilidade.

## Validar antes de commitar

`<script>` principal tem de continuar a parsear:

```bash
node -e "const fs=require('fs');const h=fs.readFileSync('app/public/testes.html','utf8');const scripts=[...h.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)];scripts.forEach((m,i)=>{try{new Function('document','window','localStorage','confirm','firebase',m[1]);console.log('script '+i+': OK');}catch(e){console.error('script '+i+': FAIL',e.message);process.exit(1);}});console.log('ALL OK')"
```

Depois: commit no branch `main` → Vercel auto-deploy.

## Headers Vercel

`vercel.json` serve `/testes.html` como qualquer asset HTML — não precisa de
config extra. O gate client-side é a única protecção. Não há SSR para verificar
auth server-side; assume-se que conteúdo dentro é resistente a inspecção
(ninguém vê detalhes sensíveis no HTML estático — apenas estrutura de QA).
