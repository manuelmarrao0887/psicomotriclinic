// Cloud Function — lembretes de sessão (equivalente Firebase da antiga edge function Supabase).
// Agenda: horário recorrente semanal em patients (day_of_week, hour). Destinatário = responsável
// (patients.parent_profile_id -> profiles.email). Envio por Resend.
//
// Requer plano Blaze (chamadas de rede externas + agendamento).
// Salvaguarda: só envia com RESEND_API_KEY definido E REMINDERS_DRY_RUN != "true".
import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();
const RESEND_API_KEY = defineSecret("RESEND_API_KEY");

const PT_DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const FROM = "Psicomotriclinic <lembretes@acasadapsicomotricidade.pt>";

async function runReminders() {
  const dry = (process.env.REMINDERS_DRY_RUN ?? "true").toLowerCase() === "true";
  const key = RESEND_API_KEY.value();

  // "Amanhã" no fuso de Lisboa.
  const lisbonNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Lisbon" }));
  const tomorrow = new Date(lisbonNow);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekday = PT_DAYS[tomorrow.getDay()];
  const sessionDate = tomorrow.toISOString().slice(0, 10);

  const snap = await db.collection("patients").where("active", "==", true).get();
  const due = snap.docs.filter((d) => d.data().day_of_week === weekday); // dia filtrado em JS (sem índice composto)

  const summary = { dry_run: dry || !key, weekday, session_date: sessionDate, processed: 0, sent: 0, skipped: 0, failed: 0 };

  for (const doc of due) {
    const p = doc.data();
    summary.processed++;
    const ref = db.collection("reminders").doc(`${doc.id}_${sessionDate}_email`); // dedup por id determinístico

    // Anti-duplicado.
    if ((await ref.get()).exists) { summary.skipped++; continue; }

    let email = null;
    if (p.parent_profile_id) {
      const par = await db.collection("profiles").doc(p.parent_profile_id).get();
      email = par.exists ? (par.data().email ?? null) : null;
    }

    const base = { patient_id: doc.id, session_date: sessionDate, session_hour: p.hour ?? null, channel: "email", recipient: email, created_at: new Date().toISOString() };

    if (!email) { await ref.set({ ...base, status: "skipped", detail: "sem responsável/email" }); summary.skipped++; continue; }

    if (dry || !key) { await ref.set({ ...base, status: "dry_run", detail: "simulado (sem envio)" }); continue; }

    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: FROM, to: [email],
          subject: `Lembrete: sessão de ${p.name} amanhã às ${p.hour}`,
          html: `<div style="font-family:Arial,sans-serif;color:#3C3C3B;line-height:1.6">`
            + `<p>Olá,</p><p>Lembrete da sessão de <b>${p.name}</b> marcada para <b>amanhã (${weekday}) às ${p.hour}</b>.</p>`
            + `<p>Para remarcar, contacte-nos com antecedência.</p>`
            + `<p style="color:#8A8A86">A Casa da Psicomotricidade — Psicomotriclinic</p></div>`
        })
      });
      if (!resp.ok) { await ref.set({ ...base, status: "failed", detail: `resend ${resp.status}` }); summary.failed++; continue; }
      await ref.set({ ...base, status: "sent", detail: null }); summary.sent++;
    } catch (e) {
      await ref.set({ ...base, status: "failed", detail: String(e).slice(0, 300) }); summary.failed++;
    }
  }
  console.log("session-reminders:", JSON.stringify(summary));
  return summary;
}

// Diariamente às 18:00 de Lisboa.
export const sessionReminders = onSchedule(
  { schedule: "0 18 * * *", timeZone: "Europe/Lisbon", secrets: [RESEND_API_KEY] },
  async () => { await runReminders(); }
);
