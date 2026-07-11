import { useState, useMemo, Fragment } from "react";
import { Link } from "react-router-dom";
import { Mark, Icon } from "../lib/icons.jsx";
import { Card, Eyebrow } from "../lib/ui.jsx";
import { PRIVACY_SECTIONS, PRIVACY_VERSION, PRIVACY_LAST_UPDATE, CONTROLLER } from "../lib/privacyPolicy.js";

// Política de privacidade renderizada a partir de privacyPolicy.js.
// Atualizar conteúdo = editar esse ficheiro + bumpar PRIVACY_VERSION.
// Layout: índice colapsável (mobile) / sticky sidebar (desktop) + secções renderizadas via blocks.

export default function Privacy() {
  const [search, setSearch] = useState("");

  const filteredSections = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return PRIVACY_SECTIONS;
    return PRIVACY_SECTIONS.filter((s) => {
      const blob = (s.title + " " + s.eyebrow + " " + JSON.stringify(s.blocks)).toLowerCase();
      return blob.includes(q);
    });
  }, [search]);

  return (
    <div style={{ minHeight: "100vh", background: "#F7F9FB" }}>
      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,.92)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderBottom: "1px solid #EAE6DD",
        padding: "calc(var(--safe-top) + 14px) 24px 14px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Mark size={32} />
            <div>
              <div className="mono" style={{ fontSize: 10, color: "#8A8A86", letterSpacing: ".12em" }}>— RGPD · v{PRIVACY_VERSION}</div>
              <div className="serif" style={{ fontSize: 18, fontWeight: 600, color: "#152741", letterSpacing: "-0.01em", lineHeight: 1.2 }}>Política de Privacidade</div>
            </div>
          </div>
          <Link to="/login" className="ch tap-target" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 10,
            background: "#FFFFFF", border: "1px solid #D9D3C5",
            color: "#152741", fontSize: 13, fontWeight: 500,
          }}>
            <Icon name="back" size={14} /> Voltar
          </Link>
        </div>
      </header>

      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "28px 24px calc(var(--safe-bottom) + 60px)",
        display: "grid",
        gridTemplateColumns: "240px 1fr",
        gap: 32,
      }} className="privacy-grid">
        {/* Sidebar índice */}
        <aside className="privacy-toc" style={{ position: "sticky", top: 100, alignSelf: "start", maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
          <div style={{ marginBottom: 14, position: "relative" }}>
            <Icon name="search" size={14} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Procurar…"
              aria-label="Procurar na política"
              style={{
                width: "100%", padding: "8px 12px 8px 32px",
                borderRadius: 10, border: "1px solid #D9D3C5",
                fontSize: 13, background: "#FFFFFF",
              }}
            />
            <span aria-hidden="true" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#8A8A86", display: "flex" }}>
              <Icon name="search" size={14} />
            </span>
          </div>
          <Eyebrow>— ÍNDICE</Eyebrow>
          <nav style={{ marginTop: 8 }}>
            {PRIVACY_SECTIONS.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                style={{
                  display: "block", padding: "8px 10px", borderRadius: 8,
                  color: "#3C3C3B", fontSize: 13, lineHeight: 1.4, textDecoration: "none",
                  borderLeft: "2px solid transparent",
                }}
                className="privacy-toc-link"
              >
                <span style={{ color: "#8A8A86", marginRight: 6, fontVariantNumeric: "tabular-nums", fontSize: 11 }}>{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </a>
            ))}
          </nav>
          <div style={{ marginTop: 18, padding: "12px 10px", borderTop: "1px solid #F5F2EC", fontSize: 11, color: "#8A8A86", lineHeight: 1.55 }}>
            <div>Versão <b style={{ color: "#152741" }}>{PRIVACY_VERSION}</b></div>
            <div>Atualizada em <b style={{ color: "#152741" }}>{PRIVACY_LAST_UPDATE}</b></div>
            <div style={{ marginTop: 8 }}>
              Contacto: <a href={`mailto:${CONTROLLER.email}`} style={{ color: "#152741" }}>{CONTROLLER.email}</a>
            </div>
          </div>
        </aside>

        {/* Conteúdo */}
        <main>
          {/* Intro */}
          <div style={{ marginBottom: 28 }}>
            <Eyebrow>— A CASA DA PSICOMOTRICIDADE</Eyebrow>
            <h1 className="serif" style={{ fontSize: 38, fontWeight: 300, color: "#152741", letterSpacing: "-0.025em", lineHeight: 1.08, marginTop: 6, marginBottom: 12 }}>
              A sua privacidade<span className="serif-it">.</span>
            </h1>
            <p style={{ fontSize: 15, color: "#5A5A58", lineHeight: 1.65, maxWidth: 660 }}>
              Esta página descreve, com transparência, que dados pessoais recolhemos, para quê,
              durante quanto tempo e quais os seus direitos sobre eles. Está em conformidade com o
              Regulamento Geral sobre a Proteção de Dados (RGPD — Regulamento UE 2016/679).
            </p>
          </div>

          {filteredSections.length === 0 && (
            <Card pad={28} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, color: "#8A8A86" }}>Sem secções para "{search}".</div>
            </Card>
          )}

          {filteredSections.map((section) => (
            <section key={section.id} id={section.id} style={{ scrollMarginTop: 110, marginBottom: 18 }}>
              <Card pad={28}>
                <Eyebrow>{section.eyebrow}</Eyebrow>
                <h2 className="serif" style={{ fontSize: 22, fontWeight: 400, color: "#152741", letterSpacing: "-0.015em", marginTop: 6, marginBottom: 16 }}>
                  {section.title}
                </h2>
                {section.blocks.map((b, i) => <Block key={i} b={b} />)}
              </Card>
            </section>
          ))}
        </main>
      </div>

      <style>{`
        .privacy-toc-link:hover { background: #F5F2EC; }
        @media (max-width: 899.98px) {
          .privacy-grid { grid-template-columns: 1fr !important; gap: 18px !important; }
          .privacy-toc { position: static !important; max-height: none !important; }
        }
      `}</style>
    </div>
  );
}

