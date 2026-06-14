import { Component } from "react";

// Apanha qualquer erro de render em descendentes e mostra um ecrã com a
// mensagem + stack. Substitui o silêncio do "página em branco".
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    // Log para a consola — visível em devtools (Cmd+Opt+I)
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, info);
  }

  reset = () => this.setState({ error: null, info: null });

  render() {
    if (this.state.error) {
      const msg = this.state.error?.message || String(this.state.error);
      const stack = this.state.error?.stack || "";
      const compStack = this.state.info?.componentStack || "";
      return (
        <div style={{
          maxWidth: 720, margin: "40px auto", padding: 24,
          background: "#FBFAF7", color: "#3C3C3B",
          border: "1px solid #EAE6DD", borderRadius: 14,
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", fontSize: 14, lineHeight: 1.6,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, color: "#B83A3A" }}>
            <span style={{
              width: 36, height: 36, borderRadius: 18, background: "#F4E0E0",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700,
            }}>!</span>
            <h1 style={{ fontSize: 18, margin: 0, color: "#152741", fontWeight: 600 }}>Algo correu mal nesta página</h1>
          </div>
          <p style={{ marginBottom: 14, color: "#5A5A58" }}>
            A página não conseguiu renderizar. O erro está abaixo — partilha isto para podermos corrigir.
          </p>
          <pre style={{
            background: "#F5F2EC", border: "1px solid #EAE6DD", borderRadius: 10,
            padding: 14, overflow: "auto", maxHeight: 260,
            fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: 12,
            color: "#B83A3A", whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}>{msg}</pre>
          {stack && (
            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: "pointer", fontSize: 13, color: "#5A5A58" }}>Stack trace</summary>
              <pre style={{
                background: "#F5F2EC", border: "1px solid #EAE6DD", borderRadius: 10,
                padding: 14, overflow: "auto", maxHeight: 200, marginTop: 8,
                fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: 11,
                color: "#5A5A58", whiteSpace: "pre",
              }}>{stack}</pre>
            </details>
          )}
          {compStack && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ cursor: "pointer", fontSize: 13, color: "#5A5A58" }}>Component stack</summary>
              <pre style={{
                background: "#F5F2EC", border: "1px solid #EAE6DD", borderRadius: 10,
                padding: 14, overflow: "auto", maxHeight: 200, marginTop: 8,
                fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: 11,
                color: "#5A5A58", whiteSpace: "pre",
              }}>{compStack}</pre>
            </details>
          )}
          <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
            <button onClick={this.reset} style={{
              padding: "10px 18px", borderRadius: 10, border: "1px solid #152741",
              background: "#152741", color: "#F7F4EE", fontSize: 14, fontWeight: 500,
            }}>Tentar outra vez</button>
            <button onClick={() => window.location.assign("/dashboard")} style={{
              padding: "10px 18px", borderRadius: 10, border: "1px solid #D9D3C5",
              background: "#FBFAF7", color: "#152741", fontSize: 14, fontWeight: 500,
            }}>Voltar ao Dashboard</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
