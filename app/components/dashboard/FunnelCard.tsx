import type { FunnelStage } from "../../types/dashboard.types"
import { formatInt, formatPct } from "../../lib/missoes"
import { ordinalSteps } from "./chartTheme"
import ChartCard from "./ChartCard"

export default function FunnelCard({ stages, recorte }: { stages: FunnelStage[]; recorte: boolean }) {
  const base = stages[0]?.total ?? 0
  const cores = ordinalSteps(stages.length)

  return (
    <ChartCard
      eyebrow="Jornada"
      title="Funil da Missão"
      subtitle={recorte ? "Participantes com atividade no recorte selecionado" : "Do cadastro ao resgate de prêmio"}
      table={{
        columns: ["Etapa", "Participantes", "% do cadastro", "% da etapa anterior"],
        numeric: [1, 2, 3],
        rows: stages.map((s, i) => [
          s.etapa,
          s.total,
          base ? formatPct((s.total / base) * 100, 1) : "–",
          i === 0 ? "–" : stages[i - 1].total ? formatPct((s.total / stages[i - 1].total) * 100, 1) : "–",
        ]),
      }}
    >
      {base === 0 ? (
        <div className="empty">Nenhum participante no recorte selecionado.</div>
      ) : (
        <div role="list">
          {stages.map((s, i) => {
            const pct = (s.total / base) * 100
            const prev = i > 0 ? stages[i - 1].total : 0
            const conv = i > 0 && prev > 0 ? (s.total / prev) * 100 : null
            return (
              <div key={s.etapa} role="listitem" aria-label={`${s.etapa}: ${formatInt(s.total)} (${formatPct(pct)})`}>
                {conv !== null && <div className="funnel-conv">↓ {formatPct(conv)} seguem para a próxima etapa</div>}
                <div className="funnel-step" title={s.descricao}>
                  <div className="hbar-label">
                    {s.etapa}
                    <small>{s.descricao}</small>
                  </div>
                  <div className="hbar-track">
                    <div className="hbar-fill" style={{ width: `${pct * 0.78}%`, height: 24, background: cores[i] }} />
                    <span className="hbar-value">
                      {formatInt(s.total)}
                      <small>{formatPct(pct)}</small>
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </ChartCard>
  )
}
