import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../lib/store.jsx";
import { Btn, Card, Eyebrow, Section, Av, Tag } from "../../lib/ui.jsx";
import { Icon } from "../../lib/icons.jsx";
import { RL } from "../../lib/constants.js";

export default function Users() {
  const { users, setForm, setModal, profile } = useStore();
  const navigate = useNavigate();

  return (
    <div style={{ padding: "28px 40px 60px" }}>
      <Section eyebrow={`— ${users.length} CONTAS`} title="Utilizadores" sub="Gerir acessos à plataforma"
        right={<Btn icon={<Icon name="plus" size={16} />} onClick={() => { setForm({}); setModal("invite"); }}>Convidar</Btn>} />
      <Card pad={0}>
        <div style={{ display: "grid", gridTemplateColumns: "60px 2fr 2fr 1fr 1fr", padding: "14px 20px", background: "#EFEBE2", borderBottom: "1px solid #E5E0D4" }}>
          <Eyebrow>&nbsp;</Eyebrow><Eyebrow>Nome</Eyebrow><Eyebrow>Email/Utilizador</Eyebrow><Eyebrow>Papel</Eyebrow><Eyebrow>Estado</Eyebrow>
        </div>
        {users.map((u, i) => (
          <div key={u.id} className="ch" onClick={() => navigate(`/utilizadores/${u.id}`)} style={{
            display: "grid", gridTemplateColumns: "60px 2fr 2fr 1fr 1fr",
            padding: "14px 20px", alignItems: "center", cursor: "pointer",
            borderBottom: i < users.length - 1 ? "1px solid #EFEBE2" : "none",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#FBF9F4"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
            <Av t={u.full_name?.split(" ").map((w) => w[0]).join("").slice(0, 2) || "?"} bg={u.role === "director" ? "#EFEBE2" : u.role === "professional" ? "#C7DDCB" : "#DCE7F0"} sz={36} />
            <span style={{ fontSize: 14, fontWeight: 500, color: "#152741" }}>{u.full_name || "—"}{u.email === profile?.email && <span style={{ fontSize: 11, color: "#8A8A86", marginLeft: 8, fontWeight: 400 }}>(tu)</span>}</span>
            <span style={{ fontSize: 13.5, color: "#5A5A58" }}>{u.email}</span>
            <span><Tag type={u.role}>{RL[u.role] || u.role}</Tag></span>
            <span>{u.active === false ? <Tag type="pendente">Inativo</Tag> : <Tag type="sage">Ativo</Tag>}</span>
          </div>
        ))}
        {users.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#8A8A86", fontSize: 14 }}>Sem utilizadores.</div>}
      </Card>
    </div>
  );
}

export function UserDetail() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { users, profile, changeRole, removeUser, toggleUserActive } = useStore();
  const u = users.find((x) => x.id === uid);

  if (!u) return (
    <div style={{ padding: "28px 40px" }}>
      <button onClick={() => navigate("/utilizadores")} className="ch" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "#5A5A58", marginBottom: 18, padding: "6px 0" }}>
        <Icon name="back" size={16} /> Voltar
      </button>
      <Card pad={28} style={{ textAlign: "center", color: "#8A8A86" }}>Utilizador não encontrado.</Card>
    </div>
  );

  return (
    <div style={{ padding: "28px 40px 60px" }}>
      <button onClick={() => navigate("/utilizadores")} className="ch" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "#5A5A58", marginBottom: 18, padding: "6px 0" }}>
        <Icon name="back" size={16} /> Voltar a utilizadores
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }}>
        <Card pad={28} style={{ textAlign: "center", height: "fit-content" }}>
          <Av t={u.full_name?.split(" ").map((w) => w[0]).join("").slice(0, 2) || "?"} bg={u.role === "director" ? "#EFEBE2" : "#DCE7F0"} sz={88} />
          <div className="serif" style={{ fontSize: 24, fontWeight: 300, color: "#152741", marginTop: 16, letterSpacing: "-0.02em" }}>{u.full_name}</div>
          <div style={{ fontSize: 13.5, color: "#8A8A86", marginTop: 4 }}>{u.email}</div>
          <div style={{ marginTop: 14, display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}>
            <Tag type={u.role}>{RL[u.role]}</Tag>
            {u.active === false && <Tag type="pendente">Inativo</Tag>}
          </div>
          {u.email !== profile?.email && (
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #EFEBE2", display: "flex", flexDirection: "column", gap: 10 }}>
              {u.active === false
                ? <Btn variant="primary" size="sm" icon={<Icon name="check" size={14} />} onClick={() => toggleUserActive(u.id, true)} style={{ width: "100%" }}>Reativar utilizador</Btn>
                : <Btn variant="secondary" size="sm" icon={<Icon name="shield" size={14} />} onClick={() => toggleUserActive(u.id, false)} style={{ width: "100%" }}>Desativar utilizador</Btn>}
              <Btn variant="danger" size="sm" icon={<Icon name="trash" size={14} />}
                onClick={() => { if (confirm("Remover este utilizador? Esta ação apaga o perfil de forma permanente.")) { removeUser(u.id); navigate("/utilizadores"); } }}
                style={{ width: "100%" }}>Remover utilizador</Btn>
            </div>
          )}
        </Card>
        <div>
          <Section eyebrow="— PERMISSÕES" title="Alterar papel" sub="Define o nível de acesso da plataforma" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {["parent", "professional", "director"].map((r) => (
              <Card key={r} pad={18} onClick={() => changeRole(u.id, r)} style={{
                cursor: "pointer", textAlign: "center",
                background: u.role === r ? "#152741" : "#FBF9F4",
                borderColor: u.role === r ? "#152741" : "#E5E0D4",
              }}>
                <div style={{ color: u.role === r ? "#E8A13C" : "#152741", marginBottom: 8, display: "flex", justifyContent: "center" }}>
                  <Icon name={r === "director" ? "shield" : r === "professional" ? "users" : "home"} size={22} />
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 500, color: u.role === r ? "#F7F4EE" : "#152741" }}>{RL[r]}</div>
                {u.role === r && <div className="mono" style={{ color: "#E8A13C", marginTop: 6 }}>— ATIVO</div>}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
