// Helpers de formatação/derivação puros — extraídos de código duplicado em
// store.jsx, Dashboard.jsx, ProfessionalPortal.jsx, ParentPortal.jsx, Patients.jsx.
// Puros (sem estado/efeitos) → fáceis de testar (ver format.test.js).

// Iniciais de um nome: "Ana Ribeiro Silva" → "AR" (2 primeiras palavras).
export function initials(name) {
  return (name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Lista de ids de profissionais de um paciente, normalizando os dois formatos
// (professional_ids array novo, professional_id legado).
export function professionalIds(patient) {
  if (!patient) return [];
  if (Array.isArray(patient.professional_ids) && patient.professional_ids.length) return patient.professional_ids;
  return patient.professional_id ? [patient.professional_id] : [];
}

// Rótulo do mês corrente: "Julho 2026". Formato explícito (sem "de") para
// coincidir com os labels existentes (MONTHS_2026 em constants.js) — é usado
// como chave de agrupamento no financeiro, não pode divergir por locale/ICU.
const _MES_PT = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
export function currentMonthLabel(date = new Date()) {
  return `${_MES_PT[date.getMonth()]} ${date.getFullYear()}`;
}

// Dias até ao próximo aniversário a partir de uma data de nascimento (ISO).
// Devolve null se a data for inválida. 0 = é hoje.
export function daysUntilBirthday(birthISO, today = new Date()) {
  if (!birthISO) return null;
  const b = new Date(birthISO);
  if (isNaN(b)) return null;
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let next = new Date(t.getFullYear(), b.getMonth(), b.getDate());
  if (next < t) next = new Date(t.getFullYear() + 1, b.getMonth(), b.getDate());
  return Math.round((next - t) / 86400000);
}

// Sequência de dias consecutivos (streak) terminando hoje, a partir de um
// conjunto de datas ISO (yyyy-mm-dd). Conta para trás enquanto houver registo
// em cada dia; pára no primeiro dia sem registo. Se hoje não tiver registo → 0.
// `today` injetável para testes determinísticos.
export function practiceStreak(dates, today = new Date(), max = 60) {
  const set = dates instanceof Set ? dates : new Set(dates || []);
  const cur = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let streak = 0;
  while (streak < max) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, "0");
    const d = String(cur.getDate()).padStart(2, "0");
    if (!set.has(`${y}-${m}-${d}`)) break;
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

// Idade que a pessoa faz no próximo aniversário.
export function ageOnNext(birthISO, today = new Date()) {
  if (!birthISO) return null;
  const b = new Date(birthISO);
  if (isNaN(b)) return null;
  const hadBirthdayThisYear =
    today.getMonth() > b.getMonth() ||
    (today.getMonth() === b.getMonth() && today.getDate() >= b.getDate());
  const ageNow = today.getFullYear() - b.getFullYear() - (hadBirthdayThisYear ? 0 : 1);
  return ageNow + 1;
}
