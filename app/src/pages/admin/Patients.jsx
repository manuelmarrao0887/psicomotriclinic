import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../lib/store.jsx";
import { Btn, Card, Eyebrow, Section, Av, Tag, Progress, ConfirmModal, Modal, Field, Skeleton, EmptyState } from "../../lib/ui.jsx";
import { Icon } from "../../lib/icons.jsx";
import { INSURANCE_LABEL } from "../../lib/constants.js";

const Row = ({ label, value }) => (
  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", padding: "8px 0", borderTop: "1px solid #F5F2EC", fontSize: 13.5 }}>
    <span style={{ color: "#8A8A86" }}>{label}</span>
    <span style={{ color: "#152741" }}>{value || "—"}</span>
  </div>
);

export default function Patients() {
  const { pts, profs, hydrated, setForm, setModal } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const filtered = pts.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-pad" style={{ padding: "28px 40px 60px" }}>
      <Section eyebrow="— CASOS" title={`Pacientes · ${pts.length}`} sub="Acompanhamentos em curso"
        right={<>
          <div className="only-desktop" style={{ position: "relative", width: 260 }}>
            <label htmlFor="patient-search" className="sr-only">Procurar paciente</label>
            <div aria-hidden="true" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#8A8A86", display: "flex" }}><Icon name="search" size={16} /></div>
            <input id="patient-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Procurar paciente…" aria-label="Procurar paciente" style={{ width: "100%", padding: "10px 14px 10px 40px", borderRadius: 10, border: "1px solid #D9D3C5", fontSize: 14, background: "#FFFFFF" }} />
          </div>
          <Btn variant="secondary" icon={<Icon name="copy" size={15} />} onClick={() => { setForm({}); setModal("bulkPatient"); }}>Importar</Btn>
          <Btn icon={<Icon name="plus" size={16} />} onClick={() => { setForm({}); setModal("addPatient"); }}>Novo paciente</Btn>
        </>} />

      {/* Search mobile — full width abaixo do título */}
      <div className="only-mobile" style={{ position: "relative", marginBottom: 14 }}>
        <label htmlFor="patient-search-m" className="sr-only">Procurar paciente</label>
        <div aria-hidden="true" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#8A8A86", display: "flex" }}><Icon name="search" size={16} /></div>
        <input id="patient-search-m" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Procurar paciente…" aria-label="Procurar paciente" style={{ width: "100%", padding: "12px 14px 12px 40px", borderRadius: 12, border: "1px solid #D9D3C5", background: "#FFFFFF" }} />
      </div>

      <Card pad={0} style={{ overflow: "hidden" }}>
        <div data-mobile-cards="true">
          <div role="row" data-mobile-row="header" style={{ display: "grid", gridTemplateColumns: "2fr 80px 2fr 2fr 1.2fr 1fr", padding: "14px 20px", background: "#F5F2EC", borderBottom: "1px solid #EAE6DD" }}>
            <Eyebrow>Nome</Eyebrow><Eyebrow>Idade</Eyebrow><Eyebrow>Profissional</Eyebrow><Eyebrow>Horário</Eyebrow><Eyebrow>Tipo</Eyebrow><Eyebrow>&nbsp;</Eyebrow>
          </div>
          {filtered.map((p, i) => {
            const ids = (p.professional_ids && p.professional_ids.length) ? p.professional_ids : (p.professional_id ? [p.professional_id] : []);
            const names = ids.map((id) => profs.find((x) => x.id === id)?.name).filter(Boolean).join(" · ") || "—";
            const open = () => navigate(`/pacientes/${p.id}`);
            return (
              <div key={p.id} role="button" tabIndex={0} aria-label={`Abrir ficha de ${p.name}`} data-mobile-row="row" className="ch" onClick={open}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }}
                style={{
                  display: "grid", gridTemplateColumns: "2fr 80px 2fr 2fr 1.2fr 1fr",
                  padding: "14px 20px", alignItems: "center", cursor: "pointer",
                  borderBottom: i < filtered.length - 1 ? "1px solid #F5F2EC" : "none",
                }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: "#152741" }}>{p.name}</span>
                <span style={{ fontSize: 13, color: "#5A5A58" }}>
                  <span className="only-mobile mono" style={{ fontSize: 10, color: "#8A8A86", marginRight: 6 }}>IDADE</span>
                  {p.age} anos
                </span>
                <span style={{ fontSize: 13, color: "#5A5A58" }}>
                  <span className="only-mobile mono" style={{ fontSize: 10, color: "#8A8A86", marginRight: 6 }}>PROFISSIONAL</span>
                  {names}
                </span>
                <span style={{ fontSize: 13, color: "#5A5A58" }}>
                  <span className="only-mobile mono" style={{ fontSize: 10, color: "#8A8A86", marginRight: 6 }}>HORÁRIO</span>
                  {p.day_of_week} · {p.hour}
                </span>
                <span><Tag type={p.session_type === "individual" ? "sage" : "amber"}>{p.session_type === "individual" ? "Individual" : "Grupo"}</Tag></span>
                <span className="only-desktop" style={{ textAlign: "right", color: "#B9CDE0" }} aria-hidden="true"><Icon name="arr" size={16} /></span>
              </div>
            );
          })}
          {filtered.length === 0 && (!hydrated
            ? <div style={{ padding: "8px 20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
                {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} w={`${70 - i * 6}%`} h={18} />)}
              </div>
            : <EmptyState icon="clipboard"
                title={search ? "Sem resultados" : "Ainda sem pacientes"}
                message={search ? "Nenhum paciente corresponde à procura." : "Comece por criar o primeiro paciente."}
                action={!search && <Btn icon={<Icon name="plus" size={15} />} onClick={() => { setForm({}); setModal("addPatient"); }}>Novo paciente</Btn>} />
          )}
        </div>
      </Card>
    </div>
  );
}

