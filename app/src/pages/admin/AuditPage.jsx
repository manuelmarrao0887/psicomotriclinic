import { useStore } from "../../lib/store.jsx";
import { Card, Eyebrow, Section, Tag } from "../../lib/ui.jsx";

const actionLabel = {
  change_role: "Alterar papel",
  delete_user: "Eliminar utilizador",
  activate_user: "Reativar utilizador",
  deactivate_user: "Desativar utilizador",
  add_professional: "Adicionar profissional",
  delete_professional: "Eliminar profissional",
  add_patient: "Adicionar paciente",
  update_patient: "Atualizar paciente",
  delete_patient: "Eliminar paciente",
  add_payment: "Registar pagamento",
  toggle_payment: "Alterar estado de pagamento",
  invite_user: "Convidar utilizador",
  save_overheads: "Atualizar custos fixos",
  save_variable_cost: "Registar custos variáveis",
  save_anamnesis: "Guardar anamnese",
  add_session_note: "Nota de sessão",
  delete_session_note: "Eliminar nota",
  save_intervention_plan: "Guardar plano",
  approve_request: "Aprovar pedido",
  reject_request: "Recusar pedido",
};

export default function AuditPage() {
  const { auditLog } = useStore();
  return (
    <div style={{ padding: "28px 40px 60px" }}>
      <Section eyebrow="— REGISTO" title={`Log de auditoria · ${auditLog.length}`} sub="Quem fez o quê, quando. Últimos 500 registos." />
      {auditLog.length === 0 && (
        <Card pad={40} style={{ textAlign: "center", color: "#8A8A86" }}>Sem registos ainda. As ações futuras aparecem aqui.</Card>
      )}
      <Card pad={0}>
        {auditLog.map((e, i) => (
          <div key={e.id} style={{
            display: "grid", gridTemplateColumns: "180px 1.5fr 2fr 1.2fr",
            padding: "12px 20px", alignItems: "center", fontSize: 13.5,
            borderBottom: i < auditLog.length - 1 ? "1px solid #EFEBE2" : "none",
          }}>
            <span className="mono" style={{ color: "#8A8A86", fontSize: 11 }}>{e.ts ? new Date(e.ts).toLocaleString("pt-PT") : ""}</span>
            <span style={{ color: "#152741", fontWeight: 500 }}>{actionLabel[e.action] || e.action}</span>
            <span style={{ color: "#5A5A58" }}>{e.summary || "—"}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Tag type={e.who_role === "director" ? "director" : "professional"}>{e.who_name || "—"}</Tag>
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}
