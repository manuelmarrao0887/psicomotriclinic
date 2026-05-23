import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../lib/store.jsx";
import { Btn, Card, Eyebrow, Section, Av, Tag } from "../../lib/ui.jsx";
import { Icon } from "../../lib/icons.jsx";

const Row = ({ label, value }) => (
  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", padding: "8px 0", borderTop: "1px solid #EFEBE2", fontSize: 13.5 }}>
    <span style={{ color: "#8A8A86" }}>{label}</span>
    <span style={{ color: "#152741" }}>{value || "—"}</span>
  </div>
);

export default function Patients() {
  const { pts, profs, setForm, setModal } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const filtered = pts.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: "28px 40px 60px" }}>
      <Section eyebrow="— CASOS" title={`Pacientes · ${pts.length}`} sub="Acompanhamentos em curso"
        right={<>
          <div style={{ position: "relative", width: 260 }}>
            <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#8A8A86", display: "flex" }}><Icon name="search" size={16} /></div>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Procurar paciente…" style={{ width: "100%", padding: "10px 14px 10px 40px", borderRadius: 10, border: "1px solid #D9D3C5", fontSize: 14, background: "#FBF9F4" }} />
          </div>
          <Btn variant="secondary" icon={<Icon name="copy" size={15} />} onClick={() => { setForm({}); setModal("bulkPatient"); }}>Importar</Btn>
          <Btn icon={<Icon name="plus" size={16} />} onClick={() => { setForm({}); setModal("addPatient"); }}>Novo paciente</Btn>
        </>} />
      <Card pad={0}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 80px 2fr 2fr 1.2fr 1fr", padding: "14px 20px", background: "#EFEBE2", borderBottom: "1px solid #E5E0D4" }}>
          <Eyebrow>Nome</Eyebrow><Eyebrow>Idade</Eyebrow><Eyebrow>Profissional</Eyebrow><Eyebrow>Horário</Eyebrow><Eyebrow>Tipo</Eyebrow><Eyebrow>&nbsp;</Eyebrow>
        </div>
        {filtered.map((p, i) => {
          const ids = (p.professional_ids && p.professional_ids.length) ? p.professional_ids : (p.professional_id ? [p.professional_id] : []);
          const names = ids.map((id) => profs.find((x) => x.id === id)?.name).filter(Boolean).join(" · ") || "—";
          return (
            <div key={p.id} className="ch" onClick={() => navigate(`/pacientes/${p.id}`)} style={{
              display: "grid", gridTemplateColumns: "2fr 80px 2fr 2fr 1.2fr 1fr",
              padding: "14px 20px", alignItems: "center", cursor: "pointer",
              borderBottom: i < filtered.length - 1 ? "1px solid #EFEBE2" : "none",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#FBF9F4"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#152741" }}>{p.name}</span>
              <span style={{ fontSize: 13.5, color: "#5A5A58" }}>{p.age}</span>
              <span style={{ fontSize: 13.5, color: "#5A5A58" }}>{names}</span>
              <span style={{ fontSize: 13.5, color: "#5A5A58" }}>{p.day_of_week} · {p.hour}</span>
              <span><Tag type={p.session_type === "individual" ? "sage" : "amber"}>{p.session_type === "individual" ? "Individual" : "Grupo"}</Tag></span>
              <span style={{ textAlign: "right", color: "#B9CDE0" }}><Icon name="arr" size={16} /></span>
            </div>
          );
        })}
        {filtered.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#8A8A86", fontSize: 14 }}>{search ? "Sem resultados para a procura." : "Sem pacientes. Use \"Novo paciente\"."}</div>}
      </Card>
    </div>
  );
}

export function PatientDetail() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { pts, profs, pays, deletePatient, setForm, setModal } = useStore();
  const pt = pts.find((x) => x.id === patientId);

  if (!pt) return (
    <div style={{ padding: "28px 40px" }}>
      <button onClick={() => navigate("/pacientes")} className="ch" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "#5A5A58", marginBottom: 18, padding: "6px 0" }}>
        <Icon name="back" size={16} /> Voltar
      </button>
      <Card pad={28} style={{ textAlign: "center", color: "#8A8A86" }}>Paciente não encontrado.</Card>
    </div>
  );

  const ids = (pt.professional_ids && pt.professional_ids.length) ? pt.professional_ids : (pt.professional_id ? [pt.professional_id] : []);
  const profNames = ids.map((id) => profs.find((x) => x.id === id)?.name).filter(Boolean).join(" · ") || "—";
  const myPays = pays.filter((p) => p.patient_id === pt.id);
  const ini = pt.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ padding: "28px 40px 60px" }}>
      <button onClick={() => navigate("/pacientes")} className="ch" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "#5A5A58", marginBottom: 18, padding: "6px 0" }}>
        <Icon name="back" size={16} /> Voltar a pacientes
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }}>
        <Card pad={28} style={{ textAlign: "center", height: "fit-content" }}>
          <Av t={ini} bg="#DCE7F0" sz={88} />
          <div className="serif" style={{ fontSize: 24, fontWeight: 300, color: "#152741", marginTop: 16, letterSpacing: "-0.02em" }}>{pt.name}</div>
          <div style={{ fontSize: 13.5, color: "#8A8A86", marginTop: 4 }}>{pt.age} anos{pt.birth_date ? ` · ${new Date(pt.birth_date).toLocaleDateString("pt-PT")}` : ""}</div>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
            <Tag type={pt.session_type === "individual" ? "sage" : "amber"}>{pt.session_type === "individual" ? "Individual" : "Grupo"}</Tag>
            <Tag type="default">{pt.day_of_week} · {pt.hour}</Tag>
          </div>
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid #EFEBE2", display: "flex", flexDirection: "column", gap: 10 }}>
            <Btn size="sm" variant="secondary" icon={<Icon name="edit" size={14} />}
              onClick={() => {
                setForm({
                  editingId: pt.id,
                  name: pt.name, age: pt.age, prof: pt.professional_id,
                  profs: pt.professional_ids || (pt.professional_id ? [pt.professional_id] : []),
                  sessionType: pt.session_type, day: pt.day_of_week, hour: pt.hour,
                  nif: pt.nif, birth: pt.birth_date,
                  mother: pt.parent_mother, father: pt.parent_father,
                  doctor: pt.doctor, others: pt.other_profs,
                  insName: pt.insurance_name, insNum: pt.insurance_number,
                });
                setModal("addPatient");
              }}>Editar dados</Btn>
            <Btn size="sm" variant="secondary" icon={<Icon name="wallet" size={14} />} onClick={() => { setForm({ pt: pt.id }); setModal("addPayment"); }}>Registar pagamento</Btn>
            <Btn size="sm" variant="danger" icon={<Icon name="trash" size={14} />}
              onClick={() => { if (confirm(`Eliminar o paciente "${pt.name}"? Esta ação é permanente e apaga o caso clínico. Os pagamentos associados não são removidos.`)) { deletePatient(pt.id); navigate("/pacientes"); } }}>
              Eliminar paciente
            </Btn>
          </div>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Card pad={28}>
            <Eyebrow>— FAMÍLIA</Eyebrow>
            <div style={{ marginTop: 10 }}>
              <Row label="Nome da mãe" value={pt.parent_mother} />
              <Row label="Nome do pai" value={pt.parent_father} />
              <Row label="NIF" value={pt.nif} />
            </div>
          </Card>
          <Card pad={28}>
            <Eyebrow>— SAÚDE</Eyebrow>
            <div style={{ marginTop: 10 }}>
              <Row label="Médico" value={pt.doctor} />
              <Row label="Outros profissionais" value={pt.other_profs} />
              <Row label="Seguro de saúde" value={pt.insurance_name} />
              <Row label="Nº de seguro" value={pt.insurance_number} />
            </div>
          </Card>
          <Card pad={28}>
            <Eyebrow>— INTERVENÇÃO</Eyebrow>
            <div style={{ marginTop: 10 }}>
              <Row label="Tipo" value={pt.session_type === "individual" ? "Individual" : "Grupo"} />
              <Row label={pt.session_type === "grupo" ? "Profissionais" : "Profissional"} value={profNames} />
              <Row label="Horário fixo" value={`${pt.day_of_week} · ${pt.hour}`} />
              <Row label="Periodicidade" value={pt.periodicity || "Semanal"} />
            </div>
          </Card>
          {myPays.length > 0 && (
            <Card pad={28}>
              <Eyebrow>— PAGAMENTOS</Eyebrow>
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {myPays.map((p) => (
                  <div key={p.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "8px 0", borderTop: "1px solid #EFEBE2", fontSize: 13.5, alignItems: "center" }}>
                    <span style={{ color: "#5A5A58" }}>{p.month}</span>
                    <span style={{ color: "#152741", fontWeight: 500 }}>{p.amount}€</span>
                    <span><Tag type={p.status}>{p.status === "pago" ? "Pago" : "Pendente"}</Tag></span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
