import { Link } from "react-router-dom";
import { Mark } from "../lib/icons.jsx";
import { Card, Eyebrow } from "../lib/ui.jsx";

export default function Privacy() {
  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", padding: "40px 24px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <Mark size={36} />
          <div className="serif" style={{ fontSize: 28, fontWeight: 300, color: "#152741", letterSpacing: "-0.02em" }}>Política de Privacidade</div>
        </div>
        <Card pad={28}>
          <Eyebrow>— RGPD · A CASA DA PSICOMOTRICIDADE</Eyebrow>

          <h3 style={{ marginTop: 18, fontSize: 16, fontWeight: 600, color: "#152741" }}>1. Responsável pelo tratamento</h3>
          <p style={{ fontSize: 13.5, color: "#3C3C3B", marginTop: 6, lineHeight: 1.65 }}>
            A Casa da Psicomotricidade · Psicomotriclinic, com sede em Portugal, é a entidade responsável pelo tratamento dos dados pessoais introduzidos na plataforma. Para qualquer questão relacionada com dados pessoais, contacte: <b>manuelsousamarrao@gmail.com</b>.
          </p>

          <h3 style={{ marginTop: 18, fontSize: 16, fontWeight: 600, color: "#152741" }}>2. Dados recolhidos</h3>
          <p style={{ fontSize: 13.5, color: "#3C3C3B", marginTop: 6, lineHeight: 1.65 }}>
            Conta de utilizador (nome, email/identificador, papel), dados clínicos do paciente (nome, idade, contactos dos responsáveis, anamnese, notas de sessão, plano de intervenção), dados financeiros (pagamentos, recibos) e dados de acesso (registo de visitas para fins de auditoria).
          </p>

          <h3 style={{ marginTop: 18, fontSize: 16, fontWeight: 600, color: "#152741" }}>3. Finalidades</h3>
          <p style={{ fontSize: 13.5, color: "#3C3C3B", marginTop: 6, lineHeight: 1.65 }}>
            Prestação dos serviços terapêuticos, gestão clínica e administrativa da clínica, faturação e obrigações fiscais. <b>Os dados não são partilhados com terceiros</b> sem o seu consentimento explícito.
          </p>

          <h3 style={{ marginTop: 18, fontSize: 16, fontWeight: 600, color: "#152741" }}>4. Dados clínicos de menores</h3>
          <p style={{ fontSize: 13.5, color: "#3C3C3B", marginTop: 6, lineHeight: 1.65 }}>
            Os dados clínicos relativos a menores são tratados com sigilo profissional. O acesso é restrito à direção da clínica e aos profissionais responsáveis pelo caso. Todas as ações sobre estes dados ficam registadas no log de auditoria.
          </p>

          <h3 style={{ marginTop: 18, fontSize: 16, fontWeight: 600, color: "#152741" }}>5. Conservação</h3>
          <p style={{ fontSize: 13.5, color: "#3C3C3B", marginTop: 6, lineHeight: 1.65 }}>
            Os dados clínicos são conservados pelo período legalmente exigido para registos de saúde. Os dados financeiros são conservados pelo período fiscal legalmente exigido (atualmente 10 anos em Portugal).
          </p>

          <h3 style={{ marginTop: 18, fontSize: 16, fontWeight: 600, color: "#152741" }}>6. Os seus direitos</h3>
          <p style={{ fontSize: 13.5, color: "#3C3C3B", marginTop: 6, lineHeight: 1.65 }}>
            Pode pedir acesso, retificação, eliminação, oposição ou portabilidade dos seus dados a qualquer momento, contactando o endereço acima. Tem também o direito de apresentar reclamação à CNPD (Comissão Nacional de Proteção de Dados).
          </p>

          <h3 style={{ marginTop: 18, fontSize: 16, fontWeight: 600, color: "#152741" }}>7. Segurança</h3>
          <p style={{ fontSize: 13.5, color: "#3C3C3B", marginTop: 6, lineHeight: 1.65 }}>
            A plataforma utiliza a infraestrutura Firebase (Google Cloud, Europa) com autenticação, regras de acesso baseadas em papéis e tráfego cifrado em HTTPS. Acessos sensíveis (consulta de dados clínicos, alterações administrativas) são registados.
          </p>

          <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid #F5F2EC", fontSize: 12, color: "#8A8A86" }}>
            Última atualização: 2026-05-23 · Versão 1.0
          </div>
        </Card>
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13.5, color: "#8A8A86" }}>
          <Link to="/login" style={{ color: "#152741", textDecoration: "underline" }}>Voltar ao início</Link>
        </div>
      </div>
    </div>
  );
}
