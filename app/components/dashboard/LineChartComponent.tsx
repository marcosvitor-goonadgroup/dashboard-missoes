"use client"

import { ResponsiveLine } from "@nivo/line"
import { nivoTheme } from "./chartTheme"

export interface LineSeries {
  id: string
  color: string
  data: { x: string; y: number }[]
}

interface LineChartComponentProps {
  series: LineSeries[]
  /** Rótulo do eixo Y */
  yLabel?: string
  /** Rotaciona os rótulos do eixo X quando há muitos pontos */
  denseX?: boolean
}

/**
 * Gráfico de linhas com crosshair + tooltip por coluna (todas as séries).
 * Legenda HTML acima do gráfico quando há 2+ séries.
 */
export default function LineChartComponent({ series, yLabel = "Quantidade", denseX = false }: LineChartComponentProps) {
  const pontos = series[0]?.data.length ?? 0
  if (pontos === 0) return <div className="empty">Sem dados para o recorte selecionado.</div>

  const maxY = Math.max(1, ...series.flatMap((s) => s.data.map((d) => d.y)))
  const tickStep = pontos > 14 ? Math.ceil(pontos / 12) : 1

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {series.length > 1 && (
        <div className="legend" role="list">
          {series.map((s) => (
            <span className="legend-item" role="listitem" key={s.id}>
              <span className="legend-line" style={{ background: s.color }} />
              {s.id}
            </span>
          ))}
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveLine
          data={series}
          theme={nivoTheme}
          colors={series.map((s) => s.color)}
          margin={{ top: 12, right: 16, bottom: denseX ? 52 : 36, left: 48 }}
          xScale={{ type: "point" }}
          yScale={{ type: "linear", min: 0, max: maxY < 5 ? 5 : "auto", stacked: false }}
          curve="monotoneX"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 0,
            tickPadding: 10,
            tickRotation: denseX ? -40 : 0,
            tickValues: series[0].data.filter((_, i) => i % tickStep === 0).map((d) => d.x),
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 8,
            tickValues: 5,
            format: (v: number) => (Number.isInteger(v) ? v.toLocaleString("pt-BR") : ""),
            legend: yLabel,
            legendOffset: -40,
            legendPosition: "middle",
          }}
          enableGridX={false}
          gridYValues={5}
          lineWidth={2}
          pointSize={pontos > 24 ? 0 : 8}
          pointColor={{ from: "serieColor" }}
          pointBorderWidth={2}
          pointBorderColor="#fffdf3"
          enableArea={series.length === 1}
          areaOpacity={0.1}
          enableSlices="x"
          sliceTooltip={({ slice }) => (
            <div className="tooltip">
              <div className="tooltip-title">{String(slice.points[0]?.data.xFormatted ?? "")}</div>
              {slice.points.map((p) => (
                <div className="tooltip-row" key={p.id}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span className="legend-line" style={{ background: p.serieColor }} />
                    {p.serieId}
                  </span>
                  <strong>{Number(p.data.y).toLocaleString("pt-BR")}</strong>
                </div>
              ))}
            </div>
          )}
          legends={[]}
          role="img"
        />
      </div>
    </div>
  )
}
