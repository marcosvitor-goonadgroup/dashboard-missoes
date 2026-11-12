// Constantes e helpers compartilhados entre servidor (sanitização) e cliente (cálculos).

export const EVENTO = {
  nome: "Missão BB",
  hashtag: "#MissãoBB",
  festival: "Rec’n’Play 2026",
  periodo: "11 a 14/11",
  local: "Recife",
  timeZone: "America/Recife",
}

/** Intervalo de atualização automática do painel (ms) */
export const REFRESH_INTERVAL_MS = 60_000

/** Meta de pontos acompanhada no card "Alcançaram 10 mil pontos" */
export const META_PONTOS = 10_000

// ------------------------------------------------------------
// Datas no fuso do evento
// ------------------------------------------------------------

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: EVENTO.timeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
})

const cache = new Map<string, { dia: string; hora: number }>()

function parts(iso: string): { dia: string; hora: number } {
  const hit = cache.get(iso)
  if (hit) return hit
  const p = partsFormatter.formatToParts(new Date(iso))
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? "00"
  const result = { dia: `${get("year")}-${get("month")}-${get("day")}`, hora: Number(get("hour")) }
  if (cache.size > 50_000) cache.clear()
  cache.set(iso, result)
  return result
}

/** "2026-11-11" no fuso do evento */
export const dayKey = (iso: string) => parts(iso).dia

/** 0–23 no fuso do evento */
export const hourOf = (iso: string) => parts(iso).hora

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"]

/** "2026-11-11" → "11/11 qua" */
export function dayLabel(dia: string): string {
  const [y, m, d] = dia.split("-").map(Number)
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay()]
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")} ${weekday}`
}

/** Lista todos os dias entre dois YYYY-MM-DD (inclusive) */
export function daysBetween(inicio: string, fim: string): string[] {
  const out: string[] = []
  const [y1, m1, d1] = inicio.split("-").map(Number)
  const [y2, m2, d2] = fim.split("-").map(Number)
  const cur = new Date(Date.UTC(y1, m1 - 1, d1, 12))
  const end = new Date(Date.UTC(y2, m2 - 1, d2, 12))
  while (cur <= end && out.length < 366) {
    out.push(cur.toISOString().slice(0, 10))
    cur.setUTCDate(cur.getUTCDate() + 1)
  }
  return out
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: EVENTO.timeZone,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: EVENTO.timeZone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

// ------------------------------------------------------------
// Faixas etárias (mesmos cortes usados nos relatórios BB anteriores)
// ------------------------------------------------------------

export const FAIXAS_ETARIAS = ["Menos de 18", "18 a 24", "25 a 40", "41 a 59", "60 ou mais"] as const

export function faixaEtaria(idade: number): string {
  if (idade < 18) return FAIXAS_ETARIAS[0]
  if (idade <= 24) return FAIXAS_ETARIAS[1]
  if (idade <= 40) return FAIXAS_ETARIAS[2]
  if (idade <= 59) return FAIXAS_ETARIAS[3]
  return FAIXAS_ETARIAS[4]
}

export function idadeEm(nascimento: string, referencia = new Date()): number | null {
  const nasc = new Date(nascimento)
  if (Number.isNaN(nasc.getTime())) return null
  let idade = referencia.getUTCFullYear() - nasc.getUTCFullYear()
  const m = referencia.getUTCMonth() - nasc.getUTCMonth()
  if (m < 0 || (m === 0 && referencia.getUTCDate() < nasc.getUTCDate())) idade--
  // Descarta datas de placeholder (ex.: contas criadas com a data de hoje) e valores absurdos
  if (idade < 5 || idade > 110) return null
  return idade
}

// ------------------------------------------------------------
// Rótulos
// ------------------------------------------------------------

/** Perfis do quiz de entrada (mesmos do app Missão BB) */
export const PERFIS_QUIZ: Record<string, { nome: string; frase: string }> = {
  planejador: { nome: "Planejador", frase: "Penso no futuro antes de estar pronto pra ele." },
  construtor: { nome: "Construtor", frase: "Saí de casa antes de ter tudo resolvido." },
  explorador: { nome: "Explorador", frase: "Prefiro guardar lembranças do que coisas." },
  equilibrista: { nome: "Equilibrista", frase: "Entre trabalho, estudo e casa, acho meu equilíbrio." },
}

export const perfilLabel = (chave: string) => PERFIS_QUIZ[chave]?.nome ?? capitalize(chave)

export const MODOS_VALIDACAO: Record<string, string> = {
  cadastro: "Cadastro + quiz",
  video: "Vídeo no app",
  qr_promotor: "QR do promotor",
  foto_ia: "Foto (IA)",
  comprovante_ia: "Comprovante (IA)",
  pesquisa: "Pesquisa",
}

export const modoLabel = (modo: string) => MODOS_VALIDACAO[modo] ?? capitalize(modo.replace(/_/g, " "))

export const METODOS_CHECKIN: Record<string, string> = {
  qr: "QR do promotor",
  ia: "Análise por IA",
  automatico: "Automática",
}

export const metodoLabel = (m: string) => METODOS_CHECKIN[m] ?? capitalize(m)

export const CATEGORIAS_MISSAO: Record<string, string> = {
  missao: "Missão",
  booster: "Booster",
}

export const categoriaLabel = (c: string) => CATEGORIAS_MISSAO[c] ?? capitalize(c)

export function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

// ------------------------------------------------------------
// Números
// ------------------------------------------------------------

const intFmt = new Intl.NumberFormat("pt-BR")
const compactFmt = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 })

export const formatInt = (n: number) => intFmt.format(Math.round(n))

/** 1.284 / 12,9 mil / 4,2 mi */
export const formatCompact = (n: number) => (Math.abs(n) < 10_000 ? intFmt.format(Math.round(n)) : compactFmt.format(n))

export const formatPct = (n: number, digits = 0) =>
  `${n.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`

/** plural(1, "resposta") → "1 resposta"; plural(3, "resposta") → "3 respostas" */
export const plural = (n: number, singular: string, pluralForm = `${singular}s`) =>
  `${formatInt(n)} ${Math.round(n) === 1 ? singular : pluralForm}`

export const formatDecimal = (n: number, digits = 1) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits })

/** Normaliza texto para comparação (minúsculas, sem acentos, aspas retas) */
export function norm(s: string | null | undefined): string {
  return (s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’‘´`]/g, "'")
    .toLowerCase()
    .trim()
}
