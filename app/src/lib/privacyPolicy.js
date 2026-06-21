// Política de privacidade — dados estruturados (data-driven render em Privacy.jsx).
// Bumpar PRIVACY_VERSION + PRIVACY_LAST_UPDATE quando alterares conteúdo significativo
// (para o aviso "actualizada em X" e potencialmente forçar reaceitação).

import { APP_VERSION, formatBuildDate } from "./constants.js";

export const PRIVACY_VERSION = "1.1";
export const PRIVACY_LAST_UPDATE = "2026-06-13";

export const CONTROLLER = {
  name: "A Casa da Psicomotricidade",
  legalName: "Manuel Sousa Marrão (Empresário em Nome Individual)",
  address: "Lisboa, Portugal",
  website: "acasadapsicomotricidade.pt",
  email: "manuelsousamarrao@gmail.com",
  dpoEmail: "manuelsousamarrao@gmail.com",
};

// Cada secção: id, eyebrow (label curto), title, blocks: [{ type, ... }]
// Types: "p" (parágrafo), "list" (bullets), "table" (linhas), "callout" (banner âmbar), "kv" (chave→valor)
export const PRIVACY_SECTIONS = [
  {
    id: "controller",
    eyebrow: "— RESPONSÁVEL",
    title: "Quem é responsável pelo tratamento",
    blocks: [
      { type: "p", text: `O responsável pelo tratamento dos seus dados pessoais é a ${CONTROLLER.name}, titulada por ${CONTROLLER.legalName}, com sede em ${CONTROLLER.address}.` },
      { type: "kv", rows: [
        ["Website", CONTROLLER.website],
        ["Email para questões de privacidade", CONTROLLER.email],
        ["Encarregado de proteção de dados (DPO)", CONTROLLER.dpoEmail],
      ]},
    ],
  },
  {
    id: "data",
    eyebrow: "— DADOS",
    title: "Que dados pessoais recolhemos",
    blocks: [
      { type: "p", text: "Conforme o seu papel na plataforma, recolhemos diferentes categorias de dados:" },
      { type: "table", header: ["Categoria", "Quando", "O quê"], rows: [
        ["Conta", "Quando cria conta ou é convidado", "Nome, email, papel (Diretor/Profissional/Responsável), data de criação"],
        ["Crianças acompanhadas", "Inscrição na clínica", "Nome, idade, data de nascimento, NIF (opcional), nome dos pais, informação de seguro de saúde, contactos médicos relevantes"],
        ["Clínicos", "Sessões + anamnese + plano", "Anamnese (motivo, queixas, gestação, marcos, contexto escolar/familiar), plano de intervenção com objectivos, notas de cada sessão (domínios psicomotores, observações, evolução)"],
        ["Agenda", "Marcação", "Dia e hora da sessão fixa semanal, profissional atribuído, tipo (individual/grupo)"],
        ["Financeiro", "Pagamentos", "Mês, valor, estado (pago/pendente), data de pagamento"],
        ["Pedidos", "Comunicação", "Pedidos de troca de horário (autor, paciente, motivo, estado)"],
        ["Acesso", "Logins", "Data e hora dos logins (limitado aos últimos 30 dias)"],
        ["Auditoria", "Acções administrativas", "Quem fez o quê, quando — para responsabilização"],
        ["Notificações push", "Se ativar", "Token FCM do dispositivo (anónimo, revogável)"],
      ]},
      { type: "callout", text: "Não recolhemos números de cartão de crédito. Pagamentos são feitos fora da plataforma e apenas o estado (pago/pendente) é registado." },
    ],
  },
  {
    id: "purpose",
    eyebrow: "— FINALIDADE",
    title: "Para que usamos os seus dados",
    blocks: [
      { type: "list", items: [
        "Prestar o serviço clínico contratado (terapia de psicomotricidade)",
        "Comunicar com responsáveis sobre sessões, planos e evolução",
        "Gerir agenda, presenças, faltas e pedidos de troca",
        "Faturar e registar pagamentos",
        "Cumprir obrigações legais (fiscais, sanitárias, RGPD)",
        "Melhorar o serviço através de análises agregadas e anónimas",
        "Enviar notificações operacionais (lembretes de sessão, resposta a pedidos, anúncios da direção)",
      ]},
    ],
  },
  {
    id: "legal-basis",
    eyebrow: "— BASE LEGAL",
    title: "Com que fundamento processamos os dados (RGPD art. 6)",
    blocks: [
      { type: "table", header: ["Categoria", "Base legal"], rows: [
        ["Conta + clínicos + agenda + pagamentos", "Execução do contrato (art. 6.1.b) com o responsável da criança"],
        ["Auditoria + logs de acesso", "Interesse legítimo (art. 6.1.f) — responsabilização e segurança"],
        ["Faturação e retenção fiscal", "Obrigação legal (art. 6.1.c)"],
        ["Dados clínicos sensíveis (saúde)", "Cuidados de saúde (art. 9.2.h) + consentimento explícito do responsável legal"],
        ["Notificações push", "Consentimento (art. 6.1.a) — revogável em qualquer momento"],
      ]},
    ],
  },
  {
    id: "access",
    eyebrow: "— QUEM ACEDE",
    title: "Quem pode ver os seus dados",
    blocks: [
      { type: "p", text: "Aplicamos princípio de menor privilégio. O acesso depende do papel:" },
      { type: "table", header: ["Papel", "Vê"], rows: [
        ["Diretor", "Todas as colecções (gestão da clínica). Aceitação RGPD obrigatória."],
        ["Profissional", "Apenas casos atribuídos a si. Não vê pagamentos nem auditoria."],
        ["Responsável", "Apenas os seus filhos (via vínculo explícito do diretor ou match por nome). Plano, notas resumidas, pagamentos do filho, pedidos próprios."],
      ]},
      { type: "p", text: "As Firestore Security Rules garantem este isolamento no servidor — não é só filtragem no cliente." },
    ],
  },
  {
    id: "retention",
    eyebrow: "— RETENÇÃO",
    title: "Durante quanto tempo guardamos os dados",
    blocks: [
      { type: "table", header: ["Tipo", "Período"], rows: [
        ["Dados clínicos (anamnese, plano, notas)", "5 anos após a última sessão da criança"],
        ["Faturação e pagamentos", "10 anos (obrigação fiscal portuguesa)"],
        ["Conta de utilizador", "Enquanto activa + 30 dias após desactivação"],
        ["Logs de acesso (visits)", "Apenas últimos 30 dias visíveis; eliminação após 90 dias"],
        ["Auditoria", "Indefinidamente dentro do tenant (append-only)"],
        ["FCM tokens push", "Até desactivar ou trocar de dispositivo; tokens inválidos limpos automaticamente"],
      ]},
    ],
  },
  {
    id: "sharing",
    eyebrow: "— PARTILHA",
    title: "Com quem partilhamos os dados",
    blocks: [
      { type: "p", text: "Não vendemos nem cedemos dados a terceiros para fins de marketing. As únicas entidades envolvidas no processamento são:" },
      { type: "table", header: ["Subprocessador", "Função", "Localização"], rows: [
        ["Google (Firebase Auth + Firestore + FCM + Cloud Functions)", "Infraestrutura: autenticação, armazenamento de dados, push notifications, lembretes diários", "EU (region europe-west)"],
        ["Vercel", "Hosting da aplicação (HTML/CSS/JS estáticos)", "Global CDN — origem EU"],
        ["Resend (opcional)", "Envio de emails de lembrete (se activo)", "EU"],
      ]},
      { type: "callout", text: "Estes subprocessadores estão vinculados por contratos de processamento (DPA) e cumprem RGPD." },
    ],
  },
  {
    id: "rights",
    eyebrow: "— OS SEUS DIREITOS",
    title: "Que direitos tem sobre os seus dados",
    blocks: [
      { type: "list", items: [
        "Acesso — obter cópia dos seus dados",
        "Rectificação — corrigir dados incorrectos",
        "Apagamento — pedir eliminação (sujeito a obrigações legais de retenção)",
        "Portabilidade — receber os dados em formato estruturado (CSV/JSON)",
        "Oposição ao tratamento baseado em interesse legítimo",
        "Limitação do tratamento",
        "Retirar consentimento (push notifications, etc.) em qualquer momento",
        "Reclamar à CNPD (https://www.cnpd.pt) se considerar que os seus direitos foram violados",
      ]},
      { type: "p", text: `Para exercer qualquer destes direitos, envie email para ${CONTROLLER.email} com prova de identidade. Respondemos em até 30 dias.` },
    ],
  },
  {
    id: "security",
    eyebrow: "— SEGURANÇA",
    title: "Como protegemos os dados",
    blocks: [
      { type: "list", items: [
        "Comunicação cifrada em trânsito (HTTPS/TLS)",
        "Armazenamento cifrado em repouso (Firestore + Google Cloud)",
        "Firestore Security Rules com princípio de menor privilégio (verificadas no servidor)",
        "Log de auditoria append-only — quem fez o quê e quando",
        "Autenticação por Firebase Auth (passwords nunca tocam o nosso servidor)",
        "Service Worker apenas com acesso a recursos do próprio domínio (PWA)",
        "Backups automáticos diários (Firebase)",
        "Acesso ao painel administrativo restrito a contas com role=director",
      ]},
    ],
  },
  {
    id: "cookies",
    eyebrow: "— COOKIES",
    title: "Cookies e tecnologias similares",
    blocks: [
      { type: "p", text: "Usamos armazenamento local (localStorage / IndexedDB) e cookies funcionais estritamente necessários:" },
      { type: "table", header: ["Item", "Finalidade", "Tipo"], rows: [
        ["Firebase Auth token", "Manter sessão iniciada", "Essencial"],
        ["psm.theme", "Lembrar preferência claro/escuro", "Funcional"],
        ["psm.parent.lastSeen.*", "Detectar pedidos respondidos desde última visita", "Funcional"],
        ["psm.push.dismissedUntil", "Não voltar a mostrar banner de push durante 7 dias", "Funcional"],
        ["psm.chunk.reloaded", "Auto-recovery após deploy novo", "Funcional"],
        ["IndexedDB Firestore cache", "Reduzir leituras + offline", "Funcional"],
        ["FCM service worker registration", "Receber notificações push (se autorizar)", "Consentimento"],
      ]},
      { type: "p", text: "Não usamos cookies de tracking nem de marketing. Não há terceiros que façam fingerprinting." },
    ],
  },
  {
    id: "minors",
    eyebrow: "— MENORES",
    title: "Dados de crianças",
    blocks: [
      { type: "p", text: "Os principais titulares dos dados clínicos da plataforma são crianças. O tratamento ocorre sempre com base no consentimento explícito do(s) titular(es) das responsabilidades parentais, no contexto da prestação do serviço clínico." },
      { type: "p", text: "As crianças não criam conta diretamente. O acesso aos seus dados é feito pelos pais/responsáveis (no Portal Responsável) e pelos profissionais atribuídos." },
    ],
  },
  {
    id: "changes",
    eyebrow: "— ALTERAÇÕES",
    title: "Atualizações a esta política",
    blocks: [
      { type: "p", text: "Esta política pode ser actualizada para reflectir alterações legais ou da plataforma. A versão e data de actualização aparecem no topo da página." },
      { type: "p", text: "Em alterações materiais (novos subprocessadores, novos tipos de dados, mudança de finalidades) avisamos por anúncio no portal e/ou email." },
    ],
  },
  {
    id: "contact",
    eyebrow: "— CONTACTO",
    title: "Como falar connosco",
    blocks: [
      { type: "kv", rows: [
        ["Email RGPD", CONTROLLER.email],
        ["Website", `https://${CONTROLLER.website}`],
        ["Versão da app", APP_VERSION],
        ["Build da app", formatBuildDate()],
        ["Versão desta política", PRIVACY_VERSION],
        ["Última actualização", PRIVACY_LAST_UPDATE],
      ]},
    ],
  },
];
