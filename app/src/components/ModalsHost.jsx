import { useStore } from "../lib/store.jsx";
import { Btn, Field, Inp, Sel, Modal, Eyebrow } from "../lib/ui.jsx";
import { Icon } from "../lib/icons.jsx";
import { DAYS, HOURS, MONTHS_2026, INSURANCES, INSURANCE_LABEL } from "../lib/constants.js";

// Domínios de psicomotricidade — usados nas notas de sessão e plano.
const PSM_DOMAINS = [
  "Coordenação motora",
  "Esquema corporal",
  "Lateralidade",
  "Equilíbrio",
  "Regulação emocional",
  "Atenção",
  "Função executiva",
  "Tónus muscular",
  "Praxias",
  "Cooperação / social",
];

const taStyle = { width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: "1px solid #D9D3C5", fontSize: 14, background: "#FBF9F4", color: "#3C3C3B", fontFamily: "inherit", resize: "vertical", minHeight: 70 };
const Ta = (props) => <textarea {...props} style={{ ...taStyle, ...(props.style || {}) }} />;

export default function ModalsHost() {
  const s = useStore();
  const { modal, setModal, form, setForm, profs } = s;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <Modal open={modal === "invite"} onClose={() => { setModal(null); setForm((f) => ({ ...f, inviteResult: null })); }}
        title={form.inviteResult ? "Conta criada" : "Convidar utilizador"} eyebrow="— NOVO ACESSO">
        {!form.inviteResult ? (
          <>
            <Field label="Nome"><Inp value={form.invName || ""} onChange={(e) => set("invName", e.target.value)} placeholder="Ex: João Silva" /></Field>
            <Field label="Email ou utilizador"><Inp type="text" value={form.invEmail || ""} onChange={(e) => set("invEmail", e.target.value)} placeholder="joao@email.pt  ou  utilizador" /></Field>
            <Field label="Papel"><Sel value={form.invRole || ""} onChange={(v) => set("invRole", v)} options={[{ v: "professional", l: "Profissional" }, { v: "parent", l: "Responsável" }, { v: "director", l: "Diretor" }]} /></Field>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
              <Btn variant="secondary" onClick={() => setModal(null)}>Cancelar</Btn>
              <Btn onClick={s.inviteUser} disabled={!form.invName || !form.invEmail || !form.invRole}>Criar conta</Btn>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 13.5, color: "#5A5A58", lineHeight: 1.6, marginBottom: 14 }}>
              Conta criada para <b>{form.inviteResult.name}</b>. Guarde estas credenciais e partilhe com o utilizador.
            </div>
            <div style={{ marginBottom: 12 }}>
              <Eyebrow>EMAIL/UTILIZADOR</Eyebrow>
              <div style={{ fontSize: 14, color: "#152741", marginTop: 4 }}>{form.inviteResult.email}</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <Eyebrow>PASSWORD TEMPORÁRIA</Eyebrow>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 14, color: "#152741" }}>{form.inviteResult.pw}</span>
                <button onClick={() => navigator.clipboard?.writeText(form.inviteResult.pw)} className="ch" style={{ color: "#5A5A58", padding: 4, display: "flex" }}><Icon name="copy" size={16} /></button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn onClick={() => { setModal(null); setForm({}); }}>Fechar</Btn>
            </div>
          </>
        )}
      </Modal>

      <Modal open={modal === "addProf"} onClose={() => setModal(null)} title="Adicionar profissional" eyebrow="— NOVA EQUIPA">
        <Field label="Nome"><Inp placeholder="Ex: Maria Santos" value={form.name || ""} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="Função"><Sel value={form.role || "Psicomotricista"} onChange={(v) => set("role", v)} options={[{ v: "Psicomotricista", l: "Psicomotricista" }, { v: "Terapeuta Ocupacional", l: "Terapeuta Ocupacional" }, { v: "Psicólogo/a", l: "Psicólogo/a" }]} /></Field>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
          <Btn variant="secondary" onClick={() => setModal(null)}>Cancelar</Btn>
          <Btn onClick={s.addProf} disabled={!form.name}>Adicionar</Btn>
        </div>
      </Modal>

      <Modal open={modal === "bulkProf"} onClose={() => setModal(null)} title="Importar profissionais" eyebrow="— EM MASSA">
        <p style={{ fontSize: 13.5, color: "#8A8A86", marginBottom: 10, lineHeight: 1.6 }}>
          Uma linha por profissional. Formato: <b>Nome, Função</b> — a função é opcional (por defeito Psicomotricista).
        </p>
        <textarea value={form.bulk || ""} onChange={(e) => set("bulk", e.target.value)} rows={8}
          placeholder={"Maria Santos, Psicomotricista\nJoão Lopes, Terapeuta Ocupacional\nInês Castro"}
          style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10, border: "1px solid #D9D3C5", fontSize: 14, background: "#FBF9F4", color: "#3C3C3B", fontFamily: "inherit", resize: "vertical" }} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
          <Btn variant="secondary" onClick={() => setModal(null)}>Cancelar</Btn>
          <Btn onClick={s.addProfsBulk} disabled={!(form.bulk || "").trim()}>Importar</Btn>
        </div>
      </Modal>

      <Modal open={modal === "bulkPatient"} onClose={() => setModal(null)} title="Importar pacientes" eyebrow="— EM MASSA" width={620}>
        {/* Toggle de formato */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14, padding: 4, background: "#FBF9F4", border: "1px solid #E5E0D4", borderRadius: 10 }}>
          {[
            { v: "schedule", l: "Com horário", h: "Nome, Idade, Profissional, Dia, Hora, Tipo" },
            { v: "admin", l: "Só dados administrativos", h: "Nome, NIF, Seguro, Nº seguro" },
          ].map((opt) => {
            const active = (form.bulkMode || "schedule") === opt.v;
            return (
              <button key={opt.v} type="button" className="ch" onClick={() => set("bulkMode", opt.v)} style={{
                flex: 1, padding: "8px 10px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                background: active ? "#152741" : "transparent",
                color: active ? "#F7F4EE" : "#5A5A58",
                border: "none", cursor: "pointer",
              }}>{opt.l}</button>
            );
          })}
        </div>

        {(form.bulkMode || "schedule") === "admin" ? (
          <p style={{ fontSize: 13.5, color: "#8A8A86", marginBottom: 10, lineHeight: 1.6 }}>
            Uma linha por paciente. Formato: <b>Nome, NIF, Seguro, Nº seguro</b>.<br />
            <b>Seguro</b> aceita: <b>ADSE</b>, <b>SAMS</b>, ou <b>ADM</b> (Assistência de Doença Militares). Pode ficar vazio.
            Os pacientes ficam <i>sem horário</i> atribuído — depois editas para definir profissional e horário.
          </p>
        ) : (
          <p style={{ fontSize: 13.5, color: "#8A8A86", marginBottom: 10, lineHeight: 1.6 }}>
            Uma linha por paciente. Formato: <b>Nome, Idade, Profissional, Dia, Hora, Tipo</b>.<br />
            O <b>Profissional</b> tem de existir (pelo nome). Dias: {DAYS.join(" · ")}. Tipo: individual/grupo (opcional).
          </p>
        )}

        <textarea value={form.bulk || ""} onChange={(e) => set("bulk", e.target.value)} rows={8}
          placeholder={(form.bulkMode || "schedule") === "admin"
            ? "Maria Silva, 245678901, ADSE, M-4421889\nJoão Pereira, 267781234, SAMS, S-9921003\nAna Costa, 289112344, ADM, ADM-553219"
            : "Maria S., 12, Maria Santos, Segunda, 17:00, individual\nTiago R., 8, João Lopes, Terça, 10:00, grupo"}
          style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10, border: "1px solid #D9D3C5", fontSize: 14, background: "#FBF9F4", color: "#3C3C3B", fontFamily: "inherit", resize: "vertical" }} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
          <Btn variant="secondary" onClick={() => setModal(null)}>Cancelar</Btn>
          <Btn onClick={s.addPatientsBulk} disabled={!(form.bulk || "").trim()}>Importar</Btn>
        </div>
      </Modal>

      <Modal open={modal === "addPatient"} onClose={() => setModal(null)} title={form.editingId ? "Editar paciente" : "Novo paciente"} eyebrow="— NOVO CASO" width={640}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
          <Field label="Nome"><Inp placeholder="Ex: Maria S." value={form.name || ""} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Idade"><Inp type="number" placeholder="12" value={form.age || ""} onChange={(e) => set("age", e.target.value)} /></Field>
          <Field label="Data nascimento"><Inp type="date" value={form.birth || ""} onChange={(e) => set("birth", e.target.value)} /></Field>
        </div>
        <Field label="NIF"><Inp placeholder="123456789" value={form.nif || ""} onChange={(e) => set("nif", e.target.value)} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Nome da mãe"><Inp placeholder="Ex: Ana Silva" value={form.mother || ""} onChange={(e) => set("mother", e.target.value)} /></Field>
          <Field label="Nome do pai"><Inp placeholder="Ex: João Silva" value={form.father || ""} onChange={(e) => set("father", e.target.value)} /></Field>
        </div>
        <Field label="Médico que segue o caso"><Inp placeholder="Ex: Dr. Pedro Almeida (Pediatria)" value={form.doctor || ""} onChange={(e) => set("doctor", e.target.value)} /></Field>
        <Field label="Outros profissionais que seguem o caso" hint="Separe vários com vírgula"><Inp placeholder="Ex: Terapia da fala · Inês Castro" value={form.others || ""} onChange={(e) => set("others", e.target.value)} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Seguro de saúde">
            <Sel value={INSURANCES.includes(form.insName) ? form.insName : ""} onChange={(v) => set("insName", v || null)}
              options={INSURANCES.map((k) => ({ v: k, l: INSURANCE_LABEL[k] }))} placeholder="— Sem seguro / Outro —" />
            {form.insName && !INSURANCES.includes(form.insName) && (
              <div style={{ fontSize: 11.5, color: "#8A8A86", marginTop: 6 }}>
                Valor atual: <b>{form.insName}</b> (não está nas opções; selecione um para substituir).
              </div>
            )}
          </Field>
          <Field label="Número do seguro"><Inp placeholder="Ex: 4421889" value={form.insNum || ""} onChange={(e) => set("insNum", e.target.value)} /></Field>
        </div>

        {((form.sessionType || "individual") === "grupo") ? (
          <Field label="Profissionais do grupo" hint="Selecione um ou mais">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {profs.map((p) => {
                const sel = (form.profs || []).includes(p.id);
                return (
                  <button key={p.id} type="button" className="ch" onClick={() => setForm((f) => { const cur = f.profs || []; return { ...f, profs: cur.includes(p.id) ? cur.filter((x) => x !== p.id) : [...cur, p.id] }; })} style={{
                    padding: "8px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
                    background: sel ? "#152741" : "#FBF9F4", color: sel ? "#F7F4EE" : "#3C3C3B",
                    border: `1px solid ${sel ? "#152741" : "#D9D3C5"}`,
                  }}>{sel ? "✓ " : ""}{p.name}</button>
                );
              })}
              {profs.length === 0 && <span style={{ fontSize: 13, color: "#8A8A86" }}>Adicione profissionais primeiro.</span>}
            </div>
          </Field>
        ) : (
          <Field label="Profissional"><Sel value={form.prof || ""} onChange={(v) => set("prof", v)} options={profs.map((p) => ({ v: p.id, l: p.name }))} /></Field>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Field label="Tipo de intervenção"><Sel value={form.sessionType || "individual"} onChange={(v) => set("sessionType", v)} options={[{ v: "individual", l: "Individual" }, { v: "grupo", l: "Grupo" }]} /></Field>
          <Field label="Dia"><Sel value={form.day || ""} onChange={(v) => set("day", v)} options={DAYS.map((d) => ({ v: d, l: d }))} /></Field>
          <Field label="Hora"><Sel value={form.hour || ""} onChange={(v) => set("hour", v)} options={HOURS.map((h) => ({ v: h, l: h }))} /></Field>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
          <Btn variant="secondary" onClick={() => setModal(null)}>Cancelar</Btn>
          <Btn onClick={s.addPatient} disabled={!form.name || !form.age || !form.sessionType || !form.day || !form.hour || ((form.sessionType === "grupo") ? !(form.profs && form.profs.length) : !form.prof)}>
            {form.editingId ? "Guardar" : "Criar caso"}
          </Btn>
        </div>
      </Modal>

      <Modal open={modal === "addPayment"} onClose={() => setModal(null)} title="Registar pagamento" eyebrow="— FINANCEIRO">
        <Field label="Paciente"><Sel value={form.pt || ""} onChange={(v) => set("pt", v)} options={s.pts.map((p) => ({ v: p.id, l: p.name }))} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Field label="Valor (€)"><Inp type="number" placeholder="220" value={form.amount || ""} onChange={(e) => set("amount", e.target.value)} /></Field>
          <Field label="Mês"><Sel value={form.payMonth || "Maio 2026"} onChange={(v) => set("payMonth", v)} options={MONTHS_2026.map((m) => ({ v: m, l: m }))} /></Field>
          <Field label="Estado"><Sel value={form.paySt || "pendente"} onChange={(v) => set("paySt", v)} options={[{ v: "pago", l: "Pago" }, { v: "pendente", l: "Pendente" }]} /></Field>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
          <Btn variant="secondary" onClick={() => setModal(null)}>Cancelar</Btn>
          <Btn onClick={s.addPayment} disabled={!form.pt || !form.amount}>Registar</Btn>
        </div>
      </Modal>

      <Modal open={modal === "overheads"} onClose={() => setModal(null)} title="Renda & garagem (fixos)" eyebrow="— CUSTOS FIXOS MENSAIS">
        <Field label="Renda do espaço (€/mês)"><Inp type="number" placeholder="0" value={form.rent ?? ""} onChange={(e) => set("rent", e.target.value)} /></Field>
        <div style={{ fontSize: 12, color: "#8A8A86", margin: "8px 0 6px", fontWeight: 500 }}>Rendimento — aluguer de garagem</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Nº de lugares alugados"><Inp type="number" placeholder="3" value={form.garageSpots ?? ""} onChange={(e) => set("garageSpots", e.target.value)} /></Field>
          <Field label="Renda por lugar (€/mês)"><Inp type="number" placeholder="0" value={form.garagePerSpot ?? ""} onChange={(e) => set("garagePerSpot", e.target.value)} /></Field>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
          <Btn variant="secondary" onClick={() => setModal(null)}>Cancelar</Btn>
          <Btn onClick={s.saveOverheads}>Guardar</Btn>
        </div>
      </Modal>

      <Modal open={modal === "varCost"} onClose={() => setModal(null)} title="Custos variáveis do mês" eyebrow="— LUZ · ÁGUA · TELECOM.">
        <p style={{ fontSize: 13, color: "#8A8A86", marginBottom: 10, lineHeight: 1.6 }}>Estes valores variam de mês para mês. Registar de novo o mesmo mês substitui os valores.</p>
        <Field label="Mês"><Sel value={form.vcMonth || ""} onChange={(v) => set("vcMonth", v)} options={MONTHS_2026.map((m) => ({ v: m, l: m }))} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Field label="Luz / eletricidade (€)"><Inp type="number" placeholder="0" value={form.power ?? ""} onChange={(e) => set("power", e.target.value)} /></Field>
          <Field label="Água (€)"><Inp type="number" placeholder="0" value={form.water ?? ""} onChange={(e) => set("water", e.target.value)} /></Field>
          <Field label="Telecom. (€)"><Inp type="number" placeholder="0" value={form.telecom ?? ""} onChange={(e) => set("telecom", e.target.value)} /></Field>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
          <Btn variant="secondary" onClick={() => setModal(null)}>Cancelar</Btn>
          <Btn onClick={s.saveVarCost} disabled={!form.vcMonth}>Registar</Btn>
        </div>
      </Modal>

      {/* ───────── ANAMNESE ───────── */}
      <Modal open={modal === "anamnesis"} onClose={() => setModal(null)} title="Anamnese" eyebrow="— FICHA DE ADMISSÃO" width={720}>
        <p style={{ fontSize: 13, color: "#8A8A86", marginBottom: 12, lineHeight: 1.6 }}>
          Informação clínica de base do caso. Preencha o que tiver — pode atualizar depois.
        </p>
        <Field label="Motivo do encaminhamento">
          <Ta value={form.referral_reason || ""} onChange={(e) => set("referral_reason", e.target.value)} placeholder="Quem encaminhou, por que razão e que objetivo inicial." />
        </Field>
        <Field label="Queixas principais">
          <Ta value={form.chief_complaints || ""} onChange={(e) => set("chief_complaints", e.target.value)} placeholder="O que a família refere — dificuldades motoras, regulação, atenção, escola..." />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Gestação / nascimento">
            <Ta value={form.birth_history || ""} onChange={(e) => set("birth_history", e.target.value)} placeholder="Tipo de parto, prematuridade, complicações, peso à nascença..." />
          </Field>
          <Field label="Marcos do desenvolvimento">
            <Ta value={form.developmental_milestones || ""} onChange={(e) => set("developmental_milestones", e.target.value)} placeholder="Idade primeiras palavras, marcha, controlo de esfíncteres, alimentação..." />
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Contexto escolar">
            <Ta value={form.school_context || ""} onChange={(e) => set("school_context", e.target.value)} placeholder="Ano de escolaridade, desempenho, relação com pares e professores." />
          </Field>
          <Field label="Contexto familiar">
            <Ta value={form.family_context || ""} onChange={(e) => set("family_context", e.target.value)} placeholder="Composição, rotinas, dinâmica relacional, sono, alimentação." />
          </Field>
        </div>
        <Field label="Intervenções anteriores / em curso">
          <Ta value={form.previous_interventions || ""} onChange={(e) => set("previous_interventions", e.target.value)} placeholder="Terapia da fala, psicologia, terapia ocupacional, medicação..." />
        </Field>
        <Field label="Notas gerais">
          <Ta value={form.general_notes || ""} onChange={(e) => set("general_notes", e.target.value)} placeholder="Outras observações relevantes." />
        </Field>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
          <Btn variant="secondary" onClick={() => setModal(null)}>Cancelar</Btn>
          <Btn onClick={s.saveAnamnesis}>Guardar anamnese</Btn>
        </div>
      </Modal>

      {/* ───────── NOTA DE SESSÃO ───────── */}
      <Modal open={modal === "sessionNote"} onClose={() => setModal(null)} title="Nota de sessão" eyebrow="— REGISTO CLÍNICO" width={720}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Field label="Data"><Inp type="date" value={form.snDate || ""} onChange={(e) => set("snDate", e.target.value)} /></Field>
          <Field label="Estado da sessão">
            <Sel value={form.snStatus || "realizada"} onChange={(v) => set("snStatus", v)} options={[
              { v: "realizada", l: "Realizada" },
              { v: "falta", l: "Falta" },
              { v: "cancelada", l: "Cancelada" },
            ]} />
          </Field>
          <Field label="Profissional">
            <Sel value={form.snProf || ""} onChange={(v) => set("snProf", v)} options={s.profs.map((p) => ({ v: p.id, l: p.name }))} />
          </Field>
        </div>

        <Field label="Domínios trabalhados" hint="Seleciona um ou mais">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PSM_DOMAINS.map((d) => {
              const sel = (form.snDomains || []).includes(d);
              return (
                <button key={d} type="button" className="ch" onClick={() => setForm((f) => { const cur = f.snDomains || []; return { ...f, snDomains: cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d] }; })} style={{
                  padding: "7px 12px", borderRadius: 8, fontSize: 12.5, fontWeight: 500, cursor: "pointer",
                  background: sel ? "#152741" : "#FBF9F4", color: sel ? "#F7F4EE" : "#3C3C3B",
                  border: `1px solid ${sel ? "#152741" : "#D9D3C5"}`,
                }}>{sel ? "✓ " : ""}{d}</button>
              );
            })}
          </div>
        </Field>

        <Field label="Trabalho realizado"><Ta value={form.snWork || ""} onChange={(e) => set("snWork", e.target.value)} placeholder="Atividades, materiais, sequência da sessão..." /></Field>
        <Field label="Observações clínicas"><Ta value={form.snObs || ""} onChange={(e) => set("snObs", e.target.value)} placeholder="Comportamento, respostas, dificuldades, momentos significativos por domínio..." /></Field>
        <Field label="Evolução observada"><Ta value={form.snProgress || ""} onChange={(e) => set("snProgress", e.target.value)} placeholder="Progresso face à sessão anterior, objetivos atingidos..." /></Field>
        <Field label="Plano para a próxima sessão"><Ta value={form.snNext || ""} onChange={(e) => set("snNext", e.target.value)} placeholder="O que trabalhar a seguir, materiais a preparar..." /></Field>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
          <Btn variant="secondary" onClick={() => setModal(null)}>Cancelar</Btn>
          <Btn onClick={s.addSessionNote} disabled={!form.snDate || !form.snPatientId}>Guardar nota</Btn>
        </div>
      </Modal>

      {/* ───────── PLANO DE INTERVENÇÃO ───────── */}
      <Modal open={modal === "plan"} onClose={() => setModal(null)} title="Plano de intervenção" eyebrow="— OBJETIVOS TERAPÊUTICOS" width={720}>
        <p style={{ fontSize: 13, color: "#8A8A86", marginBottom: 12, lineHeight: 1.6 }}>
          Objetivos terapêuticos mensuráveis. O progresso pode ser atualizado ao longo do tempo.
        </p>
        <Field label="Área de intervenção"><Inp placeholder="Ex: Psicomotricidade — coordenação e regulação" value={form.planArea || ""} onChange={(e) => set("planArea", e.target.value)} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Data de início"><Inp type="date" value={form.planStart || ""} onChange={(e) => set("planStart", e.target.value)} /></Field>
          <Field label="Próxima revisão"><Inp type="date" value={form.planReview || ""} onChange={(e) => set("planReview", e.target.value)} /></Field>
        </div>

        <div style={{ fontSize: 12, color: "#5A5A58", marginBottom: 6, fontWeight: 500 }}>Objetivos</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
          {(form.planObjectives || []).map((o, idx) => (
            <div key={idx} style={{ padding: 12, borderRadius: 10, background: "#FBF9F4", border: "1px solid #E5E0D4" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "start" }}>
                <Ta rows={2} value={o.text} onChange={(e) => {
                  const arr = [...(form.planObjectives || [])]; arr[idx] = { ...arr[idx], text: e.target.value };
                  set("planObjectives", arr);
                }} placeholder="Ex: Melhorar coordenação óculo-manual em tarefas de precisão" />
                <button onClick={() => set("planObjectives", (form.planObjectives || []).filter((_, i) => i !== idx))}
                  className="ch" style={{ color: "#B83A3A", padding: 6 }} title="Remover"><Icon name="trash" size={16} /></button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10, alignItems: "center" }}>
                <Sel value={o.domain || ""} onChange={(v) => { const arr = [...(form.planObjectives || [])]; arr[idx] = { ...arr[idx], domain: v }; set("planObjectives", arr); }}
                  options={PSM_DOMAINS.map((d) => ({ v: d, l: d }))} placeholder="Domínio" />
                <Sel value={o.status || "ativo"} onChange={(v) => { const arr = [...(form.planObjectives || [])]; arr[idx] = { ...arr[idx], status: v }; set("planObjectives", arr); }}
                  options={[{ v: "ativo", l: "Ativo" }, { v: "atingido", l: "Atingido" }, { v: "em_pausa", l: "Em pausa" }]} />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="range" min="0" max="100" value={o.progress ?? 0} onChange={(e) => { const arr = [...(form.planObjectives || [])]; arr[idx] = { ...arr[idx], progress: Number(e.target.value) }; set("planObjectives", arr); }}
                    style={{ flex: 1 }} />
                  <span className="mono" style={{ fontSize: 12, color: "#5A5A58", minWidth: 36, textAlign: "right" }}>{o.progress ?? 0}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Btn size="sm" variant="secondary" icon={<Icon name="plus" size={14} />}
          onClick={() => set("planObjectives", [...(form.planObjectives || []), { text: "", domain: "", status: "ativo", progress: 0 }])}>
          Adicionar objetivo
        </Btn>

        <Field label="Notas do plano" hint="Estratégias, materiais, periodicidade, observações para a equipa">
          <Ta value={form.planNotes || ""} onChange={(e) => set("planNotes", e.target.value)} />
        </Field>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
          <Btn variant="secondary" onClick={() => setModal(null)}>Cancelar</Btn>
          <Btn onClick={s.savePlan}>Guardar plano</Btn>
        </div>
      </Modal>

      <Modal open={modal === "myPassword"} onClose={() => setModal(null)} title="Alterar a minha password" eyebrow="— SEGURANÇA">
        <p style={{ fontSize: 13, color: "#8A8A86", marginBottom: 12, lineHeight: 1.6 }}>Define a nova password da conta com que tens sessão iniciada. Mínimo 6 caracteres.</p>
        <Field label="Nova password">
          <div style={{ display: "flex", gap: 8 }}>
            <Inp type="text" placeholder="••••••" value={form.newPw || ""} onChange={(e) => set("newPw", e.target.value)} />
            <Btn variant="secondary" onClick={s.genPassword}>Gerar aleatória</Btn>
          </div>
        </Field>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
          <Btn variant="secondary" onClick={() => setModal(null)}>Cancelar</Btn>
          <Btn onClick={s.changeMyPassword} disabled={(form.newPw || "").trim().length < 6}>Alterar password</Btn>
        </div>
      </Modal>
    </>
  );
}
