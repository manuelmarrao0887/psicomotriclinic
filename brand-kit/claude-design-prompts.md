# Kit de prompts — Claude Design
### A Casa da Psicomotricidade · linha Clinic (pais)
**Revisto e ligado ao design system do produto (v2.0.0-alpha.36).**

Um prompt por cada asset e template. Copia um de cada vez para o Claude Design.

> **Ponte marca ↔ produto.** O marketing mantém a sua voz própria (títulos em
> **Fraunces**, creme dominante, elipses orgânicas) — não é igual à UI da app. Mas
> **herda do design system real** os valores exatos que não podem divergir: os
> **hexes**, os **gradientes de marca** e as **regras de contraste (AA)**. Assim marca
> e produto sentem-se a mesma casa sem serem o mesmo layout. Os tokens do produto
> vivem em `design-system/tokens.json` e `MASTER.md`.

---

## Como usar

1. **Carrega o ficheiro do logótipo** no início de cada sessão. O logótipo está
   **fechado** — o Claude Design usa-o tal como está e **nunca o redesenha,
   recolore ou recompõe**.
2. **Cola primeiro o «bloco base da marca»** (abaixo). Define cores, letra e tom.
   Dentro da mesma sessão, não precisas de repetir.
3. **Depois cola o prompt específico** do asset que queres. Cada um refere o bloco base.
4. **Pede sempre vetorial (SVG) e fundo transparente** quando fizer sentido, e
   uma ou duas variações para escolheres.
5. **Ordem recomendada:** primeiro os *assets base* (elipses, ícones, padrão).
   Os templates a seguir reutilizam-nos.

---

## Bloco base da marca — colar no topo de cada sessão

```
Marca: A Casa da Psicomotricidade — clínica de psicomotricidade.
Público desta linha: pais de adolescentes (10–17 anos).

LOGÓTIPO: já existe e está fechado. Vou carregar o ficheiro. Usa-o exatamente
como está — nunca o redesenhes, recolores nem recomponhas. Deixa sempre uma
área de proteção livre à sua volta (mínimo: a altura do "P" do logótipo).

CORES — usa APENAS estas (hexes exatos, partilhados com o produto):
- Creme #F7F4EE — fundo dominante (marketing)
- Navy #152741 — cor principal e estrutura
- Sálvia #8DBF94 — secundária
- Céu sereno #B9CDE0 — secundária
- Âmbar #E8A13C — acento; só em pequenos detalhes, sempre o elemento mais pequeno
- Texto: cinza #3C3C3B; títulos em navy #152741
Proporção alvo: ~50% creme · ~25% navy · ~12% sálvia · ~8% céu · ~5% âmbar.

Para profundidade, se precisares de tons: navy escuro #0E1B30 / #08111F;
navy claro #1E3556; âmbar escuro #C97A1F. Neutros: linha #EAE6DD, borda #D9D3C5.

GRADIENTES DE MARCA (usar com parcimónia, nunca berrantes):
- Âmbar (só em pontos/avatares): radial-gradient(circle at 30% 30%, #E8A13C, #C9791A)
- Navy (superfícies escuras): linear-gradient(135deg, #152741, #0E1B30)

REGRA DE CONTRASTE (acessibilidade — obrigatória):
- Âmbar NUNCA como texto sobre fundo claro (falha contraste). Se precisares de
  texto cor-de-âmbar, usa âmbar-escuro #8A5011.
- Texto sobre creme: cinza #3C3C3B ou navy. Texto sobre navy: creme #F7F4EE.
- Qualquer texto ≥ 4.5:1 de contraste; a cor nunca é o único sinal de significado.

TIPOGRAFIA:
- Títulos: Fraunces (serifada, pesos 300–400), tracking ligeiramente negativo
- Texto e interface: DM Sans (400/500/700)
- Etiquetas pequenas em maiúsculas (opcional): JetBrains Mono, tracking +0.08em

ELEMENTO GRÁFICO — as quatro elipses:
Navy, sálvia, céu e âmbar. Sobreposição orgânica entre 15% e 60%, âmbar SEMPRE a
mais pequena. Podem aparecer soltas como decoração (pelo menos duas visíveis em
simultâneo). Bordas suaves, sem contorno, sem sombra. Discretas — nunca competem
com o conteúdo nem com o logótipo.

TOM VISUAL: próximo mas não íntimo, humano mas não sentimental, rigoroso mas não
frio. Calmo, contido, com muito espaço branco. Uma só cor de acento (âmbar),
usada com parcimónia.

EVITA SEMPRE: o azul antigo #0E3A5A; tipos de letra de sistema; gradientes
berrantes; sombras pesadas; efeitos 3D; ícones e imagens clichés (cérebro,
engrenagens, coração, puzzle, família de bonecos, stock sorridente).
```

