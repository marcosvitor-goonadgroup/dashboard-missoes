"use client"

import { ReactNode, useState } from "react"
import Icon from "./Icon"

export interface TableData {
  columns: string[]
  rows: (string | number)[][]
  /** índices das colunas numéricas (alinhadas à direita) */
  numeric?: number[]
}

interface ChartCardProps {
  title: string
  eyebrow?: string
  subtitle?: ReactNode
  children: ReactNode
  /** Altura da área do gráfico (inclui eixos). Omitir = cresce com o conteúdo. */
  height?: number
  /** Versão em tabela do gráfico (acessibilidade / leitura exata dos valores) */
  table?: TableData
  actions?: ReactNode
  className?: string
}

export default function ChartCard({ title, eyebrow, subtitle, children, height, table, actions, className = "" }: ChartCardProps) {
  const [showTable, setShowTable] = useState(false)

  return (
    <section className={`glass card ${className}`} aria-label={title}>
      <div className="card-head">
        <div style={{ minWidth: 0 }}>
          {eyebrow && <div className="eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>}
          <h3>{title}</h3>
          {subtitle && <div className="card-sub">{subtitle}</div>}
        </div>
        <div style={{ display: "flex", gap: 8, flex: "none" }}>
          {actions}
          {table && (
            <button
              type="button"
              className="btn-glass btn-sm"
              onClick={() => setShowTable((v) => !v)}
              aria-pressed={showTable}
              title={showTable ? "Ver gráfico" : "Ver tabela"}
            >
              <Icon name={showTable ? "grafico" : "tabela"} size={16} />
              {showTable ? "Gráfico" : "Tabela"}
            </button>
          )}
        </div>
      </div>

      {showTable && table ? (
        <div className="table-wrap scroll" style={{ maxHeight: height ? Math.max(height, 240) : 420 }}>
          <table className="data-table">
            <thead>
              <tr>
                {table.columns.map((c, i) => (
                  <th key={c} className={table.numeric?.includes(i) ? "num" : undefined}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((v, ci) => (
                    <td key={ci} className={table.numeric?.includes(ci) ? "num" : undefined}>
                      {typeof v === "number" ? v.toLocaleString("pt-BR") : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="chart-box" style={height ? { height } : undefined}>
          {children}
        </div>
      )}
    </section>
  )
}
