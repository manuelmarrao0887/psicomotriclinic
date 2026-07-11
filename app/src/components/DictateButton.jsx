import { useEffect, useRef, useState } from "react";
import { Icon } from "../lib/icons.jsx";

// Botão microfone usando Web Speech API (SpeechRecognition).
// Chama onAppend(text) sempre que houver resultado interim ou final.
// Suporte: Chrome/Edge, Safari (parcial), Firefox (não). Testar client-side.

export default function DictateButton({ onAppend, lang = "pt-PT" }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  useEffect(() => {
    const S = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    setSupported(!!S);
  }, []);

  const start = () => {
    const S = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!S) return;
    const rec = new S();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (ev) => {
      const chunk = Array.from(ev.results).slice(ev.resultIndex).map((r) => r[0].transcript).join(" ");
      if (chunk && onAppend) onAppend((chunk.charAt(0).toUpperCase() + chunk.slice(1)).trim() + " ");
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  };

  const stop = () => {
    try { recRef.current?.stop(); } catch (_) {}
    setListening(false);
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      aria-label={listening ? "Parar ditado" : "Ditar por voz"}
      title={listening ? "Parar ditado" : "Ditar por voz (pt-PT)"}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 10px", borderRadius: 8,
        background: listening ? "#B83A3A" : "#F5F2EC",
        color: listening ? "#FFFFFF" : "#152741",
        border: "1px solid " + (listening ? "#B83A3A" : "#D9D3C5"),
        fontSize: 11, fontWeight: 600, cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      <span aria-hidden="true" style={{ display: "flex", animation: listening ? "pulse 1.2s infinite" : "none" }}>
        <Icon name={listening ? "warn" : "mail"} size={12} />
      </span>
      <span>{listening ? "A gravar…" : "Ditar"}</span>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5}}`}</style>
    </button>
  );
}
