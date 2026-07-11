import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Mark, Icon } from "../lib/icons.jsx";
import { Eyebrow, Av } from "../lib/ui.jsx";
import { APP_VERSION, formatBuildDate } from "../lib/constants.js";
import { useStore } from "../lib/store.jsx";
import ErrorBoundary from "../components/ErrorBoundary.jsx";

// Sidebar sections com dividers (inspiração Untitled UI sidebar-section-dividers).
const SIDEBAR_SECTIONS = [
  { title: "PRINCIPAL", items: [
    { id: "dashboard", label: "Dashboard", icon: "home", to: "/dashboard" },
  ]},
  { title: "CLÍNICO", items: [
    { id: "pacientes", label: "Pacientes", icon: "clipboard", to: "/pacientes" },
    { id: "agenda", label: "Agenda", icon: "calendar", to: "/agenda" },
    { id: "equipa", label: "Equipa", icon: "users", to: "/equipa" },
    { id: "lista-espera", label: "Lista de espera", icon: "clock", to: "/lista-espera" },
    { id: "exercicios", label: "Biblioteca exerc.", icon: "trend", to: "/exercicios" },
  ]},
  { title: "GESTÃO", items: [
    { id: "financeiro", label: "Financeiro", icon: "wallet", to: "/financeiro" },
    { id: "pedidos", label: "Pedidos", icon: "swap", to: "/pedidos", countKey: "pending_requests" },
    { id: "comunicacoes", label: "Comunicações", icon: "mail", to: "/comunicacoes" },
  ]},
  { title: "SISTEMA", items: [
    { id: "utilizadores", label: "Utilizadores", icon: "shield", to: "/utilizadores" },
    { id: "definicoes", label: "Definições", icon: "cog", to: "/definicoes" },
    { id: "faq", label: "FAQ", icon: "question", to: "/faq" },
  ]},
];

// 8 secções para a sidebar (desktop). No mobile mostramos 4 principais na tab bar
// e o resto via menu "Mais" para evitar uma tab bar entupida (padrão iOS).
const allItems = [
  { id: "dashboard",    label: "Dashboard",        icon: "home",      to: "/dashboard",    primary: true },
  { id: "pacientes",    label: "Pacientes",        icon: "clipboard", to: "/pacientes",    primary: true },
  { id: "agenda",       label: "Agenda",           icon: "calendar",  to: "/agenda",       primary: true },
  { id: "financeiro",   label: "Financeiro",       icon: "wallet",    to: "/financeiro",   primary: false },
  { id: "utilizadores", label: "Utilizadores",     icon: "shield",    to: "/utilizadores", primary: false },
  { id: "equipa",       label: "Equipa",           icon: "users",     to: "/equipa",       primary: false },
  { id: "pedidos",      label: "Pedidos",          icon: "swap",      to: "/pedidos",      primary: false },
  { id: "comunicacoes", label: "Comunicações",     icon: "mail",      to: "/comunicacoes", primary: false },
  { id: "definicoes",   label: "Definições",       icon: "cog",       to: "/definicoes",   primary: false },
];

const primary = allItems.filter((i) => i.primary);
const secondary = allItems.filter((i) => !i.primary);

const titles = {
  "/dashboard":    { e: "— GERAL",        t: "Dashboard",            s: "Visão de gestão da clínica" },
  "/utilizadores": { e: "— ACESSOS",      t: "Utilizadores",         s: "" },
  "/equipa":       { e: "— EQUIPA",       t: "Profissionais",        s: "" },
  "/pacientes":    { e: "— CASOS",        t: "Pacientes",            s: "" },
  "/agenda":       { e: "— AGENDA",       t: "Sessões",              s: "" },
  "/financeiro":   { e: "— FINANCEIRO",   t: "Pagamentos & custos",  s: "Vista agregada da Casa" },
  "/meu-financeiro": { e: "— MEU CONSULTÓRIO", t: "Meu financeiro", s: "Pagamentos dos seus pacientes" },
  "/pedidos":      { e: "— PEDIDOS",      t: "Trocas de horário",    s: "" },
  "/comunicacoes": { e: "— ANÚNCIOS",     t: "Comunicações",         s: "Mensagens visíveis nos portais" },
  "/definicoes":   { e: "— PREFERÊNCIAS", t: "Definições",           s: "" },
};

