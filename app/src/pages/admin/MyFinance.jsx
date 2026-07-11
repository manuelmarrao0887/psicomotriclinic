import { useMemo } from "react";
import { useStore } from "../../lib/store.jsx";
import { Card, Eyebrow, Btn } from "../../lib/ui.jsx";
import { ProFinance } from "../portals/ProfessionalPortal.jsx";
import { useNavigate } from "react-router-dom";

// Rota /meu-financeiro — Só aparece quando director tem profile.id ligado
// a um registo em `profs` (professionals.profile_id === user.id). Reusa
// o componente ProFinance do Portal Profissional, filtrado ao próprio.

export default function MyFinance() {
  const { profile, pts, profs, pays = [], createPayment, togglePayment, deletePayment, updatePayment } = useStore();
  const nav = useNavigate();

  const myProfRecord = useMemo(() => (profs || []).find((p) => p.profile_id === profile?.id) || null, [profs, profile?.id]);
  const myProfId = myProfRecord?.id;

  const myPatients = useMemo(() => {
    if (!myProfId) return [];
    return (pts || []).filter((p) => {
      const ids = p.professional_ids?.length ? p.professional_ids : (p.professional_id ? [p.professional_id] : []);
      return ids.includes(myProfId);
    });
  }, [pts, myProfId]);

  const myPatientIds = useMemo(() => new Set(myPatients.map((p) => p.id)), [myPatients]);
  const myPayments = useMemo(() => (pays || []).filter((py) => {
    if (py.professional_id) return py.professional_id === myProfId;
    return myPatientIds.has(py.patient_id);
  }), [pays, myPatientIds, myProfId]);

  if (!myProfId) {
    return (
      <Card pad={24}>
        <Eyebrow>— MEU CONSULTÓRIO</Eyebrow>
        <div className="serif" style={{ fontSize: 22, fontWeight: 300, color: "#152741", marginTop: 6, marginBottom: 10 }}>Sem registo profissional associado</div>
        <p style={{ fontSize: 14, color: "#5A5A58", lineHeight: 1.55 }}>
          Para gerir os seus próprios pagamentos precisa de estar ligado a um registo em Equipa. Peça a alguém com acesso para associar o seu utilizador ao registo correspondente.
        </p>
        <div style={{ marginTop: 14 }}>
          <Btn variant="secondary" onClick={() => nav("/equipa")}>Ir para Equipa</Btn>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Eyebrow>— MEU CONSULTÓRIO</Eyebrow>
        <h1 className="serif" style={{ fontSize: 30, fontWeight: 300, color: "#152741", letterSpacing: "-0.025em", marginTop: 6 }}>
          Meu financeiro<span className="serif-it">.</span>
        </h1>
        <p style={{ fontSize: 14, color: "#8A8A86", marginTop: 4 }}>
          Pagamentos dos seus {myPatients.length} paciente{myPatients.length === 1 ? "" : "s"}. Vista pessoal, separada do agregado da Casa em Financeiro.
        </p>
      </div>
      <ProFinance
        myPatients={myPatients}
        myPayments={myPayments}
        createPayment={createPayment}
        togglePayment={togglePayment}
        deletePayment={deletePayment}
        updatePayment={updatePayment}
      />
    </div>
  );
}
