# Importação para o Firestore — Psicomotriclinic

Conversão dos dois ficheiros Excel para um formato que a tua app em Firebase consegue importar.

## Ficheiros

| Ficheiro | O que é |
|---|---|
| `firestore_import.json` | Tudo junto, nas 3 coleções (para o script de importação). |
| `utentes.json` | Só os utentes (53). |
| `sessoes.json` | Só as sessões (323). |
| `financeiro_mensal.json` | Resumo financeiro por mês (28 meses). |
| `importar_firestore.js` | Script que carrega tudo para o Firestore. |

## Estrutura das coleções

**utentes** — uma entrada por pessoa (sem repetições)
`nome`, `nif`, `seguro`, `nr_seguro`, `observacoes`, `nomes_alternativos`

**sessoes** — uma entrada por sessão (cada data = uma sessão)
`utente_id`, `nome`, `data` (AAAA-MM-DD), `ano`, `mes`, `dia`, `valor`, `pago`, `origem_folha`

**financeiro_mensal** — uma entrada por mês
`ano`, `mes`, `mes_iso`, `receitas`, `custos_fixos`, `custos_variaveis`, `ebitda`, `resultado_liquido`

## Decisões de limpeza (importante rever)

1. **Granularidade**: uma linha por sessão. As datas em texto ("9, 16, 23 e 30") foram
   transformadas em sessões individuais com data completa.
2. **Ano dos meses sem sufixo** (Abril…Dezembro, sem ano no nome): assumido **2023**.
   Confirma se está certo.
3. **Utentes repetidos**: juntados pelo NIF. "Clara Gomes"/"Ana Clara Gomes" e
   "Gustavo"/"Gustavo jardim" foram fundidos (ver `nomes_alternativos`).
4. **"Março 25"**: esta folha tinha 4 meses encostados na horizontal e ficou **de fora**
   da conversão automática — precisa de tratamento à mão.
5. **Financeiro**: extraído das folhas 2023–2026. A folha "2022" foi excluída porque as
   colunas continham, na verdade, dados de 2023 (com valores diferentes da folha 2023).
6. **Estado de pagamento** (`pago`): inferido das marcas "Sim"/"Pago" na linha. Vale a
   pena uma revisão por amostragem.

## Segurança

A chave `serviceAccountKey.json` dá acesso total ao teu projeto. Não a partilhes nem a
metas em repositórios públicos. Por isso o script vem em **modo de teste** por defeito.
