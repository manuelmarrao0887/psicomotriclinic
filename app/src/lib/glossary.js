// Glossário psicomotor — 20 termos técnicos com definição para responsáveis.
// Uso: importar GLOSSARY e componente Term em pages que mostram texto clínico.

export const GLOSSARY = {
  "coordenação motora": "Capacidade de organizar e executar movimentos do corpo de forma controlada, precisa e eficiente.",
  "esquema corporal": "Consciência do próprio corpo — partes, funções e posição no espaço. Base para muitos aprendizagens.",
  "lateralidade": "Preferência dominante do lado do corpo (destro/esquerdo) para acções específicas como escrever, chutar.",
  "equilíbrio": "Capacidade de manter o corpo estável em posições estáticas ou durante o movimento.",
  "regulação emocional": "Capacidade de reconhecer, tolerar e ajustar respostas emocionais em situações do dia-a-dia.",
  "atenção": "Capacidade de focar em estímulos relevantes e ignorar distratores. Base para todas as aprendizagens.",
  "função executiva": "Conjunto de processos mentais (planeamento, memória de trabalho, inibição, flexibilidade) que permitem gerir tarefas complexas.",
  "tónus muscular": "Nível de tensão nos músculos em repouso. Adequado permite postura estável e movimentos precisos.",
  "praxias": "Capacidade de planear e executar sequências de movimentos coordenados com intenção (ex: amarrar atacadores).",
  "cooperação social": "Capacidade de interagir com outros — partilhar, respeitar regras, resolver conflitos.",
  "psicomotricidade": "Área que trabalha a integração entre corpo, movimento, emoção e pensamento no desenvolvimento.",
  "m-abc-2": "Movement Assessment Battery for Children — bateria estandardizada que avalia destreza manual, mira e equilíbrio.",
  "percentil": "Posição relativa numa escala de 0 a 100. Percentil 50 = mediana. Abaixo de 15 indica dificuldade significativa.",
  "anamnese": "Ficha inicial com história do desenvolvimento, contexto familiar, escolar e queixas principais.",
  "grafomotricidade": "Coordenação necessária para escrever — pinça fina, controlo do lápis, orientação espacial na folha.",
  "propriocepção": "Percepção do próprio corpo e suas partes sem recurso à visão. Base para movimentos automáticos.",
  "planificação motora": "Capacidade de sequenciar e antecipar os passos necessários para executar uma acção nova.",
  "integração bilateral": "Uso coordenado dos dois lados do corpo — como cortar com tesoura enquanto se segura o papel.",
  "flexibilidade cognitiva": "Capacidade de mudar de estratégia ou perspectiva conforme muda a situação.",
  "memória de trabalho": "Manter e manipular informação a curto prazo (ex: seguir instruções com 3 passos).",
};

export function findTermInText(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  const hit = Object.keys(GLOSSARY).find((k) => lower.includes(k));
  return hit || null;
}
