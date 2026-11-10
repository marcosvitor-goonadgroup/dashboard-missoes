import type { ValidacaoResumo } from "../../types/dashboard.types"
import { formatDateTime, formatInt, formatPct, plural } from "../../lib/missoes"
import { STATUS } from "./chartTheme"
import ChartCard from "./ChartCard"
import Icon from "./Icon"

export default function ValidationCard({ validacao }: { validacao: ValidacaoResumo }) {
  const { metodos, taxaAprovacaoIA, analisadasIA, recusasRecentes } = validacao
  const maxTotal = Math.max(1, ...metodos.map((m) => m.validados + m.pendentes + m.recusados))

  return (
    <ChartCard
      eyebrow="Operação"
      title="Validação dos check-ins"
      subtitle="Como as missões estão sendo confirmadas"
      table={{
        columns: ["Método", "Validadas", "Pendentes", "Recusadas"],
        numeric: [1, 2, 3],
        rows: metodos.map((m) => [m.rotulo, m.validados, m.pendentes, m.recusados]),
      }}
    >
      {metodos.length === 0 ? (
        <div className="empty">Sem check-ins no recorte selecionado.</div>
      ) : (
        <>
          <div className="hbars" role="list">
            {metodos.map((m) => {
              const total = m.validados + m.pendentes + m.recusados
              const desc = `${m.rotulo}: ${m.validados} validadas, ${m.pendentes} pendentes, ${m.recusados} recusadas`
              return (
                <div className="hbar-row" role="listitem" key={m.metodo} aria-label={desc} title={desc}>
                  <div className="hbar-label">
                    {m.rotulo}
                    <small>{plural(total, "check-in")}</small>
                  </div>
                  <div className="hbar-track">
                    <div className="segbar thin" style={{ height: 12, width: `${(total / maxTotal) * 82}%` }}>
                      {(["validados", "pendentes", "recusados"] as const).map((k) =>
                        m[k] > 0 ? (
                          <div
                            key={k}
                            style={{
                              width: `${(m[k] / total) * 100}%`,
                              background: STATUS[k === "validados" ? "validado" : k === "pendentes" ? "pendente" : "recusado"].cor,
                            }}
                          />
                        ) : null,
                      )}
                    </div>
                    <span className="hbar-value">{formatInt(m.validados)}<small>validadas</small></span>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 18 }}>
            <div className="note" style={{ flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>Aprovação da IA</span>
              <span style={{ font: "800 26px/1 var(--font-titulos)", color: "var(--noite)" }}>
                {taxaAprovacaoIA != null ? formatPct(taxaAprovacaoIA, 0) : "–"}
              </span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>das fotos já decididas</span>
            </div>
            <div className="note" style={{ flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>Enviadas para IA</span>
              <span style={{ font: "800 26px/1 var(--font-titulos)", color: "var(--noite)" }}>{formatInt(analisadasIA)}</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>fotos e comprovantes</span>
            </div>
          </div>

          {recusasRecentes.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Últimas recusas</div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {recusasRecentes.map((r, i) => (
                  <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13 }}>
                    <span className="status-dot" style={{ background: STATUS.recusado.cor, marginTop: 1 }} title="Recusada">
                      <Icon name="x" size={12} strokeWidth={3} />
                    </span>
                    <span style={{ flex: 1, lineHeight: 1.4 }}>
                      <strong>{r.missao}</strong> · {r.motivo}
                    </span>
                    <span style={{ flex: "none", fontSize: 12, color: "var(--text-muted)" }}>{formatDateTime(r.em)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </ChartCard>
  )
}
