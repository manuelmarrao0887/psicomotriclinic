import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../lib/store.jsx";
import { Card, Eyebrow } from "../../lib/ui.jsx";
import { DAYS, HOURS } from "../../lib/constants.js";

export default function Agenda() {
  const { pts, profs } = useStore();
  const navigate = useNavigate();
  const slot = (day, hour) => pts.filter((p) => p.day_of_week === day && p.hour === hour);

  return (
    <div style={{ padding: "28px 40px 60px" }}>
      <Card pad={0}>
        <div style={{ display: "grid", gridTemplateColumns: `90px repeat(${DAYS.length}, 1fr)` }}>
          <div style={{ padding: "14px 12px", background: "#EFEBE2", borderBottom: "1px solid #E5E0D4" }}><Eyebrow>Hora</Eyebrow></div>
          {DAYS.map((d) => (
            <div key={d} style={{ padding: "14px 16px", background: "#EFEBE2", borderBottom: "1px solid #E5E0D4", borderLeft: "1px solid #E5E0D4" }}>
              <Eyebrow>{d}</Eyebrow>
            </div>
          ))}
          {HOURS.map((h) => (
            <Fragment key={h}>
              <div style={{ padding: "14px 12px", borderBottom: "1px solid #EFEBE2", color: "#5A5A58", fontSize: 13, fontWeight: 500 }} className="mono">{h}</div>
              {DAYS.map((d) => {
                const items = slot(d, h);
                return (
                  <div key={d + h} style={{
                    padding: 8, borderLeft: "1px solid #EFEBE2", borderBottom: "1px solid #EFEBE2",
                    minHeight: 62, background: items.length === 0 ? "transparent" : "#FBF9F4",
                  }}>
                    {items.map((p) => {
                      const ids = (p.professional_ids && p.professional_ids.length) ? p.professional_ids : (p.professional_id ? [p.professional_id] : []);
                      const pr = profs.find((x) => x.id === ids[0]);
                      const firstName = pr?.name?.split(" ")[0] || "—";
                      return (
                        <div key={p.id} className="ch" onClick={() => navigate(`/pacientes/${p.id}`)} style={{
                          padding: "7px 9px", borderRadius: 7,
                          background: pr?.avatar_color || "#DCE7F0",
                          marginBottom: 4, fontSize: 12, cursor: "pointer",
                        }}>
                          <div style={{ fontWeight: 500, color: "#152741" }}>{p.name}</div>
                          <div style={{ color: "#5A5A58", fontSize: 11, marginTop: 1 }}>
                            {firstName}{ids.length > 1 ? ` +${ids.length - 1}` : ""} · {p.session_type === "individual" ? "Indiv." : "Grupo"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </Card>
    </div>
  );
}
