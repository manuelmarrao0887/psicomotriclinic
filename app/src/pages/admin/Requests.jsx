import { useStore } from "../../lib/store.jsx";
import { Btn, Card, Section, Av, Tag } from "../../lib/ui.jsx";
import { Icon } from "../../lib/icons.jsx";

export default function Requests() {
  const { reqs, profs, pts, approveRequest, rejectRequest } = useStore();

  return (
    <div style={{ padding: "28px 40px 60px" }}>
      <Section eyebrow="— PEDIDOS" title={`Trocas de horário · ${reqs.length}`} sub="Pedidos pendentes da equipa" />

      {reqs.length === 0 && (
        <Card pad={40} style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 12, display: "flex", justifyContent: "center", color: "#B9CDE0" }}><Icon name="check" size={32} /></div>
          <div className="serif-it" style={{ fontSize: 18, color: "#152741", marginBottom: 6 }}>Tudo em ordem</div>
          <div style={{ fontSize: 13.5, color: "#8A8A86" }}>Sem pedidos de troca pendentes.</div>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {reqs.map((r, i) => {
          const pr = profs.find((p) => p.id === r.professional_id);
          const pt = pts.find((p) => p.id === r.patient_id);
          return (
            <Card key={r.id} delay={i * 60} pad={22}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                {pr && <Av t={pr.avatar_initials} bg={pr.avatar_color} sz={48} />}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 500, color: "#152741" }}>{pr?.name || "—"}</span>
                    <Tag type="pendente">Pendente</Tag>
                  </div>
                  <div style={{ fontSize: 13.5, color: "#5A5A58", marginBottom: 8 }}>
                    Paciente: <strong style={{ color: "#152741" }}>{pt?.name || "—"}</strong>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                    <span style={{ padding: "4px 10px", borderRadius: 6, background: "#F4E0E0", color: "#B83A3A" }} className="mono">{r.from_schedule}</span>
                    <Icon name="arr" size={14} color="#8A8A86" />
                    <span style={{ padding: "4px 10px", borderRadius: 6, background: "#DDEADE", color: "#3D7A4A" }} className="mono">{r.to_schedule}</span>
                  </div>
                  {r.reason && (
                    <div className="serif-it" style={{ fontSize: 14, color: "#5A5A58", marginTop: 10, paddingLeft: 12, borderLeft: "2px solid #B9CDE0" }}>
                      "{r.reason}"
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn variant="primary" icon={<Icon name="check" size={14} />} onClick={() => approveRequest(r.id)}>Aprovar</Btn>
                  <Btn variant="secondary" onClick={() => rejectRequest(r.id)}>Recusar</Btn>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
