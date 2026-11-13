import type { PremioResumo } from "../../types/dashboard.types"
import { formatInt } from "../../lib/missoes"
import ChartCard from "./ChartCard"
import Icon, { type IconName } from "./Icon"

/** Status do resgate — cada número do card sai com o seu rótulo */
const STATUS_RESGATE = {
  entregue: { rotulo: "Entregues", detalhe: "retirados no balcão", cor: "#0ca30c", icone: "check" as IconName },
  reservado: { rotulo: "Reservados", detalhe: "aguardando retirada", cor: "#fab219", icone: "ampulheta" as IconName },
  cancelado: { rotulo: "Cancelados", detalhe: "voltaram ao estoque", cor: "#8f8db8", icone: "x" as IconName },
}

function situacaoEstoque(p: PremioResumo) {
  if (p.estoqueTotal <= 0) return null
  const restante = (p.disponivel / p.estoqueTotal) * 100
  if (p.disponivel <= 0) return { rotulo: "Esgotado", cor: "#d03b3b", texto: "#fff" }
  if (restante <= 5) return { rotulo: "Estoque crítico", cor: "#d03b3b", texto: "#fff" }
  if (restante <= 20) return { rotulo: "Estoque baixo", cor: "#fab219", texto: "#13136b" }
  return null
}

interface PrizesCardProps {
  premios: PremioResumo[]
  pontosResgatados: number
  /** true quando algum filtro (dia ou público) está recortando os resgates */
  filtrado: boolean
}

export default function PrizesCard({ premios, pontosResgatados, filtrado }: PrizesCardProps) {
  const temOutros = premios.some((p) => p.outros > 0)

  return (
    <ChartCard
      eyebrow="Prêmios"
      title="Entrega de prêmios e estoque"
      subtitle={`${formatInt(pontosResgatados)} pontos trocados por prêmios (já descontados os cancelamentos)`}
      table={{
        columns: [
          "Prêmio",
          "Pontos",
          "Entregues",
          "Reservados",
          "Cancelados",
          ...(temOutros ? ["Outro status"] : []),
          "Total de registros",
          "Disponíveis",
          "Estoque total",
        ],
        numeric: temOutros ? [1, 2, 3, 4, 5, 6, 7, 8] : [1, 2, 3, 4, 5, 6, 7],
        rows: premios.map((p) => [
          p.titulo,
          p.pontos,
          p.entregues,
          p.reservados,
          p.cancelados,
          ...(temOutros ? [p.outros] : []),
          p.total,
          p.disponivel,
          p.estoqueTotal,
        ]),
      }}
    >
      {premios.length === 0 ? (
        <div className="empty">Nenhum prêmio cadastrado.</div>
      ) : (
        <>
          <div className="legend" role="list" aria-label="Legenda da barra de estoque">
            <span className="legend-item" role="listitem">
              <span className="legend-swatch" style={{ background: STATUS_RESGATE.entregue.cor }} />
              Entregues
            </span>
            <span className="legend-item" role="listitem">
              <span className="legend-swatch" style={{ background: STATUS_RESGATE.reservado.cor }} />
              Reservados
            </span>
            <span className="legend-item" role="listitem">
              <span className="legend-swatch" style={{ background: "var(--track)", boxShadow: "inset 0 0 0 1px #d9d7ef" }} />
              Disponíveis
            </span>
          </div>

          {filtrado && (
            <div className="note" style={{ marginBottom: 14 }}>
              <Icon name="info" size={18} />
              <span>Os números por status seguem os filtros ativos. A barra e os disponíveis mostram sempre o estoque total do prêmio.</span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {premios.map((p) => {
              const situacao = situacaoEstoque(p)
              const pct = (n: number) => (p.estoqueTotal > 0 ? `${Math.min(100, (n / p.estoqueTotal) * 100)}%` : "0%")
              const descBarra = `${p.titulo}: ${p.estoqueEntregues} entregues, ${p.estoqueReservados} reservados e ${p.disponivel} disponíveis de ${p.estoqueTotal} no estoque`
              return (
                <div key={p.id} className="prize">
                  <div className="prize-head">
                    <div className="prize-name">
                      <strong>{p.titulo}</strong>
                      <span>{formatInt(p.pontos)} pts</span>
                      {p.altoValor && (
                        <span className="pill pill-y" style={{ height: 20, fontSize: 11 }}>
                          Alto valor
                        </span>
                      )}
                    </div>
                    {situacao && (
                      <span className="pill" style={{ height: 24, fontSize: 12, background: situacao.cor, color: situacao.texto }}>
                        <Icon name="alerta" size={14} />
                        {situacao.rotulo}
                      </span>
                    )}
                  </div>

                  {p.estoqueTotal > 0 && (
                    <div className="stock-bar" role="img" aria-label={descBarra} title={descBarra}>
                      {p.estoqueEntregues > 0 && <div style={{ width: pct(p.estoqueEntregues), background: STATUS_RESGATE.entregue.cor }} />}
                      {p.estoqueReservados > 0 && <div style={{ width: pct(p.estoqueReservados), background: STATUS_RESGATE.reservado.cor }} />}
                    </div>
                  )}

                  <div className="prize-stats">
                    {(["entregue", "reservado", "cancelado"] as const).map((s) => {
                      const st = STATUS_RESGATE[s]
                      const valor = s === "entregue" ? p.entregues : s === "reservado" ? p.reservados : p.cancelados
                      return (
                        <div className="prize-stat" key={s}>
                          <span className="prize-stat-label">
                            <span className="status-dot" style={{ background: st.cor }}>
                              <Icon name={st.icone} size={12} strokeWidth={3} />
                            </span>
                            {st.rotulo}
                          </span>
                          <span className="prize-stat-value">{formatInt(valor)}</span>
                          <span className="prize-stat-caption">{st.detalhe}</span>
                        </div>
                      )
                    })}
                    <div className="prize-stat">
                      <span className="prize-stat-label">Disponíveis</span>
                      <span className="prize-stat-value">
                        {formatInt(p.disponivel)}
                        <small> de {formatInt(p.estoqueTotal)}</small>
                      </span>
                      <span className="prize-stat-caption">no estoque agora</span>
                    </div>
                  </div>

                  {p.outros > 0 && (
                    <div className="note" style={{ marginTop: 8 }}>
                      <Icon name="alerta" size={18} />
                      <span>
                        {formatInt(p.outros)} {p.outros === 1 ? "registro com status desconhecido" : "registros com status desconhecido"} (fora
                        de entregue, reservado e cancelado).
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </ChartCard>
  )
}