---

## 1 · Assets base

### 1.1 Elementos gráficos das elipses
```
(Marca: usa o bloco base.) Cria um conjunto de elementos gráficos decorativos
a partir das quatro elipses da marca (navy, sálvia, céu, âmbar), para capas e
separadores. Dá-me 4 a 6 composições: agrupamento central, faixa lateral, canto
superior, canto inferior, e uma versão «rasto» diagonal. Em cada uma: pelo menos
duas elipses visíveis, sobreposição 15–60%, âmbar a mais pequena, bordas suaves,
sem contorno nem sombra. Sem o wordmark. Fundo transparente, SVG vetorial.
Exporta cada composição individualmente.
```

### 1.2 Conjunto de ícones
```
(Marca: usa o bloco base.) Cria um conjunto de ~16 ícones de linha, coerentes
com as formas suaves da marca: traço uniforme 1.5–2px, cantos arredondados, sem
preenchimento, grelha 24×24, cor navy #152741. Um só estilo (não misturar linha
e sólido). Temas: corpo, movimento, emoção, regulação, criança, adolescente,
família, sessão, agenda, contacto, artigo/blog, avaliação, jogo, respiração,
casa, acompanhamento. Fundo transparente, SVG, exportáveis individualmente.
Devem manter-se legíveis a 16px e ter área de toque util ≥ 44px quando usados
em interface.
```

### 1.3 Padrão / textura de fundo
```
(Marca: usa o bloco base.) Cria um padrão de fundo muito subtil a partir das
elipses, para fundos de secção e capas. Baixo contraste: elipses navy e sálvia
a baixa opacidade (5–12%) sobre creme. Calmo, não obviamente repetitivo, sem
costura visível. Duas versões: uma sobre creme (elementos escuros) e uma sobre
navy (elementos claros, ex. creme/sálvia a baixa opacidade). Formato grande
(SVG ou PNG 3000px).
```

### 1.4 Base de capas e imagens de partilha (Open Graph)
```
(Marca: usa o bloco base.) Cria um template de imagem de partilha (Open Graph
1200×630) e uma capa genérica. Fundo creme ou navy, elipses soltas num canto,
espaço central para um título curto em Fraunces e o logótipo num dos cantos com
área de proteção. Mantém a proporção de cor da marca (creme dominante). Mostra
2 variações: fundo claro (creme) e fundo navy. Garante contraste AA do título.
```

---

## 2 · Redes sociais

### 2.1 Carrossel Instagram — pais
```
(Marca: usa o bloco base.) Cria um sistema de carrossel para Instagram
(1080×1350, 6 a 8 cartões) dirigido a pais. Estrutura:
- Capa: título forte em Fraunces + elipses num canto.
- Conteúdo: texto em DM Sans, muito espaço branco, no máximo um destaque em
  âmbar por cartão (ponto/detalhe, nunca texto âmbar sobre creme).
- Final: logótipo e um convite contido (nunca comercial).
Tom próximo, segunda pessoa, calmo. Preenche com um tema de exemplo à tua
escolha para eu ver o sistema a funcionar. Mantém consistência de margens
e posição do logótipo entre cartões.
```

### 2.2 Carrossel LinkedIn — profissionais
```
(Marca: usa o bloco base.) Cria um sistema de carrossel para LinkedIn
(1080×1350, 6 a 8 cartões) dirigido a profissionais e comunidade educativa.
Mais sóbrio e conceptual do que o de Instagram: menos âmbar, mais navy e creme,
linguagem institucional («a Casa», primeira pessoa do plural). Capa com título
Fraunces, cartões de conteúdo densos mas arejados, cartão final com logótipo e
assinatura. Preenche com um tema de exemplo.
```

### 2.3 Cartão de citação
```
(Marca: usa o bloco base.) Cartão de citação para Instagram (1080×1080). Frase
curta em Fraunces sobre creme, elipses discretas num canto, assinatura «A Casa
da Psicomotricidade» em baixo (DM Sans). Contido, sem clichés motivacionais.
Dá 2 variações (fundo creme e fundo navy — no navy, texto em creme #F7F4EE).
```

### 2.4 Cartão de dica
```
(Marca: usa o bloco base.) Cartão de dica prática, em duas medidas (1080×1080 e
1080×1350). Título curto em Fraunces + 3 pontos simples em DM Sans. Um ícone da
biblioteca (1.2) no topo, em navy. Um único acento em âmbar (detalhe, não texto).
Muito espaço branco.
```

