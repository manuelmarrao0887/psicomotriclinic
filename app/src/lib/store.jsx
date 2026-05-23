// Store partilhada: dados carregados do Firestore + acções CRUD + toast + modais.
// Vive ao nível do AdminLayout — todas as páginas filhas usam `useStore()`.
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { sb } from "./firebase.js";
import { AVATAR_BG } from "./constants.js";

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
  const [toast, setToast]   = useState(null);
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({});

  const show = useCallback((m, t = "success") => {
    setToast({ m, t });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const load = useCallback(async () => {
    try {
      const [r1, r2, r3, r4, r5, r6, r7, r8, r9] = await Promise.all([
        sb.from("profiles").select("*").order("created_at", { ascending: false }),
        sb.from("professionals").select("*").eq("active", true).order("name"),
        sb.from("patients").select("*").eq("active", true).order("name"),
        sb.from("sessions").select("*").order("date", { ascending: false }).limit(200),
        sb.from("payments").select("*").order("created_at", { ascending: false }),
        sb.from("schedule_requests").select("*").eq("status", "pendente"),
        sb.from("overheads").select("*"),
        sb.from("variable_costs").select("*"),
        sb.from("visits").select("*").order("created_at", { ascending: false }).limit(2000),
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
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ────────── Acções ──────────

  const changeRole = async (uid, r) => {
    await sb.from("profiles").update({ role: r }).eq("id", uid);
    show("Papel atualizado");
    await load();
  };

  const removeUser = async (uid) => {
    await sb.from("profiles").delete().eq("id", uid);
    show("Utilizador removido");
    await load();
  };

  const toggleUserActive = async (uid, makeActive) => {
    await sb.from("profiles").update({ active: makeActive }).eq("id", uid);
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
    setModal(null); setForm({}); show("Profissional adicionado"); await load();
  };

  const deleteProfessional = async (id) => {
    await sb.from("professionals").delete().eq("id", id);
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
      doctor: form.doctor || null,
      other_profs: form.others || null,
      insurance_name: form.insName || null,
      insurance_number: form.insNum || null,
    };
    if (form.editingId) await sb.from("patients").update(payload).eq("id", form.editingId);
    else await sb.from("patients").insert(payload);
    setModal(null); setForm({}); show(form.editingId ? "Paciente atualizado" : "Paciente criado"); await load();
  };

  const deletePatient = async (id) => {
    await sb.from("patients").delete().eq("id", id);
    show("Paciente eliminado"); await load();
  };

  const addPatientsBulk = async () => {
    const lines = (form.bulk || "").split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    let ok = 0; const errs = [];
    for (const line of lines) {
      const [name, age, profName, day, hour, type] = line.split(/[,;\t]/).map((s) => (s || "").trim());
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
    setModal(null); setForm({}); show("Pagamento registado"); await load();
  };

  const togglePayment = async (p) => {
    const newSt = p.status === "pago" ? "pendente" : "pago";
    await sb.from("payments").update({
      status: newSt,
      paid_date: newSt === "pago" ? new Date().toISOString().slice(0, 10) : null,
    }).eq("id", p.id);
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
    setModal(null); setForm({}); show("Custos do mês registados"); await load();
  };

  const genPassword = () => {
    const p = "Ps" + Math.random().toString(36).slice(2, 8) + Math.floor(Math.random() * 90 + 10);
    setForm((f) => ({ ...f, newPw: p }));
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

  const value = {
    profile,
    users, profs, pts, sess, pays, reqs, over, vcosts, visits,
    toast, show,
    modal, setModal, form, setForm,
    load,
    changeRole, removeUser, toggleUserActive,
    addProf, deleteProfessional, addProfsBulk,
    addPatient, deletePatient, addPatientsBulk,
    addPayment, togglePayment,
    saveOverheads, saveVarCost,
    inviteUser,
    genPassword, changeMyPassword,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
