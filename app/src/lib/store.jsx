// Store partilhada: dados carregados do Firestore + acções CRUD + toast + modais.
// Vive ao nível do AdminLayout — todas as páginas filhas usam `useStore()`.
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { sb } from "./firebase.js";
import { AVATAR_BG, normalizeInsurance, INSURANCES } from "./constants.js";

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ profile, children }) {
  const [users, setUsers]   = useState([]);
  const [profs, setProfs]   = useState([]);
  const [pts, setPts]       = useState([]);
  const [sess, setSess]     = useState([]);
  const [pays, setPays]     = useState([]);
  const [reqs, setReqs]     = useState([]);
  const [over, setOver]     = useState({});
  const [vcosts, setVcosts] = useState([]);
  const [visits, setVisits] = useState([]);
  const [anamneses, setAnamneses] = useState([]);
  const [notes, setNotes]     = useState([]);
  const [plans, setPlans]     = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [toast, setToast]   = useState(null);
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({});

  const show = useCallback((m, t = "success") => {
    setToast({ m, t });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const load = useCallback(async () => {
    try {
      const [r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14] = await Promise.all([
        sb.from("profiles").select("*").order("created_at", { ascending: false }),
        sb.from("professionals").select("*").eq("active", true).order("name"),
        sb.from("patients").select("*").eq("active", true).order("name"),
        sb.from("sessions").select("*").order("date", { ascending: false }).limit(200),
        sb.from("payments").select("*").order("created_at", { ascending: false }),
        sb.from("schedule_requests").select("*"),
        sb.from("overheads").select("*"),
        sb.from("variable_costs").select("*"),
        sb.from("visits").select("*").order("created_at", { ascending: false }).limit(2000),
        sb.from("anamnesis").select("*"),
        sb.from("session_notes").select("*").order("date", { ascending: false }).limit(500),
        sb.from("intervention_plans").select("*"),
        sb.from("audit_log").select("*").order("ts", { ascending: false }).limit(500),
        sb.from("announcements").select("*").order("created_at", { ascending: false }).limit(50),
      ]);
      setUsers(r1.data || []);
      setProfs(r2.data || []);
      setPts(r3.data || []);
      setSess(r4.data || []);
      setPays(r5.data || []);
      setReqs(r6.data || []);
      setOver((r7.data && r7.data[0]) || {});
      setVcosts(r8.data || []);
      setVisits(r9.data || []);
      setAnamneses(r10.data || []);
      setNotes(r11.data || []);
      setPlans(r12.data || []);
      setAuditLog(r13.data || []);
      setAnnouncements(r14.data || []);
    } catch (e) { console.error(e); }
  }, []);

  // Audit helper — escreve no audit_log sem nunca quebrar a UI em caso de falha.
  const audit = useCallback(async (action, target, summary) => {
    try {
      await sb.from("audit_log").insert({
        who_id: profile?.id || null,
        who_name: profile?.full_name || "",
        who_role: profile?.role || "",
        action, target: target || "", summary: summary || "",
        ts: new Date().toISOString(),
      });
    } catch (_) { /* não quebrar UI */ }
  }, [profile]);

  useEffect(() => { load(); }, [load]);

  // ────────── Acções ──────────

  const changeRole = async (uid, r) => {
    const u = users.find((x) => x.id === uid);
    await sb.from("profiles").update({ role: r }).eq("id", uid);
    await audit("change_role", `profiles:${uid}`, `${u?.full_name || uid} → ${r}`);
    show("Papel atualizado");
    await load();
  };

  const removeUser = async (uid) => {
    const u = users.find((x) => x.id === uid);
    await sb.from("profiles").delete().eq("id", uid);
    await audit("delete_user", `profiles:${uid}`, u?.full_name || uid);
    show("Utilizador removido");
    await load();
  };

  const toggleUserActive = async (uid, makeActive) => {
    const u = users.find((x) => x.id === uid);
    await sb.from("profiles").update({ active: makeActive }).eq("id", uid);
    await audit(makeActive ? "activate_user" : "deactivate_user", `profiles:${uid}`, u?.full_name || uid);
    show(makeActive ? "Utilizador reativado" : "Utilizador desativado");
    await load();
  };

  const addProf = async () => {
    if (!form.name) return;
    const ini = form.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    await sb.from("professionals").insert({
      name: form.name,
      role_title: form.role || "Psicomotricista",
      avatar_initials: ini,
      avatar_color: AVATAR_BG[profs.length % AVATAR_BG.length],
      active: true,
    });
    await audit("add_professional", "professionals", form.name);
    setModal(null); setForm({}); show("Profissional adicionado"); await load();
  };

  const deleteProfessional = async (id) => {
    const p = profs.find((x) => x.id === id);
    await sb.from("professionals").delete().eq("id", id);
    await audit("delete_professional", `professionals:${id}`, p?.name || id);
    show("Profissional eliminado"); await load();
  };

  const addProfsBulk = async () => {
    const lines = (form.bulk || "").split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    let ok = 0, skip = 0;
    for (const line of lines) {
      const [name, role] = line.split(/[,;\t]/).map((s) => (s || "").trim());
      if (!name) { skip++; continue; }
      const ini = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
      await sb.from("professionals").insert({
        name,
        role_title: role || "Psicomotricista",
        avatar_initials: ini,
        avatar_color: AVATAR_BG[(profs.length + ok) % AVATAR_BG.length],
        active: true,
      });
      ok++;
    }
    setModal(null); setForm({});
    show(`${ok} profissional(is) importado(s)${skip ? ` · ${skip} ignorado(s)` : ""}`);
    await load();
  };

  const addPatient = async () => {
    const isGroup = form.sessionType === "grupo";
    const profIds = isGroup ? (form.profs || []) : (form.prof ? [form.prof] : []);
    if (!form.name || !form.age || !form.day || !form.hour || !form.sessionType || profIds.length === 0) return;
    const payload = {
      name: form.name,
      age: parseInt(form.age),
      professional_id: profIds[0],
      professional_ids: profIds,
      session_type: form.sessionType,
      day_of_week: form.day,
      hour: form.hour,
      periodicity: "Semanal",
      active: true,
      nif: form.nif || null,
      birth_date: form.birth || null,
      parent_mother: form.mother || null,
      parent_father: form.father || null,
      parent_user_ids: form.parentUserIds || [],
      doctor: form.doctor || null,
      other_profs: form.others || null,
      insurance_name: form.insName || null,
      insurance_number: form.insNum || null,
    };
    if (form.editingId) {
      await sb.from("patients").update(payload).eq("id", form.editingId);
      await audit("update_patient", `patients:${form.editingId}`, form.name);
    } else {
      await sb.from("patients").insert(payload);
      await audit("add_patient", "patients", form.name);
    }
    setModal(null); setForm({}); show(form.editingId ? "Paciente atualizado" : "Paciente criado"); await load();
  };

  const deletePatient = async (id) => {
    const pt = pts.find((x) => x.id === id);
    await sb.from("patients").delete().eq("id", id);
    await audit("delete_patient", `patients:${id}`, pt?.name || id);
    show("Paciente eliminado"); await load();
  };

  const addPatientsBulk = async () => {
    const lines = (form.bulk || "").split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    const mode = form.bulkMode || "schedule"; // "schedule" | "admin"
    let ok = 0; const errs = [];
    for (const line of lines) {
      const cols = line.split(/[,;\t]/).map((s) => (s || "").trim());

      if (mode === "admin") {
        // Formato: Nome, NIF, Seguro, Nº seguro
        const [name, nif, seguro, nrSeguro] = cols;
        if (!name) { errs.push(`"${line}" — nome em falta`); continue; }
        const insurance = seguro ? normalizeInsurance(seguro) : null;
        if (seguro && !insurance) {
          errs.push(`"${name}" — seguro "${seguro}" inválido. Aceita: ${INSURANCES.join(", ")}`);
          continue;
        }
        await sb.from("patients").insert({
          name,
          nif: nif || null,
          insurance_name: insurance,
          insurance_number: nrSeguro || null,
          session_type: "individual",
          periodicity: "Semanal",
          active: true,
        });
        ok++;
      } else {
        // Formato com horário: Nome, Idade, Profissional, Dia, Hora, Tipo
        const [name, age, profName, day, hour, type] = cols;
        if (!name || !age || !profName || !day || !hour) { errs.push(`"${line}" — campos em falta`); continue; }
        const prof = profs.find((p) => p.name.toLowerCase() === profName.toLowerCase());
        if (!prof) { errs.push(`"${name}" — profissional "${profName}" não encontrado`); continue; }
        const st = (type || "").toLowerCase().startsWith("grupo") ? "grupo" : "individual";
        await sb.from("patients").insert({
          name, age: parseInt(age) || null,
          professional_id: prof.id, professional_ids: [prof.id],
          session_type: st, day_of_week: day, hour,
          periodicity: "Semanal", active: true,
        });
        ok++;
      }
    }
    await audit("bulk_import_patients", "patients", `modo:${mode} · ${ok} ok · ${errs.length} ignorados`);
    setModal(null); setForm({});
    show(`${ok} paciente(s) importado(s)${errs.length ? ` · ${errs.length} ignorado(s)` : ""}`, errs.length ? "error" : "success");
    if (errs.length) console.warn("Importação de pacientes — ignorados:\n" + errs.join("\n"));
    await load();
  };

  const addPayment = async () => {
    if (!form.pt || !form.amount) return;
    await sb.from("payments").insert({
      patient_id: form.pt,
      month: form.payMonth || "Maio 2026",
      amount: parseFloat(form.amount),
      status: form.paySt || "pendente",
      paid_date: form.paySt === "pago" ? new Date().toISOString().slice(0, 10) : null,
    });
    const pt = pts.find((x) => x.id === form.pt);
    await audit("add_payment", "payments", `${pt?.name || form.pt} · ${form.amount}€ · ${form.payMonth || "—"}`);
    setModal(null); setForm({}); show("Pagamento registado"); await load();
  };

  const togglePayment = async (p) => {
    const newSt = p.status === "pago" ? "pendente" : "pago";
    await sb.from("payments").update({
      status: newSt,
      paid_date: newSt === "pago" ? new Date().toISOString().slice(0, 10) : null,
    }).eq("id", p.id);
    const pt = pts.find((x) => x.id === p.patient_id);
    await audit("toggle_payment", `payments:${p.id}`, `${pt?.name || ""} · ${p.amount}€ → ${newSt}`);
    show(newSt === "pago" ? "Marcado como pago" : "Marcado como pendente");
    await load();
  };

  const inviteUser = async () => {
    if (!form.invName || !form.invEmail || !form.invRole) return;
    const tempPw = "Psico" + Math.random().toString(36).slice(2, 8) + "!";
    const { data, error } = await sb.auth.signUp({
      email: form.invEmail, password: tempPw,
      options: { data: { full_name: form.invName, role: form.invRole } },
    });
    if (error) { show("Erro: " + error.message, "error"); return; }
    if (data?.user) {
      await sb.from("profiles").upsert({
        id: data.user.id, email: form.invEmail,
        full_name: form.invName, role: form.invRole, active: true,
      });
      if (form.invRole === "professional") {
        const ini = form.invName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
        await sb.from("professionals").insert({
          name: form.invName, role_title: "Psicomotricista",
          avatar_initials: ini, avatar_color: AVATAR_BG[profs.length % AVATAR_BG.length],
          profile_id: data.user.id, active: true,
        });
      }
    }
    await audit("invite_user", "profiles", `${form.invName} · ${form.invRole}`);
    setForm({ ...form, inviteResult: { email: form.invEmail, pw: tempPw, role: form.invRole, name: form.invName } });
    show("Conta criada");
    await load();
  };

  const saveOverheads = async () => {
    await sb.from("overheads").upsert({
      id: "main",
      rent: parseFloat(form.rent) || 0,
      garage_spots: parseInt(form.garageSpots) || 0,
      garage_per_spot: parseFloat(form.garagePerSpot) || 0,
    });
    await audit("save_overheads", "overheads", `renda ${form.rent}€ · garagem ${form.garageSpots}×${form.garagePerSpot}€`);
    setModal(null); setForm({}); show("Custos fixos atualizados"); await load();
  };

  const saveVarCost = async () => {
    if (!form.vcMonth) { show("Escolha o mês", "error"); return; }
    const id = "m_" + form.vcMonth.normalize("NFD").replace(/[^\w]/g, "_").toLowerCase();
    await sb.from("variable_costs").upsert({
      id, month: form.vcMonth,
      power: parseFloat(form.power) || 0,
      water: parseFloat(form.water) || 0,
      telecom: parseFloat(form.telecom) || 0,
    });
    await audit("save_variable_cost", `variable_costs:${id}`, `${form.vcMonth} · luz ${form.power}€ · água ${form.water}€ · telecom ${form.telecom}€`);
    setModal(null); setForm({}); show("Custos do mês registados"); await load();
  };

  const genPassword = () => {
    const p = "Ps" + Math.random().toString(36).slice(2, 8) + Math.floor(Math.random() * 90 + 10);
    setForm((f) => ({ ...f, newPw: p }));
  };

  // ───── Clínico ─────

  const saveAnamnesis = async () => {
    if (!form.anamnesisPatientId) return;
    const id = form.anamnesisPatientId;
    await sb.from("anamnesis").upsert({
      id, patient_id: id,
      birth_history: form.birth_history || "",
      developmental_milestones: form.developmental_milestones || "",
      school_context: form.school_context || "",
      family_context: form.family_context || "",
      previous_interventions: form.previous_interventions || "",
      referral_reason: form.referral_reason || "",
      chief_complaints: form.chief_complaints || "",
      general_notes: form.general_notes || "",
      updated_at: new Date().toISOString(),
      updated_by: profile?.id || null,
    });
    const pt = pts.find((x) => x.id === id);
    await audit("save_anamnesis", `anamnesis:${id}`, pt?.name || id);
    setModal(null); setForm({}); show("Anamnese guardada"); await load();
  };

  const addSessionNote = async () => {
    if (!form.snDate || !form.snPatientId) return;
    await sb.from("session_notes").insert({
      patient_id: form.snPatientId,
      date: form.snDate,
      status: form.snStatus || "realizada",
      domains: form.snDomains || [],
      work_done: form.snWork || "",
      observations: form.snObs || "",
      progress: form.snProgress || "",
      next_plan: form.snNext || "",
      professional_id: form.snProf || null,
      created_by: profile?.id || null,
    });
    const pt = pts.find((x) => x.id === form.snPatientId);
    await audit("add_session_note", `session_notes:${form.snPatientId}`, `${pt?.name || ""} · ${form.snDate}`);
    setModal(null); setForm({}); show("Nota de sessão guardada"); await load();
  };

  const deleteSessionNote = async (id) => {
    await sb.from("session_notes").delete().eq("id", id);
    await audit("delete_session_note", `session_notes:${id}`, "");
    show("Nota eliminada"); await load();
  };

  const savePlan = async () => {
    if (!form.planPatientId) return;
    const id = form.planPatientId;
    await sb.from("intervention_plans").upsert({
      id, patient_id: id,
      area: form.planArea || "",
      objectives: form.planObjectives || [],
      start_date: form.planStart || null,
      review_date: form.planReview || null,
      notes: form.planNotes || "",
      updated_at: new Date().toISOString(),
      updated_by: profile?.id || null,
    });
    const pt = pts.find((x) => x.id === id);
    await audit("save_intervention_plan", `intervention_plans:${id}`, `${pt?.name || id} · ${(form.planObjectives || []).length} objetivos`);
    setModal(null); setForm({}); show("Plano de intervenção guardado"); await load();
  };

  const approveRequest = async (id) => {
    await sb.from("schedule_requests").update({ status: "aprovado", updated_at: new Date().toISOString() }).eq("id", id);
    await audit("approve_request", `schedule_requests:${id}`, "");
    show("Pedido aprovado"); await load();
  };

  const rejectRequest = async (id) => {
    await sb.from("schedule_requests").update({ status: "recusado", updated_at: new Date().toISOString() }).eq("id", id);
    await audit("reject_request", `schedule_requests:${id}`, "");
    show("Pedido recusado", "error"); await load();
  };

  const changeMyPassword = async () => {
    const pw = (form.newPw || "").trim();
    if (pw.length < 6) { show("Password: mínimo 6 caracteres", "error"); return; }
    const { error } = await sb.auth.updatePassword(pw);
    if (error) {
      const s = (error.message || "").toLowerCase();
      if (s.includes("recent")) show("Por segurança, termine sessão e volte a entrar antes de mudar a password.", "error");
      else show("Não foi possível alterar: " + error.message, "error");
      return;
    }
    setModal(null); setForm({}); show("Password alterada com sucesso");
  };

  // ───── Comunicações da direção (announcements) ─────
  const addAnnouncement = async () => {
    if (!form.annTitle || !form.annBody) { show("Título e mensagem são obrigatórios", "error"); return; }
    await sb.from("announcements").insert({
      title: form.annTitle,
      body: form.annBody,
      audience: form.annAudience || "all", // "all" | "professional" | "parent"
      author_id: profile?.id || null,
      author_name: profile?.full_name || "Direção",
      active: true,
    });
    await audit("add_announcement", "announcements", `${form.annTitle} · ${form.annAudience || "all"}`);
    setModal(null); setForm({}); show("Comunicação publicada"); await load();
  };

  const toggleAnnouncementActive = async (id, newActive) => {
    await sb.from("announcements").update({ active: newActive }).eq("id", id);
    await audit("toggle_announcement", `announcements:${id}`, newActive ? "ativada" : "desativada");
    show(newActive ? "Comunicação ativada" : "Comunicação desativada"); await load();
  };

  const deleteAnnouncement = async (id) => {
    await sb.from("announcements").delete().eq("id", id);
    await audit("delete_announcement", `announcements:${id}`, "");
    show("Comunicação eliminada"); await load();
  };

  // ───── Acção rápida do profissional: marcar falta numa sessão ─────
  const quickMarkFalta = async (patientId, professionalId, date) => {
    const d = date || new Date().toISOString().slice(0, 10);
    await sb.from("session_notes").insert({
      patient_id: patientId,
      professional_id: professionalId || null,
      date: d,
      status: "falta",
      domains: [],
      work_done: "", observations: "", progress: "", next_plan: "",
      created_by: profile?.id || null,
    });
    const pt = pts.find((x) => x.id === patientId);
    await audit("mark_falta", `session_notes:${patientId}`, `${pt?.name || patientId} · ${d}`);
    show("Falta registada"); await load();
  };

  // ───── Linkar responsáveis (perfis com role=parent) a um paciente ─────
  const setPatientParents = async (patientId, parentUserIds) => {
    await sb.from("patients").update({ parent_user_ids: parentUserIds || [] }).eq("id", patientId);
    const pt = pts.find((x) => x.id === patientId);
    await audit("set_patient_parents", `patients:${patientId}`, `${pt?.name || patientId} · ${(parentUserIds || []).length} vinculados`);
    show("Responsáveis atualizados"); await load();
  };

  const value = {
    profile,
    users, profs, pts, sess, pays, reqs, over, vcosts, visits,
    anamneses, notes, plans, auditLog, announcements,
    toast, show,
    modal, setModal, form, setForm,
    load,
    changeRole, removeUser, toggleUserActive,
    addProf, deleteProfessional, addProfsBulk,
    addPatient, deletePatient, addPatientsBulk,
    addPayment, togglePayment,
    saveOverheads, saveVarCost,
    inviteUser,
    approveRequest, rejectRequest,
    saveAnamnesis, addSessionNote, deleteSessionNote, savePlan,
    genPassword, changeMyPassword,
    addAnnouncement, toggleAnnouncementActive, deleteAnnouncement,
    quickMarkFalta, setPatientParents,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
