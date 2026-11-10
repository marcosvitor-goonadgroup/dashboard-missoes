"use client"

import { useEffect, useRef } from "react"
import type { DashboardFilters, FilterOptions, TipoCliente } from "../../types/dashboard.types"
import { EMPTY_FILTERS, hasAnyFilter } from "../../utils/dashboard.utils"
import Icon from "./Icon"

interface FilterOffcanvasProps {
  isOpen: boolean
  onClose: () => void
  filters: DashboardFilters
  options: FilterOptions
  onChange: (f: DashboardFilters) => void
}

export default function FilterOffcanvas({ isOpen, onClose, filters, options, onChange }: FilterOffcanvasProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [isOpen, onClose])

  const set = (patch: Partial<DashboardFilters>) => onChange({ ...filters, ...patch })

  return (
    <>
      {isOpen && <div className="drawer-overlay" onClick={onClose} aria-hidden />}
      <aside
        className={`drawer ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Filtros do painel"
        aria-hidden={!isOpen}
        inert={!isOpen ? true : undefined}
      >
        <div className="drawer-head">
          <div>
            <div className="eyebrow">Filtros globais</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>Recortar o painel</h3>
          </div>
          <button ref={closeRef} type="button" className="icon-btn" onClick={onClose} aria-label="Fechar filtros">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="drawer-body">
          <div className="eyebrow" style={{ color: "var(--text-muted)" }}>Atividade</div>

          <div className="field">
            <label htmlFor="f-missao">Missão</label>
            <select
              id="f-missao"
              value={filters.missaoId ?? ""}
              onChange={(e) => set({ missaoId: e.target.value ? Number(e.target.value) : undefined })}
            >
              <option value="">Todas as missões</option>
              {options.missoes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </select>
            <p>Check-ins, pontos e berloques só dessa missão.</p>
          </div>

          <div className="field">
            <label htmlFor="f-dia">Dia</label>
            <select id="f-dia" value={filters.dia} onChange={(e) => set({ dia: e.target.value })}>
              <option value="">Todos os dias</option>
              {options.dias.map((d) => (
                <option key={d.valor} value={d.valor}>
                  {d.rotulo}
                </option>
              ))}
            </select>
            <p>Usa o horário de Recife.</p>
          </div>

          <div className="eyebrow" style={{ color: "var(--text-muted)", marginTop: 4 }}>Público</div>

          <div className="field">
            <label htmlFor="f-cliente">Relação com o BB</label>
            <select id="f-cliente" value={filters.tipoCliente} onChange={(e) => set({ tipoCliente: e.target.value as TipoCliente })}>
              <option value="">Clientes e não clientes</option>
              <option value="cliente">Somente clientes BB</option>
              <option value="nao-cliente">Somente não clientes</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="f-faixa">Faixa etária</label>
            <select id="f-faixa" value={filters.faixaEtaria} onChange={(e) => set({ faixaEtaria: e.target.value })}>
              <option value="">Todas as idades</option>
              {options.faixas.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="f-perfil">Perfil do quiz</label>
            <select id="f-perfil" value={filters.perfilQuiz} onChange={(e) => set({ perfilQuiz: e.target.value })}>
              <option value="">Todos os perfis</option>
              {options.perfis.map((p) => (
                <option key={p.chave} value={p.chave}>
                  {p.rotulo}
                </option>
              ))}
            </select>
          </div>

          <div className="note">
            <Icon name="info" size={18} />
            <span>
              Os filtros de público valem para todo o painel. Com Missão ou Dia ativos, os gráficos de público mostram só quem fez check-in no
              recorte.
            </span>
          </div>
        </div>

        <div className="drawer-foot">
          <button type="button" className="btn-glass" onClick={() => onChange(EMPTY_FILTERS)} disabled={!hasAnyFilter(filters)}>
            Limpar
          </button>
          <button type="button" className="btn" style={{ flex: 1 }} onClick={onClose}>
            Ver resultados
          </button>
        </div>
      </aside>
    </>
  )
}
