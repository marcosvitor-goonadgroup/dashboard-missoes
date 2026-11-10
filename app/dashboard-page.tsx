"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { DashboardFilters, MissoesDataset } from "./types/dashboard.types"
import { EMPTY_FILTERS, computeDashboard, getFilterOptions } from "./utils/dashboard.utils"
import { REFRESH_INTERVAL_MS, dayLabel, formatCompact, formatDecimal, formatInt, formatPct, perfilLabel, plural } from "./lib/missoes"
import { SERIES, ordinalSteps } from "./components/dashboard/chartTheme"
import Header from "./components/dashboard/Header"
import MetricCard from "./components/dashboard/MetricCard"
import ChartCard from "./components/dashboard/ChartCard"
import LineChartComponent from "./components/dashboard/LineChartComponent"
import RankedBars from "./components/dashboard/RankedBars"
import FunnelCard from "./components/dashboard/FunnelCard"
import MissionsTable from "./components/dashboard/MissionsTable"
import ValidationCard from "./components/dashboard/ValidationCard"
import BaseCard from "./components/dashboard/BaseCard"
import PrizesCard from "./components/dashboard/PrizesCard"
import SatisfactionBlockCard from "./components/dashboard/SatisfactionBlockCard"
import CommentsCard from "./components/dashboard/CommentsCard"
import FilterOffcanvas from "./components/dashboard/FilterOffcanvas"
import Icon from "./components/dashboard/Icon"

const DATA_URL = "/api/dashboard"

