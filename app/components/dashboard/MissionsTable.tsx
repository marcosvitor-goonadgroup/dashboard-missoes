"use client"

import { useMemo, useState } from "react"
import type { MissaoResumo } from "../../types/dashboard.types"
import { categoriaLabel, formatInt, modoLabel } from "../../lib/missoes"
import { STATUS } from "./chartTheme"
import Icon from "./Icon"

type Ordenacao = "app" | "concluidas" | "pendentes"

export default function MissionsTable({ missoes, selecionada }: { missoes: MissaoResumo[]; selecionada?: number }) {
  const [ordem, setOrdem] = useState<Ordenacao>("app")

  const linhas = useMemo(() => {
    const l = [...missoes]
    if (ordem === "concluidas") l.sort((a, b) => b.validados - a.validados || b.pendentes - a.pendentes)
    if (ordem === "pendentes") l.sort((a, b) => b.pendentes - a.pendentes || b.validados - a.validados)
    return l
  }, [missoes, ordem])

  const maxTotal = Math.max(1, ...missoes.map((m) => m.validados + m.pendentes + m.recusados))
  const totais = missoes.reduce(
    (acc, m) => ({ v: acc.v + m.validados, p: acc.p + m.pendentes, r: acc.r + m.recusados }),
    { v: 0, p: 0, r: 0 },
  )

  return (
    <section className="glass card" aria-label="Missões">
      <div className="card-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Missões e boosters</div>
          <h3>Desempenho por missão</h3>
          <div className="card-sub">Check-ins por status. Participantes = pessoas distintas com a missão validada.</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }} role="group" aria-label="Ordenar missões">
          {(
            [
              ["app", "Ordem do app"],
              ["concluidas", "Mais concluídas"],
              ["pendentes", "Mais pendentes"],
            ] as [Ordenacao, string][]
          ).map(([k, rotulo]) => (
            <button
              key={k}
              type="button"
              className={k === ordem ? "pill pill-b" : "pill pill-g"}
              style={{ border: 0, cursor: "pointer" }}
              aria-pressed={k === ordem}
              onClick={() => setOrdem(k)}
            >
              {rotulo}
            </button>
          ))}
        </div>
      </div>

      <div className="legend" role="list" aria-label="Legenda de status">
        {(["validado", "pendente", "recusado"] as const).map((s) => (
          <span className="legend-item" role="listitem" key={s}>
            <span className="status-dot" style={{ background: STATUS[s].cor }}>
              <Icon name={STATUS[s].icone} size={12} strokeWidth={3} />
            </span>
            {STATUS[s].rotulo}
            <strong style={{ color: "var(--text-primary)" }}>
              {formatInt(s === "validado" ? totais.v : s === "pendente" ? totais.p : totais.r)}
            </strong>
          </span>
        ))}
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Missão</th>
              <th className="num">Pontos</th>
              <th style={{ width: "28%", minWidth: 160 }}>Check-ins</th>
              <th className="num">Validadas</th>
              <th className="num">Pendentes</th>
              <th className="num">Recusadas</th>
              <th className="num">Participantes</th>
              <th className="num">Berloques</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((m) => {
              const total = m.validados + m.pendentes + m.recusados
              const seg = (n: number) => `${(n / maxTotal) * 100}%`
              const desc = `${m.nome}: ${m.validados} validadas, ${m.pendentes} pendentes, ${m.recusados} recusadas`
              return (
                <tr key={m.id} className={selecionada === m.id ? "is-selected" : undefined}>
                  <td>
                    <div style={{ fontWeight: 800 }}>{m.nome}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4, flexWrap: "wrap" }}>
                      <span className={m.categoria === "booster" ? "pill pill-y" : "pill pill-lilas"} style={{ height: 20, fontSize: 11 }}>
                        {categoriaLabel(m.categoria)}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{modoLabel(m.modo)}</span>
                    </div>
                  </td>
                  <td className="num">{m.pontos > 0 ? formatInt(m.pontos) : "–"}</td>
                  <td>
                    {total === 0 ? (
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Sem check-ins</span>
                    ) : (
                      <div className="segbar thin" style={{ height: 12 }} role="img" aria-label={desc} title={desc}>
                        {m.validados > 0 && <div style={{ width: seg(m.validados), background: STATUS.validado.cor }} />}
                        {m.pendentes > 0 && <div style={{ width: seg(m.pendentes), background: STATUS.pendente.cor }} />}
                        {m.recusados > 0 && <div style={{ width: seg(m.recusados), background: STATUS.recusado.cor }} />}
                      </div>
                    )}
                  </td>
                  <td className="num">{formatInt(m.validados)}</td>
                  <td className="num">{m.pendentes ? formatInt(m.pendentes) : <span style={{ color: "var(--text-muted)" }}>0</span>}</td>
                  <td className="num">{m.recusados ? formatInt(m.recusados) : <span style={{ color: "var(--text-muted)" }}>0</span>}</td>
                  <td className="num">{formatInt(m.participantesUnicos)}</td>
                  <td className="num">{m.berloques ? formatInt(m.berloques) : <span style={{ color: "var(--text-muted)" }}>0</span>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
