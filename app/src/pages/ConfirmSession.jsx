import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../lib/store.jsx";
import { Btn, Card, Eyebrow, Field, Inp } from "../lib/ui.jsx";
import { Icon, Mark } from "../lib/icons.jsx";

// Página alvo do tap no push de lembrete.
// URL: /confirmar/:patientId/:date  (date = AAAA-MM-DD)
//
// UX (modelo opt-out):
// - Default = vai estar lá. Mostra "Tudo OK" como CTA principal — fecha.
// - "Não posso ir" → confirmação → cria session_note status=cancelado
//   + opcional motivo + botão "Quer pedir troca?".

export default function ConfirmSession() {
  const { patientId, date } = useParams();
  const navigate = useNavigate();
  const { pts, profs, cancelSession } = useStore();
  const [stage, setStage] = useState("home"); // home | cancelling | done
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const pt = pts.find((p) => p.id === patientId);
  const pr = pt ? profs.find((x) => x.id === pt.professional_id) : null;

  const formattedDate = (() => {
    try {
      const d = new Date(date);
      if (isNaN(d)) return date;
      return d.toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" });
    } catch (_) { return date; }
  })();

  const doCancel = async () => {
    setBusy(true);
    const res = await cancelSession(patientId, date, reason);
    setBusy(false);
    if (res?.ok) setStage("done");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7F4EE", display: "flex", flexDirection: "column", paddingTop: "var(--safe-top)" }}>
      <header style={{ padding: "20px 20px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <Mark size={32} />
        <span style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em", color: "#152741" }}>
          PSICOMOTRI<span style={{ fontWeight: 400 }}>CLINIC</span>
        </span>
      </header>

      <main style={{ flex: 1, padding: "24px 18px calc(var(--safe-bottom) + 40px)", maxWidth: 500, width: "100%", margin: "0 auto" }}>
        <div style={{ marginBottom: 18 }}>
          <Eyebrow>— PRÓXIMA SESSÃO</Eyebrow>
          <h1 className="serif" style={{ fontSize: 30, fontWeight: 300, color: "#152741", letterSpacing: "-0.025em", lineHeight: 1.1, marginTop: 6 }}>
            {pt ? pt.name : "Sessão"}<span className="serif-it">.</span>
          </h1>
          <p style={{ fontSize: 14.5, color: "#8A8A86", marginTop: 6 }}>
            {formattedDate}{pt?.hour ? ` · ${pt.hour}` : ""}
            {pr?.name && ` · com ${pr.name}`}
          </p>
        </div>

        {!pt && (
          <Card pad={22}>
            <div style={{ fontSize: 14, color: "#8A8A86" }}>Sessão não encontrada.</div>
            <div style={{ marginTop: 14 }}>
              <Btn variant="secondary" onClick={() => navigate("/")} style={{ width: "100%" }}>Voltar</Btn>
            </div>
          </Card>
        )}

        {pt && stage === "home" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Card pad={22}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: "#DDEADE", color: "#3D7A4A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="check" size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#152741" }}>Tudo OK?</div>
                  <div style={{ fontSize: 12.5, color: "#8A8A86" }}>Se sim, não precisa de fazer nada.</div>
                </div>
              </div>
              <Btn variant="primary" onClick={() => navigate("/")} style={{ width: "100%" }}>Tudo OK, fechar</Btn>
            </Card>

            <Card pad={22}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: "#F4E0E0", color: "#B83A3A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="x" size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#152741" }}>Não posso ir</div>
                  <div style={{ fontSize: 12.5, color: "#8A8A86" }}>Avisamos a direção e o profissional.</div>
                </div>
              </div>
              <Btn variant="danger" onClick={() => setStage("cancelling")} style={{ width: "100%" }}>Cancelar esta sessão</Btn>
            </Card>
          </div>
        )}

        {pt && stage === "cancelling" && (
          <Card pad={22}>
            <Eyebrow>— CANCELAR</Eyebrow>
            <div className="serif" style={{ fontSize: 20, fontWeight: 400, color: "#152741", marginTop: 6, marginBottom: 14 }}>
              Confirmar cancelamento
            </div>
            <Field label="Motivo (opcional)" hint="Ajuda o profissional a preparar a sessão de recuperação">
              <Inp
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: febre, viagem, escola fechada"
              />
            </Field>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <Btn variant="secondary" onClick={() => setStage("home")} disabled={busy} style={{ flex: 1 }}>Voltar</Btn>
              <Btn variant="danger" onClick={doCancel} disabled={busy} style={{ flex: 1 }}>
                {busy ? "A enviar…" : "Confirmar cancelamento"}
              </Btn>
            </div>
          </Card>
        )}

        {pt && stage === "done" && (
          <Card pad={28} style={{ textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, background: "#DDEADE", color: "#3D7A4A", display: "inline-flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Icon name="check" size={26} />
            </div>
            <div className="serif" style={{ fontSize: 22, fontWeight: 400, color: "#152741", marginBottom: 8 }}>
              Cancelamento registado
            </div>
            <p style={{ fontSize: 13.5, color: "#5A5A58", lineHeight: 1.55, marginBottom: 18 }}>
              A direção e o profissional foram avisados. Se quiser, pode propor uma data alternativa.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Btn variant="primary" onClick={() => navigate("/")} style={{ width: "100%" }}>Voltar ao portal</Btn>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
