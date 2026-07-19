// Store partilhada: dados carregados do Firestore + acções CRUD + toast + modais.
// Vive ao nível do AdminLayout — todas as páginas filhas usam `useStore()`.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { sb, db, collection, query, where, orderBy, limit, onSnapshot, createStaffAccount, fcmRequestPermissionAndToken, fcmDeleteToken, fcmSaveTokenToProfile, fcmRemoveTokenFromProfile, fcmCurrentPermission } from "./firebase.js";
import { AVATAR_BG, normalizeInsurance, INSURANCES } from "./constants.js";
import { initials, professionalIds, currentMonthLabel } from "./format.js";

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);
// Contexto separado para o estado de modal/form. Isolar aqui evita que cada
// tecla escrita num modal re-renderize todos os consumidores de useStore()
// (só o ModalsHost, que lê useUi(), re-renderiza). Ver StoreProvider.
const UiCtx = createContext(null);
export const useUi = () => useContext(UiCtx);

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
  const [waitlist, setWaitlist] = useState([]);
  const [homeExercises, setHomeExercises] = useState([]);
  const [homeAssignments, setHomeAssignments] = useState([]);
  const [homeCompletions, setHomeCompletions] = useState([]);
  const [parentMessages, setParentMessages] = useState([]);
  const [behaviorDiary, setBehaviorDiary] = useState([]);
  const [toast, setToast]   = useState(null);
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({});
  // Fica true após a 1ª snapshot de pacientes chegar — distingue "a carregar"
  // de "vazio", para as páginas poderem mostrar skeletons em vez de "sem dados".
  const [hydrated, setHydrated] = useState(false);

  const show = useCallback((m, t = "success") => {
    setToast({ m, t });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Owner ids denormalizados a gravar em cada doc clínico — as regras Firestore
  // usam parent_user_ids/professional_ids do próprio doc para autorizar leitura
  // sem um get() por documento. Sem isto, o portal do responsável fica sem
  // acesso (ou, pior, ficaria com acesso a tudo). Ver firestore.rules.
  const ownerIdsFor = useCallback((patientId) => {
    const pt = pts.find((x) => x.id === patientId);
    return {
      parent_user_ids: pt?.parent_user_ids || [],
      professional_ids: professionalIds(pt),
    };
  }, [pts]);

  // ───── Listeners (onSnapshot) ─────
  // Cada colecção tem uma subscrição em vez de polling. Resultado:
  //  • Primeiro ligar = N reads (uma vez por colecção)
  //  • Depois, apenas docs que mudam são facturados
  //  • Cache IndexedDB (persistentLocalCache) serve dados anteriores
  //    enquanto a delta chega da rede
  //  • Mutações via sb.from(...).insert/update/delete propagam-se aos
  //    listeners automaticamente — sem necessidade de refetch manual
  //
  // load() permanece como callable no-op para compatibilidade com chamadas
  // de "await load()" dispersas pelas acções — listeners actualizam state
  // por conta própria.
  const load = useCallback(() => Promise.resolve(), []);

  useEffect(() => {
    if (!profile?.id) return;
    setHydrated(false);
    const uid = profile.id;
    const staff = profile.role === "director" || profile.role === "professional";
    const unsubs = [];
    const sub = (q, setter, transform) => {
      const u = onSnapshot(
        q,
        (snap) => {
          const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setter(transform ? transform(rows) : rows);
        },
        // Falha de subscrição (permissão/rede) → limpar o slice e avisar em dev.
        (err) => { console.warn("[subscription]", err?.code || err?.message || err); setter(transform ? transform([]) : []); },
      );
      unsubs.push(u);
    };
    const sortByName = (rows) => rows.slice().sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    const byDateDesc = (rows) => rows.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const byCreatedDesc = (rows) => rows.slice().sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    // Query scoped: staff vê tudo (com orderBy+limit para não puxar anos de
    // histórico); responsável só docs cujo parent_user_ids contém o seu uid
    // (array-contains → índice de campo único, sem índices compostos; sem
    // orderBy para evitar índice composto, ordenação feita em JS via transform).
    // opts: { orderField, lim } aplicados apenas ao staff.
    const owned = (name, opts = {}) => {
      if (staff) {
        const cons = [];
        if (opts.orderField) cons.push(orderBy(opts.orderField, "desc"));
        if (opts.lim) cons.push(limit(opts.lim));
        return cons.length ? query(collection(db, name), ...cons) : collection(db, name);
      }
      const cons = [where("parent_user_ids", "array-contains", uid)];
      if (opts.lim) cons.push(limit(opts.lim));
      return query(collection(db, name), ...cons);
    };

    // profiles & equipa (leitura a autenticados)
    sub(query(collection(db, "profiles"), orderBy("created_at", "desc")), setUsers);
    sub(query(collection(db, "professionals"), where("active", "==", true)), setProfs, sortByName);
    sub(owned("patients"), (rows) => { setPts(rows); setHydrated(true); }, sortByName);

    // clínico — limites repostos p/ staff (evita puxar histórico inteiro)
    sub(owned("sessions", { orderField: "date", lim: 200 }), setSess, byDateDesc);
    sub(owned("anamnesis"), setAnamneses);
    sub(owned("session_notes", { orderField: "date", lim: 500 }), setNotes, byDateDesc);
    sub(owned("intervention_plans"), setPlans);
    sub(owned("behavior_diary", { orderField: "date", lim: 300 }), setBehaviorDiary, byDateDesc);
    sub(owned("home_practice_assignments"), setHomeAssignments);
    sub(owned("home_practice_completions", { orderField: "date", lim: 500 }), setHomeCompletions, byDateDesc);

    // biblioteca de exercícios (pública a autenticados) & comunicações
    sub(query(collection(db, "home_exercises_library"), orderBy("created_at", "desc"), limit(200)), setHomeExercises);
    sub(query(collection(db, "announcements"), orderBy("created_at", "desc"), limit(50)), setAnnouncements);

    // pedidos & mensagens — staff vê todos; responsável só os seus
    if (staff) {
      sub(collection(db, "schedule_requests"), setReqs);
      sub(query(collection(db, "parent_messages"), orderBy("created_at", "desc"), limit(200)), setParentMessages);
    } else {
      sub(query(collection(db, "schedule_requests"), where("requested_by_id", "==", uid)), setReqs);
      sub(query(collection(db, "parent_messages"), where("from_user_id", "==", uid)), setParentMessages, byCreatedDesc);
    }

    // Pagamentos: staff vê tudo (ordenado; sem limit — o financeiro precisa do
    // histórico anual/IRS); responsável vê só os dos seus filhos.
    sub(owned("payments", { orderField: "created_at" }), setPays, byCreatedDesc);

    // Livro de custos & lista de espera — só-staff (regras negam a responsáveis).
    if (staff) {
      sub(collection(db, "overheads"), setOver, (rows) => rows[0] || {});
      sub(collection(db, "variable_costs"), setVcosts);
      sub(query(collection(db, "waitlist"), orderBy("created_at", "desc"), limit(100)), setWaitlist);
    } else {
      setOver({}); setVcosts([]); setWaitlist([]);
    }

    // Colecções só-director
    if (profile.role === "director") {
      sub(query(collection(db, "audit_log"), orderBy("ts", "desc"), limit(500)), setAuditLog);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      sub(query(collection(db, "visits"), where("ts", ">=", thirtyDaysAgo), orderBy("ts", "desc")), setVisits);
    } else {
      setAuditLog([]);
      setVisits([]);
    }

    return () => unsubs.forEach((u) => { try { u && u(); } catch (_) {} });
  }, [profile?.id, profile?.role]);

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
    if (!form.name) { show("Nome é obrigatório", "error"); return; }
    const ini = initials(form.name);
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
      const ini = initials(name);
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
    if (!form.name || !form.age || !form.day || !form.hour || !form.sessionType) {
      show("Preencha nome, idade, tipo, dia e hora", "error"); return;
    }
    if (profIds.length === 0) { show("Selecione pelo menos um profissional", "error"); return; }
    if (form.nif && !/^\d{9}$/.test(String(form.nif).trim())) { show("NIF inválido — devem ser 9 dígitos", "error"); return; }
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
    if (!form.pt) { show("Selecione o paciente", "error"); return; }
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) { show("Montante inválido — deve ser maior que 0", "error"); return; }
    const pt = pts.find((x) => x.id === form.pt);
    const profId = pt?.professional_id || (pt?.professional_ids?.[0]) || null;
    await sb.from("payments").insert({
      patient_id: form.pt,
      ...ownerIdsFor(form.pt),
      professional_id: profId,
      month: form.payMonth || currentMonthLabel(),
      amount: amt,
      status: form.paySt || "pendente",
      paid_date: form.paySt === "pago" ? new Date().toISOString().slice(0, 10) : null,
      method: form.payMethod || null,
      notes: form.payNotes || null,
    });
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

  const deletePayment = async (p) => {
    await sb.from("payments").delete().eq("id", p.id);
    const pt = pts.find((x) => x.id === p.patient_id);
    await audit("delete_payment", `payments:${p.id}`, `${pt?.name || ""} · ${p.amount}€ · ${p.month}`);
    show("Pagamento eliminado");
    await load();
  };

  const updatePayment = async (id, patch) => {
    await sb.from("payments").update(patch).eq("id", id);
    await audit("update_payment", `payments:${id}`, JSON.stringify(patch).slice(0, 200));
    show("Pagamento atualizado");
    await load();
  };

  // Cria um pagamento diretamente (sem passar pelo modal). Útil para o Pro portal.
  const createPayment = async ({ patient_id, month, amount, status = "pendente", method = null, notes = null }) => {
    const pt = pts.find((x) => x.id === patient_id);
    const profId = pt?.professional_id || (pt?.professional_ids?.[0]) || null;
    await sb.from("payments").insert({
      patient_id,
      ...ownerIdsFor(patient_id),
      professional_id: profId,
      month,
      amount: parseFloat(amount),
      status,
      paid_date: status === "pago" ? new Date().toISOString().slice(0, 10) : null,
      method,
      notes,
    });
    await audit("add_payment", "payments", `${pt?.name || patient_id} · ${amount}€ · ${month}`);
    show("Pagamento registado");
    await load();
  };

  const inviteUser = async () => {
    if (!form.invName || !form.invEmail || !form.invRole) { show("Preencha nome, email e papel", "error"); return; }
    const tempPw = "Psico" + Math.random().toString(36).slice(2, 8) + "!";
    // Cria a conta numa instância secundária — não substitui a sessão do admin.
    const res = await createStaffAccount({ email: form.invEmail, password: tempPw, fullName: form.invName });
    if (res.error) { show("Erro: " + res.error.message, "error"); return; }
    // A direção (sessão atual) eleva o papel do perfil recém-criado.
    await sb.from("profiles").update({ role: form.invRole, active: true }).eq("id", res.uid);
    if (form.invRole === "professional") {
      const ini = initials(form.invName);
      await sb.from("professionals").insert({
        name: form.invName, role_title: "Psicomotricista",
        avatar_initials: ini, avatar_color: AVATAR_BG[profs.length % AVATAR_BG.length],
        profile_id: res.uid, active: true,
      });
    }
    await audit("invite_user", "profiles", `${form.invName} · ${form.invRole}`);
    setForm({ ...form, inviteResult: { email: res.email, pw: tempPw, role: form.invRole, name: form.invName } });
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
      ...ownerIdsFor(id),
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
    if (!form.snDate || !form.snPatientId) { show("Escolha o paciente e a data", "error"); return; }
    await sb.from("session_notes").insert({
      patient_id: form.snPatientId,
      ...ownerIdsFor(form.snPatientId),
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
      ...ownerIdsFor(id),
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

  // ───── Sprint 2-4 actions ─────
  const addWaitlist = async (data) => {
    await sb.from("waitlist").insert({ status: "new", ...data });
    await audit("add_waitlist", "waitlist", data.name || "");
    show("Adicionado à lista de espera");
  };
  const updateWaitlist = async (id, patch) => {
    await sb.from("waitlist").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
    await audit("update_waitlist", `waitlist:${id}`, Object.keys(patch).join(","));
  };
  const deleteWaitlist = async (id) => {
    await sb.from("waitlist").delete().eq("id", id);
    await audit("delete_waitlist", `waitlist:${id}`, "");
    show("Removido da lista");
  };

  const addHomeExercise = async (data) => {
    await sb.from("home_exercises_library").insert(data);
    await audit("add_home_exercise", "library", data.title || "");
    show("Exercício criado");
  };
  const deleteHomeExercise = async (id) => {
    await sb.from("home_exercises_library").delete().eq("id", id);
    show("Exercício removido");
  };
  const assignHomeExercise = async (patientId, exerciseId, notes) => {
    await sb.from("home_practice_assignments").insert({
      patient_id: patientId, exercise_id: exerciseId,
      ...ownerIdsFor(patientId),
      professional_id: profile?.id || null,
      custom_notes: notes || "",
      active: true,
    });
    await audit("assign_exercise", `home_practice:${patientId}`, exerciseId);
    show("Exercício atribuído");
  };
  const unassignHomeExercise = async (id) => {
    await sb.from("home_practice_assignments").update({ active: false }).eq("id", id);
  };
  const markCompletion = async (patientId, exerciseId, note) => {
    await sb.from("home_practice_completions").insert({
      patient_id: patientId, exercise_id: exerciseId,
      ...ownerIdsFor(patientId),
      date: new Date().toISOString().slice(0, 10),
      by_user_id: profile?.id || null,
      note: note || "",
    });
    show("Registado");
  };

  const sendParentMessage = async (patientId, toProId, body) => {
    await sb.from("parent_messages").insert({
      patient_id: patientId,
      ...ownerIdsFor(patientId),
      from_user_id: profile?.id || null,
      to_professional_id: toProId,
      body: body || "",
    });
    show("Mensagem enviada");
  };
  const replyToParent = async (messageId, replyBody) => {
    await sb.from("parent_messages").update({
      reply: replyBody, replied_at: new Date().toISOString(),
    }).eq("id", messageId);
    show("Resposta enviada");
  };
  const markMessageRead = async (messageId) => {
    await sb.from("parent_messages").update({ read_by_pro_at: new Date().toISOString() }).eq("id", messageId);
  };

  const addBehaviorEntry = async (patientId, data) => {
    await sb.from("behavior_diary").insert({
      patient_id: patientId,
      ...ownerIdsFor(patientId),
      by_user_id: profile?.id || null,
      date: data.date || new Date().toISOString().slice(0, 10),
      mood: data.mood ?? null,
      sleep_hours: data.sleep_hours ?? null,
      notable_events: data.notable_events || [],
      concerns: data.concerns || "",
    });
    show("Entrada do diário guardada");
  };

  const setNotificationPrefs = async (prefs) => {
    if (!profile?.id) return;
    await sb.from("profiles").update({ notification_prefs: prefs }).eq("id", profile.id);
    show("Preferências guardadas");
  };

  // Reset destrutivo + seed demo — apaga tudo excepto director actual, e cria
  // trio (1 profissional, 1 responsável stub, 1 paciente vinculado a ambos).
  // Só para conta admin. Usa director.id em parent_user_ids + prof.profile_id
  // para que o role-switcher funcione (mesma uid vê como todos os papéis).
  const resetAndSeedDemo = async () => {
    if (!profile?.id) return { ok: false };

    // 1) DELETE tudo
    const wipe = ["patients", "professionals", "session_notes", "intervention_plans", "anamnesis", "payments", "schedule_requests", "announcements", "visits", "reminders", "audit_log"];
    for (const c of wipe) {
      try { await sb.from(c).delete(); } catch (e) { console.warn("wipe", c, e?.message); }
    }
    // Profiles: apagar excepto o director actual + preservar stubs? Apagar tudo excepto self.
    try {
      const all = await sb.from("profiles").select("*");
      for (const p of (all.data || [])) {
        if (p.id !== profile.id) {
          try { await sb.from("profiles").delete().eq("id", p.id); } catch (_) {}
        }
      }
    } catch (_) {}

    // 2) CREATE — profile stub responsável
    const parentStubId = "demo-parent-ana";
    await sb.from("profiles").upsert({
      id: parentStubId,
      email: "ana@demo.local",
      full_name: "Ana Silva",
      role: "parent",
      active: true,
    });

    // 3) CREATE — profile stub profissional (para aparecer em Utilizadores)
    const proProfileId = "demo-pro-ines";
    await sb.from("profiles").upsert({
      id: proProfileId,
      email: "ines@demo.local",
      full_name: "Inês Mota",
      role: "professional",
      active: true,
    });

    // 4) CREATE — registo profissional. profile_id = director.id para RoleSwitcher.
    const proRes = await sb.from("professionals").insert({
      name: "Inês Mota",
      role_title: "Psicomotricista",
      profile_id: profile.id, // director actua como esta pro no override
      avatar_initials: "IM",
      avatar_color: "#8DBF94",
      active: true,
    });
    const proId = proRes.data?.id;

    // 5) CREATE — paciente vinculado ao director (parent_user_ids) + ao pro
    const ptRes = await sb.from("patients").insert({
      name: "Beatriz Sá",
      age: 6,
      birth_date: "2020-03-15",
      nif: null,
      professional_id: proId,
      professional_ids: [proId],
      parent_user_ids: [profile.id, parentStubId], // director + parent stub
      parent_mother: "Ana Silva",
      parent_father: "João Sá",
      session_type: "individual",
      day_of_week: "Segunda",
      hour: "15:00",
      periodicity: "Semanal",
      active: true,
    });
    const ptId = ptRes.data?.id;

    // 6) Anamnese
    await sb.from("anamnesis").upsert({
      id: ptId, patient_id: ptId,
      referral_reason: "Encaminhamento pela pediatra por dificuldades de coordenação motora observadas em contexto escolar.",
      chief_complaints: "Tropeça com frequência. Dificuldade em amarrar atacadores. Escrita ainda irregular.",
      birth_history: "Gestação normal, parto de termo, sem complicações. Amamentação até aos 8 meses.",
      developmental_milestones: "Marcha aos 14 meses. Primeiras palavras aos 12 meses. Frases aos 24 meses. Ligeiro atraso motor desde os 3 anos.",
      school_context: "1º ano de escolaridade. Educadora reporta dificuldades em Educação Física e destrezas manuais. Comportamento adequado.",
      family_context: "Filha única. Ambos pais activos profissionalmente. Sem antecedentes familiares relevantes.",
      previous_interventions: "Nenhuma até à data.",
      general_notes: "Criança colaborante e motivada. Boa recetividade à intervenção.",
    });

    // 7) Plano de intervenção
    await sb.from("intervention_plans").upsert({
      id: ptId, patient_id: ptId,
      area: "Coordenação motora, esquema corporal e praxias finas",
      objectives: [
        { text: "Melhorar coordenação bilateral em saltos e obstáculos", domain: "Coordenação motora", status: "ativo", progress: 40 },
        { text: "Consolidar esquema corporal com actividades de espelho", domain: "Esquema corporal", status: "ativo", progress: 25 },
        { text: "Autonomia em amarrar atacadores e abotoar", domain: "Praxias", status: "ativo", progress: 15 },
        { text: "Reforçar regulação em contexto de frustração", domain: "Regulação emocional", status: "ativo", progress: 30 },
      ],
      start_date: "2026-04-01",
      review_date: "2026-09-01",
      notes: "Reavaliação trimestral. Próxima em Setembro.",
      updated_at: new Date().toISOString(),
      updated_by: profile.id,
    });

    // 8) Notas de sessão (últimas 3)
    const notes = [
      { date: "2026-06-15", status: "realizada",
        work_done: "Circuito psicomotor com obstáculos horizontais e verticais. Jogo de espelho com par.",
        observations: "Motivada e colaborante. Frustração inicial no espelho, resolvida com apoio verbal.",
        progress: "Melhoria notória na coordenação bilateral. Salta a pés juntos com fluidez.",
        next_plan: "Introduzir jogos de imitação e sequências mais complexas." },
      { date: "2026-06-08", status: "realizada",
        work_done: "Trabalho de pinça fina e nós simples. Sequência com lã e argolas.",
        observations: "Frustração inicial ao 3º nó falhado — respirou e retomou.",
        progress: "Ainda revela dificuldade em amarrar atacadores autonomamente.",
        next_plan: "Continuar sequência de nós. Introduzir laços em cartão." },
      { date: "2026-06-01", status: "realizada",
        work_done: "Avaliação psicomotora inicial. M-ABC-2. Provas de esquema corporal.",
        observations: "Criança adaptada. Estabeleceu contacto de imediato.",
        progress: "Resultado M-ABC-2: percentil 15 (motor global). Plano em preparação.",
        next_plan: "Reunião de definição de plano com responsável na próxima semana." },
    ];
    for (const n of notes) {
      await sb.from("session_notes").insert({
        patient_id: ptId,
        professional_id: proId,
        domains: ["Coordenação motora", "Esquema corporal", "Praxias"],
        created_by: profile.id,
        ...n,
      });
    }

    // 9) Pagamentos (1 pago, 1 pendente)
    await sb.from("payments").insert({ patient_id: ptId, month: "Maio 2026", amount: 160, status: "pago", paid_date: "2026-05-30" });
    await sb.from("payments").insert({ patient_id: ptId, month: "Junho 2026", amount: 160, status: "pendente" });

    // 10) Anúncio de boas-vindas
    await sb.from("announcements").insert({
      title: "Bem-vindos ao novo Portal Psicomotriclinic Hub",
      body: "Estamos a estrear o novo portal. Aqui podem consultar o plano de intervenção, notas de sessão, pagamentos e comunicar directamente com a direção. Qualquer questão, estamos à disposição.",
      audience: "all",
      author_id: profile.id,
      author_name: profile.full_name || "Direção",
      active: true,
    });

    await audit("reset_and_seed_demo", "", `paciente=${ptId} pro=${proId} parent=${parentStubId}`);
    show("Dados demo criados. Recarrega se necessário.");
    return { ok: true };
  };

  // Upload avatar — resize client-side (256×256 max, JPEG 0.85) e guarda como
  // data URL em profiles.{uid}.photo_url. Evita depender de Firebase Storage.
  // Ficheiro raw comprimido ~15-30KB por imagem — cabe no doc Firestore.
  const updateMyPhoto = async (file) => {
    if (!file || !profile?.id) return;
    if (file.size > 5 * 1024 * 1024) { show("Imagem demasiado grande (máx 5MB).", "error"); return; }
    try {
      const dataUrl = await new Promise((res, rej) => {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = () => { img.src = reader.result; };
        reader.onerror = rej;
        img.onload = () => {
          const MAX = 256;
          let { width, height } = img;
          if (width > height) { height = Math.round(height * (MAX / width)); width = MAX; }
          else { width = Math.round(width * (MAX / height)); height = MAX; }
          const canvas = document.createElement("canvas");
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          res(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = rej;
        reader.readAsDataURL(file);
      });
      await sb.from("profiles").update({ photo_url: dataUrl }).eq("id", profile.id);
      await audit("update_photo", `profiles:${profile.id}`, "");
      show("Foto atualizada");
    } catch (e) {
      show("Não foi possível guardar a foto.", "error");
    }
  };

  const removeMyPhoto = async () => {
    if (!profile?.id) return;
    await sb.from("profiles").update({ photo_url: null }).eq("id", profile.id);
    await audit("remove_photo", `profiles:${profile.id}`, "");
    show("Foto removida");
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
      ...ownerIdsFor(patientId),
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

  // ───── Push notifications ─────
  const [pushState, setPushState] = useState({
    permission: typeof window !== "undefined" ? fcmCurrentPermission() : "unsupported",
    enabling: false,
  });

  const enablePush = async () => {
    setPushState((s) => ({ ...s, enabling: true }));
    const res = await fcmRequestPermissionAndToken();
    setPushState((s) => ({ ...s, enabling: false, permission: fcmCurrentPermission() }));
    if (res.error) {
      const map = {
        "no-vapid": "Servidor ainda não configurado para notificações. Contacte a direção.",
        "unsupported": "Este browser/dispositivo não suporta notificações.",
        "permission-denied": "Permissão negada — active nas definições do browser.",
        "permission-default": "Permissão não concedida.",
        "sw-not-ready": "Service worker indisponível.",
        "token-fail": "Não foi possível registar o dispositivo.",
      };
      show(map[res.error.code] || res.error.message, "error");
      return { ok: false };
    }
    if (profile?.id) {
      await fcmSaveTokenToProfile(profile.id, res.token);
      await audit("enable_push", `profiles:${profile.id}`, "");
    }
    show("Notificações ativadas neste dispositivo");
    return { ok: true };
  };

  const disablePush = async () => {
    try {
      // Apaga token actual deste device + remove-o do array no profile.
      // Como não temos o valor do token, usamos deleteToken (revoga FCM-side)
      // e deixamos o token "morto" no array — Cloud Function descarta no envio.
      await fcmDeleteToken();
      if (profile?.id) await audit("disable_push", `profiles:${profile.id}`, "");
    } catch (_) {}
    setPushState((s) => ({ ...s, permission: fcmCurrentPermission() }));
    show("Notificações desativadas neste dispositivo");
  };

  // ───── Confirmar "Não posso ir" — grava nota com status=cancelado ─────
  // Usado pelo fluxo 1-tap do push de lembrete (página /confirmar/...).
  const cancelSession = async (patientId, dateISO, reason) => {
    const pt = pts.find((x) => x.id === patientId);
    if (!pt) { show("Paciente não encontrado", "error"); return { ok: false }; }
    await sb.from("session_notes").insert({
      patient_id: patientId,
      ...ownerIdsFor(patientId),
      professional_id: pt.professional_id || null,
      date: dateISO,
      status: "cancelado",
      domains: [],
      work_done: "",
      observations: reason || "Cancelado pelo responsável (app).",
      progress: "",
      next_plan: "",
      created_by: profile?.id || null,
      cancelled_by_user: true,
    });
    await audit("cancel_session_by_parent", `session_notes:${patientId}`, `${pt.name} · ${dateISO}`);
    show("Sessão cancelada — a direção foi avisada");
    await load();
    return { ok: true };
  };

  // ───── Linkar conta (perfil com role=professional) a um registo de profissional ─────
  const setProfessionalUser = async (professionalId, userId) => {
    await sb.from("professionals").update({ profile_id: userId || null }).eq("id", professionalId);
    const pr = profs.find((x) => x.id === professionalId);
    const u = users.find((x) => x.id === userId);
    await audit("set_professional_user", `professionals:${professionalId}`, `${pr?.name || professionalId} ↔ ${u?.full_name || userId || "—"}`);
    show(userId ? "Conta vinculada" : "Vínculo removido"); await load();
  };

  // Proxies estáveis das ações: cada wrapper tem identidade fixa (útil p/ memo)
  // mas chama SEMPRE a versão fresca via ref → nunca fica com closure obsoleta.
  // O corpo das ações não é tocado (zero risco de transcrição).
  const actionsRef = useRef({});
  actionsRef.current = {
    show, load,
    changeRole, removeUser, toggleUserActive,
    addProf, deleteProfessional, addProfsBulk,
    addPatient, deletePatient, addPatientsBulk,
    addPayment, togglePayment, createPayment, deletePayment, updatePayment,
    saveOverheads, saveVarCost, inviteUser,
    approveRequest, rejectRequest,
    saveAnamnesis, addSessionNote, deleteSessionNote, savePlan,
    genPassword, changeMyPassword, updateMyPhoto, removeMyPhoto, resetAndSeedDemo,
    addWaitlist, updateWaitlist, deleteWaitlist,
    addHomeExercise, deleteHomeExercise, assignHomeExercise, unassignHomeExercise, markCompletion,
    sendParentMessage, replyToParent, markMessageRead,
    addBehaviorEntry, setNotificationPrefs,
    addAnnouncement, toggleAnnouncementActive, deleteAnnouncement,
    quickMarkFalta, setPatientParents, setProfessionalUser,
    enablePush, disablePush, cancelSession,
  };
  const stableActions = useMemo(() => {
    const out = {};
    for (const k of Object.keys(actionsRef.current)) out[k] = (...args) => actionsRef.current[k](...args);
    return out;
  }, []);

  // Valor principal memoizado — só muda quando os dados mudam (NÃO com cada tecla
  // de form/modal, que vivem no UiCtx). setForm/setModal ficam aqui também (setters
  // estáveis) para as páginas abrirem modais via useStore() sem alterações.
  const value = useMemo(() => ({
    profile,
    users, profs, pts, sess, pays, reqs, over, vcosts, visits,
    anamneses, notes, plans, auditLog, announcements,
    waitlist, homeExercises, homeAssignments, homeCompletions, parentMessages, behaviorDiary,
    toast, hydrated, pushState,
    setModal, setForm,
    ...stableActions,
  }), [profile, users, profs, pts, sess, pays, reqs, over, vcosts, visits, anamneses, notes, plans, auditLog, announcements, waitlist, homeExercises, homeAssignments, homeCompletions, parentMessages, behaviorDiary, toast, hydrated, pushState, stableActions]);

  const uiValue = useMemo(() => ({ form, setForm, modal, setModal }), [form, modal]);

  return (
    <Ctx.Provider value={value}>
      <UiCtx.Provider value={uiValue}>{children}</UiCtx.Provider>
    </Ctx.Provider>
  );
}
