// Cloud Functions — push notifications (FCM) + email fallback.
// 3 funções:
//  1. sessionReminders (Cloud Scheduler diário, 18:00 Lisboa)
//     → lembrete por push aos parent_user_ids; fallback email se houver Resend
//  2. onAnnouncementCreated (Firestore trigger em /announcements)
//     → envia push à audiência seleccionada (all/professional/parent)
//  3. onScheduleRequestUpdated (Firestore trigger em /schedule_requests)
//     → quando status muda para aprovado/recusado, push ao requested_by_id
//
// Requer plano Blaze. RESEND_API_KEY é opcional (sem ela, push-only).
// REMINDERS_DRY_RUN=true (env var no projecto) suprime envios reais — útil para testar.

import { onSchedule } from "firebase-functions/v2/scheduler";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

initializeApp();
const db = getFirestore();
const messaging = getMessaging();
const RESEND_API_KEY = defineSecret("RESEND_API_KEY");

const PT_DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const FROM = "Psicomotriclinic <lembretes@acasadapsicomotricidade.pt>";

// ───────────────────────────── helpers ─────────────────────────────

const isDryRun = () => (process.env.REMINDERS_DRY_RUN ?? "true").toLowerCase() === "true";

// Obtém todos os fcm_tokens de um conjunto de user ids. Apaga tokens inválidos.
async function getTokensForUsers(userIds) {
  const tokens = [];
  const tokenOwners = new Map(); // token -> userId (para limpar inválidos)
  for (const uid of userIds) {
    if (!uid) continue;
    const snap = await db.collection("profiles").doc(uid).get();
    if (!snap.exists) continue;
    const arr = snap.data().fcm_tokens || [];
    for (const t of arr) { tokens.push(t); tokenOwners.set(t, uid); }
  }
  return { tokens, tokenOwners };
}

async function pruneInvalidTokens(responses, tokens, tokenOwners) {
  const dead = [];
  responses.forEach((r, i) => {
    if (r.success) return;
    const code = r.error?.code || "";
    if (code === "messaging/invalid-registration-token" || code === "messaging/registration-token-not-registered") {
      dead.push(tokens[i]);
    }
  });
  for (const t of dead) {
    const uid = tokenOwners.get(t);
    if (!uid) continue;
    try { await db.collection("profiles").doc(uid).update({ fcm_tokens: FieldValue.arrayRemove(t) }); }
    catch (_) {}
  }
}

// Envia push para um conjunto de tokens com data payload.
// Usa 'data' em vez de 'notification' para o nosso sw.js construir a notificação
// (controlo total sobre ícone/click handling).
async function sendPushToTokens(tokens, data) {
  if (!tokens.length) return { sent: 0, failed: 0 };
  if (isDryRun()) { console.log("[dry-run] push to", tokens.length, "tokens:", data); return { sent: 0, failed: 0, dry: true }; }
  // FCM Admin SDK aceita até 500 tokens por chamada via sendEachForMulticast.
  const chunks = [];
  for (let i = 0; i < tokens.length; i += 500) chunks.push(tokens.slice(i, i + 500));
  let sent = 0, failed = 0;
  for (const chunk of chunks) {
    const res = await messaging.sendEachForMulticast({
      tokens: chunk,
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v ?? "")])),
    });
    sent += res.successCount; failed += res.failureCount;
  }
  return { sent, failed };
}

