// Tema compartilhado dos gráficos Nivo + paleta de dados.
// Paleta validada (dataviz/validate_palette.js) sobre a superfície #fffdf3:
// faixa de luminosidade, croma, separação para daltonismo (ΔE ≥ 8) e contraste ≥ 3:1.

export const SERIES = {
  azul: "#465eff",
  rosa: "#e8507a",
  ciano: "#0b9cbd",
}

/** Rampa ordinal de um único matiz (claro → escuro) para etapas e faixas */
export const ORDINAL = ["#a3aeff", "#7d8cff", "#5a6cf5", "#3f4bd6", "#2b2fa8"]

/** Escolhe n passos da rampa ordinal mantendo a ordem claro → escuro */
export function ordinalSteps(n: number): string[] {
  if (n <= 0) return []
  if (n === 1) return [ORDINAL[2]]
  if (n >= ORDINAL.length) return Array.from({ length: n }, (_, i) => ORDINAL[Math.min(ORDINAL.length - 1, Math.round((i * (ORDINAL.length - 1)) / (n - 1)))])
  return Array.from({ length: n }, (_, i) => ORDINAL[Math.round((i * (ORDINAL.length - 1)) / (n - 1))])
}

/** Status reservados — sempre acompanhados de ícone + rótulo */
export const STATUS = {
  validado: { cor: "#0ca30c", rotulo: "Validadas", icone: "check" as const },
  pendente: { cor: "#fab219", rotulo: "Pendentes", icone: "ampulheta" as const },
  recusado: { cor: "#d03b3b", rotulo: "Recusadas", icone: "x" as const },
}

export const nivoTheme = {
  background: "transparent",
  text: {
    fontFamily: "var(--font-banco-textos), system-ui, sans-serif",
    fontSize: 12,
    fill: "#5f5f99",
  },
  axis: {
    domain: { line: { stroke: "transparent", strokeWidth: 0 } },
    ticks: {
      line: { stroke: "transparent", strokeWidth: 0 },
      text: { fill: "#5f5f99", fontSize: 12, fontWeight: 600 },
    },
    legend: { text: { fill: "#3333bd", fontSize: 12, fontWeight: 700 } },
  },
  grid: { line: { stroke: "#e7e5f2", strokeWidth: 1 } },
  crosshair: { line: { stroke: "#3333bd", strokeWidth: 1, strokeOpacity: 0.5, strokeDasharray: "0" } },
  tooltip: { container: { background: "transparent", boxShadow: "none", padding: 0 } },
}
