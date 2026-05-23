import { useStore } from "../../lib/store.jsx";
import { Btn, Card, Eyebrow, Section } from "../../lib/ui.jsx";
import { Icon } from "../../lib/icons.jsx";
import { ADMIN_EMAIL } from "../../lib/firebase.js";
import { APP_VERSION } from "../../lib/constants.js";

export default function Settings({ theme, setTheme }) {
  const { setForm, setModal } = useStore();

  const actions = [
    { t: "Convidar utilizador",          d: "Criar conta e enviar credenciais de acesso",   ic: "mail",      ac: "#EFEBE2", m: "invite" },
    { t: "Adicionar profissional",       d: "Registar novo terapeuta na equipa",              ic: "users",     ac: "#C7DDCB", m: "addProf" },
    { t: "Novo paciente",                d: "Abrir caso clínico e definir horário",           ic: "clipboard", ac: "#DCE7F0", m: "addPatient" },
    { t: "Registar pagamento",           d: "Recibo emitido ou cobrança pendente",            ic: "wallet",    ac: "#F5D9A8", m: "addPayment" },
    { t: "Alterar a minha password",     d: "Definir uma nova password para a sua conta",     ic: "shield",    ac: "#B9CDE0", m: "myPassword" },
  ];

  return (
    <div style={{ padding: "28px 40px 60px" }}>
      <Section eyebrow="— ACÇÕES RÁPIDAS" title="O que queres fazer?" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
        {actions.map((a, i) => (
          <Card key={a.m} delay={i * 40} pad={22} onClick={() => { setForm({}); setModal(a.m); }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: a.ac, color: "#152741", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={a.ic} size={22} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: "#152741" }}>{a.t}</div>
                <div style={{ fontSize: 13, color: "#8A8A86", marginTop: 3 }}>{a.d}</div>
              </div>
              <div style={{ color: "#B9CDE0" }}><Icon name="arr" size={16} /></div>
            </div>
          </Card>
        ))}
      </div>

      <Section eyebrow="— APARÊNCIA" title="Visual" />
      <Card pad={22}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#152741" }}>Modo escuro</div>
            <div style={{ fontSize: 13, color: "#8A8A86", marginTop: 3 }}>Alternar entre tema claro e escuro.</div>
          </div>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="ch" aria-label="Alternar modo escuro" style={{
            width: 52, height: 30, borderRadius: 15, border: "none", cursor: "pointer", padding: 3,
            background: theme === "dark" ? "#152741" : "#D9D3C5",
            display: "flex", alignItems: "center",
            justifyContent: theme === "dark" ? "flex-end" : "flex-start",
            transition: "background .2s",
          }}>
            <span style={{ width: 24, height: 24, borderRadius: 12, background: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", color: "#152741" }}>
              <Icon name={theme === "dark" ? "shield" : "home"} size={13} />
            </span>
          </button>
        </div>
      </Card>

      <Section eyebrow="— SISTEMA" title="Sobre" />
      <Card pad={26}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          <div><Eyebrow>VERSÃO</Eyebrow><div style={{ fontSize: 15, color: "#152741", marginTop: 6, fontWeight: 500 }}>{APP_VERSION}</div></div>
          <div><Eyebrow>ADMINISTRADOR</Eyebrow><div style={{ fontSize: 15, color: "#152741", marginTop: 6, fontWeight: 500 }}>{ADMIN_EMAIL}</div></div>
          <div><Eyebrow>WEB</Eyebrow><div style={{ fontSize: 15, color: "#152741", marginTop: 6, fontWeight: 500 }}>acasadapsicomotricidade.pt</div></div>
        </div>
      </Card>
    </div>
  );
}
