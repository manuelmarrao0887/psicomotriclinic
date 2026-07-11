import { useEffect, useState } from "react";
import { getRoleOverride, setRoleOverride, ROLE_OPTIONS } from "../lib/roleOverride.js";
import { ADMIN_EMAIL } from "../lib/firebase.js";
import { Icon } from "../lib/icons.jsx";

// Chip flutuante bottom-left. Só monta quando profile.email === ADMIN_EMAIL.
// Mostra papel actual efectivo + popover para trocar.

export default function RoleSwitcher({ profile }) {
  const [open, setOpen] = useState(false);
  const [override, setLocalOverride] = useState(getRoleOverride());

  useEffect(() => {
    const h = () => setLocalOverride(getRoleOverride());
    window.addEventListener("psm-role-override", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("psm-role-override", h);
      window.removeEventListener("storage", h);
    };
  }, []);

  if (!profile || profile.email !== ADMIN_EMAIL) return null;

  const currentLabel = ROLE_OPTIONS.find((o) => o.value === override)?.label || "Papel real";
  const isOverriding = override !== "real";

  const pick = (v) => {
    setRoleOverride(v);
    setOpen(false);
  };

  return (
    <>
      {/* Chip */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Trocar papel para teste"
        aria-expanded={open}
        style={{
          position: "fixed",
          top: `calc(var(--safe-top) + 12px)`,
          right: 16,
          zIndex: 80,
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 14px",
          borderRadius: 999,
          background: isOverriding ? "#E8A13C" : "#152741",
          color: isOverriding ? "#152741" : "#F7F4EE",
          border: "none",
          boxShadow: "0 8px 24px rgba(21,39,65,.28)",
          fontSize: 12.5, fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <span aria-hidden="true" style={{ display: "flex" }}><Icon name="users" size={14} /></span>
        <span>{isOverriding ? "TESTE: " : ""}{currentLabel}</span>
        <span aria-hidden="true" style={{ opacity: .7 }}>▾</span>
      </button>

      {/* Popover */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 79, background: "rgba(21,39,65,.35)" }}
          />
          <div
            role="dialog"
            aria-label="Escolher papel de teste"
            style={{
              position: "fixed",
              top: `calc(var(--safe-top) + 58px)`,
              right: 16,
              zIndex: 81,
              width: 260,
              background: "#FFFFFF",
              border: "1px solid #EAE6DD",
              borderRadius: 14,
              boxShadow: "0 24px 60px rgba(21,39,65,.32)",
              padding: 8,
              animation: "fu .18s ease both",
            }}
          >
            <div style={{ padding: "8px 12px 6px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".12em", color: "#8A8A86" }}>
              — TESTAR COMO
            </div>
            {ROLE_OPTIONS.map((o) => {
              const sel = override === o.value;
              return (
                <button
                  key={o.value}
                  onClick={() => pick(o.value)}
                  aria-pressed={sel}
                  style={{
                    width: "100%",
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: sel ? "#F5F2EC" : "transparent",
                    color: "#152741",
                    border: "none",
                    fontSize: 13.5, fontWeight: sel ? 600 : 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left",
                  }}
                >
                  <span aria-hidden="true" style={{
                    width: 16, height: 16, borderRadius: 8,
                    border: `2px solid ${sel ? "#E8A13C" : "#D9D3C5"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {sel && <span style={{ width: 8, height: 8, borderRadius: 4, background: "#E8A13C" }} />}
                  </span>
                  <span style={{ flex: 1 }}>{o.label}</span>
                </button>
              );
            })}
            <div style={{ padding: "8px 12px 4px", fontSize: 11, color: "#8A8A86", lineHeight: 1.5, borderTop: "1px solid #F5F2EC", marginTop: 6 }}>
              Testa como Responsável ou Profissional sem sair da conta admin.
              Rules do Firestore permitem leitura completa (és director real).
            </div>
          </div>
        </>
      )}
    </>
  );
}
