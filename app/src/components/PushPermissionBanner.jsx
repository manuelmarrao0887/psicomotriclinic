import { useEffect, useState } from "react";
import { useStore } from "../lib/store.jsx";
import { Icon } from "../lib/icons.jsx";
import { Btn } from "../lib/ui.jsx";

// Banner discreto que pede permissão para notificações.
// Mostra-se se:
// - browser suporta Notification API
// - permission === "default" (nunca foi pedido)
// - utilizador ainda não dispensou nesta sessão (localStorage)
//
// Dismiss: persistente em localStorage por 7 dias.
const DISMISS_KEY = "psm.push.dismissedUntil";
const DISMISS_DAYS = 7;

export default function PushPermissionBanner() {
  const { pushState, enablePush, profile } = useStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pushState.permission !== "default") { setVisible(false); return; }
    if (!profile?.id) { setVisible(false); return; }
    const until = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (Date.now() < until) { setVisible(false); return; }
    setVisible(true);
  }, [pushState.permission, profile?.id]);

  if (!visible) return null;

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 86400000)); } catch (_) {}
    setVisible(false);
  };

  const enable = async () => {
    const res = await enablePush();
    if (res?.ok) setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Activar notificações"
      style={{
        position: "fixed",
        left: 16, right: 16,
        // Acima da bottom tab bar (mobile) ou no canto inferior direito (desktop).
        bottom: "calc(var(--tabbar-h) + var(--safe-bottom) + 16px)",
        maxWidth: 460, marginLeft: "auto", marginRight: "auto",
        background: "#152741", color: "#F7F4EE",
        padding: "14px 16px",
        borderRadius: 16,
        boxShadow: "0 14px 40px rgba(21,39,65,.32)",
        zIndex: 60,
        animation: "fu .3s cubic-bezier(.32,.72,0,1) both",
        display: "flex", gap: 12, alignItems: "flex-start",
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 18, background: "#E8A13C", color: "#152741", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="mail" size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Receber lembretes</div>
        <div style={{ fontSize: 12.5, color: "rgba(247,244,238,.78)", lineHeight: 1.5, marginBottom: 10 }}>
          Lembretes das sessões e novidades da clínica neste dispositivo.
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn size="sm" variant="accent" onClick={enable} disabled={pushState.enabling}>
            {pushState.enabling ? "A pedir…" : "Ativar"}
          </Btn>
          <Btn size="sm" variant="ghost" style={{ color: "rgba(247,244,238,.65)" }} onClick={dismiss}>
            Agora não
          </Btn>
        </div>
      </div>
      <button
        onClick={dismiss}
        aria-label="Fechar"
        className="ch tap-target"
        style={{ background: "transparent", color: "rgba(247,244,238,.55)", padding: 4, display: "flex" }}
      >
        <Icon name="x" size={16} />
      </button>
    </div>
  );
}
