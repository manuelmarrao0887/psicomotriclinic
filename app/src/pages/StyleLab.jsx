import { useState } from "react";
import { Mark, Icon } from "../lib/icons.jsx";

// Style lab — 3 paletas distintas para escolha visual antes do redesign global.
// Cada variante renderiza os mesmos componentes (sidebar, topbar, KPIs, tabela,
// botões, modal) com tokens próprios. Não toca em código de produção.

const VARIANTS = [
  {
    id: "mono",
    label: "Mono Navy",
    description: "Navy + cinzas + branco. Minimal SaaS (Linear/Notion). Acentos = opacidades do navy.",
    tokens: {
      bg: "#FFFFFF",
      surface: "#F8F9FB",
      surfaceAlt: "#F1F3F7",
      border: "#E5E7EB",
      borderStrong: "#D1D5DB",
      text: "#152741",
      textSub: "#5A6473",
      textMuted: "#94A3B8",
      primary: "#152741",
      primaryHover: "#1E3556",
      accent: "#152741",
      success: "#0F766E",
      danger: "#B91C1C",
      sidebarBg: "#FBFCFE",
      sidebarActive: "#EEF1F6",
      shadow: "0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.06)",
      shadowLg: "0 4px 12px rgba(15,23,42,.06)",
      radius: 8,
      radiusLg: 12,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      fontHeading: "Inter, -apple-system, sans-serif",
      logoColor: "#152741",
    },
  },
  {
    id: "brand",
    label: "Brand Aligned",
    description: "Navy + amber CTA. Cream tint suave. Mantém identidade actual mas mais branco/limpo.",
    tokens: {
      bg: "#FFFFFF",
      surface: "#FFFFFF",
      surfaceAlt: "#F5F2EC",
      border: "#EAE6DD",
      borderStrong: "#D9D3C5",
      text: "#152741",
      textSub: "#6B6B68",
      textMuted: "#A8A8A0",
      primary: "#152741",
      primaryHover: "#1E3556",
      accent: "#E8A13C",
      success: "#3D7A4A",
      danger: "#B83A3A",
      sidebarBg: "#152741",
      sidebarText: "#F7F4EE",
      sidebarActive: "rgba(247,244,238,.10)",
      sidebarActiveText: "#E8A13C",
      shadow: "0 1px 3px rgba(21,39,65,.06)",
      shadowLg: "0 8px 24px rgba(21,39,65,.08)",
      radius: 12,
      radiusLg: 16,
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      fontHeading: "'DM Sans', -apple-system, sans-serif",
      logoColor: "#152741",
    },
  },
  {
    id: "sage",
    label: "Sage Fresh",
    description: "Verde sage do logo como primária. Navy só para texto. Branco puro. Saúde / serenidade.",
    tokens: {
      bg: "#FFFFFF",
      surface: "#F5F9F5",
      surfaceAlt: "#E8F0E8",
      border: "#DDE7DD",
      borderStrong: "#C7D6C7",
      text: "#152741",
      textSub: "#4A5C4F",
      textMuted: "#8AA08C",
      primary: "#5FA56A",
      primaryHover: "#4E8F58",
      accent: "#8DBF94",
      success: "#3D7A4A",
      danger: "#B83A3A",
      sidebarBg: "#FFFFFF",
      sidebarText: "#152741",
      sidebarActive: "#EAF4EC",
      sidebarActiveText: "#3D7A4A",
      shadow: "0 1px 2px rgba(61,122,74,.05), 0 1px 3px rgba(21,39,65,.04)",
      shadowLg: "0 10px 28px rgba(61,122,74,.10)",
      radius: 12,
      radiusLg: 16,
      fontFamily: "Inter, -apple-system, sans-serif",
      fontHeading: "'DM Sans', Inter, -apple-system, sans-serif",
      logoColor: "#152741",
    },
  },
];

const MOCK_KPIS = [
  { label: "PACIENTES", value: 53, trend: "+3 esta semana", color: "primary" },
  { label: "SESSÕES HOJE", value: 18, trend: "12 confirmadas", color: "accent" },
  { label: "RECEITA (MAIO)", value: "4 280 €", trend: "+12% vs Abril", color: "success" },
  { label: "FALTAS (7D)", value: 4, trend: "−2 vs sem. ant.", color: "danger" },
];

