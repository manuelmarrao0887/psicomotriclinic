# Migração para Firebase — passos de arranque

A app (`index.html`) já está ligada ao Firebase via um adaptador que mantém a API que o código usava.
Falta **a tua parte de configuração** na consola/CLI do Firebase.

## 1. Colar a config web
Em `index.html`, no bloco `firebaseConfig` (procura `COLA_AQUI`), cola os valores do teu projeto:
Consola Firebase → ⚙ **Definições do projeto** → **As tuas apps** (Web) → *SDK setup and configuration* → **Config**.

Se ainda não tens uma "Web app" registada, clica em **Adicionar app → Web (</>)** primeiro.

## 2. Ativar os métodos de login
Consola → **Authentication** → **Sign-in method** → ativar:
- **Email/Password**
- **Google** (define o email de suporte)

## 3. Criar a base de dados Firestore
Consola → **Firestore Database** → **Criar base de dados** → modo **Production** → região (ex.: `europe-west1`).

## 4. Publicar as regras de segurança
Com o Firebase CLI (`npm i -g firebase-tools`, depois `firebase login`):
```bash
firebase use <o-teu-project-id>
firebase deploy --only firestore:rules
```
(As regras estão em `firestore.rules`.)

## 5. (Opcional, mas necessário p/ login Google em produção)
Em **Authentication → Settings → Authorized domains**, adiciona `psicomotriclinic.proofstudio.pt` e o domínio final.

---

## Lembretes de sessão (Cloud Function) — Fase 2
Equivalente Firebase da antiga edge function. **Requer plano Blaze** (rede externa + agendamento).

```bash
cd functions && npm install && cd ..
# guardar a API key do Resend como secret
firebase functions:secrets:set RESEND_API_KEY
# por defeito corre em dry-run; para enviar a sério, define a env:
#   REMINDERS_DRY_RUN=false   (em functions, via .env ou config de runtime)
firebase deploy --only functions
```
A função `sessionReminders` corre todos os dias às 18:00 (Europe/Lisbon).

## Limitações conhecidas (a tratar a seguir)
- **Convite de utilizadores pelo admin** (`addProfessional`/convite): criar conta no cliente com Firebase **troca a sessão** para o novo utilizador (o admin fica desligado). Solução correta: uma Cloud Function com o Admin SDK para criar contas. Posso implementar.
- **Verificação de email**: o Firebase não bloqueia o login por defeito. Se quiseres confirmação obrigatória, usa `sendEmailVerification` + verificação no arranque.
- **Associar responsável ao paciente** (`parent_profile_id`) continua por preencher — sem isso os lembretes não têm destinatário.
