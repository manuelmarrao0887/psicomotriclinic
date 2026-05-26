import { useStore } from "../../lib/store.jsx";
import { Btn, Card, Section, Av, Tag } from "../../lib/ui.jsx";
import { Icon } from "../../lib/icons.jsx";

export default function Requests() {
  const { reqs, profs, pts, approveRequest, rejectRequest } = useStore();
  const pending = reqs.filter((r) => r.status === "pendente" || !r.status);

  return (
    <div className="page-pad" style={{ padding: "28px 40px 60px" }}>
      <Section eyebrow="— PEDIDOS" title={`Trocas de horário · ${pending.length}`} sub="Pedidos pendentes da equipa e responsáveis" />

      {pending.length === 0 && (
        <Card pad={40} style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 12, display: "flex", justifyContent: "center", color: "#B9CDE0" }}><Icon name="check" size={32} /></div>
          <div className="serif-it" style={{ fontSize: 18, color: "#152741", marginBottom: 6 }}>Tudo em ordem</div>
          <div style={{ fontSize: 13.5, color: "#8A8A86" }}>Sem pedidos de troca pendentes.</div>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {pending.map((r, i) => {
          const pr = profs.find((p) => p.id === r.professional_id);
          const pt = pts.find((p) => p.id === r.patient_id);
          const requesterName = r.requested_by_name || pr?.name || "—";
          const isParent = !!r.requested_by_name && !r.professional_id;
          const fromText = r.from_schedule || (r.from_day || r.from_hour ? `${r.from_day || "?"} · ${r.from_hour || "?"}` : "—");
          const toText = r.to_schedule || (r.new_day || r.new_hour ? `${r.new_day || "?"} · ${r.new_hour || "?"}` : "—");
          const ini = requesterName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
          return (
            <Card key={r.id} delay={i * 60} pad={22}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
                {pr ? <Av t={pr.avatar_initials} bg={pr.avatar_color} sz={48} /> : <Av t={ini} bg="#DCE7F0" sz={48} />}
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 500, color: "#152741" }}>{requesterName}</span>
                    <Tag type={isParent ? "parent" : "professional"}>{isParent ? "Responsável" : "Profissional"}</Tag>
                    <Tag type="pendente">Pendente</Tag>
                  </div>
                  <div style={{ fontSize: 13.5, color: "#5A5A58", marginBottom: 8 }}>
                    Paciente: <strong style={{ color: "#152741" }}>{pt?.name || r.patient_name || "—"}</strong>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, flexWrap: "wrap" }}>
                    <span style={{ padding: "4px 10px", borderRadius: 6, background: "#F4E0E0", color: "#B83A3A" }} className="mono">{fromText}</span>
                    <Icon name="arr" size={14} color="#8A8A86" />
                    <span style={{ padding: "4px 10px", borderRadius: 6, background: "#DDEADE", color: "#3D7A4A" }} className="mono">{toText}</span>
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
