# Psicomotriclinic Hub — versão Vite (em construção)

Esta pasta `/app` é a **nova versão** da app, construída com:

- **Vite** + **React 18**
- **React Router** (várias páginas com URLs próprias)
- **Firebase modular SDK** (Auth + Firestore)

A versão actual (single-file `index.html` na raiz do projeto) continua a funcionar e a servir o site `psicomotriclinic.proofstudio.pt` enquanto esta migração não estiver completa.

## Como correr localmente

Pré-requisito: Node.js ≥ 18.

```bash
cd app
npm install
npm run dev
```

Abre automaticamente em http://localhost:5173. Faz login com a tua conta Firebase (a mesma do projeto `psicomotriclinic-app`).

## Como compilar para produção

```bash
cd app
npm run build
```

Os ficheiros estáticos ficam em `app/dist`. Quando a migração estiver completa, este `dist/` é o que se publica no `proofstudio.pt` em vez do `index.html` antigo.

## Estrutura

```
app/
  index.html              — entry HTML (Vite injecta o JS)
  vite.config.js          — config mínima
  package.json
  src/
    main.jsx              — bootstrap (ReactDOM + BrowserRouter)
    App.jsx               — auth gate + routing
    index.css             — estilos globais (+ dark mode)
    lib/
      firebase.js         — adaptador `sb` (mesma API do legacy)
      ui.jsx              — Btn, Card, Stat, Modal, Field, Inp, Sel, ...
      icons.jsx           — Icon + Mark (logo SVG)
      constants.js        — DAYS, HOURS, MONTHS_2026, RL, AVATAR_BG, ...
    pages/
      Login.jsx
      AdminLayout.jsx     — sidebar + topbar + outlet
      admin/
        Dashboard.jsx
        Placeholder.jsx   — usado pelas restantes páginas até serem migradas
```

## Roadmap de migração

| Lote | Conteúdo | Estado |
|---|---|---|
| 1 | Scaffold + Login + Dashboard básico | ✅ feito |
| 2 | Utilizadores, Equipa, Pacientes, Definições | em fila |
| 3 | Agenda, Financeiro, Pedidos | em fila |
| 4 | Anamnese · Notas de sessão · Plano de intervenção | em fila |
| 5 | Log de auditoria · Export CSV · P&L mensal · Aniversários · RGPD | em fila |
| 6 | Portal dos pais real (leitura) + plano de casa | em fila |
| 7 | Biblioteca de exercícios · Marcos de desenvolvimento · Avaliações | em fila |
| 8 | PWA · 2FA · Backup · Lembretes (Blaze) · MB WAY | em fila |

## Notas

- **Firebase config** — está em `src/lib/firebase.js`. A chave web é pública por design (a segurança vem das Firestore Rules).
- **Regras Firestore** — são as mesmas do projeto raiz (`firestore.rules`). Não há mudanças aqui.
- **Domínios autorizados** — para Google Sign-In funcionar em produção, adiciona o domínio em Authentication → Settings → Authorized domains.
