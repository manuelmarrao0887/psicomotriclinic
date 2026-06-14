import { useStore } from "../../lib/store.jsx";
import { Btn, Card, Eyebrow, Section, Tag, Modal, Field, Inp, Sel, ConfirmModal } from "../../lib/ui.jsx";
import { Icon } from "../../lib/icons.jsx";
import { useState } from "react";

const AUDIENCE_LABEL = { all: "Todos", professional: "Profissionais", parent: "Responsáveis" };
const AUDIENCE_COLOR = { all: "default", professional: "professional", parent: "parent" };

export default function Announcements() {
  const { announcements, addAnnouncement, toggleAnnouncementActive, deleteAnnouncement, form, setForm, modal, setModal } = useStore();
  const [toDelete, setToDelete] = useState(null);

  const open = () => { setForm({ annTitle: "", annBody: "", annAudience: "all" }); setModal("addAnnouncement"); };

  const active = announcements.filter((a) => a.active !== false);
  const inactive = announcements.filter((a) => a.active === false);

  return (
    <div className="page-pad" style={{ padding: "28px 40px 60px" }}>
      <Section
        eyebrow="— COMUNICAÇÕES"
        title={`Anúncios · ${active.length} ativos`}
        sub="Mensagens visíveis para profissionais e/ou responsáveis nos seus portais"
        right={<Btn icon={<Icon name="plus" size={16} />} onClick={open}>Nova comunicação</Btn>}
      />

      {active.length === 0 && inactive.length === 0 && (
        <Card pad={40} style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 12, color: "#B9CDE0", display: "flex", justifyContent: "center" }}><Icon name="mail" size={32} /></div>
          <div className="serif-it" style={{ fontSize: 18, color: "#152741", marginBottom: 6 }}>Sem comunicações</div>
          <div style={{ fontSize: 13.5, color: "#8A8A86" }}>Use "Nova comunicação" para enviar um anúncio à equipa ou às famílias.</div>
        </Card>
      )}

      {active.length > 0 && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {active.map((a) => (
              <AnnouncementCard
                key={a.id}
                a={a}
                onToggle={() => toggleAnnouncementActive(a.id, false)}
                onDelete={() => setToDelete(a)}
              />
            ))}
          </div>
        </>
      )}

      {inactive.length > 0 && (
        <>
          <Section eyebrow="— ARQUIVO" title="Inativas" sub={`${inactive.length} arquivadas — não aparecem nos portais`} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: .7 }}>
            {inactive.map((a) => (
              <AnnouncementCard
                key={a.id}
                a={a}
                inactive
                onToggle={() => toggleAnnouncementActive(a.id, true)}
                onDelete={() => setToDelete(a)}
              />
            ))}
          </div>
        </>
      )}

      {/* Modal: criar comunicação */}
      <Modal open={modal === "addAnnouncement"} onClose={() => setModal(null)} title="Nova comunicação" eyebrow="— PUBLICAR" width={560}>
        <Field label="Título"><Inp value={form.annTitle || ""} onChange={(e) => setForm((f) => ({ ...f, annTitle: e.target.value }))} placeholder="Ex: Fecho no feriado de 10 de junho" /></Field>
        <Field label="Mensagem">
          <textarea
            value={form.annBody || ""}
            onChange={(e) => setForm((f) => ({ ...f, annBody: e.target.value }))}
            placeholder="O essencial em 2-3 frases."
            style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #D9D3C5", fontSize: 14, background: "#FBFAF7", minHeight: 110, resize: "vertical", fontFamily: "inherit" }}
          />
        </Field>
        <Field label="Audiência">
          <Sel
            value={form.annAudience || "all"}
            onChange={(v) => setForm((f) => ({ ...f, annAudience: v }))}
            options={[
              { v: "all", l: "Todos (Profissionais + Responsáveis)" },
              { v: "professional", l: "Apenas Profissionais" },
              { v: "parent", l: "Apenas Responsáveis" },
            ]}
          />
        </Field>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
          <Btn variant="secondary" onClick={() => setModal(null)}>Cancelar</Btn>
          <Btn onClick={addAnnouncement} disabled={!form.annTitle || !form.annBody}>Publicar</Btn>
        </div>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => { deleteAnnouncement(toDelete.id); setToDelete(null); }}
        eyebrow="— AÇÃO PERMANENTE"
        title={`Eliminar "${toDelete?.title || ""}"?`}
        message="A comunicação será permanentemente removida. Se quiser apenas escondê-la, prefira 'Desativar'."
        confirmLabel="Eliminar"
      />
    </div>
  );
}

function AnnouncementCard({ a, inactive, onToggle, onDelete }) {
  const date = a.created_at ? new Date(a.created_at) : null;
  return (
    <Card pad={20}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: "#152741" }}>{a.title}</span>
            <Tag type={AUDIENCE_COLOR[a.audience] || "default"}>{AUDIENCE_LABEL[a.audience] || a.audience || "Todos"}</Tag>
            {inactive && <Tag type="default">Inativa</Tag>}
          </div>
          <div style={{ fontSize: 13.5, color: "#3C3C3B", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{a.body}</div>
          <div style={{ fontSize: 12, color: "#8A8A86", marginTop: 10 }}>
            Por <b style={{ color: "#5A5A58" }}>{a.author_name || "Direção"}</b>
            {date && <> · {date.toLocaleDateString("pt-PT")} {date.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn size="sm" variant="secondary" onClick={onToggle}>{inactive ? "Reativar" : "Desativar"}</Btn>
          <Btn size="sm" variant="danger" icon={<Icon name="trash" size={13} />} onClick={onDelete}>Eliminar</Btn>
        </div>
      </div>
    </Card>
  );
}