const MOCK_PATIENTS = [
  { name: "Beatriz Sá", age: 6, prof: "Ana Ribeiro", day: "Segunda", hour: "15:00", type: "Individual" },
  { name: "Tomás Marques", age: 8, prof: "Pedro Silva", day: "Terça", hour: "17:00", type: "Grupo" },
  { name: "Madalena Costa", age: 5, prof: "Ana Ribeiro", day: "Quarta", hour: "10:00", type: "Individual" },
  { name: "Diogo Pinheiro", age: 9, prof: "Inês Mota", day: "Quinta", hour: "16:00", type: "Individual" },
];

const NAV = [
  { id: "dash", label: "Dashboard", icon: "home" },
  { id: "pat", label: "Pacientes", icon: "clipboard" },
  { id: "ag", label: "Agenda", icon: "calendar" },
  { id: "fin", label: "Financeiro", icon: "wallet" },
  { id: "set", label: "Definições", icon: "cog" },
];

export default function StyleLab() {
  const [pick, setPick] = useState(null);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0E1A2C",
      paddingTop: "calc(var(--safe-top) + 24px)",
      paddingBottom: "calc(var(--safe-bottom) + 60px)",
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
        <header style={{ color: "#F7F4EE", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <Mark size={36} />
            <span style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em" }}>
              PSICOMOTRI<span style={{ fontWeight: 400 }}>CLINIC</span> · STYLE LAB
            </span>
          </div>
          <h1 style={{ fontFamily: "DM Sans", fontWeight: 300, fontSize: 38, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: 8 }}>
            3 direcções visuais — escolhe uma
          </h1>
          <p style={{ fontSize: 15, color: "rgba(247,244,238,.7)", maxWidth: 720, lineHeight: 1.55 }}>
            Cada variante mostra os mesmos componentes (sidebar, dashboard, tabela de pacientes, botões, badges).
            Clica "Escolher esta" no fundo de cada uma. Depois confirma e refacto a app inteira nesse estilo.
          </p>
          {pick && (
            <div role="status" style={{
              marginTop: 18, padding: "12px 16px", background: "#E8A13C",
              color: "#152741", borderRadius: 12, fontWeight: 600, fontSize: 14,
              display: "inline-block",
            }}>
              Seleccionada: {VARIANTS.find((v) => v.id === pick)?.label}. Diz no chat para avançar.
            </div>
          )}
        </header>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 24,
        }}>
          {VARIANTS.map((v) => (
            <Variant key={v.id} v={v} picked={pick === v.id} onPick={() => setPick(v.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Variant({ v, picked, onPick }) {
  const t = v.tokens;
  return (
    <section style={{
      background: t.bg, borderRadius: 20, overflow: "hidden",
      border: picked ? `3px solid #E8A13C` : "1px solid rgba(255,255,255,.1)",
      boxShadow: "0 24px 60px rgba(0,0,0,.3)",
      fontFamily: t.fontFamily,
    }}>
      {/* Header da variante */}
      <div style={{
        padding: "20px 24px",
        background: t.surfaceAlt,
        borderBottom: `1px solid ${t.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", color: t.textMuted, marginBottom: 4 }}>
            VARIANTE
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, color: t.text, fontFamily: t.fontHeading }}>{v.label}</div>
          <div style={{ fontSize: 13, color: t.textSub, marginTop: 4, maxWidth: 600 }}>{v.description}</div>
        </div>
        <button
          onClick={onPick}
          style={{
            padding: "10px 18px", borderRadius: t.radius,
            background: picked ? "#E8A13C" : t.primary,
            color: picked ? "#152741" : "#fff",
            border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
          }}
        >
          {picked ? "✓ Escolhida" : "Escolher esta"}
        </button>
      </div>

      {/* Mock app */}
      <div style={{ background: t.bg, display: "grid", gridTemplateColumns: "220px 1fr", minHeight: 540 }}>
        {/* Sidebar */}
        <aside style={{
          background: t.sidebarBg,
          color: t.sidebarText || t.text,
          padding: "20px 12px",
          borderRight: t.sidebarBg === "#FFFFFF" || t.sidebarBg === "#FBFCFE" ? `1px solid ${t.border}` : "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 10px 18px", marginBottom: 12, borderBottom: `1px solid ${t.sidebarText ? "rgba(247,244,238,.10)" : t.border}` }}>
            <Mark size={28} />
            <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: "-0.01em" }}>PSICOMOTRI<span style={{ fontWeight: 400 }}>CLINIC</span></span>
          </div>
          {NAV.map((n, i) => {
            const active = i === 1;
            return (
              <div key={n.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "9px 12px", borderRadius: t.radius, marginBottom: 2,
                background: active ? t.sidebarActive : "transparent",
                color: active ? (t.sidebarActiveText || t.primary) : (t.sidebarText || t.textSub),
                fontSize: 14, fontWeight: active ? 600 : 500,
                position: "relative",
              }}>
                <Icon name={n.icon} size={17} />
                <span>{n.label}</span>
                {active && v.id === "brand" && (
                  <span style={{ position: "absolute", left: -12, top: 6, bottom: 6, width: 3, background: t.accent, borderRadius: 2 }} />
                )}
              </div>
            );
          })}
        </aside>

        {/* Main */}
        <main style={{ padding: "24px 28px" }}>
          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", color: t.textMuted, marginBottom: 4 }}>— GERAL</div>
              <h2 style={{ fontFamily: t.fontHeading, fontWeight: v.id === "brand" ? 300 : 600, fontSize: 28, color: t.text, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                Dashboard
              </h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                padding: "8px 12px", background: t.surface,
                borderRadius: t.radius, border: `1px solid ${t.border}`,
                display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: t.textSub,
              }}>
                <Icon name="search" size={14} />
                <span>Procurar…</span>
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: 18,
                background: t.accent, color: t.id === "brand" ? "#152741" : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 13,
              }}>MM</div>
            </div>
          </div>

          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
            {MOCK_KPIS.map((k) => {
              const color = t[k.color] || t.primary;
              return (
                <div key={k.label} style={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  borderRadius: t.radiusLg,
                  padding: "16px 16px 14px",
                  position: "relative", overflow: "hidden",
                  boxShadow: t.shadow,
                }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color }} />
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", color: t.textMuted, marginBottom: 8 }}>
                    {k.label}
                  </div>
                  <div style={{
                    fontSize: 28, fontWeight: v.id === "brand" ? 300 : 700,
                    fontFamily: t.fontHeading,
                    color: t.text, lineHeight: 1, letterSpacing: "-0.02em",
                  }}>{k.value}</div>
                  <div style={{ fontSize: 11, color: t.textSub, marginTop: 6 }}>{k.trend}</div>
                </div>
              );
            })}
          </div>

          {/* Table */}
          <div style={{
            background: t.bg,
            border: `1px solid ${t.border}`,
            borderRadius: t.radiusLg,
            overflow: "hidden",
            boxShadow: t.shadow,
            marginBottom: 20,
          }}>
            <div style={{
              padding: "14px 20px",
              background: t.surfaceAlt,
              borderBottom: `1px solid ${t.border}`,
              display: "grid", gridTemplateColumns: "2fr 60px 2fr 1.5fr 1fr",
              fontSize: 10, fontWeight: 700, letterSpacing: ".12em", color: t.textMuted,
            }}>
              <div>NOME</div><div>IDADE</div><div>PROFISSIONAL</div><div>HORÁRIO</div><div>TIPO</div>
            </div>
            {MOCK_PATIENTS.map((p, i) => (
              <div key={p.name} style={{
                padding: "14px 20px",
                display: "grid", gridTemplateColumns: "2fr 60px 2fr 1.5fr 1fr",
                alignItems: "center",
                borderBottom: i < MOCK_PATIENTS.length - 1 ? `1px solid ${t.border}` : "none",
                fontSize: 14,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 16,
                    background: t.surfaceAlt, color: t.text,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700,
                  }}>{p.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</div>
                  <span style={{ color: t.text, fontWeight: 600 }}>{p.name}</span>
                </div>
                <div style={{ color: t.textSub }}>{p.age}</div>
                <div style={{ color: t.textSub }}>{p.prof}</div>
                <div style={{ color: t.textSub, fontSize: 13 }}>{p.day} · {p.hour}</div>
                <div>
                  <span style={{
                    display: "inline-block", padding: "3px 10px", borderRadius: 99,
                    fontSize: 11, fontWeight: 600,
                    background: p.type === "Individual" ? (v.id === "sage" ? "#D1FAE5" : v.id === "mono" ? t.surfaceAlt : "#DDEADE") : (v.id === "sage" ? "#FEF3C7" : v.id === "mono" ? t.surfaceAlt : "#F5E5CD"),
                    color: p.type === "Individual" ? t.success : t.accent,
                  }}>{p.type}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Buttons + badges row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <button style={{
              padding: "10px 20px", borderRadius: t.radius,
              background: t.primary, color: "#fff",
              border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer",
              boxShadow: t.shadow,
            }}>Acção primária</button>
            <button style={{
              padding: "10px 20px", borderRadius: t.radius,
              background: t.bg, color: t.text,
              border: `1px solid ${t.borderStrong}`, fontWeight: 500, fontSize: 14, cursor: "pointer",
            }}>Secundária</button>
            <button style={{
              padding: "10px 20px", borderRadius: t.radius,
              background: t.accent, color: v.id === "brand" ? "#152741" : "#fff",
              border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer",
              boxShadow: t.shadow,
            }}>CTA / Destaque</button>
            <div style={{ width: 1, height: 24, background: t.border, margin: "0 4px" }} />
            {["Pendente", "Aprovado", "Recusado"].map((label, i) => {
              const bg = [t.surfaceAlt, v.id === "sage" ? "#D1FAE5" : "#DDEADE", v.id === "sage" ? "#FEE2E2" : "#F4E0E0"][i];
              const fg = [t.textSub, t.success, t.danger][i];
              return (
                <span key={label} style={{
                  padding: "4px 10px", borderRadius: 99, fontSize: 11.5, fontWeight: 600,
                  background: bg, color: fg,
                }}>{label}</span>
              );
            })}
          </div>

          {/* Tokens summary */}
          <div style={{
            marginTop: 24, padding: "14px 16px",
            background: t.surface, borderRadius: t.radius,
            border: `1px solid ${t.border}`,
            display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center",
            fontSize: 12, color: t.textSub,
          }}>
            <Swatch color={t.primary} label="primary" textColor={t.text} bg={t.bg} />
            <Swatch color={t.accent} label="accent" textColor={t.text} bg={t.bg} />
            <Swatch color={t.success} label="success" textColor={t.text} bg={t.bg} />
            <Swatch color={t.danger} label="danger" textColor={t.text} bg={t.bg} />
            <span>• radius {t.radius}/{t.radiusLg}px</span>
            <span>• font {t.fontFamily.split(",")[0].replace(/['"]/g, "")}</span>
          </div>
        </main>
      </div>

      {/* Footer pick CTA */}
      <div style={{
        padding: "16px 24px",
        background: picked ? "#FEF3C7" : t.surface,
        borderTop: `1px solid ${t.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 13, color: t.textSub, fontWeight: 500 }}>
          {picked ? "Volta ao topo e confirma no chat para começar o redesign." : "Gostas? Marca como escolhida."}
        </span>
        <button
          onClick={onPick}
          style={{
            padding: "10px 18px", borderRadius: t.radius,
            background: picked ? "#E8A13C" : t.primary,
            color: picked ? "#152741" : "#fff",
            border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
          }}
        >
          {picked ? "✓ Escolhida" : "Escolher esta"}
        </button>
      </div>
    </section>
  );
}

function Swatch({ color, label, textColor, bg }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 14, height: 14, borderRadius: 4, background: color, border: `1px solid rgba(0,0,0,.08)` }} />
      <span style={{ color: textColor }}>{label}</span>
    </span>
  );
}