function pickTitle(pathname) {
  const base = "/" + (pathname.split("/")[1] || "");
  return titles[base] || { t: "", s: "" };
}

// Hook simples para detectar mobile via media query — re-render em resize.
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

export default function AdminLayout({ profile, onLogout, theme, setTheme }) {
  const location = useLocation();
  const navigate = useNavigate();
  const title = pickTitle(location.pathname);
  const isMobile = useIsMobile();
  const [moreOpen, setMoreOpen] = useState(false);

  // Fechar sheet "Mais" quando se muda de rota.
  useEffect(() => { setMoreOpen(false); }, [location.pathname]);

  const initials = profile?.full_name?.split(" ").map((w) => w[0]).join("").slice(0, 2) || "A";

  return (
    <>
      <a href="#main" className="skip-link">Saltar para o conteúdo principal</a>

      {/* ─────────────── DESKTOP — sidebar à esquerda ─────────────── */}
      {!isMobile && (
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh", background: "#F7F9FB" }}>
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

            <SidebarBody profile={profile} onLogout={onLogout} theme={theme} setTheme={setTheme} initials={initials} />

            <div style={{ padding: "6px 12px 0", fontSize: 10, lineHeight: 1.5, color: "rgba(247,244,238,.55)" }}>
              <div style={{ fontWeight: 600, color: "rgba(247,244,238,.7)" }}>{APP_VERSION}</div>
              <div style={{ marginTop: 2, color: "rgba(247,244,238,.5)" }}>Atualizado: {formatBuildDate()}</div>
            </div>
          </aside>

          <main id="main">
            {title.t && (
              <div style={{ padding: "32px 40px 24px", borderBottom: "1px solid #EAE6DD", background: "#FFFFFF" }}>
                {title.e && <div style={{ marginBottom: 8 }}><Eyebrow>{title.e}</Eyebrow></div>}
                <h1 className="serif" style={{ fontSize: 36, fontWeight: 300, color: "#152741", letterSpacing: "-0.025em", lineHeight: 1.05 }}>{title.t}</h1>
                {title.s && <p style={{ fontSize: 14.5, color: "#8A8A86", marginTop: 6 }}>{title.s}</p>}
              </div>
            )}
            <ErrorBoundary key={location.pathname}><Outlet /></ErrorBoundary>
          </main>
        </div>
      )}

      {/* ─────────────── MOBILE — topbar + bottom tab bar (iOS-feel) ─────────────── */}
      {isMobile && (
        <div style={{ minHeight: "100vh", background: "#F7F9FB", display: "flex", flexDirection: "column" }}>
          {/* Top app bar — fixo, transparente com blur sob scroll */}
          <header style={{
            position: "sticky", top: 0, zIndex: 50,
            paddingTop: "var(--safe-top)",
            background: "rgba(247,244,238,.88)",
            backdropFilter: "saturate(180%) blur(20px)",
            WebkitBackdropFilter: "saturate(180%) blur(20px)",
            borderBottom: "1px solid rgba(229,224,212,.6)",
          }}>
            <div style={{ height: "var(--topbar-h)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Mark size={28} />
                <span style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em", color: "#152741" }}>
                  PSICOMOTRI<span style={{ fontWeight: 400 }}>CLINIC</span>
                </span>
              </div>
              <button
                onClick={() => setMoreOpen(true)}
                className="ch tap-target"
                aria-label="Conta e definições"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 0, borderRadius: 999 }}
              >
                <Av t={initials} bg="#E8A13C" sz={34} color="#152741" />
              </button>
            </div>
          </header>

          {/* Large title — estilo iOS, aparece em cada página */}
          {title.t && (
            <div style={{ padding: "12px 18px 14px" }}>
              {title.e && <div style={{ marginBottom: 6 }}><Eyebrow>{title.e}</Eyebrow></div>}
              <h1 className="serif" style={{ fontSize: 30, fontWeight: 300, color: "#152741", letterSpacing: "-0.025em", lineHeight: 1.08 }}>
                {title.t}
              </h1>
              {title.s && <p style={{ fontSize: 14, color: "#8A8A86", marginTop: 4 }}>{title.s}</p>}
            </div>
          )}

          <main id="main" style={{ flex: 1, paddingBottom: 0 }}>
            <ErrorBoundary key={location.pathname}><Outlet /></ErrorBoundary>
          </main>

          {/* Bottom tab bar — 4 primários + "Mais" */}
          <nav aria-label="Navegação" style={{
            position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 50,
            paddingBottom: "var(--safe-bottom)",
            background: "rgba(247,244,238,.92)",
            backdropFilter: "saturate(180%) blur(20px)",
            WebkitBackdropFilter: "saturate(180%) blur(20px)",
            borderTop: "1px solid rgba(229,224,212,.7)",
          }}>
            <div style={{ height: "var(--tabbar-h)", display: "grid", gridTemplateColumns: `repeat(${primary.length + 1}, 1fr)` }}>
              {primary.map((it) => (
                <NavLink key={it.id} to={it.to} className="ch tap-target" style={({ isActive }) => ({
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                  color: isActive ? "#E8A13C" : "#5A5A58",
                  textDecoration: "none", fontSize: 10.5, fontWeight: isActive ? 600 : 500,
                  letterSpacing: ".01em",
                })}>
                  {({ isActive }) => (
                    <>
                      <Icon name={it.icon} size={22} />
                      <span style={{ color: isActive ? "#E8A13C" : "#5A5A58" }}>{it.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
              <button
                onClick={() => setMoreOpen(true)}
                className="ch tap-target"
                aria-label="Mais opções"
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                  color: secondary.some((s) => location.pathname.startsWith(s.to)) ? "#E8A13C" : "#5A5A58",
                  fontSize: 10.5, fontWeight: 500,
                }}
              >
                <Icon name="more" size={22} />
                <span>Mais</span>
              </button>
            </div>
          </nav>

          {/* Sheet "Mais" — bottom sheet com secções secundárias + conta */}
          {moreOpen && (
            <div
              onClick={() => setMoreOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-label="Mais opções"
              style={{
                position: "fixed", inset: 0, zIndex: 200,
                background: "rgba(21,39,65,.4)", backdropFilter: "blur(4px)",
                display: "flex", alignItems: "flex-end", justifyContent: "center",
                animation: "fade-in .18s ease both",
              }}
            >
              <div onClick={(e) => e.stopPropagation()} style={{
                width: "100%", background: "#FFFFFF",
                borderRadius: "20px 20px 0 0",
                paddingBottom: "calc(var(--safe-bottom) + 12px)",
                animation: "sheet-up .32s cubic-bezier(.32,.72,0,1) both",
                boxShadow: "0 -24px 64px rgba(21,39,65,.25)",
              }}>
                <div style={{ width: 36, height: 5, borderRadius: 3, background: "#D9D3C5", margin: "8px auto 4px" }} aria-hidden="true" />
                {/* Cabeçalho do utilizador */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px 14px", borderBottom: "1px solid #F5F2EC" }}>
                  <Av t={initials} bg="#E8A13C" sz={44} color="#152741" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#152741", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile?.full_name || "Admin"}</div>
                    <div style={{ fontSize: 12.5, color: "#8A8A86", marginTop: 2 }}>{profile?.role === "director" ? "Diretor" : "Admin"}</div>
                  </div>
                </div>

                {/* Secções secundárias */}
                <div style={{ padding: "8px 12px 0" }}>
                  {secondary.map((it) => {
                    const active = location.pathname.startsWith(it.to);
                    return (
                      <button
                        key={it.id}
                        onClick={() => { navigate(it.to); }}
                        className="ch tap-target"
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 14,
                          padding: "13px 12px", borderRadius: 12,
                          background: active ? "#F5F2EC" : "transparent",
                          color: active ? "#152741" : "#3C3C3B",
                          fontSize: 15, fontWeight: active ? 600 : 500, textAlign: "left",
                        }}
                      >
                        <span style={{ display: "flex", color: active ? "#E8A13C" : "#5A5A58" }}><Icon name={it.icon} size={20} /></span>
                        <span style={{ flex: 1 }}>{it.label}</span>
                        <Icon name="arr" size={16} color="#B9CDE0" />
                      </button>
                    );
                  })}
                </div>

                {/* Toggle tema + logout */}
                <div style={{ padding: "10px 12px 14px", marginTop: 6, borderTop: "1px solid #F5F2EC" }}>
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="ch tap-target"
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 14,
                      padding: "13px 12px", borderRadius: 12,
                      color: "#3C3C3B", fontSize: 15, fontWeight: 500, textAlign: "left",
                    }}
                  >
                    <span style={{ display: "flex", color: "#5A5A58" }}><Icon name={theme === "dark" ? "sun" : "moon"} size={20} /></span>
                    <span style={{ flex: 1 }}>{theme === "dark" ? "Modo claro" : "Modo escuro"}</span>
                  </button>
                  <button
                    onClick={onLogout}
                    className="ch tap-target"
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 14,
                      padding: "13px 12px", borderRadius: 12,
                      color: "#B83A3A", fontSize: 15, fontWeight: 500, textAlign: "left",
                    }}
                  >
                    <span style={{ display: "flex" }}><Icon name="logout" size={20} /></span>
                    <span style={{ flex: 1 }}>Terminar sessão</span>
                  </button>
                </div>

                {/* Versão */}
                <div style={{ padding: "8px 24px 4px", fontSize: 11, color: "#8A8A86", textAlign: "center", lineHeight: 1.55 }}>
                  <div><b style={{ color: "#5A5A58" }}>{APP_VERSION}</b></div>
                  <div style={{ marginTop: 2 }}>Atualizado: {formatBuildDate()}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </>
  );
}

// ────────── SidebarBody — sections + dividers + bottom perfil com upload ──────────
function SidebarBody({ profile, onLogout, theme, setTheme, initials }) {
  const { reqs, users, profs = [], updateMyPhoto, removeMyPhoto } = useStore();
  const fileRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const pendingCount = (reqs || []).filter((r) => r.status === "pendente" || !r.status).length;
  const countValue = (key) => ({ pending_requests: pendingCount })[key] || 0;

  // Director que também é profissional (professionals.profile_id === user.id)
  // ganha secção MEU CONSULTÓRIO com atalhos para o seu financeiro pessoal.
  const myProfRecord = profs.find((p) => p.profile_id === profile?.id);
  const sections = myProfRecord ? [
    ...SIDEBAR_SECTIONS.slice(0, -1),
    { title: "MEU CONSULTÓRIO", items: [
      { id: "meu-financeiro", label: "Meu financeiro", icon: "wallet", to: "/meu-financeiro" },
    ]},
    SIDEBAR_SECTIONS[SIDEBAR_SECTIONS.length - 1],
  ] : SIDEBAR_SECTIONS;

  // Foto vem do users store (dados frescos por listener) — não do profile prop
  const me = (users || []).find((u) => u.id === profile?.id);
  const photoUrl = me?.photo_url || null;
  const displayName = profile?.full_name || me?.full_name || "Admin";
  const roleLabel = profile?.role === "director" ? "Diretor" :
                    profile?.role === "professional" ? "Profissional" :
                    profile?.role === "parent" ? "Responsável" : "Admin";

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (f) updateMyPhoto(f);
    e.target.value = "";
    setMenuOpen(false);
  };

  return (
    <>
      <nav aria-label="Secções" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflowY: "auto" }}>
        {sections.map((section, sIdx) => (
          <div key={section.title} style={{ marginBottom: sIdx < sections.length - 1 ? 6 : 0 }}>
            <div style={{ padding: "8px 8px 6px", fontSize: 9.5, letterSpacing: ".14em", fontWeight: 700, color: "rgba(247,244,238,.42)" }}>
              — {section.title}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {section.items.map((it) => {
                const count = it.countKey ? countValue(it.countKey) : 0;
                return (
                  <NavLink key={it.id} to={it.to} className="ch" style={({ isActive }) => ({
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "9px 12px", borderRadius: 9,
                    background: isActive ? "rgba(247,244,238,.08)" : "transparent",
                    color: isActive ? "#F7F4EE" : "rgba(247,244,238,.78)",
                    fontSize: 14, fontWeight: isActive ? 500 : 400,
                    textDecoration: "none", position: "relative",
                  })}>
                    {({ isActive }) => (
                      <>
                        {isActive && <span aria-hidden="true" style={{ position: "absolute", left: -16, top: 8, bottom: 8, width: 3, background: "#E8A13C", borderRadius: "0 3px 3px 0" }} />}
                        <span aria-hidden="true" style={{ display: "flex", color: isActive ? "#E8A13C" : "rgba(247,244,238,.6)" }}><Icon name={it.icon} size={17} /></span>
                        <span style={{ flex: 1 }}>{it.label}</span>
                        {count > 0 && (
                          <span aria-label={`${count} pendentes`} style={{
                            fontSize: 10.5, fontWeight: 700, padding: "1px 7px",
                            borderRadius: 999, background: "#E8A13C", color: "#152741",
                            minWidth: 18, textAlign: "center",
                          }}>{count}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
            {sIdx < sections.length - 1 && (
              <div aria-hidden="true" style={{ height: 1, background: "rgba(247,244,238,.08)", margin: "10px 8px 4px" }} />
            )}
          </div>
        ))}
      </nav>

      {/* Bottom perfil com upload de foto */}
      <div style={{ marginTop: 12, borderTop: "1px solid rgba(247,244,238,.08)", paddingTop: 14, position: "relative" }}>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onPickFile}
          style={{ display: "none" }}
          aria-hidden="true"
        />
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 8px" }}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Trocar foto de perfil"
            className="ch"
            style={{
              padding: 0, borderRadius: 999, position: "relative",
              background: "transparent", border: "none",
            }}
          >
            <Av t={initials} bg="#E8A13C" sz={44} color="#152741" photoUrl={photoUrl} />
            <span aria-hidden="true" style={{
              position: "absolute", bottom: -2, right: -2,
              width: 18, height: 18, borderRadius: 9,
              background: "#152741", border: "2px solid #152741",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#E8A13C", fontSize: 10, boxShadow: "0 0 0 2px rgba(232,161,60,.4)",
            }}>
              <Icon name="edit" size={9} />
            </span>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#F7F4EE", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayName}</div>
            <div style={{ fontSize: 11, color: "rgba(247,244,238,.6)", marginTop: 1 }}>{roleLabel}</div>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="ch"
            aria-label={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
            style={{ padding: 6, borderRadius: 8, color: "rgba(247,244,238,.72)", display: "flex", background: "transparent", border: "none", cursor: "pointer" }}
          >
            <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
          </button>
          <button
            onClick={onLogout}
            className="ch"
            aria-label="Terminar sessão"
            title="Terminar sessão"
            style={{ padding: 6, borderRadius: 8, color: "rgba(247,244,238,.72)", display: "flex", background: "transparent", border: "none", cursor: "pointer" }}
          >
            <Icon name="logout" size={16} />
          </button>
        </div>

        {/* Popover foto */}
        {menuOpen && (
          <>
            <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 60 }} />
            <div role="dialog" aria-label="Foto de perfil" style={{
              position: "absolute", bottom: 68, left: 8, zIndex: 61,
              background: "#FFFFFF", color: "#152741",
              borderRadius: 12, padding: 6, minWidth: 200,
              boxShadow: "0 20px 50px rgba(0,0,0,.35)",
              animation: "fu .18s ease both",
            }}>
              <button
                onClick={() => { fileRef.current?.click(); }}
                style={{ width: "100%", padding: "10px 12px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, fontWeight: 500, color: "#152741", borderRadius: 8, textAlign: "left", fontFamily: "inherit" }}
              >
                <Icon name="edit" size={14} /> {photoUrl ? "Trocar foto" : "Carregar foto"}
              </button>
              {photoUrl && (
                <button
                  onClick={() => { removeMyPhoto(); setMenuOpen(false); }}
                  style={{ width: "100%", padding: "10px 12px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, fontWeight: 500, color: "#B83A3A", borderRadius: 8, textAlign: "left", fontFamily: "inherit" }}
                >
                  <Icon name="trash" size={14} /> Remover foto
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
