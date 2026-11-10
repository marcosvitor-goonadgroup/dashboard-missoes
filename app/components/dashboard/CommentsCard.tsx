"use client"

import { useMemo, useState } from "react"
import type { Comment } from "../../types/dashboard.types"
import { formatDateTime, plural } from "../../lib/missoes"

export default function CommentsCard({ comments }: { comments: Comment[] }) {
  const perguntas = useMemo(() => Array.from(new Set(comments.map((c) => c.pergunta))), [comments])
  const [filtro, setFiltro] = useState("")
  const lista = filtro ? comments.filter((c) => c.pergunta === filtro) : comments

  return (
    <section className="glass card" aria-label="Comentários da pesquisa">
      <div className="card-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Voz do público</div>
          <h3>Comentários da pesquisa</h3>
          <div className="card-sub">{plural(comments.length, "comentário aberto", "comentários abertos")}</div>
        </div>
      </div>

      {perguntas.length > 1 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }} role="group" aria-label="Filtrar por pergunta">
          {["", ...perguntas].map((p) => (
            <button
              key={p || "todas"}
              type="button"
              className={filtro === p ? "pill pill-b" : "pill pill-g"}
              style={{ border: 0, cursor: "pointer" }}
              aria-pressed={filtro === p}
              onClick={() => setFiltro(p)}
            >
              {p || "Todas"}
            </button>
          ))}
        </div>
      )}

      {lista.length === 0 ? (
        <div className="empty">Nenhum comentário no recorte selecionado.</div>
      ) : (
        <ul className="scroll" style={{ listStyle: "none", margin: 0, padding: "0 4px 0 0", maxHeight: 460, display: "flex", flexDirection: "column", gap: 10 }}>
          {lista.map((c) => (
            <li
              key={c.id}
              style={{ background: "rgba(255,255,255,0.7)", borderRadius: 16, padding: "12px 14px", borderLeft: "4px solid var(--azul)" }}
            >
              <div style={{ fontSize: 14, lineHeight: 1.5, color: "var(--text-primary)" }}>{c.comentario}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
                <span className="pill pill-lilas" style={{ height: 20, fontSize: 11 }}>{c.pergunta}</span>
                {c.perfil && <span className="pill pill-g" style={{ height: 20, fontSize: 11 }}>{c.perfil}</span>}
                {c.cliente != null && (
                  <span className="pill pill-g" style={{ height: 20, fontSize: 11 }}>{c.cliente ? "Cliente BB" : "Não cliente"}</span>
                )}
                <span style={{ marginLeft: "auto" }}>{formatDateTime(c.em)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
