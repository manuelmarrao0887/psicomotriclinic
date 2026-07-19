import { Mark, Icon } from "../lib/icons.jsx";
import { Av } from "../lib/ui.jsx";
import { APP_VERSION, formatBuildDate } from "../lib/constants.js";
import { initials as initialsOf } from "../lib/format.js";

// Sidebar navy partilhada pelos portais Responsável e Profissional (eram
// duas cópias quase idênticas). Difere só em: subtítulo, secção extra no topo
// (filhos vs sessões de hoje), cor do avatar e rótulo de papel.
//
// props:
//  subtitle      — "PORTAL RESPONSÁVEL" | "PORTAL PROFISSIONAL"
//  extra         — { label, items: [{ name, meta }] } | null (secção do topo)
//  nav           — [{ id, label, icon, badge }]
//  activeTab, onNav(id)
//  avatarBg, roleLabel, profileName, initials, photoUrl
//  theme, setTheme, onLogout
export default function PortalSidebar({ subtitle, extra, nav, activeTab, onNav, avatarBg, roleLabel, profileName, initials, photoUrl, theme, setTheme, onLogout }) {
  return (
    <aside aria-label="Navegação" style={{ background: "#152741", color: "#F7F4EE", display: "flex", flexDirection: "column", padding: "22px 16px 18px", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
      <div style={{ padding: "4px 8px 22px", borderBottom: "1px solid rgba(247,244,238,.08)", marginBottom: 14, display: "flex", alignItems: "center", gap: 11 }}>
        <Mark size={34} />
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <span style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>PSICOMOTRI<span style={{ fontWeight: 400 }}>CLINIC</span></span>
          <span className="mono" style={{ color: "rgba(247,244,238,.45)", fontSize: 9, marginTop: 4 }}>{subtitle}</span>
        </div>
      </div>

      {extra && extra.items.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ padding: "6px 8px", fontSize: 9.5, letterSpacing: ".14em", fontWeight: 700, color: "rgba(247,244,238,.42)" }}>— {extra.label} · {extra.items.length}</div>
          {extra.items.map((it, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 9, fontSize: 13, color: "rgba(247,244,238,.85)" }}>
              <Av t={initialsOf(it.name)} bg="#DCE7F0" sz={26} />
              <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.name}</span>
              <span className="mono" style={{ fontSize: 9.5, color: "rgba(247,244,238,.5)" }}>{it.meta}</span>
            </div>
          ))}
          <div aria-hidden="true" style={{ height: 1, background: "rgba(247,244,238,.08)", margin: "10px 8px 4px" }} />
        </div>
      )}

      <div style={{ padding: "6px 8px 6px", fontSize: 9.5, letterSpacing: ".14em", fontWeight: 700, color: "rgba(247,244,238,.42)" }}>— NAVEGAÇÃO</div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
        {nav.map((n) => {
          const active = activeTab === n.id;
          return (
            <button key={n.id} onClick={() => onNav(n.id)} className="ch" style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: 9, background: active ? "rgba(247,244,238,.08)" : "transparent", color: active ? "#F7F4EE" : "rgba(247,244,238,.78)", fontSize: 14, fontWeight: active ? 500 : 400, border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit", position: "relative" }}>
              {active && <span aria-hidden="true" style={{ position: "absolute", left: -16, top: 8, bottom: 8, width: 3, background: "#E8A13C", borderRadius: "0 3px 3px 0" }} />}
              <Icon name={n.icon} size={17} />
              <span style={{ flex: 1 }}>{n.label}</span>
              {n.badge > 0 && (
                <span aria-label={`${n.badge} novidades`} style={{ fontSize: 10.5, fontWeight: 700, padding: "1px 7px", borderRadius: 999, background: "#B83A3A", color: "#fff", minWidth: 18, textAlign: "center" }}>{n.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: 12, borderTop: "1px solid rgba(247,244,238,.08)", paddingTop: 14, display: "flex", alignItems: "center", gap: 10, padding: "14px 8px 4px" }}>
        <Av t={initials} bg={avatarBg} sz={40} color="#152741" photoUrl={photoUrl} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#F7F4EE", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profileName || roleLabel}</div>
          <div style={{ fontSize: 11, color: "rgba(247,244,238,.6)" }}>{roleLabel}</div>
        </div>
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="ch" aria-label={theme === "dark" ? "Modo claro" : "Modo escuro"} style={{ padding: 6, borderRadius: 8, color: "rgba(247,244,238,.72)", background: "transparent", border: "none", cursor: "pointer", display: "flex" }}><Icon name={theme === "dark" ? "sun" : "moon"} size={16} /></button>
        <button onClick={onLogout} className="ch" aria-label="Terminar sessão" style={{ padding: 6, borderRadius: 8, color: "rgba(247,244,238,.72)", background: "transparent", border: "none", cursor: "pointer", display: "flex" }}><Icon name="logout" size={16} /></button>
      </div>
      <div style={{ padding: "6px 12px 0", fontSize: 10, color: "rgba(247,244,238,.55)" }}>
        <div style={{ fontWeight: 600 }}>{APP_VERSION}</div>
        <div style={{ marginTop: 2 }}>Atualizado: {formatBuildDate()}</div>
      </div>
    </aside>
  );
}
