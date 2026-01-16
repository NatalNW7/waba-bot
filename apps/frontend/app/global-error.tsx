"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: "1rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "28rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: "#171717",
              borderRadius: "1rem",
              border: "1px solid #262626",
              padding: "2rem",
              boxShadow:
                "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)",
            }}
          >
            {/* Error Icon */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "5rem",
                height: "5rem",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.1)",
                marginBottom: "1.5rem",
              }}
            >
              <svg
                width="40"
                height="40"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Error Message */}
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#fafafa",
                marginBottom: "0.5rem",
              }}
            >
              Erro crítico
            </h1>
            <p
              style={{
                color: "#a1a1aa",
                marginBottom: "1.5rem",
                lineHeight: 1.6,
              }}
            >
              Ocorreu um erro inesperado no aplicativo. Por favor, tente
              recarregar a página.
            </p>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <button
                onClick={() => reset()}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  fontWeight: 500,
                  background: "#25D366",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#20b858")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "#25D366")
                }
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Tentar novamente
              </button>

              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- global-error.tsx must be self-contained */}
              <a
                href="/"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  fontWeight: 500,
                  background: "#262626",
                  color: "#fafafa",
                  textDecoration: "none",
                  fontSize: "1rem",
                  boxSizing: "border-box",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#333333")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "#262626")
                }
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Voltar ao início
              </a>
            </div>

            {/* Technical Details */}
            {error.digest && (
              <div
                style={{
                  marginTop: "1.5rem",
                  textAlign: "left",
                }}
              >
                <details>
                  <summary
                    style={{
                      fontSize: "0.875rem",
                      color: "#71717a",
                      cursor: "pointer",
                    }}
                  >
                    Detalhes técnicos
                  </summary>
                  <div
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.75rem",
                      borderRadius: "0.5rem",
                      background: "#262626",
                      fontSize: "0.75rem",
                      fontFamily: "monospace",
                      color: "#a1a1aa",
                      wordBreak: "break-all",
                    }}
                  >
                    <p style={{ margin: 0 }}>
                      <strong>Error ID:</strong> {error.digest}
                    </p>
                    <p style={{ margin: "0.25rem 0 0 0" }}>
                      <strong>Message:</strong> {error.message}
                    </p>
                  </div>
                </details>
              </div>
            )}
          </div>

          {/* Footer */}
          <p
            style={{
              textAlign: "center",
              fontSize: "0.875rem",
              color: "#71717a",
              marginTop: "1.5rem",
            }}
          >
            Se o problema persistir, entre em contato com o suporte.
          </p>
        </div>
      </body>
    </html>
  );
}
