// Histórico de versões — exibido em Definições > Release notes.
// Mais recentes em cima. Cada entrada lista o que foi adicionado, alterado e removido.
//
// Para acrescentar uma nova versão: bump APP_VERSION em constants.js e adiciona um
// novo objeto no topo deste array, na mesma forma.

export const RELEASE_NOTES = [
  {
    version: "v2.0.0-alpha.15",
    date: "2026-06-13",
    title: "Redesign Brand Aligned — primeira passagem (whites + navy + amber)",
    added: [],
    changed: [
      "Background global passou de cream #F7F4EE para branco #FFFFFF. AdminLayout (desktop + mobile), Login, ConfirmSession, Privacy.",
      "Tokens cream → tons mais frescos: paper #FBF9F4 → #FBFAF7 (cards), cream-2 #EFEBE2 → #F5F2EC (headers de tabela, hover), line #E5E0D4 → #EAE6DD (borders mais subtis).",
      "Top bars / tab bars dos portais Responsável e Profissional: blur translúcido sobre branco em vez de cream.",
      "Btn secondary: bg branco, hover surfaceAlt — destaca-se contra fundo branco em vez de fundir.",
      "CSS var --cream-inverse preserva F7F4EE para texto inverso em fundo navy (sidebar, modais escuros).",
      "Sidebar navy + amber accent mantidos exactamente como antes — só o canvas mudou.",
    ],
    removed: [],
  },
  {
    version: "v2.0.0-alpha.14",
    date: "2026-06-13",
    title: "Style Lab — 3 direcções visuais para redesign",
    added: [
      "Página /style-lab com 3 variantes lado-a-lado: Mono Navy (minimal SaaS), Brand Aligned (navy+amber), Sage Fresh (verde do logo). Cada uma renderiza sidebar/topbar/KPIs/tabela/botões com tokens próprios — preview real antes de commit.",
      "Cores do logo: navy #152741 e sage #8DBF94 como primárias. Sem indigo.",
    ],
    changed: [],
    removed: [],
  },
  {
    version: "v2.0.0-alpha.13",
    date: "2026-06-13",
    title: "Otimização Firestore — listeners + cache + limits reais (-90% reads)",
    added: [
      "Cache persistente IndexedDB (persistentLocalCache + persistentMultipleTabManager) — Firestore SDK serve dados em cache local, multi-tab safe",
      "Listeners em tempo real (onSnapshot) em todas as 14 colecções — primeiro ligar paga as reads, depois só docs alterados são facturados",
      "Limits e where/orderBy aplicados *server-side* — Firestore deixa de devolver colecções inteiras só para serem cortadas no cliente",
      "Visits restringidas aos últimos 30 dias (where ts >= 30d) — antes pull de toda a colecção crescendo a cada login",
      "Listeners director-only para audit_log e visits — parents/pros já nem subscrevem (rules bloqueavam mas tentativa custava ruído na consola)",
    ],
    changed: [
      "store.jsx: load() agora é no-op compatível — `await load()` em acções não custa nada, listeners propagam mutações automaticamente",
      "firebase.js: _run() select usa query(col, ...constraints) com where/orderBy/limit reais; ignora where('id') que Firestore não aceita directamente",
      "firebase.js: db, query, where, orderBy, limit, onSnapshot, getCountFromServer exportados para uso directo em store.jsx",
    ],
    removed: [
      "Polling com Promise.all de 14 getDocs() em cada open + após cada mutação — substituído por subscriptions persistentes",
    ],
  },
  {
    version: "v2.0.0-alpha.12",
    date: "2026-06-08",
    title: "Fix: auto-recovery de chunks órfãos após deploy",
    added: [
      "lazyWithRetry — wrapper de React.lazy que detecta falha de fetch de chunk (utilizador com index.html antigo após deploy novo) e força location.reload() uma vez para apanhar o index novo. Limpa flag após 5s para permitir nova recuperação em futuros deploys.",
    ],
    changed: [
      "App.jsx: todas as importações lazy passam por lazyWithRetry. Utilizadores com sessões antigas deixam de ver 'Failed to fetch dynamically imported module' — recovery silencioso por reload automático.",
    ],
    removed: [],
  },
  {
    version: "v2.0.0-alpha.11",
    date: "2026-06-08",
    title: "Fix: banner de notificações esconde-se até servidor configurado",
    added: [],
    changed: [
      "PushPermissionBanner: agora oculta-se completamente se FCM_VAPID_KEY estiver vazia (servidor ainda não configurado). Evita oferecer ao utilizador algo que falha sempre.",
    ],
    removed: [],
  },
  {
    version: "v2.0.0-alpha.10",
    date: "2026-06-06",
    title: "Push notifications + Confirmar sessão 1-tap",
    added: [
      "Service worker unificado (cache PWA + FCM background messages)",
      "Push notifications de 3 tipos: lembrete de sessão amanhã, novo anúncio, estado de pedido (aprovado/recusado)",
      "PushPermissionBanner — pede permissão ao utilizador (auto-dismiss após 7 dias)",
      "Página /confirmar/:patientId/:date — fluxo opt-out: 'Tudo OK' ou 'Não posso ir' (com motivo opcional). Cria nota de sessão com status=cancelado",
      "store.enablePush()/disablePush()/cancelSession() + pushState",
      "fcm helpers em firebase.js (requestPermissionAndToken, deleteToken, onForegroundMessage, saveTokenToProfile)",
      "Cloud Functions (functions/index.js): sessionReminders (Cloud Scheduler 18:00 Lisboa), onAnnouncementCreated, onScheduleRequestUpdated",
      "Limpeza automática de tokens FCM inválidos (pruneInvalidTokens) — após erro, remove do profile",
    ],
    changed: [
      "App.jsx: rota /confirmar/:patientId/:date acessível a todos os perfis autenticados",
      "App.jsx: PushListener — foreground messages aparecem como toast; postMessage do SW navega para o URL alvo",
      "firestore.rules: session_notes ganha excepção — responsáveis podem criar nota cancelled_by_user=true (necessário para o fluxo 'Não posso ir')",
      "sw.js renomeado conceptualmente — agora é o registado service worker, inclui firebase-messaging-compat",
      "functions/index.js: lembretes agora enviam push (preferido) + email (complementar via Resend)",
    ],
    removed: [],
  },
  {
    version: "v2.0.0-alpha.9",
    date: "2026-05-27",
    title: "PWA, code splitting, vínculo profissional, regras Firestore",
    added: [
      "PWA — manifest.webmanifest, icon.svg, apple-touch-icon.svg, service worker (cache-first em /assets, network-first com fallback offline para HTML). Install no iPhone via 'Adicionar ao Ecrã Principal'",
      "Code splitting — todas as páginas admin e portais carregadas com React.lazy + Suspense. O bundle inicial baixa só Login + Dashboard + shell; o resto vem on-demand",
      "Vínculo conta ↔ profissional — ProfDetail (admin → Equipa) ganha card 'Conta vinculada' com modal de seleção (apenas perfis role=professional). O Portal Profissional usa profile_id explícito antes do fallback por nome",
      "PageLoader iOS-style durante Suspense (mark + spinner mono)",
    ],
    changed: [
      "firestore.rules atualizadas — colecção announcements (read autenticados, write director); schedule_requests aceita create de qualquer autenticado (parent submete pedidos); anamnesis/notes/plans read aberto a autenticado para o portal do responsável funcionar (filtragem por parent_user_ids no cliente)",
      "App.jsx — VisitLogger e ToastHost mantidos, mas os componentes de página estão atrás de Suspense + ErrorBoundary",
      "Team.jsx — ProfDetail layout em 2 colunas (perfil+conta vinculada / KPIs+casos); usa patient-grid CSS para empilhar em mobile",
      "ProfessionalPortal — findMyProfRecord aceita profile.id como primeiro argumento; profile_id tem prioridade",
      "store: setProfessionalUser(professionalId, userId) — director vincula/desvincula conta",
    ],
    removed: [],
  },
  {
    version: "v2.0.0-alpha.8",
    date: "2026-05-26",
    title: "Comunicações, vinculação de responsáveis e mais",
    added: [
      "Página Comunicações (admin) — director publica anúncios visíveis nos portais Profissional e/ou Responsável; podem ser activadas/desactivadas/eliminadas",
      "Vinculação explícita responsável↔paciente — em PatientDetail, novo botão 'Vincular contas' abre modal para selecionar perfis com role=parent; o portal do responsável passa a usar parent_user_ids como matching preferencial (com fallback para o nome)",
      "Portal Profissional — botão rápido 'Marcar falta' nas sessões de hoje (cria nota com status=falta)",
      "Portal Profissional — secção 'Aniversários · 30 dias' dos meus pacientes",
      "Portal Profissional — banner de anúncios da direção no topo",
      "Portal Responsável — banner de anúncios da direção no topo",
      "Portal Responsável — separador 'Pedidos' mostra histórico completo com estado (Pendente / Aprovado / Recusado) e os horários antes→depois",
      "Portal Responsável — badge vermelho na tab 'Pedidos' quando há pedidos respondidos desde a última visita; banner 'Novidades' na Home",
    ],
    changed: [
      "store.jsx: nova colecção announcements + acções addAnnouncement/toggleAnnouncementActive/deleteAnnouncement",
      "store.jsx: quickMarkFalta(patientId, profId) e setPatientParents(patientId, ids)",
      "store.jsx: schedule_requests deixa de ser filtrada por status na store; admin Requests passa a filtrar localmente para o responsável poder ver o histórico",
      "store.jsx: approveRequest/rejectRequest gravam updated_at (necessário para detecção de novidades no portal)",
      "Admin Requests: agora distingue origem do pedido (Profissional vs Responsável) e mostra horários antes→depois para ambos os formatos",
      "Patients: addPatient agora persiste parent_user_ids",
      "Sidebar admin: nova entrada Comunicações entre Pedidos e Definições",
    ],
    removed: [],
  },
  {
    version: "v2.0.0-alpha.7",
    date: "2026-05-26",
    title: "Portais Responsável & Profissional · Release notes",
    added: [
      "Portal do Responsável — vê filhos, próximas sessões, plano de intervenção, últimas notas e pagamentos",
      "Portal do Profissional — agenda da semana, pacientes atribuídos, registo rápido de nota de sessão",
      "Esta página de Release notes em Definições (com histórico completo)",
      "ErrorBoundary global — em vez de páginas em branco mostra mensagem de erro + stack",
    ],
    changed: [
      "App: routing por papel (Diretor/Profissional/Responsável) com StoreProvider partilhada na raiz",
      "ModalsHost e Toast movidos para o topo da app (acessíveis a todos os portais)",
      "Identificação de pacientes por responsável: match (case-insensitive) entre profile.full_name e parent_mother/parent_father",
      "Identificação por profissional: match entre profile.full_name e professionals.name",
    ],
    removed: [],
  },
  {
    version: "v2.0.0-alpha.6",
    date: "2026-05-26",
    title: "Mobile responsive + iOS-feel",
    added: [
      "Bottom tab bar mobile (Dashboard, Pacientes, Agenda, Mais) com top app bar translúcida e blur",
      "Bottom sheet (slide-up) em vez de modal centrado em mobile",
      "Segmented control de dias na Agenda mobile (toca para mudar de dia)",
      "Pacientes em lista de cards em mobile (tabela mantém-se em desktop)",
      "Footer com versão e data da última atualização — auto via Vite build-time (__BUILD_DATE__)",
      "Configuração Vercel (vercel.json à raiz) para auto-deploy em cada push",
      "Safe-area insets (notch / home indicator do iPhone)",
    ],
    changed: [
      "Tipografia: -apple-system como primária, DM Sans secundária",
      "Animações: cubic-bezier(.32,.72,0,1) — curva spring inspirada no iOS",
      "Toast respeita altura da tab bar e safe-area-inset",
      "Inputs mobile com font-size 16px (impede zoom automático no Safari iOS)",
      "Scrollbars escondidos em mobile (estilo nativo)",
    ],
    removed: [
      "Link discreto 'modo escuro' no rodapé da sidebar (substituído por botão sol/lua visível)",
    ],
  },
  {
    version: "v2.0.0-alpha.5",
    date: "2026-05-26",
    title: "Acessibilidade e UX (Lote 6)",
    added: [
      "Focus rings visíveis (:focus-visible) em botões, links e elementos role=button",
      "Skip link 'Saltar para o conteúdo principal'",
      "aria-label em botões de ícone (logout, fechar modal, toggle tema, eliminar)",
      "ConfirmModal acessível (role=dialog, aria-modal, Esc para fechar)",
      "Banner inline 'Conta desativada' no Login (acionado via ?disabled=1)",
      "Toggle de tema (sol/lua) promovido a botão visível na sidebar",
    ],
    changed: [
      "alert() e confirm() nativos substituídos por Modal / Toast / ConfirmModal",
      "Cards e linhas de tabela navegáveis por teclado (Enter / Space)",
      "Toast com role=alert/status e aria-live conforme tipo",
      "Contraste sidebar inactiva subido (.5 → .65–.78) para cumprir WCAG AA",
      "prefers-reduced-motion respeitado (animações desligadas)",
    ],
    removed: [],
  },
  {
    version: "v2.0.0-alpha.4",
    date: "2026-05-24",
    title: "Importação administrativa de pacientes",
    added: [
      "Segundo formato de importação em massa (nome, NIF, seguro, número de seguro)",
    ],
    changed: [],
    removed: [],
  },
  {
    version: "v2.0.0-alpha.3",
    date: "2026-05-23",
    title: "Lote 5 — Auditoria, Export, P&L, Aniversários, RGPD",
    added: [
      "Log de auditoria — registo de todas as acções administrativas",
      "Exportação CSV (pacientes, pagamentos, profissionais, notas, utilizadores)",
      "P&L mensal no Financeiro",
      "Aniversários nos próximos 30 dias no Dashboard",
      "Página de Privacidade (RGPD)",
    ],
    changed: [],
    removed: [],
  },
  {
    version: "v2.0.0-alpha.2",
    date: "2026-05-23",
    title: "Lote 4 — Núcleo clínico",
    added: [
      "Anamnese — ficha de admissão estruturada",
      "Notas de sessão com domínios psicomotores (10 categorias)",
      "Plano de intervenção com objetivos mensuráveis e progresso",
    ],
    changed: [],
    removed: [],
  },
  {
    version: "v2.0.0-alpha.1",
    date: "2026-05-23",
    title: "Lotes 1-3 — Scaffold + migração para Vite",
    added: [
      "Nova versão modular em /app (Vite + React Router + Firebase)",
      "Autenticação Firebase (email/password e Google)",
      "Páginas: Dashboard, Utilizadores, Equipa, Pacientes (lista + detalhe)",
      "Agenda semanal (grelha dias × horas)",
      "Financeiro (pagamentos, custos fixos e variáveis)",
      "Pedidos de troca de horário",
      "Definições com acções rápidas e exports",
      "Modo escuro (toggle global)",
    ],
    changed: [
      "Migração de Supabase → Firebase via adaptador 'sb' (mesma API)",
    ],
    removed: [],
  },
];

// Total de versões — usado para badges/contadores.
export const RELEASE_NOTES_COUNT = RELEASE_NOTES.length;