### 2.5 Stories (vertical)
```
(Marca: usa o bloco base.) Template de story vertical (1080×1920) com 3
variações: capa, citação e «novo artigo». Logótipo no topo, área segura central
para o texto (respeitar zonas de UI do Instagram nos ~250px topo/base), elipses
num canto. Coerente com os carrosséis.
```

### 2.6 Foto de perfil / avatar
```
(Marca: usa o bloco base.) Cria a foto de perfil (1:1) a partir do logótipo
existente, sobre creme ou navy. Não redesenhes o logótipo — apenas enquadras e
centras, com área de proteção. Tem de ser legível a tamanho muito pequeno
(24px). Dá as duas versões (creme e navy).
```

### 2.7 Capa / banner de perfil
```
(Marca: usa o bloco base.) Cria capas de perfil: LinkedIn (1584×396) e Facebook
(820×312). Fundo navy ou creme, elipses soltas, o wordmark e uma frase-âncora
curta em Fraunces. Deixa margem de segurança para o avatar (canto inferior
esquerdo no LinkedIn) e para o recorte responsivo.
```

---

## 3 · Blog / editorial

### 3.1 Imagem de destaque de artigo
```
(Marca: usa o bloco base.) Cria um sistema de imagem de destaque para artigos,
em 16:9 e 1:1. Categoria no topo em JetBrains Mono (maiúsculas, tracking +0.08em),
título do artigo em Fraunces, elipses num canto. Duas paletas de base (clara
sobre creme e escura sobre navy) para variar entre artigos. Pensa-o como sistema,
para gerar rapidamente uma imagem por artigo mudando só o texto e a paleta.
```

> Nota: os componentes do artigo dentro do site (caixa de destaque, citação,
> cartão de artigo) são construídos em código no próprio website, com os tokens
> oficiais do design system (`tokens.json`) — não precisam do Claude Design.

---

## 4 · Documentos e apresentação

### 4.1 Template de apresentação
```
(Marca: usa o bloco base.) Cria um template de apresentação (16:9) com estes
modelos de slide: capa (logótipo + elipses + título Fraunces), separador de
secção, conteúdo (título + texto/pontos em DM Sans + área de imagem), citação,
e slide final de contacto. Sóbrio, muito espaço branco, âmbar só em detalhes.
Mostra os 5 modelos preenchidos com exemplo. Garante contraste AA em todos os
textos, incluindo sobre navy.
```

### 4.2 Assinatura de email
```
(Marca: usa o bloco base.) Cria uma assinatura de email — versão em HTML simples
(inline styles, tabela, sem dependências externas) e versão em imagem. Estrutura:
logótipo pequeno à esquerda; à direita nome, função, «A Casa da Psicomotricidade
/ Psicomotriclinic», telefone, email e site. Uma linha fina em âmbar como único
acento. Leve e legível, sem excesso. Largura ≤ 500px.
```

### 4.3 Papel timbrado / documento A4
```
(Marca: usa o bloco base.) Cria um template de documento A4 em duas versões:
carta e relatório. Cabeçalho com logótipo, rodapé com contactos, margens
generosas, título em Fraunces, corpo em DM Sans. Elementos gráficos (elipses)
apenas no cabeçalho e rodapé, discretos. O relatório inclui estilos de secção
(eyebrow em JetBrains Mono + título Fraunces). Pronto para impressão (CMYK-safe,
sem cores que dependam de fundo).
```

### 4.4 Cartão de visita
```
(Marca: usa o bloco base.) Cria um cartão de visita (85×55mm, frente e verso,
sangria 3mm para impressão). Frente: logótipo centrado sobre creme ou navy.
Verso: nome, função e contactos em DM Sans, com um detalhe de elipses e um toque
de âmbar. Vetorial, pronto a imprimir.
```

---

## Cheat-sheet de medidas
| Asset | Medida |
|---|---|
| OG / partilha | 1200×630 |
| Carrossel IG/LinkedIn | 1080×1350 |
| Quadrado (citação/dica) | 1080×1080 |
| Story | 1080×1920 |
| Avatar | 1:1 (legível a 24px) |
| Capa LinkedIn / Facebook | 1584×396 / 820×312 |
| Destaque de artigo | 16:9 e 1:1 |
| Apresentação | 16:9 |
| Cartão de visita | 85×55mm + 3mm sangria |
| Documento | A4 |

## O que deixei de fora (de propósito)
Sem documentos de escala grande — manual de merchandising, co-branding, kit de
fornecedores, packaging. Para a dimensão da Casa, seria fingir que a marca é
maior do que precisa. Quando houver vários profissionais e canais, acrescentam-se.
