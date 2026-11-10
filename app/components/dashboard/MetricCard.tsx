import type { ReactNode } from "react"
import Icon, { type IconName } from "./Icon"

interface MetricCardProps {
  label: string
  value: ReactNode
  /** sufixo pequeno ao lado do valor (ex.: "/5") */
  unit?: string
  sub?: ReactNode
  icon: IconName
  /** "destaque" usa o vidro azul da marca */
  tone?: "padrao" | "destaque"
}

export default function MetricCard({ label, value, unit, sub, icon, tone = "padrao" }: MetricCardProps) {
  return (
    <div className={`kpi ${tone === "destaque" ? "glass-blue" : "glass"}`}>
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        <span className="kpi-icon">
          <Icon name={icon} size={20} />
        </span>
      </div>
      <div className="kpi-value">
        {value}
        {unit && <small>{unit}</small>}
      </div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  )
}