// Envia email via Resend (se key + email presentes).
async function sendEmail(email, subject, html) {
  const key = RESEND_API_KEY.value();
  if (!key || isDryRun() || !email) return { ok: false, dry: true };
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [email], subject, html }),
    });
    return { ok: resp.ok, status: resp.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ───────────────────────── 1. lembretes diários ────────────────────

async function runReminders() {
  const dry = isDryRun();
  const lisbonNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Lisbon" }));
  const tomorrow = new Date(lisbonNow);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekday = PT_DAYS[tomorrow.getDay()];
  const sessionDate = tomorrow.toISOString().slice(0, 10);

  const snap = await db.collection("patients").where("active", "==", true).get();
  const due = snap.docs.filter((d) => d.data().day_of_week === weekday);

  const summary = { dry_run: dry, weekday, session_date: sessionDate, processed: 0, push_sent: 0, email_sent: 0, skipped: 0, failed: 0 };

  for (const doc of due) {
    const p = doc.data();
    summary.processed++;
    const ref = db.collection("reminders").doc(`${doc.id}_${sessionDate}`); // dedup determinístico
    if ((await ref.get()).exists) { summary.skipped++; continue; }

    // Quem recebe: parent_user_ids (preferido) com fallback ao legacy parent_profile_id.
    const userIds = Array.isArray(p.parent_user_ids) && p.parent_user_ids.length
      ? p.parent_user_ids
      : (p.parent_profile_id ? [p.parent_profile_id] : []);

    // ── Push (FCM) ─────────────────────────────────────────────
    const { tokens, tokenOwners } = await getTokensForUsers(userIds);
    let pushSent = 0;
    if (tokens.length) {
      const data = {
        type: "session_reminder",
        title: `Sessão amanhã às ${p.hour || "—"}`,
        body: `${p.name} tem sessão. Toque para confirmar ou cancelar.`,
        url: `/confirmar/${doc.id}/${sessionDate}`,
        tag: `session-${doc.id}-${sessionDate}`,
      };
      if (!dry) {
        const res = await messaging.sendEachForMulticast({
          tokens, data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
        });
        pushSent = res.successCount;
        await pruneInvalidTokens(res.responses, tokens, tokenOwners);
      }
      summary.push_sent += pushSent;
    }

    // ── Email (fallback / complementar) ────────────────────────
    let emails = [];
    for (const uid of userIds) {
      const par = await db.collection("profiles").doc(uid).get();
      const e = par.exists ? par.data().email : null;
      if (e && !emails.includes(e)) emails.push(e);
    }
    let emailSent = 0;
    for (const email of emails) {
      const res = await sendEmail(email, `Lembrete: sessão de ${p.name} amanhã às ${p.hour}`,
        `<div style="font-family:Arial,sans-serif;color:#3C3C3B;line-height:1.6">`
        + `<p>Olá,</p><p>Lembrete da sessão de <b>${p.name}</b> marcada para <b>amanhã (${weekday}) às ${p.hour}</b>.</p>`
        + `<p>Para confirmar ou cancelar, abra o portal: <a href="https://app.acasadapsicomotricidade.pt/confirmar/${doc.id}/${sessionDate}">confirmar sessão</a>.</p>`
        + `<p style="color:#8A8A86">A Casa da Psicomotricidade — Psicomotriclinic</p></div>`);
      if (res.ok) emailSent++;
    }
    summary.email_sent += emailSent;

    await ref.set({
      patient_id: doc.id, session_date: sessionDate, session_hour: p.hour ?? null,
      push_sent: pushSent, email_sent: emailSent, recipients: userIds,
      created_at: new Date().toISOString(),
      status: (pushSent + emailSent) > 0 ? "sent" : (dry ? "dry_run" : "skipped"),
    });

    if (pushSent + emailSent === 0 && !dry) summary.skipped++;
  }
  console.log("sessionReminders:", JSON.stringify(summary));
  return summary;
}

export const sessionReminders = onSchedule(
  { schedule: "0 18 * * *", timeZone: "Europe/Lisbon", secrets: [RESEND_API_KEY] },
  async () => { await runReminders(); }
);

// HTTP callable for testing (opcional — chama via emulator/curl autenticado).
// Não obrigatório, mas útil em primeiro deploy. Comentado por segurança.

// ───────────────────── 2. push em novo anúncio ─────────────────────

export const onAnnouncementCreated = onDocumentCreated("announcements/{id}", async (event) => {
  const ann = event.data?.data();
  if (!ann || ann.active === false) return;
  const audience = ann.audience || "all"; // all | professional | parent

  // Quem recebe
  let query = db.collection("profiles");
  if (audience === "professional") query = query.where("role", "==", "professional");
  if (audience === "parent") query = query.where("role", "==", "parent");
  const snap = await query.get();
  const userIds = snap.docs.map((d) => d.id);

  const { tokens, tokenOwners } = await getTokensForUsers(userIds);
  if (!tokens.length) return;

  const data = {
    type: "announcement",
    title: ann.title || "Nova comunicação",
    body: (ann.body || "").slice(0, 140),
    url: "/",
    tag: `announcement-${event.params.id}`,
  };

  if (isDryRun()) { console.log("[dry-run] announcement push to", tokens.length, "tokens"); return; }
  const res = await messaging.sendEachForMulticast({
    tokens, data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
  });
  await pruneInvalidTokens(res.responses, tokens, tokenOwners);
  console.log("onAnnouncementCreated:", JSON.stringify({ audience, sent: res.successCount, failed: res.failureCount }));
});

// ───────────────────── 3. push em estado de pedido ─────────────────

export const onScheduleRequestUpdated = onDocumentUpdated("schedule_requests/{id}", async (event) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  if (!before || !after) return;
  if (before.status === after.status) return;
  if (after.status !== "aprovado" && after.status !== "recusado") return;

  const requesterId = after.requested_by_id;
  if (!requesterId) return;

  const { tokens, tokenOwners } = await getTokensForUsers([requesterId]);
  if (!tokens.length) return;

  const title = after.status === "aprovado" ? "Pedido aprovado" : "Pedido recusado";
  const body = `${after.patient_name || "Pedido de troca"} — ${after.status === "aprovado" ? "horário alterado" : "consultar detalhes"}`;
  const data = { type: "request_update", title, body, url: "/", tag: `req-${event.params.id}` };

  if (isDryRun()) { console.log("[dry-run] request push to", tokens.length, "tokens"); return; }
  const res = await messaging.sendEachForMulticast({
    tokens, data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
  });
  await pruneInvalidTokens(res.responses, tokens, tokenOwners);
  console.log("onScheduleRequestUpdated:", JSON.stringify({ status: after.status, sent: res.successCount, failed: res.failureCount }));
});
