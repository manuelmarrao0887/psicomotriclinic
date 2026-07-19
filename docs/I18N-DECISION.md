# Decisão: aplicação monolingue (pt-PT)

**Estado:** decisão de produto assumida (não é dívida técnica por resolver).

O Psicomotriclinic Hub é, por agora, **exclusivamente pt-PT**:

- Todas as strings de interface estão em português inline.
- Datas/moeda via `toLocaleString("pt-PT")`.
- Domínio de negócio português: dias/meses (`constants.js`), seguros do mercado
  PT (`ADSE`, `SAMS`, `ADM`), rótulos de papéis.

## Porquê não há camada de i18n

O produto serve **uma clínica em Portugal**. Uma camada de i18n (catálogo de
strings, `react-intl`/`i18next`, extração de ~1000+ strings) acrescentaria
complexidade e superfície de manutenção sem utilizador que a justifique hoje.

## Quando reabrir esta decisão

Adotar i18n **apenas** se surgir um destes gatilhos:

- Expansão para outro país/idioma.
- Necessidade de suportar famílias não-lusófonas no portal do responsável.

Nessa altura, o caminho é: extrair strings para um catálogo por chave, introduzir
`i18next` + `react-i18next`, e substituir os `toLocaleString("pt-PT")` fixos por
locale dinâmico. Estimativa: refactor grande (L), a fazer com a app a correr.

Até lá, manter tudo pt-PT é a escolha certa — documentada aqui para não voltar a
aparecer como "achado" em auditorias futuras.
