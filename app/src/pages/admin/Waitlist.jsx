import { useMemo, useState } from "react";
import { useStore } from "../../lib/store.jsx";
import { Av, Btn, Card, Eyebrow, Section, Tag, Modal, Field, Inp, Sel, ConfirmModal, Skeleton, EmptyState } from "../../lib/ui.jsx";
import { Icon } from "../../lib/icons.jsx";

const STATUS = [
  { v: "new",                l: "Novo",              dot: "#8A8A86", bg: "#F5F2EC" },
  { v: "contacted",          l: "Contactado",        dot: "#C97A1F", bg: "#F5E5CD" },
  { v: "meeting_scheduled",  l: "Reunião marcada",   dot: "#1E3556", bg: "#DCE7F0" },
  { v: "anamnesis_done",     l: "Anamnese feita",    dot: "#3D7A4A", bg: "#DDEADE" },
  { v: "activated",          l: "Ativado",           dot: "#3D7A4A", bg: "#DDEADE" },
  { v: "declined",           l: "Arquivado",         dot: "#B83A3A", bg: "#F4E0E0" },
];
const STATUS_MAP = Object.fromEntries(STATUS.map((s) => [s.v, s]));

const genColor = (name) => {
  const hues = ["#DCE7F0", "#C7DDCB", "#F5D9A8", "#F5F2EC", "#B9CDE0", "#8DBF94", "#F5E5CD"];
  const h = (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return hues[h % hues.length];
};

export default function Waitlist() {
  const { waitlist = [], hydrated, addWaitlist, updateWaitlist, deleteWaitlist } = useStore();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sortKey, setSortKey] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [form, setForm] = useState({ name: "", age: "", contact_email: "", contact_phone: "", source: "", notes: "" });

  const rows = useMemo(() => {
    let arr = waitlist.slice();
    if (filter !== "all") arr = arr.filter((w) => (w.status || "new") === filter);
    arr.sort((a, b) => {
      const av = a[sortKey] ?? ""; const bv = b[sortKey] ?? "";
      let c = 0;
      if (typeof av === "number" && typeof bv === "number") c = av - bv;
      else c = String(av).localeCompare(String(bv));
      return sortDir === "desc" ? -c : c;
    });
    return arr;
  }, [waitlist, filter, sortKey, sortDir]);

  const toggleSort = (k) => {
    if (sortKey === k) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };

  const activeCount = waitlist.filter((w) => w.status !== "declined" && w.status !== "activated").length;

  const openEdit = (w) => {
    setEditing(w);
    setForm({ name: w.name || "", age: w.age || "", contact_email: w.contact_email || "", contact_phone: w.contact_phone || "", source: w.source || "", notes: w.notes || "" });
  };
  const submit = async () => {
    if (!form.name) return;
    if (editing) {
      await updateWaitlist(editing.id, { name: form.name, age: form.age ? parseInt(form.age) : null, contact_email: form.contact_email, contact_phone: form.contact_phone, source: form.source, notes: form.notes });
      setEditing(null);
    } else {
      await addWaitlist({ ...form, age: form.age ? parseInt(form.age) : null });
      setAddOpen(false);
    }
    setForm({ name: "", age: "", contact_email: "", contact_phone: "", source: "", notes: "" });
  };

  return (
    <div className="page-pad" style={{ padding: "28px 40px 60px" }}>
      <Section
        eyebrow="— LEADS"
        title={`Lista de espera · ${activeCount} ativos`}
        sub="Contactos que ainda não são pacientes. Fluxo: novo → contactado → reunião → anamnese → ativado."
        right={<Btn icon={<Icon name="plus" size={16} />} onClick={() => setAddOpen(true)}>Novo contacto</Btn>}
      />

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        <button onClick={() => setFilter("all")} className="ch" style={chip(filter === "all")}>Todos ({waitlist.length})</button>
        {STATUS.map((s) => {
          const n = waitlist.filter((w) => (w.status || "new") === s.v).length;
          if (n === 0) return null;
          return <button key={s.v} onClick={() => setFilter(s.v)} className="ch" style={chip(filter === s.v)}>{s.l} ({n})</button>;
        })}
      </div>

      <Card pad={0} style={{ overflow: "hidden" }}>
        {rows.length === 0 ? (
          !hydrated
            ? <div style={{ padding: "12px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>{[0, 1, 2].map((i) => <Skeleton key={i} w={`${75 - i * 8}%`} h={18} />)}</div>
            : <EmptyState icon="users" title="Sem contactos" message="Adicione o primeiro lead à lista de espera."
                action={<Btn icon={<Icon name="plus" size={15} />} onClick={() => setAddOpen(true)}>Novo contacto</Btn>} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#F5F2EC", borderBottom: "1px solid #EAE6DD" }}>
                  <Th onClick={() => toggleSort("name")} active={sortKey === "name"} dir={sortDir}>Nome</Th>
                  <Th onClick={() => toggleSort("status")} active={sortKey === "status"} dir={sortDir}>Estado</Th>
                  <Th>Contactos</Th>
                  <Th onClick={() => toggleSort("source")} active={sortKey === "source"} dir={sortDir}>Origem</Th>
                  <Th onClick={() => toggleSort("created_at")} active={sortKey === "created_at"} dir={sortDir}>Adicionado</Th>
                  <Th align="right">Acções</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((w, i) => {
                  const st = STATUS_MAP[w.status || "new"];
                  const ini = (w.name || "").split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();
                  const added = w.created_at ? new Date(w.created_at).toLocaleDateString("pt-PT") : "—";
                  return (
                    <tr key={w.id} style={{ borderBottom: i < rows.length - 1 ? "1px solid #F5F2EC" : "none" }}>
                      <Td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Av t={ini} bg={genColor(w.name)} sz={32} />
                          <div>
                            <div style={{ color: "#152741", fontWeight: 500 }}>{w.name}</div>
                            {w.age && <div style={{ color: "#8A8A86", fontSize: 12 }}>{w.age} anos</div>}
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 99, background: st.bg, fontSize: 11.5, fontWeight: 600, color: "#152741" }}>
                          <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 3, background: st.dot }} />
                          {st.l}
                        </span>
                      </Td>
                      <Td>
                        <div style={{ fontSize: 12.5, color: "#5A5A58" }}>
                          {w.contact_email && <div style={{ whiteSpace: "nowrap" }}>{w.contact_email}</div>}
                          {w.contact_phone && <div style={{ whiteSpace: "nowrap" }}>{w.contact_phone}</div>}
                          {!w.contact_email && !w.contact_phone && "—"}
                        </div>
                      </Td>
                      <Td><span style={{ fontSize: 13, color: "#5A5A58" }}>{w.source || "—"}</span></Td>
                      <Td><span style={{ fontSize: 13, color: "#8A8A86" }}>{added}</span></Td>
                      <Td align="right">
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
                          <Sel value={w.status || "new"} onChange={(v) => updateWaitlist(w.id, { status: v })} options={STATUS.map((s) => ({ v: s.v, l: s.l }))} />
                          <button onClick={() => openEdit(w)} aria-label="Editar" className="ch" style={iconBtnStyle}><Icon name="edit" size={14} /></button>
                          <button onClick={() => setToDelete(w)} aria-label="Remover" className="ch" style={{ ...iconBtnStyle, color: "#B83A3A" }}><Icon name="trash" size={14} /></button>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={addOpen || !!editing} onClose={() => { setAddOpen(false); setEditing(null); }} title={editing ? "Editar contacto" : "Novo contacto"} eyebrow="— LISTA DE ESPERA" width={520}>
        <Field label="Nome"><Inp value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Beatriz Sá" /></Field>
        <Field label="Idade"><Inp type="number" value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} /></Field>
        <Field label="Email"><Inp type="email" value={form.contact_email} onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))} /></Field>
        <Field label="Telefone"><Inp value={form.contact_phone} onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))} /></Field>
        <Field label="Origem" hint="Pediatra, escola, WhatsApp, referência…"><Inp value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} /></Field>
        <Field label="Notas">
          <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Contexto, queixa, disponibilidade…" style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #D9D3C5", fontSize: 14, background: "#FFFFFF", minHeight: 80, resize: "vertical", fontFamily: "inherit" }} />
        </Field>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
          <Btn variant="secondary" onClick={() => { setAddOpen(false); setEditing(null); }}>Cancelar</Btn>
          <Btn onClick={submit} disabled={!form.name}>{editing ? "Guardar" : "Adicionar"}</Btn>
        </div>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => { deleteWaitlist(toDelete.id); setToDelete(null); }}
        eyebrow="— REMOVER"
        title={`Remover "${toDelete?.name || ""}"?`}
        message="O contacto é eliminado permanentemente da lista de espera."
        confirmLabel="Remover"
      />
    </div>
  );
}

