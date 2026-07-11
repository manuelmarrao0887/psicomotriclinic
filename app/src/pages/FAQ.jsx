import { useNavigate } from "react-router-dom";
import { Icon, Mark } from "../lib/icons.jsx";
import { Av, Btn, Card, Eyebrow } from "../lib/ui.jsx";

// FAQ / Perguntas Frequentes — versão brand aligned para a plataforma
// A Casa da Psicomotricidade. Rota: /faq
// Design inspirado no padrão FAQSimple01 (Untitled UI) mas com Icon lib
// interno + tokens do projeto (navy #152741, amber #E8A13C).

const FAQS = [
  {
    question: "O que é a psicomotricidade?",
    answer: "É uma prática que trabalha o corpo, o movimento e a expressão para promover o desenvolvimento cognitivo, emocional e motor. Ajuda em coordenação, atenção, autoregulação e relação com os outros.",
    icon: "heart",
  },
  {
    question: "Como funcionam as sessões?",
    answer: "Cada paciente tem uma sessão semanal fixa (mesmo dia e hora) com o seu profissional atribuído. As sessões são individuais ou em grupo, conforme o plano combinado.",
    icon: "clock",
  },
  {
    question: "Posso pedir troca de horário?",
    answer: "Sim. No Portal Responsável, no separador Pedidos, envia um pedido com novo dia e hora. A direção clínica valida e responde nas 48 horas seguintes.",
    icon: "swap",
  },
  {
    question: "E se faltar a uma sessão?",
    answer: "Comunique com antecedência. Faltas comunicadas com mais de 24 horas podem ser repostas mediante disponibilidade. Faltas não comunicadas são cobradas.",
    icon: "x",
  },
  {
    question: "Como pago as sessões?",
    answer: "O pagamento é mensal, gerido pelo profissional que acompanha o seu filho. Aparece no Portal Responsável no dashboard. Aceitamos transferência, MB WAY e numerário.",
    icon: "wallet",
  },
  {
    question: "Recebo relatórios de evolução?",
    answer: "Sim. Relatórios semestrais completos partilhados no Portal Responsável, além do resumo de cada sessão que fica disponível para consulta a qualquer momento.",
    icon: "clipboard",
  },
  {
    question: "As sessões têm comparticipação?",
    answer: "ADSE, SAMS e ADM comparticipam parte do valor. Fornecemos recibo mensal com o código de acto médico correspondente para submeter no seu subsistema.",
    icon: "shield",
  },
  {
    question: "Como contacto o profissional entre sessões?",
    answer: "No Portal Responsável, cada filho tem um botão Falar que abre um canal direto com o profissional. Uma mensagem de cada vez, resposta habitual em 24-48 horas.",
    icon: "mail",
  },
  {
    question: "Exercícios para praticar em casa?",
    answer: "O profissional pode atribuir exercícios semanais que aparecem no separador Casa do Portal Responsável. Marca como concluído para acompanhar o progresso.",
    icon: "trend",
  },
];

export default function FAQ() {
  const nav = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "#F7F9FB", paddingBottom: 60 }}>
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        paddingTop: "var(--safe-top)",
        background: "rgba(255,255,255,.88)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderBottom: "1px solid rgba(234,230,221,.6)",
      }}>
        <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", maxWidth: 1100, margin: "0 auto" }}>
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
          <div style={{ width: 60 }} />
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px 20px", textAlign: "center" }}>
        <Eyebrow>— PERGUNTAS FREQUENTES</Eyebrow>
        <h1 className="serif" style={{ fontSize: 40, fontWeight: 300, color: "#152741", letterSpacing: "-0.025em", lineHeight: 1.05, marginTop: 10, maxWidth: 640, marginLeft: "auto", marginRight: "auto" }}>
          Tudo o que precisa de saber<span className="serif-it">.</span>
        </h1>
        <p style={{ fontSize: 16, color: "#5A5A58", marginTop: 12, maxWidth: 560, marginLeft: "auto", marginRight: "auto", lineHeight: 1.55 }}>
          Sessões, pagamentos, faltas, contactos. Se não encontrar aqui a resposta, fale connosco.
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
        <dl style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "40px 32px",
          margin: "48px 0",
        }}>
          {FAQS.map((f) => (
            <div key={f.question} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", maxWidth: 340, margin: "0 auto" }}>
              <div style={{
                width: 48, height: 48, borderRadius: 10,
                background: "#F5F2EC",
                border: "1px solid #EAE6DD",
                color: "#152741",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 1px 2px rgba(21,39,65,.05)",
              }}>
                <Icon name={f.icon} size={22} />
              </div>
              <dt style={{ marginTop: 16, fontSize: 17, fontWeight: 600, color: "#152741", letterSpacing: "-0.01em" }}>
                {f.question}
              </dt>
              <dd style={{ marginTop: 6, fontSize: 14.5, color: "#5A5A58", lineHeight: 1.55 }}>
                {f.answer}
              </dd>
            </div>
          ))}
        </dl>

        <div style={{
          marginTop: 48,
          background: "#FFFFFF",
          borderRadius: 20,
          border: "1px solid #EAE6DD",
          padding: "40px 32px 44px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
          textAlign: "center",
        }}>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <div style={{ marginRight: -14 }}>
              <Av t="AM" bg="#DCE7F0" sz={48} color="#152741" />
            </div>
            <div style={{ zIndex: 2, boxShadow: "0 0 0 2px #FFFFFF", borderRadius: 999 }}>
              <Av t="RS" bg="#F5D9A8" sz={60} color="#C97A1F" />
            </div>
            <div style={{ marginLeft: -14 }}>
              <Av t="MP" bg="#C7DDCB" sz={48} color="#2E5B3A" />
            </div>
          </div>
          <div>
            <h4 className="serif" style={{ fontSize: 24, fontWeight: 400, color: "#152741", letterSpacing: "-0.02em" }}>
              Ainda tem dúvidas?
            </h4>
            <p style={{ marginTop: 8, fontSize: 15, color: "#5A5A58", maxWidth: 480, lineHeight: 1.55 }}>
              Não encontra a resposta que procura? A equipa da Casa está disponível para o ajudar.
            </p>
          </div>
          <Btn onClick={() => { window.location.href = "mailto:geral@acasadapsicomotricidade.pt"; }}>
            Falar connosco
          </Btn>
        </div>
      </div>
    </div>
  );
}
