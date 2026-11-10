import type { PremioResumo } from "../../types/dashboard.types"
import { formatInt, formatPct, plural } from "../../lib/missoes"
import ChartCard from "./ChartCard"

/** Estoque: azul enquanto saudável, âmbar abaixo de 20% e vermelho abaixo de 5% (sempre com rótulo) */
function nivelEstoque(restantePct: number) {
  if (restantePct <= 5) return { cor: "#d03b3b", rotulo: "Crítico" }
  if (restantePct <= 20) return { cor: "#fab219", rotulo: "Baixo" }
  return { cor: "#465eff", rotulo: "" }
}

export default function PrizesCard({ premios, pontosResgatados }: { premios: PremioResumo[]; pontosResgatados: number }) {
  return (
    <ChartCard
      eyebrow="Prêmios"
      title="Resgates e estoque"
      subtitle={`${formatInt(pontosResgatados)} pontos já trocados por prêmios`}
      table={{
        columns: ["Prêmio", "Pontos", "Estoque total", "Disponível", "Resgates (recorte)", "Entregues"],
        numeric: [1, 2, 3, 4, 5],
        rows: premios.map((p) => [p.titulo, p.pontos, p.estoqueTotal, p.disponivel, p.resgatados, p.entregues]),
      }}
    >
      {premios.length === 0 ? (
        <div className="empty">Nenhum prêmio cadastrado.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {premios.map((p) => {
            const saiu = Math.max(0, p.estoqueTotal - p.disponivel)
            const usadoPct = p.estoqueTotal > 0 ? (saiu / p.estoqueTotal) * 100 : 0
            const restantePct = 100 - usadoPct
            const nivel = nivelEstoque(restantePct)
            return (
              <div key={p.id}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", marginBottom: 8 }}>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: 15 }}>{p.titulo}</span>{" "}
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatInt(p.pontos)} pts</span>
                    {p.altoValor && (
                      <span className="pill pill-y" style={{ height: 20, fontSize: 11, marginLeft: 8 }}>
                        Alto valor
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                    <strong style={{ color: "var(--text-primary)" }}>{formatInt(p.disponivel)}</strong> de {formatInt(p.estoqueTotal)} disponíveis
                    {nivel.rotulo && (
                      <span className="pill" style={{ height: 20, fontSize: 11, marginLeft: 8, background: nivel.cor, color: nivel.rotulo === "Baixo" ? "#13136b" : "#fff" }}>
                        Estoque {nivel.rotulo.toLowerCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className="meter"
                  role="meter"
                  aria-valuemin={0}
                  aria-valuemax={p.estoqueTotal}
                  aria-valuenow={saiu}
                  aria-label={`${p.titulo}: ${saiu} de ${p.estoqueTotal} já saíram do estoque`}
                >
                  <div style={{ width: `${usadoPct}%`, background: nivel.cor }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                  <span>
                    {formatPct(usadoPct, usadoPct > 0 && usadoPct < 1 ? 1 : 0)} do estoque já saiu
                  </span>
                  <span>
                    {plural(p.resgatados, "resgate")} · {plural(p.entregues, "entregue")}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </ChartCard>
  )
}