export function PatientDetail() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { pts, profs, pays, anamneses, notes, plans, users, deletePatient, deleteSessionNote, setPatientParents, setForm, setModal } = useStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [parentsModal, setParentsModal] = useState(false);
  const pt = pts.find((x) => x.id === patientId);
  const anam = anamneses.find((a) => a.patient_id === patientId);
  const ptNotes = notes.filter((n) => n.patient_id === patientId).sort((a, b) => (a.date < b.date ? 1 : -1));
  const plan = plans.find((p) => p.patient_id === patientId);

  if (!pt) return (
    <div style={{ padding: "28px 40px" }}>
      <button onClick={() => navigate("/pacientes")} className="ch" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "#5A5A58", marginBottom: 18, padding: "6px 0" }}>
        <Icon name="back" size={16} /> Voltar
      </button>
      <Card pad={28} style={{ textAlign: "center", color: "#8A8A86" }}>Paciente não encontrado.</Card>
    </div>
  );

  const ids = (pt.professional_ids && pt.professional_ids.length) ? pt.professional_ids : (pt.professional_id ? [pt.professional_id] : []);
  const profNames = ids.map((id) => profs.find((x) => x.id === id)?.name).filter(Boolean).join(" · ") || "—";
  const myPays = pays.filter((p) => p.patient_id === pt.id);
  const ini = pt.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="page-pad patient-detail" style={{ padding: "28px 40px 60px" }}>
      <button onClick={() => navigate("/pacientes")} className="ch tap-target" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#5A5A58", marginBottom: 18, padding: "6px 0" }}>
        <Icon name="back" size={16} /> Voltar a pacientes
      </button>
      <div className="patient-grid" style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }}>
        <Card pad={28} style={{ textAlign: "center", height: "fit-content" }}>
          <Av t={ini} bg="#DCE7F0" sz={88} />
          <div className="serif" style={{ fontSize: 24, fontWeight: 300, color: "#152741", marginTop: 16, letterSpacing: "-0.02em" }}>{pt.name}</div>
          <div style={{ fontSize: 13.5, color: "#8A8A86", marginTop: 4 }}>{pt.age} anos{pt.birth_date ? ` · ${new Date(pt.birth_date).toLocaleDateString("pt-PT")}` : ""}</div>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
            <Tag type={pt.session_type === "individual" ? "sage" : "amber"}>{pt.session_type === "individual" ? "Individual" : "Grupo"}</Tag>
            <Tag type="default">{pt.day_of_week} · {pt.hour}</Tag>
          </div>
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid #F5F2EC", display: "flex", flexDirection: "column", gap: 10 }}>
            <Btn size="sm" variant="secondary" icon={<Icon name="edit" size={14} />}
              onClick={() => {
                setForm({
                  editingId: pt.id,
                  name: pt.name, age: pt.age, prof: pt.professional_id,
                  profs: pt.professional_ids || (pt.professional_id ? [pt.professional_id] : []),
                  sessionType: pt.session_type, day: pt.day_of_week, hour: pt.hour,
                  nif: pt.nif, birth: pt.birth_date,
                  mother: pt.parent_mother, father: pt.parent_father,
                  doctor: pt.doctor, others: pt.other_profs,
                  insName: pt.insurance_name, insNum: pt.insurance_number,
                });
                setModal("addPatient");
              }}>Editar dados</Btn>
            <Btn size="sm" variant="secondary" icon={<Icon name="wallet" size={14} />} onClick={() => { setForm({ pt: pt.id }); setModal("addPayment"); }}>Registar pagamento</Btn>
            <Btn size="sm" variant="danger" icon={<Icon name="trash" size={14} />}
              onClick={() => setConfirmDelete(true)}>
              Eliminar paciente
            </Btn>
          </div>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Card pad={28}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <Eyebrow>— FAMÍLIA</Eyebrow>
              <Btn size="sm" variant="secondary" icon={<Icon name="users" size={13} />} onClick={() => setParentsModal(true)}>Vincular contas</Btn>
            </div>
            <div>
              <Row label="Nome da mãe" value={pt.parent_mother} />
              <Row label="Nome do pai" value={pt.parent_father} />
              <Row label="NIF" value={pt.nif} />
            </div>
            <LinkedParents patient={pt} users={users} />
          </Card>
          <Card pad={28}>
            <Eyebrow>— SAÚDE</Eyebrow>
            <div style={{ marginTop: 10 }}>
              <Row label="Médico" value={pt.doctor} />
              <Row label="Outros profissionais" value={pt.other_profs} />
              <Row label="Seguro de saúde" value={INSURANCE_LABEL[pt.insurance_name] || pt.insurance_name} />
              <Row label="Nº de seguro" value={pt.insurance_number} />
            </div>
          </Card>
          <Card pad={28}>
            <Eyebrow>— INTERVENÇÃO</Eyebrow>
            <div style={{ marginTop: 10 }}>
              <Row label="Tipo" value={pt.session_type === "individual" ? "Individual" : "Grupo"} />
              <Row label={pt.session_type === "grupo" ? "Profissionais" : "Profissional"} value={profNames} />
              <Row label="Horário fixo" value={`${pt.day_of_week} · ${pt.hour}`} />
              <Row label="Periodicidade" value={pt.periodicity || "Semanal"} />
            </div>
          </Card>
          {/* ─── ANAMNESE ─── */}
          <Card pad={28}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <Eyebrow>— ANAMNESE</Eyebrow>
              <Btn size="sm" variant="secondary" icon={<Icon name="edit" size={13} />}
                onClick={() => {
                  setForm({
                    anamnesisPatientId: pt.id,
                    referral_reason: anam?.referral_reason || "",
                    chief_complaints: anam?.chief_complaints || "",
                    birth_history: anam?.birth_history || "",
                    developmental_milestones: anam?.developmental_milestones || "",
                    school_context: anam?.school_context || "",
                    family_context: anam?.family_context || "",
                    previous_interventions: anam?.previous_interventions || "",
                    general_notes: anam?.general_notes || "",
                  });
                  setModal("anamnesis");
                }}>{anam ? "Editar anamnese" : "Criar anamnese"}</Btn>
            </div>
            {!anam ? (
              <div style={{ fontSize: 13.5, color: "#8A8A86", lineHeight: 1.6 }}>Ainda sem anamnese registada. Clica em <b>Criar anamnese</b> para preencher.</div>
            ) : (
              <div style={{ marginTop: 6 }}>
                {[
                  { l: "Motivo do encaminhamento", v: anam.referral_reason },
                  { l: "Queixas principais", v: anam.chief_complaints },
                  { l: "Gestação / nascimento", v: anam.birth_history },
                  { l: "Marcos do desenvolvimento", v: anam.developmental_milestones },
                  { l: "Contexto escolar", v: anam.school_context },
                  { l: "Contexto familiar", v: anam.family_context },
                  { l: "Intervenções anteriores", v: anam.previous_interventions },
                  { l: "Notas gerais", v: anam.general_notes },
                ].filter((x) => x.v && x.v.trim()).map((x) => (
                  <div key={x.l} style={{ padding: "10px 0", borderTop: "1px solid #F5F2EC" }}>
                    <div className="mono" style={{ fontSize: 10.5, color: "#8A8A86", marginBottom: 4 }}>{x.l.toUpperCase()}</div>
                    <div style={{ fontSize: 13.5, color: "#3C3C3B", whiteSpace: "pre-wrap", lineHeight: 1.55 }}>{x.v}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ─── PLANO DE INTERVENÇÃO ─── */}
          <Card pad={28}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <Eyebrow>— PLANO DE INTERVENÇÃO</Eyebrow>
              <Btn size="sm" variant="secondary" icon={<Icon name="edit" size={13} />}
                onClick={() => {
                  setForm({
                    planPatientId: pt.id,
                    planArea: plan?.area || "",
                    planObjectives: plan?.objectives || [],
                    planStart: plan?.start_date || "",
                    planReview: plan?.review_date || "",
                    planNotes: plan?.notes || "",
                  });
                  setModal("plan");
                }}>{plan ? "Editar plano" : "Criar plano"}</Btn>
            </div>
            {!plan ? (
              <div style={{ fontSize: 13.5, color: "#8A8A86", lineHeight: 1.6 }}>Ainda sem plano de intervenção. Define objetivos terapêuticos mensuráveis.</div>
            ) : (
              <div style={{ marginTop: 6 }}>
                {plan.area && <div style={{ fontSize: 14, color: "#152741", fontWeight: 500, marginBottom: 12 }}>{plan.area}</div>}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {(plan.objectives || []).map((o, i) => (
                    <div key={i} style={{ padding: 14, borderRadius: 10, background: "#FFFFFF", border: "1px solid #F5F2EC" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                        <div style={{ fontSize: 13.5, color: "#152741", lineHeight: 1.5 }}>{o.text}</div>
                        <Tag type={o.status === "atingido" ? "sage" : o.status === "em_pausa" ? "pendente" : "default"}>
                          {o.status === "atingido" ? "Atingido" : o.status === "em_pausa" ? "Em pausa" : "Ativo"}
                        </Tag>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {o.domain && <span className="mono" style={{ fontSize: 10.5, color: "#8A8A86" }}>{o.domain.toUpperCase()}</span>}
                        <div style={{ flex: 1 }}>
                          <Progress pct={o.progress || 0} color={o.status === "atingido" ? "#3D7A4A" : "#152741"} />
                        </div>
                        <span className="mono" style={{ fontSize: 11, color: "#5A5A58", minWidth: 36, textAlign: "right" }}>{o.progress || 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                {plan.notes && (
                  <div style={{ marginTop: 14, padding: 12, borderTop: "1px solid #F5F2EC", fontSize: 13, color: "#5A5A58", whiteSpace: "pre-wrap", lineHeight: 1.55 }}>{plan.notes}</div>
                )}
                {plan.review_date && (
                  <div style={{ marginTop: 10, fontSize: 12, color: "#8A8A86" }}>Próxima revisão: <b>{new Date(plan.review_date).toLocaleDateString("pt-PT")}</b></div>
                )}
              </div>
            )}
          </Card>

          {/* ─── NOTAS DE SESSÃO ─── */}
          <Card pad={28}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <Eyebrow>— NOTAS DE SESSÃO · {ptNotes.length}</Eyebrow>
              <Btn size="sm" variant="primary" icon={<Icon name="plus" size={13} />}
                onClick={() => {
                  setForm({
                    snPatientId: pt.id,
                    snDate: new Date().toISOString().slice(0, 10),
                    snStatus: "realizada",
                    snProf: pt.professional_id || "",
                    snDomains: [],
                    snWork: "", snObs: "", snProgress: "", snNext: "",
                  });
                  setModal("sessionNote");
                }}>Nova nota</Btn>
            </div>
            {ptNotes.length === 0 ? (
              <div style={{ fontSize: 13.5, color: "#8A8A86", lineHeight: 1.6 }}>Ainda sem notas de sessão registadas.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 6 }}>
                {ptNotes.map((n) => {
                  const pr = profs.find((x) => x.id === n.professional_id);
                  return (
                    <div key={n.id} style={{ padding: 14, borderRadius: 10, background: "#FFFFFF", border: "1px solid #F5F2EC" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span className="mono" style={{ fontSize: 11, color: "#152741", fontWeight: 600 }}>{n.date && new Date(n.date).toLocaleDateString("pt-PT")}</span>
                          <Tag type={n.status === "realizada" ? "realizada" : n.status === "falta" ? "falta" : "default"}>
                            {n.status === "realizada" ? "Realizada" : n.status === "falta" ? "Falta" : "Cancelada"}
                          </Tag>
                          {pr && <span style={{ fontSize: 12, color: "#8A8A86" }}>· {pr.name}</span>}
                        </div>
                        <button onClick={() => setNoteToDelete(n.id)} aria-label="Eliminar nota de sessão" className="ch" style={{ color: "#B83A3A", padding: 6, display: "flex" }} title="Eliminar"><Icon name="trash" size={14} /></button>
                      </div>
                      {n.domains && n.domains.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                          {n.domains.map((d) => (
                            <span key={d} style={{ padding: "3px 9px", borderRadius: 99, background: "#DCE7F0", color: "#1E3556", fontSize: 11, fontWeight: 500 }}>{d}</span>
                          ))}
                        </div>
                      )}
                      {[
                        { l: "Trabalho realizado", v: n.work_done },
                        { l: "Observações clínicas", v: n.observations },
                        { l: "Evolução observada", v: n.progress },
                        { l: "Plano para a próxima sessão", v: n.next_plan },
                      ].filter((x) => x.v && x.v.trim()).map((x) => (
                        <div key={x.l} style={{ marginTop: 8 }}>
                          <div className="mono" style={{ fontSize: 10, color: "#8A8A86", marginBottom: 2 }}>{x.l.toUpperCase()}</div>
                          <div style={{ fontSize: 13, color: "#3C3C3B", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{x.v}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {myPays.length > 0 && (
            <Card pad={28}>
              <Eyebrow>— PAGAMENTOS</Eyebrow>
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {myPays.map((p) => (
                  <div key={p.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "8px 0", borderTop: "1px solid #F5F2EC", fontSize: 13.5, alignItems: "center" }}>
                    <span style={{ color: "#5A5A58" }}>{p.month}</span>
                    <span style={{ color: "#152741", fontWeight: 500 }}>{p.amount}€</span>
                    <span><Tag type={p.status}>{p.status === "pago" ? "Pago" : "Pendente"}</Tag></span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => { deletePatient(pt.id); setConfirmDelete(false); navigate("/pacientes"); }}
        eyebrow="— AÇÃO PERMANENTE"
        title={`Eliminar paciente "${pt.name}"?`}
        message="Esta ação é permanente e apaga o caso clínico associado (anamnese, plano e notas de sessão). Os pagamentos associados não são removidos."
        confirmLabel="Eliminar paciente"
      />
      <ConfirmModal
        open={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={() => { deleteSessionNote(noteToDelete); setNoteToDelete(null); }}
        eyebrow="— ELIMINAR NOTA"
        title="Eliminar esta nota de sessão?"
        message="A nota é apagada definitivamente do registo clínico."
        confirmLabel="Eliminar"
      />
      <LinkParentsModal
        open={parentsModal}
        onClose={() => setParentsModal(false)}
        patient={pt}
        users={users}
        onSave={(ids) => { setPatientParents(pt.id, ids); setParentsModal(false); }}
      />
    </div>
  );
}

function LinkedParents({ patient, users }) {
  const linked = (patient.parent_user_ids || [])
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean);

  if (linked.length === 0) {
    return (
      <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#F5E5CD", color: "#C97A1F", fontSize: 12.5, lineHeight: 1.5, display: "flex", gap: 8, alignItems: "flex-start" }}>
        <Icon name="warn" size={16} />
        <span>
          Nenhuma conta de responsável vinculada. Quando vincular, esse responsável passa a ver este paciente no portal dele.
        </span>
      </div>
    );
  }
  return (
    <div style={{ marginTop: 12 }}>
      <div className="mono" style={{ fontSize: 10, color: "#8A8A86", marginBottom: 6 }}>RESPONSÁVEIS VINCULADOS · {linked.length}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {linked.map((u) => (
          <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#FFFFFF", border: "1px solid #F5F2EC", borderRadius: 10 }}>
            <Av t={u.full_name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?"} bg="#DCE7F0" sz={28} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#152741", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.full_name}</div>
              <div style={{ fontSize: 11.5, color: "#8A8A86" }}>{u.email}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LinkParentsModal({ open, onClose, patient, users, onSave }) {
  const [selected, setSelected] = useState(patient?.parent_user_ids || []);
  const [search, setSearch] = useState("");

  // Reset sempre que abre
  useMemo(() => { if (open) setSelected(patient?.parent_user_ids || []); }, [open, patient?.id]);

  const parents = (users || [])
    .filter((u) => u.role === "parent" && u.active !== false)
    .filter((u) => !search || (u.full_name || "").toLowerCase().includes(search.toLowerCase()) || (u.email || "").toLowerCase().includes(search.toLowerCase()));

  const toggle = (id) => {
    setSelected((cur) => cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  };

  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Vincular responsáveis" eyebrow="— CONTAS COM ACESSO" width={520}>
      <p style={{ fontSize: 13.5, color: "#5A5A58", lineHeight: 1.55, marginBottom: 14 }}>
        Selecione as contas (perfis com papel "Responsável") que devem ver este paciente nos seus portais.
      </p>
      <Field label="Procurar">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nome ou email…" style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #D9D3C5", fontSize: 14, background: "#FFFFFF" }} />
      </Field>
      <div style={{ maxHeight: 280, overflowY: "auto", border: "1px solid #F5F2EC", borderRadius: 10, marginTop: 4 }}>
        {parents.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#8A8A86", fontSize: 13 }}>
            {search ? "Sem resultados." : "Sem contas de responsável registadas. Convide um em Definições → Convidar utilizador."}
          </div>
        ) : (
          parents.map((u) => {
            const checked = selected.includes(u.id);
            return (
              <label key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderBottom: "1px solid #F5F2EC", cursor: "pointer", background: checked ? "#F5F2EC" : "transparent" }}>
                <input type="checkbox" checked={checked} onChange={() => toggle(u.id)} style={{ width: 18, height: 18 }} />
                <Av t={u.full_name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?"} bg="#DCE7F0" sz={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: "#152741", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.full_name}</div>
                  <div style={{ fontSize: 11.5, color: "#8A8A86" }}>{u.email}</div>
                </div>
              </label>
            );
          })
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
        <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={() => onSave(selected)}>Guardar ({selected.length})</Btn>
      </div>
    </Modal>
  );
}
