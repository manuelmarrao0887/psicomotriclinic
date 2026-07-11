# Plan — Portals Desktop/Mobile Parity + Winning Features

**Date:** 2026-06-22
**Context:** Post-Brand-Aligned redesign (v2.0.0-alpha.16). ParentPortal + ProfessionalPortal são hoje mobile-only (top bar + bottom tab bar). Director tem sidebar desktop + mobile-tab. Utilizador quer paridade completa + tweaks por breakpoint + features vencedoras por perfil.

---

## Global Constraints (binding para todos os tasks)

- **Design tokens:** navy `#152741` primário, amber `#E8A13C` CTA, body page `#F7F9FB` (cool gray), cards `#FFFFFF`, border `#EAE6DD`, radius 12/16
- **Typography:** DM Sans (heading via `.serif` class, 300 weight display), body `-apple-system`
- **Auth:** manter Firebase Auth intacto; `applyRoleOverride` para conta admin
- **Firestore:** listeners onSnapshot + persistent cache (não voltar a getDocs polling)
- **Rules:** não alargar leituras/escritas sem justificação
- **Build:** cada task = build limpo Vite (0 warnings críticos)
- **Ship:** cada task = git commit + push (branch main)
- **Version:** bump minor por task (alpha.17 → alpha.18 → …)
- **Release notes:** actualizar `releaseNotes.js` (added/changed/removed)
- **Breakpoint:** `< 900px` = mobile, `≥ 900px` = desktop (matches useIsMobile)
- **Store extension:** actions novas SEMPRE via store.jsx; nunca chamar sb directamente de páginas
- **Accessibility:** focus rings, aria-labels em icon-only buttons, tap-target 44px em mobile

---

## Section A — Portals Desktop/Mobile Parity

### A1. Parent Portal desktop layout (sidebar + main)

**Problema:** Portal Responsável hoje só tem versão mobile (top bar + bottom tab bar de 4 items). Em desktop fica com 720px max-width centrado no ecrã inteiro — desperdiça espaço, cria hierarquia estranha.

**Solução:** Split render por `useIsMobile()`:
- Mobile: manter actual (top bar + bottom tab bar)
- Desktop: sidebar 260px navy à esquerda com secções + main content 1fr

**Sidebar desktop structure:**
- Brand mark + wordmark
- Section eyebrow `— MEUS FILHOS`: um item por filho (nome + Av mini), click ancora a HomeTab scroll até esse card
- Divider
- Section `— NAVEGAÇÃO`: Início / Sessões / Pedidos / Conta (4 NavLinks com icons)
- Divider
- Section `— INFO`: Política privacidade
- Bottom perfil: avatar 44px (photo upload menu igual à sidebar director) + nome + role tag + logout icon

**Main desktop:**
- Top ribbon com breadcrumb + tema toggle
- Content: mesmas HomeTab/SessionsTab/RequestsTab/AccountTab mas com max-width 900px e grid 2-col quando aplicável (ex: HomeTab com card filho `2fr` + sidebar recentes `1fr`)

**Ficheiros:** `app/src/pages/portals/ParentPortal.jsx`
**Estimativa:** média (3-4h)
**Dependência:** nenhuma

### A2. Professional Portal desktop layout (sidebar + main)

**Espelho de A1** para o portal profissional.

**Sidebar desktop structure:**
- Brand mark
- Section `— HOJE`: contador sessões hoje (link ancora Início)
- Section `— NAVEGAÇÃO`: Início / Agenda / Pacientes / Conta
- Divider
- Section `— MEUS CASOS`: até 5 pacientes atribuídos (Av + nome, click → PatientDetail no main)
- Bottom perfil: avatar + upload + logout

**Main desktop:**
- Agenda desktop = grelha semana × horas actual (já implementada)
- Home = 2-col: sessões hoje `2fr` + KPIs+aniversários `1fr`
- Pacientes = lista com search

**Ficheiros:** `app/src/pages/portals/ProfessionalPortal.jsx`
**Estimativa:** média (3-4h)
**Dependência:** nenhuma

### A3. Admin (director) mobile — tweaks

**Problema:** Mobile do director está OK mas KPIs Dashboard em 2-col + hero pulso desktop-tuned parecem apertados.

**Solução:**
- Hero Dashboard: em mobile stack (Av + greeting em cima, pulso da semana em baixo)
- KPI grid: já é 2-col — verificar font-scale
- Sidebar mobile: usar mesmo `SIDEBAR_SECTIONS` que desktop (secções + dividers na sheet "Mais")
- Filho popover top-right para RoleSwitcher — actualmente pode ficar apertado em mobile pequeno

