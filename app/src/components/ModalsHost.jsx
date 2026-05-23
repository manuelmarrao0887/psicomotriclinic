import { useStore } from "../lib/store.jsx";
import { Btn, Field, Inp, Sel, Modal, Eyebrow } from "../lib/ui.jsx";
import { Icon } from "../lib/icons.jsx";
import { DAYS, HOURS, MONTHS_2026 } from "../lib/constants.js";

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

      <Modal open={modal === "bulkPatient"} onClose={() => setModal(null)} title="Importar pacientes" eyebrow="— EM MASSA">
        <p style={{ fontSize: 13.5, color: "#8A8A86", marginBottom: 10, lineHeight: 1.6 }}>
          Uma linha por paciente. Formato: <b>Nome, Idade, Profissional, Dia, Hora, Tipo</b>.<br />
          O <b>Profissional</b> tem de existir (pelo nome). Dias: {DAYS.join(" · ")}. Tipo: individual/grupo (opcional).
        </p>
        <textarea value={form.bulk || ""} onChange={(e) => set("bulk", e.target.value)} rows={8}
          placeholder={"Maria S., 12, Maria Santos, Segunda, 17:00, individual\nTiago R., 8, João Lopes, Terça, 10:00, grupo"}
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
          <Field label="Seguro de saúde"><Inp placeholder="Ex: Médis" value={form.insName || ""} onChange={(e) => set("insName", e.target.value)} /></Field>
          <Field label="Número do seguro"><Inp placeholder="Ex: M-4421889" value={form.insNum || ""} onChange={(e) => set("insNum", e.target.value)} /></Field>
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