function Block({ b }) {
  if (b.type === "p") {
    return <p style={{ fontSize: 14, color: "#3C3C3B", lineHeight: 1.7, marginBottom: 12 }}>{b.text}</p>;
  }
  if (b.type === "list") {
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        {b.items.map((it, i) => (
          <li key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: "#3C3C3B", lineHeight: 1.6 }}>
            <span aria-hidden="true" style={{ color: "#E8A13C", marginTop: 6, flexShrink: 0, fontSize: 8 }}>●</span>
            <span style={{ flex: 1 }}>{it}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (b.type === "table") {
    return (
      <div style={{ overflow: "auto", margin: "0 -8px 14px", padding: "0 8px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              {b.header.map((h, i) => (
                <th key={i} style={{
                  textAlign: "left", padding: "10px 12px",
                  fontSize: 10.5, letterSpacing: ".12em", fontWeight: 700, color: "#8A8A86",
                  borderBottom: "1px solid #EAE6DD", whiteSpace: "nowrap",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} style={{
                    padding: "10px 12px", verticalAlign: "top",
                    color: j === 0 ? "#152741" : "#3C3C3B",
                    fontWeight: j === 0 ? 500 : 400,
                    borderBottom: i < b.rows.length - 1 ? "1px solid #F5F2EC" : "none",
                    lineHeight: 1.55, fontSize: 13,
                  }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (b.type === "kv") {
    return (
      <dl style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "8px 16px", margin: "0 0 14px", fontSize: 13.5 }}>
        {b.rows.map(([k, v], i) => (
          <Fragment key={i}>
            <dt style={{ color: "#8A8A86", paddingTop: 2 }}>{k}</dt>
            <dd style={{ color: "#152741", fontWeight: 500, wordBreak: "break-word" }}>{v}</dd>
          </Fragment>
        ))}
      </dl>
    );
  }
  if (b.type === "callout") {
    return (
      <div role="note" style={{
        display: "flex", gap: 10, alignItems: "flex-start",
        padding: "12px 14px", borderRadius: 12,
        background: "#F5E5CD", color: "#7A4A0E",
        border: "1px solid #ECC58A", marginBottom: 14, fontSize: 13.5, lineHeight: 1.55,
      }}>
        <Icon name="warn" size={16} />
        <span>{b.text}</span>
      </div>
    );
  }
  return null;
}
