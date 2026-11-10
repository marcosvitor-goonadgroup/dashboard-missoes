import type { BaseResumo } from "../../types/dashboard.types"
import { formatInt, formatPct } from "../../lib/missoes"
import { SERIES } from "./chartTheme"
import ChartCard from "./ChartCard"

/** Segmentos: cor do preenchimento + cor do texto interno (escolhida pela luminância) */
const SEGMENTOS = [
  { chave: "clientes", rotulo: "Clientes BB", cor: SERIES.azul, texto: "#ffffff" },
  { chave: "naoClientes", rotulo: "Não clientes", cor: SERIES.rosa, texto: "#13136b" },
  { chave: "naoInformado", rotulo: "Não informado", cor: "#cfcde6", texto: "#13136b" },
] as const

export default function BaseCard({ base, recorte }: { base: BaseResumo; recorte: boolean }) {
  const total = base.total

  return (
    <ChartCard
      eyebrow="Público"
      title="Relação com o BB"
      subtitle={recorte ? "Participantes com atividade no recorte" : "Informado no cadastro do app"}
      table={{
        columns: ["Grupo", "Participantes", "%"],
        numeric: [1, 2],
        rows: [
          ...SEGMENTOS.map((s) => [s.rotulo, base[s.chave], total ? formatPct((base[s.chave] / total) * 100, 1) : "–"]),
          ["Funcionários BB", base.funcionariosBB, total ? formatPct((base.funcionariosBB / total) * 100, 1) : "–"],
        ],
      }}
    >
      {total === 0 ? (
        <div className="empty">Nenhum participante no recorte selecionado.</div>
      ) : (
        <>
          <div
            className="segbar"
            role="img"
            aria-label={SEGMENTOS.map((s) => `${s.rotulo}: ${base[s.chave]} (${formatPct((base[s.chave] / total) * 100)})`).join(", ")}
          >
            {SEGMENTOS.map((s) => {
              const v = base[s.chave]
              if (v === 0) return null
              const pct = (v / total) * 100
              return (
                <div
                  key={s.chave}
                  style={{ width: `${pct}%`, background: s.cor, color: s.texto }}
                  title={`${s.rotulo}: ${formatInt(v)} (${formatPct(pct, 1)})`}
                >
                  {/* rótulo só quando cabe */}
                  {pct >= 12 ? formatPct(pct) : ""}
                </div>
              )
            })}
          </div>

          <div className="legend" style={{ marginTop: 12, marginBottom: 0 }} role="list">
            {SEGMENTOS.map((s) => (
              <span className="legend-item" role="listitem" key={s.chave}>
                <span className="legend-swatch" style={{ background: s.cor }} />
                {s.rotulo}
                <strong style={{ color: "var(--text-primary)" }}>{formatInt(base[s.chave])}</strong>
              </span>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginTop: 18 }}>
            <div className="note" style={{ flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>Clientes BB</span>
              <span style={{ font: "800 26px/1 var(--font-titulos)", color: "var(--noite)" }}>
                {formatPct((base.clientes / total) * 100)}
              </span>
            </div>
            <div className="note" style={{ flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>Funcionários BB</span>
              <span style={{ font: "800 26px/1 var(--font-titulos)", color: "var(--noite)" }}>{formatInt(base.funcionariosBB)}</span>
            </div>
          </div>
        </>
      )}
    </ChartCard>
  )
}
