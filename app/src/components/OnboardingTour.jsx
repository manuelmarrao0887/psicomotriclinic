import { useEffect, useState } from "react";
import { Mark } from "../lib/icons.jsx";
import { Btn } from "../lib/ui.jsx";

// Overlay 3 slides first-run per role. Persiste em localStorage
// psm.onboarding.done.<userId> = "1".

const SLIDES = {
  parent: [
    { title: "Bem-vindo ao portal", body: "Aqui acompanha a evolução do seu filho — plano de intervenção, notas de sessão, pagamentos e comunicações. Tudo num só sítio." },
    { title: "Plano de casa", body: "O terapeuta atribui exercícios que faz em casa entre sessões. Vídeos demonstrativos e streak counter para dias seguidos." },
    { title: "Fala connosco", body: "Diário de comportamento (30s/dia) + chat rate-limited com o terapeuta. Pedidos de troca de horário directamente do portal." },
  ],
  professional: [
    { title: "Portal profissional", body: "Vê hoje as sessões marcadas, próximos dias, aniversários dos seus pacientes e mensagens dos responsáveis." },
    { title: "Notas de sessão rápidas", body: "Registe notas com ditado por voz (pt-PT). Marque falta com 1 tap. Atribua exercícios do plano de casa." },
    { title: "Notificações", body: "Personalize as suas preferências em Conta. Mensagens dos responsáveis aparecem destacadas na home." },
  ],
  director: [
    { title: "Bem-vindo à direção", body: "Vista geral da clínica: hoje, alertas, KPIs, financeiro. Sidebar com todas as áreas de gestão." },
    { title: "Novas ferramentas", body: "Lista de espera (CRM leads), biblioteca de exercícios do plano de casa, RoleSwitcher para testar portais." },
    { title: "Dados", body: "Definições > Reset+Seed cria dataset demo. Release notes mostram o que foi adicionado a cada versão." },
  ],
};

export default function OnboardingTour({ profile }) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const role = profile?.role || "parent";
  const slides = SLIDES[role] || SLIDES.parent;

  useEffect(() => {
    if (!profile?.id) return;
    const key = `psm.onboarding.done.${profile.id}`;
    try {
      if (!localStorage.getItem(key)) {
        setTimeout(() => setVisible(true), 800);
      }
    } catch (_) {}
  }, [profile?.id]);

  const dismiss = () => {
    try { localStorage.setItem(`psm.onboarding.done.${profile.id}`, "1"); } catch (_) {}
    setVisible(false);
  };
  const next = () => step + 1 < slides.length ? setStep(step + 1) : dismiss();

  if (!visible || !profile) return null;
  const cur = slides[step];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(14,26,44,.88)",
      backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
      animation: "fu .25s ease both",
    }}>
      <div style={{
        maxWidth: 420, width: "100%",
        background: "#FFFFFF", borderRadius: 20,
        padding: 28,
        boxShadow: "0 40px 80px rgba(0,0,0,.35)",
      }}>
        <Mark size={40} />
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: ".14em", color: "#8A8A86", marginTop: 18, marginBottom: 8 }}>
          — {step + 1} / {slides.length}
        </div>
        <h2 className="serif" style={{ fontSize: 26, fontWeight: 400, color: "#152741", letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: 12 }}>
          {cur.title}
        </h2>
        <p style={{ fontSize: 14.5, color: "#5A5A58", lineHeight: 1.65, marginBottom: 22 }}>{cur.body}</p>
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {slides.map((_, i) => (
            <div key={i} aria-hidden="true" style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? "#E8A13C" : "#F5F2EC" }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <Btn variant="ghost" onClick={dismiss}>Saltar</Btn>
          <Btn variant="primary" onClick={next}>{step + 1 < slides.length ? "Continuar" : "Começar"}</Btn>
        </div>
      </div>
    </div>
  );
}