function Th({ children, onClick, active, dir, align }) {
  return (
    <th onClick={onClick} style={{
      padding: "12px 16px", textAlign: align || "left",
      fontSize: 10.5, letterSpacing: ".12em", fontWeight: 700, color: "#8A8A86",
      cursor: onClick ? "pointer" : "default",
      whiteSpace: "nowrap", userSelect: "none",
    }}>
      {children}
      {active && <span aria-hidden="true" style={{ marginLeft: 6, color: "#152741" }}>{dir === "asc" ? "↑" : "↓"}</span>}
    </th>
  );
}
function Td({ children, align }) {
  return <td style={{ padding: "12px 16px", textAlign: align || "left", verticalAlign: "middle" }}>{children}</td>;
}
const chip = (active) => ({
  padding: "6px 12px", borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: "pointer",
  border: `1px solid ${active ? "#152741" : "#D9D3C5"}`,
  background: active ? "#152741" : "#FFFFFF",
  color: active ? "#F7F4EE" : "#152741",
  fontFamily: "inherit",
});
const iconBtnStyle = {
  padding: 8, borderRadius: 8, background: "transparent", border: "1px solid #EAE6DD",
  cursor: "pointer", color: "#5A5A58", display: "flex", alignItems: "center", justifyContent: "center",
};
