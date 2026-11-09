"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 32, textAlign: "center" }}>
        <h1 style={{ fontSize: 18 }}>Não foi possível carregar</h1>
        <p style={{ color: "#666", fontSize: 14 }}>
          Verifique sua conexão e tente de novo.
        </p>
        <button
          onClick={reset}
          style={{ marginTop: 16, padding: "10px 20px", borderRadius: 12, border: 0, background: "#b45309", color: "#fffdf8", fontSize: 16 }}
        >
          Tentar de novo
        </button>
      </body>
    </html>
  );
}