**Ficheiros:** `app/src/pages/AdminLayout.jsx` (mobile branch), `app/src/pages/admin/Dashboard.jsx`
**Estimativa:** baixa (1-2h)
**Dependência:** nenhuma

### A4. Photo upload em Parent + Pro Account tab

**Problema:** Só a sidebar desktop do director permite upload de foto. Portais Pro e Parent não têm entrada.

**Solução:** Na tab Conta (Account) dos 2 portais, no card do perfil no topo, avatar clicável com mesma UX: click → popover "Carregar / Trocar / Remover". Reusa `updateMyPhoto`/`removeMyPhoto` já em store.

**Ficheiros:**
- `app/src/pages/portals/ParentPortal.jsx` (AccountTab)
- `app/src/pages/portals/ProfessionalPortal.jsx` (ProAccount)

**Estimativa:** baixa (1h)
**Dependência:** nenhuma

### A5. Design tokens per breakpoint

**Problema:** Alguns componentes usam padding/font-size fixos que ficam apertados em <400px ou muito espaçados em ≥1280px.

**Solução:** adicionar CSS custom properties responsive:
- `--card-pad-mobile: 16px` / `--card-pad-desktop: 24px`
- `--heading-scale-mobile: 0.85` / `--heading-scale-desktop: 1`
- Em `index.css` @media queries actualizam.
- Applied em Card component + Section primitives.

**Ficheiros:** `app/src/index.css`, `app/src/lib/ui.jsx`
**Estimativa:** baixa (1-2h)
**Dependência:** nenhuma

---

## Section B — Winning Features

### B1. Dashboard "Hoje" widget (director)

**Impacto:** Director vê estado da casa em 30s ao abrir. Actualmente Dashboard mostra pulso semanal + KPIs mas sem foco no dia.

**Componente:** No topo do Dashboard, hero em 2 colunas:
- Esquerda: sessões de hoje ordenadas por hora (Av paciente + hora + profissional + status; click → PatientDetail)
- Direita: alertas do dia (aniversários hoje, pedidos pendentes, pagamentos atrasados, faltas inesperadas)

**Data:** filtra `pts.day_of_week = today`, `pays.status=pendente + month=current`, `reqs.status=pendente`, birthdays -3d/+3d.

**Ficheiros:** `app/src/pages/admin/Dashboard.jsx`
**Estimativa:** média (2-3h)
**Dependência:** nenhuma

### B2. Home Practice — plano de casa com exercícios

**Impacto:** Maior — cria continuidade terapêutica entre sessões. Terapeuta atribui; responsável marca feito.

**Data model:**
- Nova colecção `home_exercises_library`: `{id, title, description, video_url?, image_url?, domains[], suggested_frequency, duration_seconds, difficulty}`
- Nova colecção `home_practice_assignments`: `{id, patient_id, professional_id, exercise_id, custom_notes, active, created_at, valid_until?}`
- Nova colecção `home_practice_completions`: `{id, patient_id, exercise_id, date, by_user_id, note?}`

**UI Pro Portal:** tab nova "Casa" (5ª tab, ou como sub-tab de Pacientes) — atribui exercícios da biblioteca ao paciente
**UI Parent Portal:** tab "Casa" — vê exercícios activos, checkbox "feito hoje", streak counter
**UI Admin:** gestão da biblioteca em `/definicoes` — CRUD exercícios (video URL, título, domínios)

**Ficheiros:** store.jsx, novo `HomePracticeLibrary.jsx` (admin), `HomePracticeTab.jsx` (pro), `HomePracticeParentTab.jsx` (parent), firestore.rules
**Estimativa:** grande (6-8h)
**Dependência:** nenhuma (Firebase Storage não necessário — video_url pode ser YouTube/Vimeo embed)

### B3. Chat rate-limited com terapeuta

**Impacto:** Substitui WhatsApp pessoal. Responsável fala com terapeuta assíncrono.

**Data model:**
- Nova colecção `parent_messages`: `{id, patient_id, from_user_id, to_professional_id, body, created_at, read_by_pro_at?, replied_at?}`
- Rate limit: parent max 1 msg activa (não respondida) por paciente

**UI Parent:** botão "Falar com terapeuta" na tab Sessions do filho → modal com histórico + textarea
**UI Pro:** cartão "Mensagens dos responsáveis" na home (unread count) → lista + reply

**Rules:** parent create se from_user_id = auth.uid; pro update se to_professional_id = pro do paciente

**Ficheiros:** store.jsx, ParentPortal, ProfessionalPortal, firestore.rules
**Estimativa:** média (4-5h)

### B4. Diário de comportamento estruturado

**Impacto:** Feedback parental estruturado antes da sessão — terapeuta chega preparado.

