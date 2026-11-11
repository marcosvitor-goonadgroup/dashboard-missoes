import type { MissaoResumo } from "../../types/dashboard.types"
import { formatInt } from "../../lib/missoes"
import { STATUS } from "./chartTheme"
import ChartCard from "./ChartCard"
import Icon from "./Icon"

const ORDEM_STATUS = ["validado", "pendente", "recusado"] as const
const CAMPO: Record<(typeof ORDEM_STATUS)[number], "validados" | "pendentes" | "recusados"> = {
  validado: "validados",
  pendente: "pendentes",
  recusado: "recusados",
}

/**
 * Barras horizontais: total de check-ins por missão, empilhado por status.
 * Ordenado do maior para o menor volume; o total fica na ponta da barra.
 */
export default function MissionCheckinsChart({ missoes, selecionada }: { missoes: MissaoResumo[]; selecionada?: number }) {
  const linhas = missoes
    .map((m) => ({ ...m, total: m.validados + m.pendentes + m.recusados }))
    .filter((m) => m.total > 0)
    .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome))
  const semCheckin = missoes.length - linhas.length
  const max = Math.max(1, ...linhas.map((m) => m.total))
  const totalGeral = linhas.reduce((s, m) => s + m.total, 0)

  return (
    <ChartCard
      eyebrow="Volume"
      title="Check-ins por missão"
      subtitle={
        <>
          {formatInt(totalGeral)} check-ins no recorte
          {semCheckin > 0 && ` · ${semCheckin} ${semCheckin === 1 ? "missão" : "missões"} ainda sem check-in`}
        </>
      }
      table={{
        columns: ["Missão", "Check-ins", "Validadas", "Pendentes", "Recusadas"],
        numeric: [1, 2, 3, 4],
        rows: linhas.map((m) => [m.nome, m.total, m.validados, m.pendentes, m.recusados]),
      }}
    >
      {linhas.length === 0 ? (
        <div className="empty">Sem check-ins no recorte selecionado.</div>
      ) : (
        <>
          <div className="legend" role="list" aria-label="Legenda de status">
            {ORDEM_STATUS.map((s) => (
              <span className="legend-item" role="listitem" key={s}>
                <span className="status-dot" style={{ background: STATUS[s].cor }}>
                  <Icon name={STATUS[s].icone} size={12} strokeWidth={3} />
                </span>
                {STATUS[s].rotulo}
              </span>
            ))}
          </div>

          <div className="hbars" role="list" style={{ gap: 10 }}>
            {linhas.map((m) => {
              const destaque = selecionada === m.id
              const apagada = selecionada != null && !destaque
              const partes = ORDEM_STATUS.filter((s) => m[CAMPO[s]] > 0)
              const desc = `${m.nome}: ${m.total} check-ins (${m.validados} validadas, ${m.pendentes} pendentes, ${m.recusados} recusadas)`
              return (
                <div
                  className="hbar-row"
                  role="listitem"
                  key={m.id}
                  title={desc}
                  aria-label={desc}
                  style={{ opacity: apagada ? 0.45 : 1 }}
                >
                  <div className="hbar-label" style={{ fontWeight: destaque ? 800 : 700 }}>
                    {m.nome}
                  </div>
                  <div className="hbar-track">
                    {/* até 82% da largura, para o total sempre caber na ponta */}
                    <div style={{ display: "flex", gap: 2, height: 20, width: `${(m.total / max) * 82}%`, minWidth: 4 }}>
                      {partes.map((s, i) => (
                        <div
                          key={s}
                          style={{
                            width: `${(m[CAMPO[s]] / m.total) * 100}%`,
                            minWidth: 2,
                            background: STATUS[s].cor,
                            borderRadius: i === partes.length - 1 ? "0 4px 4px 0" : 0,
                          }}
                        />
                      ))}
                    </div>
                    <span className="hbar-value">{formatInt(m.total)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </ChartCard>
  )
}
