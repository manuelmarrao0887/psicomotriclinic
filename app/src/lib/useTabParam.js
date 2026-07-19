import { useSearchParams } from "react-router-dom";

// Sincroniza o separador ativo com o URL (?tab=...). Dá deep-linking, suporte
// ao botão Voltar e permite que um push aponte para um separador específico —
// sem reescrever os portais para rotas aninhadas. Compatível com a mesma API
// [tab, setTab] de um useState. `valid` restringe a valores conhecidos.
export function useTabParam(defaultTab, valid) {
  const [sp, setSp] = useSearchParams();
  const raw = sp.get("tab");
  const tab = valid.includes(raw) ? raw : defaultTab;
  const setTab = (t) => {
    setSp((prev) => {
      const p = new URLSearchParams(prev);
      if (t === defaultTab) p.delete("tab"); else p.set("tab", t);
      return p;
    });
  };
  return [tab, setTab];
}
