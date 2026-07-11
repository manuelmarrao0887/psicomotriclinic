import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon, Mark } from "../lib/icons.jsx";
import { Eyebrow, Card } from "../lib/ui.jsx";

// Manual de utilização — 3 secções por perfil: Diretor / Profissional /
// Responsável. Cada secção lista procedimentos passo-a-passo. Barra
// lateral com âncoras. Print-friendly.

const SECTIONS = [
  {
    id: "geral",
    title: "Geral",
    role: "todos",
    color: "#8DBF94",
    intro: "Fundamentos comuns a qualquer utilizador da plataforma — login, perfil, notificações.",
    items: [
      {
        title: "Entrar na plataforma",
        steps: [
          "Abrir app.acasadapsicomotricidade.pt no navegador.",
          "Introduzir email e password. Alternativa: botão Continuar com Google.",
          "Primeiro login obrigatório: aceitar Política de Privacidade e definir password.",
        ],
      },
      {
        title: "Editar foto de perfil",
        steps: [
          "Aceder ao separador Conta (portal) ou clicar no perfil da sidebar (admin).",
          "Clicar na foto atual → escolher ficheiro. Formatos: JPG/PNG, redimensionado para 256×256px.",
          "Alternativa: remover foto atual pelo menu (…).",
        ],
      },
      {
        title: "Alternar mobile / desktop manualmente",
        steps: [
          "Clicar no chip navy circular no canto inferior direito (só nos portais Responsável e Profissional).",
          "Escolher Automático (segue viewport), Mobile ou Desktop.",
          "Escolha fica gravada por navegador em localStorage.",
        ],
      },
      {
        title: "Ativar / desativar notificações",
        steps: [
          "Portais: separador Conta → Preferências de notificação. Ligar/desligar por tipo.",
          "Primeiro toggle ativo → o navegador pede permissão de notificações.",
          "Notificações web funcionam quando a app está instalada (PWA — Adicionar ao ecrã principal).",
        ],
      },
    ],
  },
  {
    id: "diretor",
    title: "Diretor",
    role: "Diretor",
    color: "#E8A13C",
    intro: "Gestão clínica, financeira e de equipa. Acesso total à sidebar admin.",
    items: [
      {
        title: "Dashboard — leitura diária",
        steps: [
          "Verificar Hero: saudação + sessões de hoje + pendências (pedidos, faltas, pagamentos).",
          "Pulso da semana: carga por dia útil. Hoje aparece em âmbar.",
          "InsightsPanel (lateral): MRR médio 3M, crescimento M/M, top-3 profs, vagas potenciais.",
          "Aniversários próximos 30 dias: clicar abre ficha do paciente.",
        ],
      },
      {
        title: "Adicionar paciente",
        steps: [
          "Menu Pacientes → botão Novo paciente.",
          "Preencher: nome, data nascimento, dia/hora recorrente, profissional atribuído.",
          "Opcional: responsáveis (email para vínculo), sistema comparticipação (ADSE / SAMS / ADM), mensalidade.",
          "Guardar → paciente aparece na grelha e é visível ao seu profissional atribuído.",
        ],
      },
      {
        title: "Convidar utilizador",
        steps: [
          "Menu Utilizadores → botão Convidar.",
          "Introduzir email e escolher role: Responsável / Profissional / Diretor.",
          "Sistema gera password temporária e envia email (ou copia-cola manual se falhar).",
          "Utilizador troca password no primeiro login.",
        ],
      },
      {
        title: "Aprovar pedido de troca",
        steps: [
          "Menu Pedidos → seleccionar pedido pendente (badge indica número).",
          "Ver detalhes: paciente, horário atual, horário pedido, motivo.",
          "Aprovar / Recusar → responsável recebe notificação e vê o resultado no seu portal.",
        ],
      },
      {
        title: "Registar custos do espaço",
        steps: [
          "Menu Financeiro → card Custos & Rendimentos do espaço → botões overheads / vc-{mês}.",
          "Overheads: renda mensal, garagem (nº lugares × valor).",
          "Custos variáveis por mês: luz, água, telecom.",
          "Card lateral calcula automaticamente resultado do espaço (garagem − renda − variáveis).",
        ],
      },
      {
        title: "Publicar anúncio",
        steps: [
          "Menu Comunicações → botão Novo anúncio.",
          "Escolher audience: Todos / Responsáveis / Profissionais.",
          "Definir período visível (opcional) e escrever título + corpo.",
          "Guardar → anúncio aparece no topo do dashboard dos alvos.",
        ],
      },
      {
        title: "Ver o meu consultório (director-também-pro)",
        steps: [
          "Ligar o utilizador Diretor a um registo em Equipa (professionals.profile_id).",
          "Após ligação, sidebar admin ganha secção MEU CONSULTÓRIO com atalho Meu financeiro.",
          "Vista pessoal separada do agregado da Casa (menu Financeiro).",
        ],
      },
    ],
  },
  {
    id: "profissional",
    title: "Profissional",
    role: "Profissional",
    color: "#B9CDE0",
    intro: "Gestão dos próprios pacientes, notas de sessão, exercícios em casa e pagamentos.",
    items: [
      {
        title: "Registar nota de sessão",
        steps: [
          "Portal Profissional → separador Início ou Pacientes.",
          "Na lista de sessões de hoje: clicar botão Nota → Realizada / Falta / Cancelada.",
          "Preencher: domínios trabalhados, trabalho realizado, evolução observada, próximo foco.",
          "Guardar → nota fica visível ao responsável (com termos técnicos anotados via glossário).",
        ],
      },
      {
        title: "Marcar falta rápida",
        steps: [
          "Portal Profissional → Início → sessão de hoje → botão Falta (ao lado de Nota).",
          "Regista automaticamente status=falta sem preencher domínios/observações.",
        ],
      },
      {
        title: "Atribuir exercícios em casa",
        steps: [
          "Portal Profissional → separador Pacientes → escolher paciente → aba Casa.",
          "Ver Biblioteca (curada pelo diretor) → clicar em Atribuir.",
          "Definir frequência recomendada. Responsável vê no separador Casa do seu portal e marca conclusão.",
        ],
      },
      {
        title: "Responder a mensagem do responsável",
        steps: [
          "Portal Profissional → Início → card amarelo Mensagens por responder (só se houver).",
          "Clicar → modal com histórico e textarea.",
          "Enviar resposta → responsável recebe notificação (se prefs ligadas).",
        ],
      },
      {
        title: "Registar pagamento (Financeiro Pro)",
        steps: [
          "Portal Profissional → separador Financeiro (badge indica nº pendentes).",
          "Vista Mensal: filtro por mês + botão Novo registo.",
          "Preencher: paciente, mês, valor, estado (pago/pendente), método (Transferência / MB WAY / Numerário / Multibanco), notas opcionais.",
          "Guardar → aparece na lista com KPIs actualizados.",
        ],
      },
      {
        title: "Imprimir recibo",
        steps: [
          "Financeiro Pro → linha de pagamento com estado Pago → botão de recibo (ícone clipboard).",
          "Modal apresenta recibo formatado com paciente, mês, data, método, valor, notas.",
          "Botão Imprimir → CSS de impressão oculta tudo excepto o recibo.",
        ],
      },
      {
        title: "Vista Ano / IRS",
        steps: [
          "Financeiro Pro → switcher no topo → Ano / IRS.",
          "3 KPIs: ano recebido, comissão Casa 20%, valor líquido.",
          "Tabela mensal (nº pag., total, recebido, pendente) + card IRS resumo.",
          "Botão Exportar CSV — anual ou mensal — para submissão fiscal ou contabilista.",
        ],
      },
    ],
  },
  {
    id: "responsavel",
    title: "Responsável",
    role: "Responsável",
    color: "#F5D9A8",
    intro: "Acompanhamento do filho: sessões, evolução, exercícios em casa, contactos.",
    items: [
      {
        title: "Ver progresso do meu filho",
        steps: [
          "Portal Responsável → Início.",
          "Card do filho: profissional, dia/hora, estado do plano.",
          "Card Evolução: últimas 6 notas de sessão (data, progresso, trabalho feito, próximo foco).",
          "Termos técnicos com underline dotted âmbar mostram definição no hover/tap.",
        ],
      },
      {
        title: "Registar diário de comportamento",
        steps: [
          "Portal Responsável → Início → card do filho → botão Diário.",
          "Escolher humor (5 emojis), horas de sono, chips de eventos notáveis, preocupações.",
          "Guardar → fica visível ao profissional para preparar próxima sessão.",
        ],
      },
      {
        title: "Falar com o profissional",
        steps: [
          "Portal Responsável → card do filho → botão Falar.",
          "Escrever mensagem (1 por vez, aguarda resposta).",
          "Resposta habitual em 24-48 h. Notificação chega ao ligar Preferências → Mensagens.",
        ],
      },
      {
        title: "Pedir troca de horário",
        steps: [
          "Portal Responsável → separador Pedidos → botão Novo pedido.",
          "Escolher filho, novo dia, nova hora, motivo (opcional).",
          "Enviar → direção clínica responde nas 48 h seguintes. Estado visível no separador Pedidos.",
        ],
      },
      {
        title: "Marcar exercício em casa como feito",
        steps: [
          "Portal Responsável → separador Casa.",
          "Ver exercícios atribuídos pelo profissional. Cada card indica frequência recomendada.",
          "Checkbox Concluído → registo aparece no histórico do profissional.",
        ],
      },
      {
        title: "Ver histórico de pagamentos",
        steps: [
          "Portal Responsável → Início → card do filho mostra estado do mês corrente.",
          "Pagamentos são geridos pelo profissional que acompanha o filho.",
          "Para questões de facturação/comparticipação: usar botão Falar ou email geral@.",
        ],
      },
    ],
  },
];

