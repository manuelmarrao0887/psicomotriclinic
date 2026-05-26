import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Mark, Icon } from "../lib/icons.jsx";
import { Eyebrow, Av, Toast } from "../lib/ui.jsx";
import { APP_VERSION } from "../lib/constants.js";
import { StoreProvider, useStore } from "../lib/store.jsx";
import ModalsHost from "../components/ModalsHost.jsx";

const items = [
  { id: "dashboard",    label: "Dashboard",        icon: "home",      to: "/dashboard" },
  { id: "utilizadores", label: "Utilizadores",     icon: "shield",    to: "/utilizadores" },
  { id: "equipa",       label: "Equipa",           icon: "users",     to: "/equipa" },
  { id: "pacientes",    label: "Pacientes",        icon: "clipboard", to: "/pacientes" },
  { id: "agenda",       label: "Agenda",           icon: "calendar",  to: "/agenda" },
  { id: "financeiro",   label: "Financeiro",       icon: "wallet",    to: "/financeiro" },
  { id: "pedidos",      label: "Pedidos de troca", icon: "swap",      to: "/pedidos" },
  { id: "definicoes",   label: "Definições",       icon: "cog",       to: "/definicoes" },
];

const titles = {
  "/dashboard":    { e: "— GERAL", t: "Dashboard", s: "Visão de gestão da clínica" },
  "/utilizadores": { e: "— ACESSOS", t: "Utilizadores", s: "" },
  "/equipa":       { e: "— EQUIPA", t: "Profissionais", s: "" },
  "/pacientes":    { e: "— CASOS", t: "Pacientes", s: "" },
  "/agenda":       { e: "— AGENDA", t: "Sessões", s: "" },
  "/financeiro":   { e: "— FINANCEIRO", t: "Pagamentos & custos", s: "" },
  "/pedidos":      { e: "— PEDIDOS", t: "Trocas de horário", s: "" },
  "/definicoes":   { e: "— PREFERÊNCIAS", t: "Definições", s: "" },
};

function pickTitle(pathname) {
  // título da página atual (suporta sub-rotas como /pacientes/abc)
  const base = "/" + (pathname.split("/")[1] || "");
  return titles[base] || { t: "", s: "" };
}

function LayoutInner({ profile, onLogout, theme, setTheme }) {
  const location = useLocation();
  const title = pickTitle(location.pathname);
  const { toast } = useStore();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh", background: "#F7F4EE" }}>
      <a href="#main" className="skip-link">Saltar para o conteúdo principal</a>
      <aside aria-label="Navegação principal" style={{
        background: "#152741", color: "#F7F4EE",
        display: "flex", flexDirection: "column",
        padding: "22px 16px 18px",
        borderRight: "1px solid rgba(247,244,238,.06)",
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }}>
        <div style={{ padding: "4px 8px 22px", borderBottom: "1px solid rgba(247,244,238,.08)", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <Mark size={36} />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <span style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: 15.5, letterSpacing: "-0.01em" }}>
                PSICOMOTRI<span style={{ fontWeight: 400 }}>CLINIC</span>
              </span>
              <span className="mono" style={{ color: "rgba(247,244,238,.45)", fontSize: 9, marginTop: 4 }}>HUB · ADMIN</span>
            </div>
          </div>
        </div>

        <div style={{ padding: "0 6px 8px" }}><Eyebrow color="rgba(247,244,238,.4)">— NAVEGAÇÃO</Eyebrow></div>
        <nav aria-label="Secções" style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {items.map((it) => (
            <NavLink key={it.id} to={it.to} className="ch" style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 9,
              background: isActive ? "rgba(247,244,238,.08)" : "transparent",
              color: isActive ? "#F7F4EE" : "rgba(247,244,238,.78)",
              fontSize: 14, fontWeight: isActive ? 500 : 400,
              textDecoration: "none", position: "relative",
            })}>
              {({ isActive }) => (
                <>
                  {isActive && <span aria-hidden="true" style={{ position: "absolute", left: -16, top: 8, bottom: 8, width: 3, background: "#E8A13C", borderRadius: "0 3px 3px 0" }} />}
                  <span aria-hidden="true" style={{ display: "flex", color: isActive ? "#E8A13C" : "rgba(247,244,238,.65)" }}><Icon name={it.icon} size={18} /></span>
                  <span style={{ flex: 1 }}>{it.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: "14px 12px", borderTop: "1px solid rgba(247,244,238,.08)", marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Av t={profile?.full_name?.split(" ").map((w) => w[0]).join("").slice(0, 2) || "A"} bg="#E8A13C" sz={36} color="#152741" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: "#F7F4EE", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile?.full_name || "Admin"}</div>
            <div style={{ fontSize: 11.5, color: "rgba(247,244,238,.7)" }}>{profile?.role === "director" ? "Diretor" : "Admin"}</div>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="ch"
            aria-label={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
            style={{ padding: 7, borderRadius: 8, color: "rgba(247,244,238,.78)", display: "flex" }}
          >
            <Icon name={theme === "dark" ? "sun" : "moon"} size={17} />
          </button>
          <button
            onClick={onLogout}
            className="ch"
            aria-label="Terminar sessão"
            title="Terminar sessão"
            style={{ padding: 7, borderRadius: 8, color: "rgba(247,244,238,.78)", display: "flex" }}
          >
            <Icon name="logout" size={18} />
          </button>
        </div>

        <div style={{ padding: "6px 12px 0", fontSize: 10, lineHeight: 1.5, color: "rgba(247,244,238,.55)" }}>
          <span style={{ fontWeight: 600, color: "rgba(247,244,238,.7)" }}>{APP_VERSION}</span>
        </div>
      </aside>

      <main id="main">
        {title.t && (
          <div style={{ padding: "32px 40px 24px", borderBottom: "1px solid #E5E0D4", background: "#F7F4EE" }}>
            {title.e && <div style={{ marginBottom: 8 }}><Eyebrow>{title.e}</Eyebrow></div>}
            <h1 className="serif" style={{ fontSize: 36, fontWeight: 300, color: "#152741", letterSpacing: "-0.025em", lineHeight: 1.05 }}>{title.t}</h1>
            {title.s && <p style={{ fontSize: 14.5, color: "#8A8A86", marginTop: 6 }}>{title.s}</p>}
          </div>
        )}
        <Outlet />
      </main>

      <ModalsHost />
      {toast && <Toast msg={toast.m} type={toast.t} />}
    </div>
  );
}

export default function AdminLayout(props) {
  return (
    <StoreProvider profile={props.profile}>
      <LayoutInner {...props} />
    </StoreProvider>
  );
}
