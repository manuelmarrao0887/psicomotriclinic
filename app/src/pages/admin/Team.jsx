import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../lib/store.jsx";
import { Btn, Card, Eyebrow, Section, Av, Stat, Tag } from "../../lib/ui.jsx";
import { Icon } from "../../lib/icons.jsx";

const hasProf = (pt, id) => pt.professional_id === id || (pt.professional_ids || []).includes(id);

export default function Team() {
  const { profs, pts, setForm, setModal } = useStore();
  const navigate = useNavigate();

  return (
    <div style={{ padding: "28px 40px 60px" }}>
      <Section eyebrow="— EQUIPA" title={`Profissionais · ${profs.length}`} sub="Terapeutas em atividade na Casa"
        right={<>
          <Btn variant="secondary" icon={<Icon name="copy" size={15} />} onClick={() => { setForm({}); setModal("bulkProf"); }}>Importar</Btn>
          <Btn icon={<Icon name="plus" size={16} />} onClick={() => { setForm({}); setModal("addProf"); }}>Adicionar profissional</Btn>
        </>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {profs.map((p, i) => {
          const pP = pts.filter((pt) => hasProf(pt, p.id));
          return (
            <Card key={p.id} delay={i * 40} pad={22} onClick={() => navigate(`/equipa/${p.id}`)}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <Av t={p.avatar_initials} bg={p.avatar_color} sz={56} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 500, color: "#152741" }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: "#8A8A86", marginTop: 3 }}>{p.role_title}</div>
                  <div style={{ display: "flex", gap: 18, marginTop: 14 }}>
                    <div><div className="serif" style={{ fontSize: 22, fontWeight: 300, color: "#152741", lineHeight: 1 }}>{pP.length}</div><div style={{ fontSize: 11, color: "#8A8A86", marginTop: 2 }}>casos</div></div>
                    <div><div className="serif" style={{ fontSize: 22, fontWeight: 300, color: "#152741", lineHeight: 1 }}>{pP.filter((x) => x.session_type === "individual").length}</div><div style={{ fontSize: 11, color: "#8A8A86", marginTop: 2 }}>individuais</div></div>
                  </div>
                </div>
                <div style={{ color: "#B9CDE0" }}><Icon name="arr" size={16} /></div>
              </div>
            </Card>
          );
        })}
        {profs.length === 0 && <Card pad={28} style={{ gridColumn: "1 / -1", textAlign: "center", color: "#8A8A86" }}>Sem profissionais. Use "Adicionar profissional".</Card>}
      </div>
    </div>
  );
}

export function ProfDetail() {
  const { profId } = useParams();
  const navigate = useNavigate();
  const { profs, pts, sess, deleteProfessional } = useStore();
  const p = profs.find((x) => x.id === profId);

  if (!p) return (
    <div style={{ padding: "28px 40px" }}>
      <button onClick={() => navigate("/equipa")} className="ch" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "#5A5A58", marginBottom: 18, padding: "6px 0" }}>
        <Icon name="back" size={16} /> Voltar
      </button>
      <Card pad={28} style={{ textAlign: "center", color: "#8A8A86" }}>Profissional não encontrado.</Card>
    </div>
  );

  const pP = pts.filter((pt) => hasProf(pt, p.id));
  const pS = sess.filter((s) => pP.some((pt) => pt.id === s.patient_id) && s.status === "realizada");
  let iE = 0, gE = 0;
  pS.forEach((s) => { const pt = pts.find((x) => x.id === s.patient_id); if (pt?.session_type === "individual") iE += 55 * 0.8; else gE += 150 * 0.4; });

  return (
    <div style={{ padding: "28px 40px 60px" }}>
      <button onClick={() => navigate("/equipa")} className="ch" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "#5A5A58", marginBottom: 18, padding: "6px 0" }}>
        <Icon name="back" size={16} /> Voltar
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }}>
        <Card pad={28} style={{ textAlign: "center", height: "fit-content" }}>
          <Av t={p.avatar_initials} bg={p.avatar_color} sz={88} />
          <div className="serif" style={{ fontSize: 24, fontWeight: 300, color: "#152741", marginTop: 16, letterSpacing: "-0.02em" }}>{p.name}</div>
          <div style={{ fontSize: 13.5, color: "#8A8A86", marginTop: 4 }}>{p.role_title}</div>
          <div style={{ marginTop: 14 }}><Tag type="professional">Ativo</Tag></div>
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #EFEBE2" }}>
            <Btn size="sm" variant="danger" icon={<Icon name="trash" size={14} />}
              onClick={() => {
                const msg = pP.length > 0
                  ? `Eliminar "${p.name}"? Tem ${pP.length} caso(s) associado(s) — esses pacientes ficarão sem profissional atribuído. Esta ação é permanente.`
                  : `Eliminar "${p.name}"? Esta ação é permanente.`;
                if (confirm(msg)) { deleteProfessional(p.id); navigate("/equipa"); }
              }} style={{ width: "100%" }}>Eliminar profissional</Btn>
          </div>
        </Card>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
            <Stat label="CASOS" value={pP.length} accent="#B9CDE0" />
            <Stat label="REALIZADAS" value={pS.length} accent="#8DBF94" />
            <Stat label="GANHOS" value={(iE + gE).toFixed(0)} suffix="€" accent="#E8A13C" />
          </div>
          <Section eyebrow="— ACOMPANHAMENTO" title="Casos ativos" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pP.map((pt, i) => (
              <Card key={pt.id} delay={i * 40} pad={16} onClick={() => navigate(`/pacientes/${pt.id}`)}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 3, height: 36, background: "#8DBF94", borderRadius: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 500, color: "#152741" }}>{pt.name} <span style={{ color: "#8A8A86", fontWeight: 400 }}>· {pt.age} anos</span></div>
                    <div style={{ fontSize: 13, color: "#8A8A86", marginTop: 2 }}>{pt.session_type === "individual" ? "Individual" : "Grupo"} · {pt.day_of_week} {pt.hour}</div>
                  </div>
                  <div className="mono" style={{ color: "#5A5A58" }}>{pt.day_of_week.slice(0, 3).toUpperCase()} · {pt.hour}</div>
                </div>
              </Card>
            ))}
            {pP.length === 0 && <Card pad={20} style={{ textAlign: "center", color: "#8A8A86" }}>Sem casos atribuídos.</Card>}
          </div>
        </div>
      </div>
    </div>
  );
}
