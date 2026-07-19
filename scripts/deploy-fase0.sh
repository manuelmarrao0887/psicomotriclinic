#!/usr/bin/env bash
# Deploy guiado e seguro da Fase 0 (segurança RGPD).
# Ordem crítica (ver docs/SECURITY-DEPLOY.md): cliente (Vercel) → BACKFILL →
# regras → functions. O backfill TEM de correr antes das regras, senão os
# documentos antigos ficam sem owner ids e o portal do responsável perde acesso.
#
# Uso:
#   1) firebase login              (uma vez, interativo — abre o browser)
#   2) coloca serviceAccountKey.json na raiz do repo (Firebase Console →
#      Project Settings → Service accounts → Generate new private key)
#   3) deploy do cliente no Vercel (o teu fluxo habitual) — ANTES deste script
#   4) bash scripts/deploy-fase0.sh            # verifica + backfill DRY-RUN
#      bash scripts/deploy-fase0.sh --apply    # aplica backfill + deploy regras/functions
set -euo pipefail
cd "$(dirname "$0")/.."

APPLY=false
[ "${1:-}" = "--apply" ] && APPLY=true
FB="npx --yes firebase-tools"
PROJECT="psicomotriclinic-app"

echo "== Deploy Fase 0 — projeto $PROJECT =="

# --- Pré-requisitos ---
if ! $FB login:list 2>&1 | grep -qiE "@|logged in"; then
  echo "✗ Firebase não autenticado. Corre:  firebase login" ; exit 1
fi
if [ ! -f serviceAccountKey.json ]; then
  echo "✗ Falta serviceAccountKey.json na raiz (necessário para o backfill)." ; exit 1
fi
echo "✓ Autenticado + service account presente"

# --- Verificação: regras nos testes do emulador ---
echo "== 1/4 Verificar regras (emulador) =="
( cd firestore-tests && npm install --silent >/dev/null 2>&1 || true
  $FB emulators:exec --only firestore --project "$PROJECT" "node rules.test.mjs" ) \
  && echo "✓ 22 asserções de regras verdes" \
  || { echo "✗ Testes de regras falharam — ABORTAR."; exit 1; }

# --- Backfill dos owner ids ---
echo "== 2/4 Backfill de owner ids (dry-run) =="
node scripts/backfill-owner-ids.js

if [ "$APPLY" != true ]; then
  echo
  echo "DRY-RUN concluído. Nada foi alterado nem deployado."
  echo "Para aplicar a sério:  bash scripts/deploy-fase0.sh --apply"
  echo "Lembra: faz o deploy do CLIENTE (Vercel) ANTES de aplicar."
  exit 0
fi

echo "== 2/4 Backfill (APLICAR) =="
APPLY=true node scripts/backfill-owner-ids.js
echo "✓ Backfill aplicado"

# --- Deploy das regras + índices ---
echo "== 3/4 Deploy regras + índices =="
$FB deploy --only firestore:rules,firestore:indexes --project "$PROJECT"
echo "✓ Regras + índices deployados"

# --- Deploy das Cloud Functions ---
echo "== 4/4 Deploy Cloud Functions =="
$FB deploy --only functions --project "$PROJECT"
echo "✓ Functions deployadas"

echo
echo "== FEITO. Passos manuais que faltam =="
echo " • Garantir env em produção: REMINDERS_DRY_RUN != true (default agora é envio real)"
echo " • Definir VITE_FCM_VAPID_KEY no Vercel (push do cliente)"
echo " • Firebase Auth → Password policy + verificação de email (f0-11)"
echo " • Remover exports reais (utentes.json, etc.) da pasta iCloud (f0-9)"
