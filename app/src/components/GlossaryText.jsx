import { useState } from "react";
import { GLOSSARY } from "../lib/glossary.js";

// Auto-highlight termos do glossário num bloco de texto. Ao passar por cima
// (hover / tap) mostra definição em popover pequeno.
//
// Uso: <GlossaryText text={session.progress} /> em vez de {session.progress}.

export default function GlossaryText({ text, style }) {
  if (!text) return null;
  const terms = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
  const regex = new RegExp(`(${terms.map((t) => escapeReg(t)).join("|")})`, "gi");
  const parts = String(text).split(regex);

  return (
    <span style={style}>
      {parts.map((part, i) => {
        const lower = part.toLowerCase();
        if (GLOSSARY[lower]) return <Term key={i} term={lower} label={part} />;
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

function Term({ term, label }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        style={{
          textDecoration: "underline",
          textDecorationStyle: "dotted",
          textDecorationColor: "#E8A13C",
          textUnderlineOffset: 2,
          cursor: "help",
        }}
        role="button"
        tabIndex={0}
        aria-label={`Definição de ${term}`}
      >
        {label}
      </span>
      {open && (
        <span style={{
          position: "absolute", zIndex: 30,
          bottom: "calc(100% + 6px)", left: 0,
          minWidth: 240, maxWidth: 320,
          padding: "10px 12px",
          background: "#152741", color: "#F7F4EE",
          borderRadius: 10, fontSize: 12.5, lineHeight: 1.55,
          boxShadow: "0 12px 30px rgba(21,39,65,.35)",
          fontWeight: 400,
        }}>
          <b style={{ color: "#E8A13C", textTransform: "capitalize", display: "block", marginBottom: 4, fontSize: 11 }}>{term}</b>
          {GLOSSARY[term]}
        </span>
      )}
    </span>
  );
}

function escapeReg(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
