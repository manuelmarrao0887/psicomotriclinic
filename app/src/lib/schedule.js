// Lógica pura da grelha semanal (ocupação/vagas) — extraída do Dashboard para
// ser testável. Um "slot" é (dia × hora). As vagas contam apenas horas que a
// clínica usa em algum dia (não slots teóricos infinitos).

// Carga por dia: nº de pacientes com sessão nesse dia.
export function loadByDay(patients = [], days = []) {
  return days.map((d) => patients.filter((p) => p.day_of_week === d).length);
}

// Horas em uso pela clínica (distintas, ordenadas).
export function usedHours(patients = []) {
  return Array.from(new Set(patients.map((p) => p.hour).filter(Boolean))).sort();
}

// Vagas por dia: para cada dia, quantas das horas-em-uso não estão ocupadas.
export function gapsByDay(patients = [], days = []) {
  const hours = usedHours(patients);
  return days.map((d) => {
    const busy = new Set(patients.filter((p) => p.day_of_week === d).map((p) => p.hour));
    return hours.filter((h) => !busy.has(h)).length;
  });
}

// Total de vagas na grelha.
export function totalGaps(patients = [], days = []) {
  return gapsByDay(patients, days).reduce((s, v) => s + v, 0);
}

// Ocupação (%): slots ocupados / (dias × horas-em-uso).
export function occupancyPct(patients = [], days = []) {
  const hours = usedHours(patients);
  const capacity = days.length * hours.length;
  if (!capacity) return 0;
  const gaps = totalGaps(patients, days);
  return Math.round(((capacity - gaps) / capacity) * 100);
}
