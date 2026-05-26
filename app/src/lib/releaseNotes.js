// Histórico de versões — exibido em Definições > Release notes.
// Mais recentes em cima. Cada entrada lista o que foi adicionado, alterado e removido.
//
// Para acrescentar uma nova versão: bump APP_VERSION em constants.js e adiciona um
// novo objeto no topo deste array, na mesma forma.

export const RELEASE_NOTES = [
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
