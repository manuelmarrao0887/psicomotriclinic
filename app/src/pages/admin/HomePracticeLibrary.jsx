import { useState } from "react";
import { useStore } from "../../lib/store.jsx";
import { Btn, Card, Eyebrow, Section, Tag, Modal, Field, Inp, Sel, ConfirmModal } from "../../lib/ui.jsx";
import { Icon } from "../../lib/icons.jsx";

const DOMAINS = [
  "Coordenação motora", "Esquema corporal", "Lateralidade", "Equilíbrio",
  "Regulação emocional", "Atenção", "Função executiva", "Tónus muscular",
  "Praxias", "Cooperação / social",
];

export default function HomePracticeLibrary() {
  const { homeExercises = [], addHomeExercise, deleteHomeExercise } = useStore();
  const [addOpen, setAddOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", video_url: "", domains: [], suggested_frequency: "3x semana", duration_seconds: 60, difficulty: "médio" });

  const submit = async () => {
    if (!form.title) return;
    await addHomeExercise({ ...form, duration_seconds: parseInt(form.duration_seconds) || 60 });
    setForm({ title: "", description: "", video_url: "", domains: [], suggested_frequency: "3x semana", duration_seconds: 60, difficulty: "médio" });
    setAddOpen(false);
  };
  const toggleDomain = (d) => setForm((f) => ({ ...f, domains: f.domains.includes(d) ? f.domains.filter((x) => x !== d) : [...f.domains, d] }));

  return (
    <div className="page-pad" style={{ padding: "28px 40px 60px" }}>
      <Section
        eyebrow="— PLANO DE CASA"
        title={`Biblioteca de exercícios · ${homeExercises.length}`}
        sub="Exercícios que profissionais atribuem aos pacientes. Cada um pode ter vídeo demo (YouTube/Vimeo)."
        right={<Btn icon={<Icon name="plus" size={16} />} onClick={() => setAddOpen(true)}>Novo exercício</Btn>}
      />

      {homeExercises.length === 0 ? (
        <Card pad={40} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "#8A8A86" }}>Ainda sem exercícios. Crie o primeiro.</div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {homeExercises.map((e) => (
            <Card key={e.id} pad={18}>
              <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                {(e.domains || []).slice(0, 3).map((d) => <Tag key={d} type="default">{d}</Tag>)}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#152741", marginBottom: 4 }}>{e.title}</div>
              {e.description && <div style={{ fontSize: 13, color: "#5A5A58", lineHeight: 1.5, marginBottom: 8 }}>{e.description}</div>}
              <div style={{ fontSize: 12, color: "#8A8A86", marginBottom: 10 }}>
                {e.suggested_frequency} · {e.duration_seconds || 60}s · {e.difficulty || "médio"}
              </div>
              {e.video_url && (
                <a href={e.video_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#E8A13C", textDecoration: "underline" }}>Ver vídeo demo →</a>
              )}
              <div style={{ marginTop: 12, borderTop: "1px solid #F5F2EC", paddingTop: 10 }}>
                <Btn size="sm" variant="danger" icon={<Icon name="trash" size={13} />} onClick={() => setToDelete(e)}>Eliminar</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Novo exercício" eyebrow="— BIBLIOTECA" width={560}>
        <Field label="Título"><Inp value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ex: Saltar a pés juntos sobre linha" /></Field>
        <Field label="Descrição">
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Como executar. Duração. Pontos de atenção." style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #D9D3C5", fontSize: 14, background: "#FFFFFF", minHeight: 90, resize: "vertical", fontFamily: "inherit" }} />
        </Field>
        <Field label="URL de vídeo (YouTube / Vimeo)"><Inp value={form.video_url} onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))} placeholder="https://youtu.be/…" /></Field>
        <div style={{ fontSize: 12, color: "#5A5A58", marginBottom: 6, fontWeight: 500 }}>Domínios psicomotores</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {DOMAINS.map((d) => (
            <button key={d} onClick={() => toggleDomain(d)} style={{
              padding: "5px 10px", borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: "pointer",
              border: `1px solid ${form.domains.includes(d) ? "#152741" : "#D9D3C5"}`,
              background: form.domains.includes(d) ? "#152741" : "#FFFFFF",
              color: form.domains.includes(d) ? "#F7F4EE" : "#152741",
              fontFamily: "inherit",
            }}>{d}</button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <Field label="Frequência"><Inp value={form.suggested_frequency} onChange={(e) => setForm((f) => ({ ...f, suggested_frequency: e.target.value }))} /></Field>
          <Field label="Duração (s)"><Inp type="number" value={form.duration_seconds} onChange={(e) => setForm((f) => ({ ...f, duration_seconds: e.target.value }))} /></Field>
          <Field label="Dificuldade">
            <Sel value={form.difficulty} onChange={(v) => setForm((f) => ({ ...f, difficulty: v }))} options={[{ v: "fácil", l: "Fácil" }, { v: "médio", l: "Médio" }, { v: "difícil", l: "Difícil" }]} />
          </Field>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
          <Btn variant="secondary" onClick={() => setAddOpen(false)}>Cancelar</Btn>
          <Btn onClick={submit} disabled={!form.title}>Criar</Btn>
        </div>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => { deleteHomeExercise(toDelete.id); setToDelete(null); }}
        eyebrow="— ELIMINAR"
        title={`Eliminar "${toDelete?.title || ""}"?`}
        message="O exercício sai da biblioteca. Atribuições existentes ficam órfãs mas mantêm-se activas."
        confirmLabel="Eliminar"
      />
    </div>
  );
}
