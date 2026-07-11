import { useMemo } from "react";
import { useStore } from "../../lib/store.jsx";
import { Card, Eyebrow, Btn } from "../../lib/ui.jsx";
import { ProFinance } from "../portals/ProfessionalPortal.jsx";
import { useNavigate } from "react-router-dom";

// Rota /meu-financeiro — só aparece quando o Diretor está ligado a um
// registo em `profs` (professionals.profile_id === user.id). AdminLayout
// já pinta o header do topo (— MEU CONSULTÓRIO / Meu financeiro), por isso
// aqui só o conteúdo com o padding admin habitual.

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
      <div style={{ padding: "28px 40px 60px" }}>
        <Card pad={24}>
          <Eyebrow>— MEU CONSULTÓRIO</Eyebrow>
          <div className="serif" style={{ fontSize: 22, fontWeight: 300, color: "var(--ink, #152741)", marginTop: 6, marginBottom: 10 }}>
            Sem registo profissional associado
          </div>
          <p style={{ fontSize: 14, color: "var(--sub, #5A5A58)", lineHeight: 1.55 }}>
            Para gerir os seus próprios pagamentos precisa de estar ligado a um registo em Equipa. Peça a alguém com acesso para associar o seu utilizador ao registo correspondente.
          </p>
          <div style={{ marginTop: 14 }}>
            <Btn variant="secondary" onClick={() => nav("/equipa")}>Ir para Equipa</Btn>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 40px 60px" }}>
      <div style={{ marginBottom: 20, fontSize: 14, color: "var(--sub, #8A8A86)", lineHeight: 1.55 }}>
        Vista pessoal dos seus {myPatients.length} paciente{myPatients.length === 1 ? "" : "s"}. Separada do agregado da Casa em <b>Financeiro</b>. Aqui pode registar pagamentos, alternar entre mês e vista Ano/IRS, exportar CSV e emitir recibos.
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