export default function Dashboard() {
  const [dataset, setDataset] = useState<MissoesDataset | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [atualizando, setAtualizando] = useState(false)
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const carregando = useRef(false)

  const carregar = useCallback(async () => {
    if (carregando.current) return
    carregando.current = true
    setAtualizando(true)
    try {
      const res = await fetch(DATA_URL, { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: MissoesDataset = await res.json()
      setDataset(data)
      setErro(null)
    } catch (err) {
      console.error("Dashboard:", err)
      setErro("Não foi possível atualizar os dados agora.")
    } finally {
      carregando.current = false
      setAtualizando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") carregar()
    }, REFRESH_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [carregar])

  const options = useMemo(() => (dataset ? getFilterOptions(dataset) : null), [dataset])
  const view = useMemo(() => (dataset ? computeDashboard(dataset, filters) : null), [dataset, filters])

  const closeFilters = useCallback(() => setIsFilterOpen(false), [])

  if (!dataset || !view || !options) {
    return (
      <>
        <Background />
        <div className="loading">
          {erro ? (
            <div className="glass card" style={{ maxWidth: 420 }}>
              <h3 style={{ marginBottom: 8 }}>Não foi possível carregar o painel</h3>
              <p style={{ fontWeight: 500, marginBottom: 16 }}>Verifique a conexão com a API e tente de novo.</p>
              <button className="btn" onClick={carregar}>
                Tentar novamente
              </button>
            </div>
          ) : (
            <div>
              <div className="spinner" />
              Carregando a Missão BB…
            </div>
          )}
        </div>
      </>
    )
  }

  const { kpis, pesquisa } = view
  const nomeMissao = (id?: number) => options.missoes.find((m) => m.id === id)?.nome
  const chips = [
    filters.missaoId && { k: "missao", label: `Missão: ${nomeMissao(filters.missaoId) ?? filters.missaoId}`, clear: { missaoId: undefined } },
    filters.dia && { k: "dia", label: `Dia: ${dayLabel(filters.dia)}`, clear: { dia: "" } },
    filters.tipoCliente && { k: "cliente", label: filters.tipoCliente === "cliente" ? "Clientes BB" : "Não clientes", clear: { tipoCliente: "" } },
    filters.faixaEtaria && { k: "faixa", label: `Idade: ${filters.faixaEtaria}`, clear: { faixaEtaria: "" } },
    filters.perfilQuiz && { k: "perfil", label: `Perfil: ${perfilLabel(filters.perfilQuiz)}`, clear: { perfilQuiz: "" } },
  ].filter(Boolean) as { k: string; label: string; clear: Partial<DashboardFilters> }[]

  const pctAtivos = kpis.participantes ? (kpis.participantesComMissao / kpis.participantes) * 100 : 0

  return (
    <>
      <Background />
      <main className={`page ${atualizando ? "is-refreshing" : ""}`}>
        <Header
          atualizadoEm={dataset.geradoEm}
          atualizando={atualizando}
          desatualizado={!!erro}
          filtrosAtivos={chips.length}
          onRefresh={carregar}
          onOpenFilters={() => setIsFilterOpen(true)}
        />

        {chips.length > 0 && (
          <div className="filter-bar" aria-label="Filtros ativos">
            <span style={{ fontWeight: 700 }}>Filtrando por:</span>
            {chips.map((c) => (
              <button key={c.k} type="button" className="chip" onClick={() => setFilters({ ...filters, ...c.clear })} aria-label={`Remover filtro ${c.label}`}>
                {c.label}
                <span aria-hidden>×</span>
              </button>
            ))}
            <button type="button" className="link-btn" onClick={() => setFilters(EMPTY_FILTERS)}>
              Limpar tudo
            </button>
          </div>
        )}

        {/* ---------------- KPIs ---------------- */}
        <div className="kpi-grid">
          <MetricCard
            tone="destaque"
            icon="usuarios"
            label={view.recorteDeAtividade ? "Participantes no recorte" : "Participantes"}
            value={formatCompact(kpis.participantes)}
            sub={
              <>
                <strong>{formatPct(pctAtivos)}</strong> já concluíram missões além da entrada
              </>
            }
          />
          <MetricCard
            icon="alvo"
            label="Missões concluídas"
            value={formatCompact(kpis.missoesConcluidas)}
            sub={
              <>
                <strong>{formatInt(kpis.missoesPendentes)}</strong> pendentes · <strong>{formatInt(kpis.missoesRecusadas)}</strong> recusadas
              </>
            }
          />
          <MetricCard
            icon="estrela"
            label="Pontos distribuídos"
            value={formatCompact(kpis.pontosDistribuidos)}
            sub={
              <>
                <strong>{formatCompact(kpis.pontosResgatados)}</strong> trocados por prêmios
              </>
            }
          />
          <MetricCard
            icon="premio"
            label="Prêmios resgatados"
            value={formatCompact(kpis.resgates)}
            sub={
              <>
                <strong>{formatInt(kpis.resgatesEntregues)}</strong> entregues no balcão
              </>
            }
          />
          <MetricCard icon="berloque" label="Berloques entregues" value={formatCompact(kpis.berloques)} sub="Colecionáveis das missões" />
          <MetricCard icon="ticket" label="Números da sorte" value={formatCompact(kpis.numerosDaSorte)} sub="Gerados para o sorteio" />
          <MetricCard
            icon="check"
            label="Nota da experiência"
            value={pesquisa.notaGeral != null ? formatDecimal(pesquisa.notaGeral, 2) : "–"}
            unit={pesquisa.notaGeral != null ? "/5" : undefined}
            sub={
              pesquisa.respostas > 0 ? (
                <>
                  Grau <strong>{formatPct(pesquisa.grauGeral ?? 0, 1)}</strong> · {plural(pesquisa.respostas, "resposta")}
                </>
              ) : (
                "Sem respostas na pesquisa ainda"
              )
            }
          />
        </div>

        {view.recorteDeAtividade && (
          <div className="note" style={{ marginTop: 14 }}>
            <Icon name="info" size={18} />
            <span>
              Com filtro de Missão ou Dia, os números de público consideram apenas participantes que fizeram check-in nesse recorte. Prêmios e números
              da sorte não pertencem a uma missão e seguem só o filtro de dia.
            </span>
          </div>
        )}

        {/* ---------------- Jornada ---------------- */}
        <div className="section">
          <div className="section-head">
            <div>
              <div className="eyebrow">Engajamento</div>
              <h2>Jornada dos participantes</h2>
            </div>
          </div>
          <div className="grid grid-5-7">
            <FunnelCard stages={view.funil} recorte={view.recorteDeAtividade} />
            <ChartCard
              eyebrow="Por dia"
              title={filters.missaoId ? "Conclusões por dia" : "Cadastros e missões concluídas por dia"}
              subtitle={filters.dia ? "O filtro de dia não se aplica a este gráfico" : undefined}
              height={340}
              table={{
                columns: filters.missaoId ? ["Dia", "Missões concluídas"] : ["Dia", "Cadastros", "Missões concluídas"],
                numeric: filters.missaoId ? [1] : [1, 2],
                rows: view.diario.map((d) => (filters.missaoId ? [d.rotulo, d.concluidas] : [d.rotulo, d.cadastros, d.concluidas])),
              }}
            >
              <LineChartComponent
                denseX={view.diario.length > 8}
                series={[
                  ...(filters.missaoId
                    ? []
                    : [{ id: "Cadastros", color: SERIES.azul, data: view.diario.map((d) => ({ x: d.rotulo, y: d.cadastros })) }]),
                  { id: "Missões concluídas", color: SERIES.rosa, data: view.diario.map((d) => ({ x: d.rotulo, y: d.concluidas })) },
                ]}
              />
            </ChartCard>
          </div>
        </div>

        {/* ---------------- Missões ---------------- */}
        <div className="section">
          <div className="section-head">
            <div>
              <div className="eyebrow">Missões</div>
              <h2>O que o público está fazendo</h2>
            </div>
          </div>
          <MissionsTable missoes={view.missoes} selecionada={filters.missaoId} />

          <div className="grid grid-7-5" style={{ marginTop: 16 }}>
            <ChartCard
              eyebrow="Fluxo"
              title="Check-ins por horário"
              subtitle={filters.dia ? `Dia ${dayLabel(filters.dia)} · horário de Recife` : "Soma de todos os dias · horário de Recife"}
              height={420}
              table={{ columns: ["Hora", "Check-ins"], numeric: [1], rows: view.porHora.map((h) => [h.hora, h.total]) }}
            >
              <LineChartComponent series={[{ id: "Check-ins", color: SERIES.azul, data: view.porHora.map((h) => ({ x: h.hora, y: h.total })) }]} />
            </ChartCard>
            <ValidationCard validacao={view.validacao} />
          </div>
        </div>

        {/* ---------------- Público ---------------- */}
        <div className="section">
          <div className="section-head">
            <div>
              <div className="eyebrow">Público</div>
              <h2>Quem está jogando</h2>
            </div>
          </div>
          <div className="grid grid-3">
            <ChartCard
              eyebrow="Quiz de entrada"
              title="Perfil financeiro"
              subtitle="Resultado do quiz feito no cadastro"
              table={{ columns: ["Perfil", "Participantes"], numeric: [1], rows: view.perfis.map((p) => [p.rotulo, p.total]) }}
            >
              <RankedBars showShare items={view.perfis.map((p) => ({ key: p.chave || "na", label: p.rotulo, value: p.total }))} />
            </ChartCard>
            <ChartCard
              eyebrow="Idade"
              title="Faixa etária"
              subtitle="Calculada pela data de nascimento do cadastro"
              table={{ columns: ["Faixa", "Participantes"], numeric: [1], rows: view.faixas.map((p) => [p.rotulo, p.total]) }}
            >
              <RankedBars
                showShare
                items={(() => {
                  const informadas = view.faixas.filter((f) => f.chave)
                  const cores = ordinalSteps(informadas.length)
                  return view.faixas.map((f) => ({
                    key: f.chave || "na",
                    label: f.rotulo,
                    value: f.total,
                    color: f.chave ? cores[informadas.indexOf(f)] : "#cfcde6",
                  }))
                })()}
              />
            </ChartCard>
            <BaseCard base={view.base} recorte={view.recorteDeAtividade} />
          </div>
        </div>

        {/* ---------------- Prêmios ---------------- */}
        <div className="section">
          <div className="section-head">
            <div>
              <div className="eyebrow">Recompensas</div>
              <h2>Prêmios</h2>
            </div>
          </div>
          <PrizesCard premios={view.premios} pontosResgatados={kpis.pontosResgatados} />
        </div>

        {/* ---------------- Pesquisa ---------------- */}
        <div className="section">
          <div className="section-head">
            <div>
              <div className="eyebrow">Pesquisa de experiência</div>
              <h2>Como o público avaliou o BB</h2>
              <p>
                {plural(pesquisa.respostas, "resposta")} · escala de 5 pontos (Muito satisfeito / Concordo totalmente = 5). Grau = (nota − 1) ÷ 4.
              </p>
            </div>
          </div>
          {pesquisa.blocos.length === 0 ? (
            <div className="glass card empty">Nenhuma resposta de pesquisa no recorte selecionado.</div>
          ) : (
            <div className="grid grid-3">
              {pesquisa.blocos.map((b, i) => (
                <SatisfactionBlockCard key={b.title} block={b} destaque={i === 0} />
              ))}
            </div>
          )}
          <div className="grid grid-5-7" style={{ marginTop: 16 }}>
            <ChartCard
              eyebrow="Perfil de quem respondeu"
              title="Categoria de público"
              table={{ columns: ["Categoria", "Respostas"], numeric: [1], rows: pesquisa.categorias.map((c) => [c.rotulo, c.total]) }}
            >
              <RankedBars showShare color={SERIES.ciano} items={pesquisa.categorias.map((c) => ({ key: c.chave, label: c.rotulo, value: c.total }))} />
            </ChartCard>
            <CommentsCard comments={pesquisa.comentarios} />
          </div>
        </div>

        <footer className="footer">
          Dados da API Missão BB, atualizados automaticamente a cada {REFRESH_INTERVAL_MS / 1000}s.
          {dataset.contasEquipeIgnoradas > 0 && ` ${formatInt(dataset.contasEquipeIgnoradas)} contas de equipe (promotores, supervisores, resgate) não entram nas métricas.`}
        </footer>
      </main>

      <FilterOffcanvas isOpen={isFilterOpen} onClose={closeFilters} filters={filters} options={options} onChange={setFilters} />
    </>
  )
}

function Background() {
  return (
    <div className="app-bg" aria-hidden>
      <span className="blob b1" />
      <span className="blob b2" />
      <span className="blob b3" />
      <span className="blob b4" />
      <span className="dots" />
    </div>
  )
}
