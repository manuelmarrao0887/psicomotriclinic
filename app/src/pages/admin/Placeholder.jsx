import { Card, Eyebrow } from "../../lib/ui.jsx";

export default function Placeholder({ title }) {
  return (
    <div style={{ padding: "28px 40px 60px" }}>
      <Card pad={28} style={{ textAlign: "center" }}>
        <div style={{ marginBottom: 12 }}><Eyebrow>— EM MIGRAÇÃO</Eyebrow></div>
        <div className="serif" style={{ fontSize: 24, fontWeight: 300, color: "#152741", marginBottom: 8 }}>
          {title} a chegar em breve
        </div>
        <p style={{ fontSize: 13.5, color: "#8A8A86", lineHeight: 1.6, maxWidth: 540, margin: "0 auto" }}>
          Esta página está a ser migrada do código antigo (single-file `index.html`) para esta nova estrutura modular Vite + React Router.
          Até lá, podes continuar a usar a versão atual da app (o `index.html` na raiz do projeto).
        </p>
      </Card>
    </div>
  );
}
