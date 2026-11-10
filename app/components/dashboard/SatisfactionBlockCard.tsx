import type { SatisfactionBlock } from "../../types/dashboard.types"
import { formatDecimal, formatPct, plural } from "../../lib/missoes"

const TITULO_EYEBROW: Record<SatisfactionBlock["type"], string> = {
  satisfaction: "Bloco 1",
  positioning: "Bloco 2",
  relationship: "Bloco 3",
}

export default function SatisfactionBlockCard({ block, destaque = false }: { block: SatisfactionBlock; destaque?: boolean }) {
  return (
    <section className={`card ${destaque ? "glass-blue" : "glass"}`} aria-label={block.title}>
      <div className="eyebrow" style={{ color: destaque ? "var(--amarelo)" : undefined, marginBottom: 6 }}>
        {TITULO_EYEBROW[block.type]}
      </div>
      <h3 style={{ fontSize: 19, fontWeight: 800, color: destaque ? "#fff" : "var(--noite)" }}>{block.title}</h3>

      <div style={{ display: "flex", gap: 28, margin: "16px 0 6px" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.85 }}>Grau</div>
          <div style={{ font: "800 40px/1 var(--font-titulos)" }}>
            {formatDecimal(block.grade, 1)}
            <small style={{ fontSize: 16, marginLeft: 2, opacity: 0.8 }}>%</small>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.85 }}>Nota média</div>
          <div style={{ font: "800 40px/1 var(--font-titulos)" }}>
            {formatDecimal(block.averageScore, 2)}
            <small style={{ fontSize: 16, marginLeft: 2, opacity: 0.8 }}>/5</small>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 16 }}>{block.formula}</div>

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {block.questions.map((q) => (
          <li key={q.pergunta}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13, marginBottom: 6 }}>
              <span style={{ fontWeight: 700, lineHeight: 1.3 }}>{q.pergunta}</span>
              <span style={{ whiteSpace: "nowrap", fontWeight: 800 }}>{formatDecimal(q.media, 2)}</span>
            </div>
            <div
              className="meter"
              style={{ background: destaque ? "rgba(255,255,255,0.25)" : undefined }}
              role="meter"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={q.grau}
              aria-label={`${q.pergunta}: grau ${q.grau}%`}
            >
              <div style={{ width: `${q.grau}%`, background: destaque ? "var(--amarelo)" : "var(--azul)" }} />
            </div>
            <div style={{ fontSize: 11.5, opacity: 0.8, marginTop: 4 }}>
              Grau {formatPct(q.grau, 1)} · {formatPct(q.top2, 0)} notas 4–5 · {plural(q.totalRespostas, "resposta")}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
