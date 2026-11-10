import { EVENTO, formatTime } from "../../lib/missoes"
import Icon from "./Icon"

interface HeaderProps {
  atualizadoEm: string | null
  atualizando: boolean
  desatualizado: boolean
  filtrosAtivos: number
  onRefresh: () => void
  onOpenFilters: () => void
}

const ICONES = [
  { src: "/missoes/video.webp", alt: "", style: { left: 0, top: 10, transform: "rotate(-10deg)" } },
  { src: "/missoes/cofrinho.webp", alt: "", style: { left: 46, top: 0, transform: "rotate(6deg)", width: 48, height: 48 } },
  { src: "/missoes/arena.webp", alt: "", style: { left: 92, top: 12, transform: "rotate(-4deg)" } },
  { src: "/missoes/game-cartao.webp", alt: "", style: { left: 138, top: 2, transform: "rotate(9deg)", width: 50, height: 50 } },
]

export default function Header({ atualizadoEm, atualizando, desatualizado, filtrosAtivos, onRefresh, onOpenFilters }: HeaderProps) {
  return (
    <header className="glass header">
      <span className="logo-tile" aria-hidden>
        <span className="logo-bb" />
      </span>

      <div className="header-title">
        <div className="eyebrow">
          {EVENTO.festival} · {EVENTO.periodo} · {EVENTO.local}
        </div>
        <h1>
          <span className="hashtag">{EVENTO.hashtag}</span>
          <span>Painel de resultados</span>
        </h1>
      </div>

      <div className="header-icons" aria-hidden>
        {ICONES.map((i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i.src} src={i.src} alt={i.alt} style={i.style} />
        ))}
      </div>

      <div className="header-actions">
        <span className="live" aria-live="polite">
          <span className={`live-dot ${desatualizado ? "stale" : ""}`} />
          {desatualizado ? "Sem conexão · " : "Ao vivo · "}
          {atualizadoEm ? `atualizado às ${formatTime(atualizadoEm)}` : "carregando"}
        </span>
        <button type="button" className="btn-glass" onClick={onRefresh} disabled={atualizando} aria-label="Atualizar dados">
          <Icon name="atualizar" size={18} className={atualizando ? "spin" : undefined} />
          Atualizar
        </button>
        <button type="button" className="btn" onClick={onOpenFilters}>
          <Icon name="filtro" size={18} />
          Filtros
          {filtrosAtivos > 0 && <span className="badge">{filtrosAtivos}</span>}
        </button>
      </div>
    </header>
  )
}