**Data model:**
- Nova colecção `behavior_diary`: `{id, patient_id, by_user_id, date, mood(1-5), sleep_hours?, notable_events[], concerns?}`

**UI Parent:** cartão "Diário desta semana" com botão "Nova entrada" → modal com sliders + tags rápidas
**UI Pro:** timeline no PatientDetail (visível se role=professional) — últimas 7 entradas antes de escrever nova nota de sessão

**Ficheiros:** store.jsx, ParentPortal, Patients.jsx (PatientDetail), rules
**Estimativa:** média (3-4h)

### B5. Lista de espera + CRM leads (director)

**Impacto:** Leads deixam de perder-se em WhatsApp. Fluxo estruturado: contacto → reunião → anamnese → activação.

**Data model:**
- Nova colecção `waitlist`: `{id, name, age?, contact_email, contact_phone, source, status(new|contacted|meeting_scheduled|anamnesis_done|activated|declined), notes, created_at, updated_at, activated_patient_id?}`

**UI Admin:** nova página `/lista-espera` com kanban ou lista + filtros. Botão "Convertir em paciente" no fim do fluxo → cria patient e link back.

**Ficheiros:** store.jsx, novo `Waitlist.jsx`, AdminLayout (adiciona ao section CLÍNICO)
**Estimativa:** média (3-4h)

### B6. Speech-to-text para dictar notas (pro)

**Impacto:** Poupa 5-10 min por sessão. Terapeuta foca-se no clínico.

**Solução:** Web Speech API (nativo browser, PT-PT). Botão microfone em cada campo do modal de nota de sessão → transcreve → utilizador revê + edita.

**Ficheiros:** ModalsHost.jsx (sessionNote modal), possivelmente helper novo em store.jsx
**Estimativa:** média (2-3h)

### B7. Faturas PDF + MB WAY (director/parent)

**Impacto:** Quick win operacional PT.

**Solução:** Gera PDF client-side com `pdf-lib` (bundle ~200KB, lazy). Botão em cada payment: "Descarregar recibo". Campo em payments `mbway_reference` para director introduzir manualmente.

**Ficheiros:** store.jsx (helper generatePdf), Patients.jsx (payment row), ParentPortal (payment card)
**Estimativa:** média (3h)

---

## Section C — Cross-cutting / Polish

### C1. Onboarding tour first-run

**Problema:** Novo utilizador (parent principalmente) abre app e não sabe navegar.

**Solução:** Overlay com 3-4 ecrãs curtos primeira vez que entra. Persiste em `psm.onboarding.completed.{userId}=1`.

**Ficheiros:** novo `OnboardingTour.jsx` component, App.jsx wire
**Estimativa:** baixa (1-2h)

### C2. FAQ / glossário psicomotor

**Problema:** Parent lê "praxias" e fica perdido.

**Solução:** JSON com 20 termos → componente `<Term>` que renderiza tooltip. Auto-highlight nos campos observations/progress das notas.

**Ficheiros:** novo `app/src/lib/glossary.js`, `app/src/components/Term.jsx`, aplicado em ParentPortal ChildCard notas + SessionsTab
**Estimativa:** baixa (2h)

### C3. Notification preferences

**Problema:** Utilizador quer desligar tipos específicos de push sem desligar tudo.

**Solução:** Em Account tab, secção "Notificações": 3 toggles (lembretes de sessão, anúncios, estado de pedidos). Guarda em `profiles.{id}.notification_prefs = {reminders:bool, announcements:bool, requests:bool}`. Cloud Function respeita.

**Ficheiros:** store.jsx, ParentPortal AccountTab, ProfessionalPortal ProAccount, functions/index.js
**Estimativa:** baixa (2h)

---

## Execution Order (Recommended)

**Sprint 1 — Parity (ship agora):**
1. **A4** Photo upload nas Account tabs (rápido, entrega valor imediato)
2. **A1** Parent Portal desktop
3. **A2** Pro Portal desktop
4. **A5** Design tokens per breakpoint
5. **A3** Admin mobile tweaks

**Sprint 2 — Director wins:**
6. **B1** Dashboard "Hoje" widget
7. **B5** Lista de espera + CRM
8. **B7** Faturas PDF

**Sprint 3 — Clinical wins:**
9. **B2** Home Practice + biblioteca exercícios (o grande)
10. **B4** Diário comportamento
11. **B6** Speech-to-text notas

**Sprint 4 — Communication:**
12. **B3** Chat rate-limited terapeuta-responsável
13. **C1** Onboarding tour
14. **C2** FAQ glossário
15. **C3** Notification preferences

---

## Immediate execution (this session)

Ship **Sprint 1** (5 tasks: A4, A1, A2, A5, A3). Deixa Sprint 2-4 para próximos lotes.

Se prioridade for outra, dizer.
