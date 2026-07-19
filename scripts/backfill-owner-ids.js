// Backfill de owner ids nos documentos clínicos/financeiros.
//
// PORQUÊ: as firestore.rules passaram a autorizar leitura por responsável/
// profissional com base em parent_user_ids / professional_ids DENORMALIZADOS
// em cada documento. Documentos criados antes desta mudança não têm esses
// campos — sem backfill, o portal do responsável deixaria de ver o histórico
// (o staff continua a ver tudo). Este script copia os arrays do paciente para
// cada doc filho.
//
// COMO CORRER (a partir da raiz do repo, precisa de serviceAccountKey.json):
//   node scripts/backfill-owner-ids.js            # dry-run (não escreve)
//   APPLY=true node scripts/backfill-owner-ids.js # escreve a sério
//
// Idempotente: se o doc já tiver os campos iguais, salta.

const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

const APPLY = (process.env.APPLY ?? "false").toLowerCase() === "true";

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// Coleções filhas que referenciam um paciente por patient_id.
const CHILD_COLLECTIONS = [
  "sessions",
  "session_notes",
  "anamnesis",
  "intervention_plans",
  "payments",
  "behavior_diary",
  "parent_messages",
  "home_practice_assignments",
  "home_practice_completions",
];

const sameArray = (a = [], b = []) =>
  a.length === b.length && a.every((x, i) => x === b[i]);

async function run() {
  console.log(APPLY ? "== BACKFILL (APPLY) ==" : "== BACKFILL (dry-run) ==");

  // 1) Mapa patientId -> { parent_user_ids, professional_ids }
  const patSnap = await db.collection("patients").get();
  const owners = new Map();
  patSnap.forEach((d) => {
    const p = d.data();
    const profIds = Array.isArray(p.professional_ids) && p.professional_ids.length
      ? p.professional_ids
      : (p.professional_id ? [p.professional_id] : []);
    owners.set(d.id, {
      parent_user_ids: p.parent_user_ids || [],
      professional_ids: profIds,
    });
  });
  console.log(`Pacientes: ${owners.size}`);

  let totalUpdated = 0, totalSkipped = 0, totalOrphan = 0;

  for (const coll of CHILD_COLLECTIONS) {
    const snap = await db.collection(coll).get();
    let updated = 0, skipped = 0, orphan = 0;
    for (const d of snap.docs) {
      const data = d.data();
      const pid = data.patient_id || d.id; // anamnesis/plans usam id = patientId
      const own = owners.get(pid);
      if (!own) { orphan++; continue; }
      const needParents = !sameArray(data.parent_user_ids, own.parent_user_ids);
      const needProfs = !sameArray(data.professional_ids, own.professional_ids);
      if (!needParents && !needProfs) { skipped++; continue; }
      if (APPLY) {
        await d.ref.update({
          parent_user_ids: own.parent_user_ids,
          professional_ids: own.professional_ids,
        });
      }
      updated++;
    }
    console.log(`  ${coll}: ${updated} a atualizar · ${skipped} ok · ${orphan} sem paciente`);
    totalUpdated += updated; totalSkipped += skipped; totalOrphan += orphan;
  }

  console.log(`\nTotal: ${totalUpdated} atualizados · ${totalSkipped} já ok · ${totalOrphan} órfãos`);
  if (!APPLY) console.log("Dry-run — nada foi escrito. Corre com APPLY=true para aplicar.");
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
