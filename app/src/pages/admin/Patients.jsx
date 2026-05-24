import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../lib/store.jsx";
import { Btn, Card, Eyebrow, Section, Av, Tag, Progress } from "../../lib/ui.jsx";
import { Icon } from "../../lib/icons.jsx";
import { INSURANCE_LABEL } from "../../lib/constants.js";

const Row = ({ label, value }) => (
  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", padding: "8px 0", borderTop: "1px solid #EFEBE2", fontSize: 13.5 }}>
    <span style={{ color: "#8A8A86" }}>{label}</span>
    <span style={{ color: "#152741" }}>{value || "—"}</span>
  </div>
);

export default function Patients() {
  const { pts, profs, setForm, setModal } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const filtered = pts.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: "28px 40px 60px" }}>
      <Section eyebrow="— CASOS" title={`Pacientes · ${pts.length}`} sub="Acompanhamentos em curso"
        right={<>
          <div style={{ position: "relative", width: 260 }}>
            <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#8A8A86", display: "flex" }}><Icon name="search" size={16} /></div>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Procurar paciente…" style={{ width: "100%", padding: "10px 14px 10px 40px", borderRadius: 10, border: "1px solid #D9D3C5", fontSize: 14, background: "#FBF9F4" }} />
          </div>
          <Btn variant="secondary" icon={<Icon name="copy" size={15} />} onClick={() => { setForm({}); setModal("bulkPatient"); }}>Importar</Btn>
          <Btn icon={<Icon name="plus" size={16} />} onClick={() => { setForm({}); setModal("addPatient"); }}>Novo paciente</Btn>
        </>} />
      <Card pad={0}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 80px 2fr 2fr 1.2fr 1fr", padding: "14px 20px", background: "#EFEBE2", borderBottom: "1px solid #E5E0D4" }}>
          <Eyebrow>Nome</Eyebrow><Eyebrow>Idade</Eyebrow><Eyebrow>Profissional</Eyebrow><Eyebrow>Horário</Eyebrow><Eyebrow>Tipo</Eyebrow><Eyebrow>&nbsp;</Eyebrow>
        </div>
        {filtered.map((p, i) => {
          const ids = (p.professional_ids && p.professional_ids.length) ? p.professional_ids : (p.professional_id ? [p.professional_id] : []);
          const names = ids.map((id) => profs.find((x) => x.id === id)?.name).filter(Boolean).join(" · ") || "—";
          return (
            <div key={p.id} className="ch" onClick={() => navigate(`/pacientes/${p.id}`)} style={{
              display: "grid", gridTemplateColumns: "2fr 80px 2fr 2fr 1.2fr 1fr",
              padding: "14px 20px", alignItems: "center", cursor: "pointer",
              borderBottom: i < filtered.length - 1 ? "1px solid #EFEBE2" : "none",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#FBF9F4"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#152741" }}>{p.name}</span>
              <span style={{ fontSize: 13.5, color: "#5A5A58" }}>{p.age}</span>
              <span style={{ fontSize: 13.5, color: "#5A5A58" }}>{names}</span>
              <span style={{ fontSize: 13.5, color: "#5A5A58" }}>{p.day_of_week} · {p.hour}</span>
              <span><Tag type={p.session_type === "individual" ? "sage" : "amber"}>{p.session_type === "individual" ? "Individual" : "Grupo"}</Tag></span>
              <span style={{ textAlign: "right", color: "#B9CDE0" }}><Icon name="arr" size={16} /></span>
            </div>
          );
        })}
        {filtered.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#8A8A86", fontSize: 14 }}>{search ? "Sem resultados para a procura." : "Sem pacientes. Use \"Novo paciente\"."}</div>}
      </Card>
    </div>
  );
}

export function PatientDetail() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { pts, profs, pays, anamneses, notes, plans, deletePatient, deleteSessionNote, setForm, setModal } = useStore();
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
    <div style={{ padding: "28px 40px 60px" }}>
      <button onClick={() => navigate("/pacientes")} className="ch" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "#5A5A58", marginBottom: 18, padding: "6px 0" }}>
        <Icon name="back" size={16} /> Voltar a pacientes
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }}>
        <Card pad={28} style={{ textAlign: "center", height: "fit-content" }}>
          <Av t={ini} bg="#DCE7F0" sz={88} />
          <div className="serif" style={{ fontSize: 24, fontWeight: 300, color: "#152741", marginTop: 16, letterSpacing: "-0.02em" }}>{pt.name}</div>
          <div style={{ fontSize: 13.5, color: "#8A8A86", marginTop: 4 }}>{pt.age} anos{pt.birth_date ? ` · ${new Date(pt.birth_date).toLocaleDateString("pt-PT")}` : ""}</div>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
            <Tag type={pt.session_type === "individual" ? "sage" : "amber"}>{pt.session_type === "individual" ? "Individual" : "Grupo"}</Tag>
            <Tag type="default">{pt.day_of_week} · {pt.hour}</Tag>
          </div>
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid #EFEBE2", display: "flex", flexDirection: "column", gap: 10 }}>
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
              onClick={() => { if (confirm(`Eliminar o paciente "${pt.name}"? Esta ação é permanente e apaga o caso clínico. Os pagamentos associados não são removidos.`)) { deletePatient(pt.id); navigate("/pacientes"); } }}>
              Eliminar paciente
            </Btn>
          </div>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Card pad={28}>
            <Eyebrow>— FAMÍLIA</Eyebrow>
            <div style={{ marginTop: 10 }}>
              <Row label="Nome da mãe" value={pt.parent_mother} />
              <Row label="Nome do pai" value={pt.parent_father} />
              <Row label="NIF" value={pt.nif} />
            </div>
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
                  <div key={x.l} style={{ padding: "10px 0", borderTop: "1px solid #EFEBE2" }}>
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
                    <div key={i} style={{ padding: 14, borderRadius: 10, background: "#FBF9F4", border: "1px solid #EFEBE2" }}>
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
                  <div style={{ marginTop: 14, padding: 12, borderTop: "1px solid #EFEBE2", fontSize: 13, color: "#5A5A58", whiteSpace: "pre-wrap", lineHeight: 1.55 }}>{plan.notes}</div>
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
                    <div key={n.id} style={{ padding: 14, borderRadius: 10, background: "#FBF9F4", border: "1px solid #EFEBE2" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span className="mono" style={{ fontSize: 11, color: "#152741", fontWeight: 600 }}>{n.date && new Date(n.date).toLocaleDateString("pt-PT")}</span>
                          <Tag type={n.status === "realizada" ? "realizada" : n.status === "falta" ? "falta" : "default"}>
                            {n.status === "realizada" ? "Realizada" : n.status === "falta" ? "Falta" : "Cancelada"}
                          </Tag>
                          {pr && <span style={{ fontSize: 12, color: "#8A8A86" }}>· {pr.name}</span>}
                        </div>
                        <button onClick={() => { if (confirm("Eliminar esta nota?")) deleteSessionNote(n.id); }} className="ch" style={{ color: "#B83A3A", padding: 6, display: "flex" }} title="Eliminar"><Icon name="trash" size={14} /></button>
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
                  <div key={p.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "8px 0", borderTop: "1px solid #EFEBE2", fontSize: 13.5, alignItems: "center" }}>
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
    </div>
  );
}
