import { formatInt, formatPct } from "../../lib/missoes"

export interface RankedBarItem {
  key: string
  label: string
  sublabel?: string
  value: number
  /** cor da barra (padrão: série 1) */
  color?: string
}

interface RankedBarsProps {
  items: RankedBarItem[]
  /** mostra a participação (%) ao lado do valor */
  showShare?: boolean
  color?: string
  emptyText?: string
}

/**
 * Barras horizontais finas em HTML: rótulo à esquerda, valor na ponta da barra.
 * Cada linha tem title com o valor completo (equivale ao tooltip).
 */
export default function RankedBars({ items, showShare = false, color = "#465eff", emptyText = "Sem dados para o recorte selecionado." }: RankedBarsProps) {
  const total = items.reduce((s, i) => s + i.value, 0)
  const max = Math.max(0, ...items.map((i) => i.value))
  if (items.length === 0 || total === 0) return <div className="empty">{emptyText}</div>

  return (
    <div className="hbars" role="list">
      {items.map((it) => {
        const share = total > 0 ? (it.value / total) * 100 : 0
        const width = max > 0 ? (it.value / max) * 100 : 0
        const desc = `${it.label}: ${formatInt(it.value)}${showShare ? ` (${formatPct(share)})` : ""}`
        return (
          <div className="hbar-row" role="listitem" key={it.key} title={desc} aria-label={desc}>
            <div className="hbar-label">
              {it.label}
              {it.sublabel && <small>{it.sublabel}</small>}
            </div>
            <div className="hbar-track">
              {/* largura máxima de 82% para sempre caber o valor na ponta */}
              <div className="hbar-fill" style={{ width: `${width * 0.82}%`, background: it.color ?? color }} />
              <span className="hbar-value">
                {formatInt(it.value)}
                {showShare && <small>{formatPct(share)}</small>}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