export default function Manual() {
  const nav = useNavigate();
  const [active, setActive] = useState("geral");
  const activeSection = useMemo(() => SECTIONS.find((s) => s.id === active) || SECTIONS[0], [active]);

  return (
    <div style={{ minHeight: "100vh", background: "#F7F9FB" }}>
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        paddingTop: "var(--safe-top)",
        background: "rgba(255,255,255,.88)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderBottom: "1px solid rgba(234,230,221,.6)",
      }}>
        <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", maxWidth: 1200, margin: "0 auto" }}>
          <button onClick={() => nav(-1)} className="ch tap-target" aria-label="Voltar" style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", cursor: "pointer", color: "#152741", padding: "6px 8px", borderRadius: 8 }}>
            <Icon name="back" size={20} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Voltar</span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Mark size={26} />
            <span style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em", color: "#152741" }}>
              PSICOMOTRI<span style={{ fontWeight: 400 }}>CLINIC</span>
            </span>
          </div>
          <button onClick={() => window.print()} className="ch tap-target" aria-label="Imprimir" style={{ padding: 6, borderRadius: 8, color: "#152741", background: "transparent", border: "none", cursor: "pointer", display: "flex" }} title="Imprimir">
            <Icon name="clipboard" size={18} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 20px 20px" }}>
        <Eyebrow>— MANUAL DE UTILIZAÇÃO</Eyebrow>
        <h1 className="serif" style={{ fontSize: 40, fontWeight: 300, color: "#152741", letterSpacing: "-0.025em", lineHeight: 1.05, marginTop: 10 }}>
          Procedimentos passo-a-passo<span className="serif-it">.</span>
        </h1>
        <p style={{ fontSize: 15, color: "#5A5A58", marginTop: 8, maxWidth: 640, lineHeight: 1.55 }}>
          Guia dividido por perfil. Cada procedimento é uma sequência de passos concretos. Ideal para consultar em cima do teclado ou imprimir para dar à equipa.
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 60px", display: "grid", gridTemplateColumns: "240px 1fr", gap: 32 }} className="manual-body">
        {/* Nav lateral */}
        <aside className="manual-nav" style={{ position: "sticky", top: 80, alignSelf: "flex-start" }}>
          <div className="mono" style={{ fontSize: 9.5, letterSpacing: ".14em", fontWeight: 700, color: "#8A8A86", padding: "0 8px 8px" }}>— SECÇÕES</div>
          {SECTIONS.map((s) => {
            const isActive = active === s.id;
            return (
              <button key={s.id} onClick={() => setActive(s.id)} className="ch" style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "10px 12px", borderRadius: 10,
                background: isActive ? "#FFFFFF" : "transparent",
                border: isActive ? "1px solid #EAE6DD" : "1px solid transparent",
                color: "#152741", fontSize: 14, fontWeight: isActive ? 600 : 400,
                cursor: "pointer", textAlign: "left", fontFamily: "inherit", marginBottom: 2,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: s.color, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{s.title}</span>
                <span className="mono" style={{ fontSize: 9.5, color: "#8A8A86" }}>{s.items.length}</span>
              </button>
            );
          })}
          <div style={{ marginTop: 20, padding: "12px 12px", background: "#FFFFFF", borderRadius: 10, border: "1px solid #EAE6DD", fontSize: 12, color: "#5A5A58", lineHeight: 1.55 }}>
            <b style={{ color: "#152741" }}>Dúvidas?</b><br />
            FAQ pública em <button onClick={() => nav("/faq")} className="ch" style={{ background: "transparent", border: "none", color: "#E8A13C", fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: "inherit", fontSize: 12 }}>/faq</button>. Testes em <button onClick={() => nav("/testes")} className="ch" style={{ background: "transparent", border: "none", color: "#E8A13C", fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: "inherit", fontSize: 12 }}>/testes</button>.
          </div>
        </aside>

        {/* Conteúdo secção */}
        <main>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: activeSection.color }} />
            <Eyebrow>— {activeSection.role.toUpperCase()}</Eyebrow>
          </div>
          <h2 className="serif" style={{ fontSize: 30, fontWeight: 300, color: "#152741", letterSpacing: "-0.025em", marginBottom: 8 }}>
            {activeSection.title}
          </h2>
          <p style={{ fontSize: 14.5, color: "#5A5A58", marginBottom: 24, lineHeight: 1.55, maxWidth: 640 }}>
            {activeSection.intro}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {activeSection.items.map((it, idx) => (
              <Card key={idx} pad={22}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
                  <div className="serif" style={{ fontSize: 22, fontWeight: 300, color: activeSection.color, minWidth: 32 }}>
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <h3 className="serif" style={{ fontSize: 20, fontWeight: 400, color: "#152741", letterSpacing: "-0.02em", lineHeight: 1.25, marginTop: 2 }}>
                    {it.title}
                  </h3>
                </div>
                <ol style={{ margin: 0, paddingLeft: 48, listStyle: "decimal", color: "#3C3C3B", fontSize: 14, lineHeight: 1.6 }}>
                  {it.steps.map((step, si) => (
                    <li key={si} style={{ marginBottom: 6 }}>{step}</li>
                  ))}
                </ol>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
