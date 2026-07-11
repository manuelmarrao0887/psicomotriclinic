import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../lib/store.jsx";
import { Card, Eyebrow } from "../../lib/ui.jsx";
import { DAYS, HOURS } from "../../lib/constants.js";

function useIsMobile() {
  const [is, setIs] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 899.98px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 899.98px)");
    const handler = (e) => setIs(e.matches);
    mq.addEventListener?.("change", handler) ?? mq.addListener(handler);
    return () => mq.removeEventListener?.("change", handler) ?? mq.removeListener(handler);
  }, []);
  return is;
}

export default function Agenda() {
  const { pts, profs } = useStore();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Em mobile: tabs por dia (default = dia atual da semana)
  const todayIdx = (new Date().getDay() + 6) % 7; // 0=Seg, 6=Dom
  const defaultDay = todayIdx < DAYS.length ? DAYS[todayIdx] : DAYS[0];
  const [activeDay, setActiveDay] = useState(defaultDay);

  const slot = (day, hour) => pts.filter((p) => p.day_of_week === day && p.hour === hour);

  // ─────── Desktop: grelha completa Dias × Horas ───────
  if (!isMobile) {
    return (
      <div className="page-pad" style={{ padding: "28px 40px 60px" }}>
        <Card pad={0}>
          <div style={{ display: "grid", gridTemplateColumns: `90px repeat(${DAYS.length}, 1fr)` }}>
            <div style={{ padding: "14px 12px", background: "#F5F2EC", borderBottom: "1px solid #EAE6DD" }}><Eyebrow>Hora</Eyebrow></div>
            {DAYS.map((d) => (
              <div key={d} style={{ padding: "14px 16px", background: "#F5F2EC", borderBottom: "1px solid #EAE6DD", borderLeft: "1px solid #EAE6DD" }}>
                <Eyebrow>{d}</Eyebrow>
              </div>
            ))}
            {HOURS.map((h) => (
              <Fragment key={h}>
                <div style={{ padding: "14px 12px", borderBottom: "1px solid #F5F2EC", color: "#5A5A58", fontSize: 13, fontWeight: 500 }} className="mono">{h}</div>
                {DAYS.map((d) => {
                  const items = slot(d, h);
                  return (
                    <div key={d + h} style={{
                      padding: 8, borderLeft: "1px solid #F5F2EC", borderBottom: "1px solid #F5F2EC",
                      minHeight: 62, background: items.length === 0 ? "transparent" : "#FFFFFF",
                    }}>
                      {items.map((p) => {
                        const ids = (p.professional_ids && p.professional_ids.length) ? p.professional_ids : (p.professional_id ? [p.professional_id] : []);
                        const pr = profs.find((x) => x.id === ids[0]);
                        const firstName = pr?.name?.split(" ")[0] || "—";
                        const open = () => navigate(`/pacientes/${p.id}`);
                        return (
                          <div
                            key={p.id}
                            role="button"
                            tabIndex={0}
                            aria-label={`${p.name}, ${d} às ${h}, ${p.session_type === "individual" ? "individual" : "grupo"}, com ${firstName}`}
                            className="ch"
                            onClick={open}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }}
                            style={{
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

  // ─────── Mobile: segmented control de dias + lista de sessões ───────
  const sessionsForActive = HOURS
    .map((h) => ({ h, items: slot(activeDay, h) }))
    .filter((row) => row.items.length > 0);

  return (
    <div className="page-pad" style={{ padding: "8px 16px 60px" }}>
      {/* Segmented control iOS-style */}
      <div style={{
        display: "flex", gap: 4, padding: 4, marginBottom: 16,
        background: "#F5F2EC", borderRadius: 12,
        position: "sticky", top: "calc(var(--topbar-h) + var(--safe-top))",
        zIndex: 5,
      }}>
        {DAYS.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className="ch"
            aria-pressed={activeDay === d}
            style={{
              flex: 1, padding: "9px 6px", borderRadius: 9,
              background: activeDay === d ? "#FFFFFF" : "transparent",
              color: activeDay === d ? "#152741" : "#5A5A58",
              fontSize: 13, fontWeight: activeDay === d ? 600 : 500,
              boxShadow: activeDay === d ? "0 1px 3px rgba(21,39,65,.08)" : "none",
            }}
          >
            {d.slice(0, 3)}
          </button>
        ))}
      </div>

      {sessionsForActive.length === 0 ? (
        <Card pad={32} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "#8A8A86" }}>Sem sessões agendadas para {activeDay}.</div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sessionsForActive.map(({ h, items }) => (
            <div key={h}>
              <div className="mono" style={{ padding: "4px 4px 8px", color: "#8A8A86", fontSize: 11 }}>{h}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((p) => {
                  const ids = (p.professional_ids && p.professional_ids.length) ? p.professional_ids : (p.professional_id ? [p.professional_id] : []);
                  const pr = profs.find((x) => x.id === ids[0]);
                  const firstName = pr?.name?.split(" ")[0] || "—";
                  const open = () => navigate(`/pacientes/${p.id}`);
                  return (
                    <div
                      key={p.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`${p.name} às ${h} com ${firstName}`}
                      className="ch"
                      onClick={open}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "14px 16px", borderRadius: 14,
                        background: "#FFFFFF", border: "1px solid #F5F2EC", cursor: "pointer",
                      }}
                    >
                      <div style={{
                        width: 6, alignSelf: "stretch", borderRadius: 3,
                        background: pr?.avatar_color || "#DCE7F0",
                      }} aria-hidden="true" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#152741", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                        <div style={{ fontSize: 12.5, color: "#8A8A86", marginTop: 2 }}>
                          {firstName}{ids.length > 1 ? ` +${ids.length - 1}` : ""} · {p.session_type === "individual" ? "Individual" : "Grupo"}
                        </div>
                      </div>
                      <span style={{ color: "#B9CDE0" }} aria-hidden="true">›</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
