// Cálculo de todas as visões do dashboard a partir do dataset sanitizado.
//
// Regras dos filtros globais:
//  - Faixa etária, Tipo de cliente e Perfil do quiz definem o PÚBLICO.
//  - Missão e Dia recortam a ATIVIDADE (check-ins, pontos, resgates, berloques).
//  - Quando Missão ou Dia estão ativos, os gráficos de público passam a mostrar
//    só quem teve check-in no recorte ("participantes com atividade").

import type {
  BaseResumo,
  Checkin,
  Comment,
  CountItem,
  DailyPoint,
  DashboardFilters,
  DashboardView,
  FilterOptions,
  FunnelStage,
  HourPoint,
  MissaoResumo,
  MissoesDataset,
  Participante,
  PesquisaResumo,
  PremioResumo,
  SatisfactionBlock,
  SurveyQuestion,
  ValidacaoResumo,
} from "../types/dashboard.types"
import {
  FAIXAS_ETARIAS,
  META_PONTOS,
  PERFIS_QUIZ,
  dayKey,
  dayLabel,
  daysBetween,
  hourOf,
  metodoLabel,
  norm,
  perfilLabel,
} from "../lib/missoes"

export const EMPTY_FILTERS: DashboardFilters = {
  missaoId: undefined,
  dia: "",
  faixaEtaria: "",
  tipoCliente: "",
  perfilQuiz: "",
}

export const hasAnyFilter = (f: DashboardFilters) =>
  !!(f.missaoId || f.dia || f.faixaEtaria || f.tipoCliente || f.perfilQuiz)

const round = (n: number, d = 2) => Number(n.toFixed(d))

// ============================================================
// Opções dos filtros
// ============================================================

export function getFilterOptions(ds: MissoesDataset): FilterOptions {
  const dias = new Set<string>()
  for (const c of ds.checkins) dias.add(dayKey(c.em))
  for (const p of ds.participantes) dias.add(dayKey(p.criadoEm))

  const faixas = new Set(ds.participantes.map((p) => p.faixaEtaria).filter(Boolean) as string[])
  const perfis = new Set(ds.participantes.map((p) => p.perfilQuiz).filter(Boolean) as string[])

  return {
    missoes: ds.missoes.filter((m) => !m.ehGrupo).map((m) => ({ id: m.id, nome: m.nome })),
    dias: Array.from(dias)
      .sort()
      .map((d) => ({ valor: d, rotulo: dayLabel(d) })),
    faixas: FAIXAS_ETARIAS.filter((f) => faixas.has(f)),
    perfis: [
      ...Object.keys(PERFIS_QUIZ).filter((k) => perfis.has(k)),
      ...Array.from(perfis).filter((k) => !PERFIS_QUIZ[k]),
    ].map((k) => ({ chave: k, rotulo: perfilLabel(k) })),
  }
}

// ============================================================
// Visão principal
// ============================================================

export function computeDashboard(ds: MissoesDataset, f: DashboardFilters): DashboardView {
  // ---- Público (filtros de perfil) ----
  const profileFilter = !!(f.faixaEtaria || f.tipoCliente || f.perfilQuiz)
  const userOk = (p: Participante) =>
    (!f.faixaEtaria || p.faixaEtaria === f.faixaEtaria) &&
    (!f.tipoCliente || (f.tipoCliente === "cliente" ? p.cliente === true : p.cliente === false)) &&
    (!f.perfilQuiz || p.perfilQuiz === f.perfilQuiz)

  const publico = ds.participantes.filter(userOk)
  const publicoIds = new Set(publico.map((p) => p.id))
  // Registros sem usuário vinculado só entram quando não há filtro de perfil
  const recordOk = (userId: number | null) => (profileFilter ? userId != null && publicoIds.has(userId) : true)

  // ---- Atividade (missão + dia) ----
  const dayOk = (iso: string) => !f.dia || dayKey(iso) === f.dia
  const missaoOk = (id: number | null) => !f.missaoId || id === f.missaoId
  const recorteDeAtividade = !!(f.missaoId || f.dia)

  const ckPublico = ds.checkins.filter((c) => recordOk(c.userId))
  const ckSemDia = ckPublico.filter((c) => missaoOk(c.missaoId))
  const ckSemMissao = ckPublico.filter((c) => dayOk(c.em))
  const ck = ckSemDia.filter((c) => dayOk(c.em))
  const validados = ck.filter((c) => c.status === "validado")

  // Público exibido nos gráficos de perfil: todos, ou só quem teve atividade no recorte
  const audiencia = recorteDeAtividade
    ? (() => {
        const ativos = new Set(ck.map((c) => c.userId).filter((id): id is number => id != null))
        return publico.filter((p) => ativos.has(p.id))
      })()
    : publico

  const transacoes = ds.transacoes.filter((t) => recordOk(t.userId) && dayOk(t.em) && missaoOk(t.missaoId))
  // Resgates não pertencem a uma missão: o filtro de missão não se aplica a eles
  const resgates = ds.resgates.filter((r) => recordOk(r.userId) && dayOk(r.em))
  const berloques = ds.berloques.filter((b) => recordOk(b.userId) && dayOk(b.em) && missaoOk(b.missaoId))

  // Pontos acumulados por pessoa (todas as missões; com filtro de dia, até o fim daquele dia).
  // "Ganhos" ignoram os resgates: quem chegou à meta e já trocou por prêmio continua contando.
  const ganhos = new Map<number, number>()
  const saldos = new Map<number, number>()
  for (const t of ds.transacoes) {
    if (t.userId == null || (f.dia && dayKey(t.em) > f.dia)) continue
    saldos.set(t.userId, (saldos.get(t.userId) ?? 0) + t.delta)
    if (norm(t.origem) !== "resgate") ganhos.set(t.userId, (ganhos.get(t.userId) ?? 0) + t.delta)
  }

  const usuariosComMissao = new Set(
    validados.filter((c) => c.userId != null && !isEntrada(ds, c.missaoId)).map((c) => c.userId),
  )

  const kpis = {
    participantes: audiencia.length,
    participantesComMissao: audiencia.filter((p) => usuariosComMissao.has(p.id)).length,
    missoesConcluidas: validados.length,
    missoesPendentes: ck.filter((c) => c.status === "pendente").length,
    missoesRecusadas: ck.filter((c) => c.status === "recusado").length,
    pontosDistribuidos: transacoes.filter((t) => t.delta > 0).reduce((s, t) => s + t.delta, 0),
    pontosResgatados: transacoes.filter((t) => t.delta < 0).reduce((s, t) => s - t.delta, 0),
    resgates: resgates.length,
    resgatesEntregues: resgates.filter((r) => r.entregueEm || norm(r.status) === "entregue").length,
    berloques: berloques.length,
    alcancaramMeta: audiencia.filter((p) => (ganhos.get(p.id) ?? 0) >= META_PONTOS).length,
    saldoNaMeta: audiencia.filter((p) => (saldos.get(p.id) ?? 0) >= META_PONTOS).length,
  }

  return {
    kpis,
    funil: computeFunil(ds, audiencia, ckPublico.filter((c) => dayOk(c.em)), resgates),
    missoes: computeMissoes(ds, ckSemMissao, ds.berloques.filter((b) => recordOk(b.userId) && dayOk(b.em))),
    diario: computeDiario(ds, publico, ckSemDia, !!f.missaoId),
    porHora: computePorHora(ck),
    validacao: computeValidacao(ds, ck),
    perfis: countBy(
      audiencia,
      (p) => p.perfilQuiz,
      Object.keys(PERFIS_QUIZ),
      perfilLabel,
    ),
    faixas: countBy(audiencia, (p) => p.faixaEtaria, [...FAIXAS_ETARIAS], (k) => k, true),
    base: computeBase(audiencia),
    premios: computePremios(ds, resgates),
    pesquisa: computePesquisa(ds, recordOk, dayOk),
    recorteDeAtividade,
  }
}

// ============================================================
// Partes
// ============================================================

function isEntrada(ds: MissoesDataset, missaoId: number | null): boolean {
  const m = ds.missoes.find((x) => x.id === missaoId)
  return m?.modo === "cadastro"
}

function computeFunil(
  ds: MissoesDataset,
  audiencia: Participante[],
  checkins: Checkin[],
  resgates: { userId: number | null }[],
): FunnelStage[] {
  const entradaIds = new Set(ds.missoes.filter((m) => m.modo === "cadastro").map((m) => m.id))
  const porUsuario = new Map<number, number>()
  for (const c of checkins) {
    if (c.status !== "validado" || c.userId == null || (c.missaoId != null && entradaIds.has(c.missaoId))) continue
    porUsuario.set(c.userId, (porUsuario.get(c.userId) ?? 0) + 1)
  }
  const resgatou = new Set(resgates.map((r) => r.userId))
  const n = (pred: (p: Participante) => boolean) => audiencia.filter(pred).length

  return [
    { etapa: "Cadastro", descricao: "Criaram conta no app", total: audiencia.length },
    { etapa: "Quiz", descricao: "Descobriram o perfil", total: n((p) => !!p.perfilQuiz) },
    { etapa: "1ª missão", descricao: "Concluíram ao menos 1 missão além da entrada", total: n((p) => (porUsuario.get(p.id) ?? 0) >= 1) },
    { etapa: "3+ missões", descricao: "Concluíram 3 missões ou mais", total: n((p) => (porUsuario.get(p.id) ?? 0) >= 3) },
    { etapa: "Prêmio", descricao: "Resgataram um prêmio", total: n((p) => resgatou.has(p.id)) },
  ]
}

function computeMissoes(
  ds: MissoesDataset,
  checkins: Checkin[],
  berloques: { missaoId: number | null }[],
): MissaoResumo[] {
  const acc = new Map<number, MissaoResumo & { users: Set<number> }>()
  for (const m of ds.missoes) {
    if (m.ehGrupo) continue
    acc.set(m.id, {
      id: m.id,
      nome: m.nome,
      categoria: m.categoria,
      modo: m.modo,
      pontos: m.pontos,
      validados: 0,
      pendentes: 0,
      recusados: 0,
      participantesUnicos: 0,
      berloques: 0,
      users: new Set(),
    })
  }
  for (const c of checkins) {
    const r = c.missaoId != null ? acc.get(c.missaoId) : undefined
    if (!r) continue
    if (c.status === "validado") {
      r.validados++
      if (c.userId != null) r.users.add(c.userId)
    } else if (c.status === "pendente") r.pendentes++
    else r.recusados++
  }
  for (const b of berloques) {
    const r = b.missaoId != null ? acc.get(b.missaoId) : undefined
    if (r) r.berloques++
  }
  // Mantém a ordem oficial das missões (campo "ordem")
  return Array.from(acc.values()).map(({ users, ...r }) => ({ ...r, participantesUnicos: users.size }))
}

function computeDiario(
  ds: MissoesDataset,
  publico: Participante[],
  checkins: Checkin[],
  somenteMissao: boolean,
): DailyPoint[] {
  const cad = new Map<string, number>()
  const con = new Map<string, number>()
  // Com filtro de missão, "cadastros" perde o sentido: mostramos só as conclusões
  if (!somenteMissao) for (const p of publico) inc(cad, dayKey(p.criadoEm))
  for (const c of checkins) if (c.status === "validado") inc(con, dayKey(c.validadoEm ?? c.em))

  const todos = [...cad.keys(), ...con.keys()]
  if (ds.evento?.inicio) todos.push(dayKey(ds.evento.inicio))
  if (todos.length === 0) return []
  todos.sort()
  const dias = daysBetween(todos[0], todos[todos.length - 1])
  return dias.map((d) => ({ dia: d, rotulo: dayLabel(d), cadastros: cad.get(d) ?? 0, concluidas: con.get(d) ?? 0 }))
}

function computePorHora(checkins: Checkin[]): HourPoint[] {
  if (checkins.length === 0) return []
  const m = new Map<number, number>()
  for (const c of checkins) inc(m, hourOf(c.em))
  const horas = Array.from(m.keys())
  const min = Math.min(...horas)
  const max = Math.max(...horas)
  const out: HourPoint[] = []
  for (let h = min; h <= max; h++) out.push({ hora: `${String(h).padStart(2, "0")}h`, total: m.get(h) ?? 0 })
  return out
}

function computeValidacao(ds: MissoesDataset, checkins: Checkin[]): ValidacaoResumo {
  const ordem = ["qr", "ia", "automatico"]
  const m = new Map<string, { validados: number; pendentes: number; recusados: number }>()
  for (const c of checkins) {
    const r = m.get(c.metodo) ?? { validados: 0, pendentes: 0, recusados: 0 }
    if (c.status === "validado") r.validados++
    else if (c.status === "pendente") r.pendentes++
    else r.recusados++
    m.set(c.metodo, r)
  }
  const metodos = Array.from(m.entries())
    .sort((a, b) => (ordem.indexOf(a[0]) + 1 || 99) - (ordem.indexOf(b[0]) + 1 || 99))
    .map(([metodo, r]) => ({ metodo, rotulo: metodoLabel(metodo), ...r }))

  const ia = m.get("ia")
  const decididasIA = ia ? ia.validados + ia.recusados : 0
  const nomeMissao = new Map(ds.missoes.map((x) => [x.id, x.nome]))

  return {
    metodos,
    analisadasIA: ia ? ia.validados + ia.recusados + ia.pendentes : 0,
    taxaAprovacaoIA: decididasIA > 0 ? round((ia!.validados / decididasIA) * 100, 1) : null,
    recusasRecentes: checkins
      .filter((c) => c.status === "recusado" && c.motivo)
      .sort((a, b) => b.em.localeCompare(a.em))
      .slice(0, 5)
      .map((c) => ({ missao: nomeMissao.get(c.missaoId ?? -1) ?? "Missão", motivo: c.motivo!, em: c.em })),
  }
}

function computeBase(audiencia: Participante[]): BaseResumo {
  return {
    total: audiencia.length,
    clientes: audiencia.filter((p) => p.cliente === true).length,
    naoClientes: audiencia.filter((p) => p.cliente === false).length,
    naoInformado: audiencia.filter((p) => p.cliente == null).length,
    funcionariosBB: audiencia.filter((p) => p.funcionarioBB === true).length,
  }
}

function computePremios(ds: MissoesDataset, resgates: { brindeId: number | null; entregueEm: string | null; status: string }[]): PremioResumo[] {
  return ds.brindes.map((b) => {
    const rs = resgates.filter((r) => r.brindeId === b.id)
    return {
      ...b,
      resgatados: rs.length,
      entregues: rs.filter((r) => r.entregueEm || norm(r.status) === "entregue").length,
    }
  })
}

// ============================================================
// Pesquisa de experiência
// ============================================================

// Escala de 5 pontos. Respostas antigas no formato "5 - Muito satisfeito" também são aceitas.
const LIKERT: Record<string, number> = {
  "muito satisfeito": 5,
  satisfeito: 4,
  "nem satisfeito nem insatisfeito": 3,
  neutro: 3,
  indiferente: 3,
  insatisfeito: 2,
  "muito insatisfeito": 1,
  "concordo totalmente": 5,
  "concordo parcialmente": 4,
  concordo: 4,
  "nem concordo nem discordo": 3,
  "discordo parcialmente": 2,
  discordo: 2,
  "discordo totalmente": 1,
}

export function likertScore(resposta: string): number | null {
  const r = norm(resposta)
  if (!r) return null
  if (LIKERT[r] != null) return LIKERT[r]
  const num = r.match(/^([1-5])(\s|$|\s*-)/)
  if (num) return Number(num[1])
  const semNumero = r.replace(/^\d+\s*-\s*/, "")
  return LIKERT[semNumero] ?? null
}

type QuestionKey =
  | "categoria"
  | "atendimento"
  | "palestras"
  | "experiencia"
  | "simples"
  | "conectado"
  | "relacionamento"
  | "aberta"
  | "outra"

export function classifyQuestion(pergunta: string): QuestionKey {
  const q = norm(pergunta)
  if (q.includes("categoria de publico")) return "categoria"
  if (q.includes("comente") || q.includes("comentario") || q.includes("sugest") || q.includes("o que motivou")) return "aberta"
  if (q.includes("atendimento")) return "atendimento"
  if (q.includes("palestra")) return "palestras"
  if (q.includes("experiencia") && (q.includes("forma geral") || q.includes("espaco"))) return "experiencia"
  if (q.includes("simples") && q.includes("inteligente")) return "simples"
  if (q.includes("conectad")) return "conectado"
  if (q.includes("relacionamento") && (q.includes("ampliar") || q.includes("tornar cliente"))) return "relacionamento"
  return "outra"
}

const SHORT_LABEL: Partial<Record<QuestionKey, string>> = {
  atendimento: "Atendimento e serviços",
  palestras: "Palestras e conteúdos",
  experiencia: "Experiência geral nos espaços BB",
  simples: "BB mostrou soluções simples e inteligentes",
  conectado: "BB está conectado com a sociedade",
  relacionamento: "Vontade de ampliar o relacionamento com o BB",
}

function shortOpenLabel(pergunta: string): string {
  const q = norm(pergunta)
  if (q.includes("chamou a atencao")) return "O que chamou atenção"
  if (q.includes("o que motivou")) return "Motivo da avaliação de relacionamento"
  if (q.includes("sugest")) return "Sugestões para próximos eventos"
  return pergunta.length > 60 ? pergunta.slice(0, 57) + "…" : pergunta
}

function computePesquisa(
  ds: MissoesDataset,
  recordOk: (userId: number | null) => boolean,
  dayOk: (iso: string) => boolean,
): PesquisaResumo {
  const pesquisas = ds.pesquisas.filter((p) => recordOk(p.userId) && dayOk(p.em))
  const userById = new Map(ds.participantes.map((p) => [p.id, p]))

  const scores = new Map<string, { label: string; key: QuestionKey; valores: number[] }>()
  const categorias = new Map<string, number>()
  const comentarios: Comment[] = []

  for (const p of pesquisas) {
    const u = p.userId != null ? userById.get(p.userId) : undefined
    p.respostas.forEach((item, idx) => {
      const key = classifyQuestion(item.pergunta)
      if (key === "categoria") {
        if (item.resposta) inc(categorias, item.resposta)
        return
      }
      const score = key === "aberta" ? null : likertScore(item.resposta)
      if (score != null) {
        const id = key === "outra" ? `outra:${item.pergunta}` : key
        const s = scores.get(id) ?? { label: SHORT_LABEL[key] ?? item.pergunta, key, valores: [] }
        s.valores.push(score)
        scores.set(id, s)
      } else if (item.resposta && item.resposta.length > 1) {
        comentarios.push({
          id: `${p.id}-${idx}`,
          pergunta: shortOpenLabel(item.pergunta),
          comentario: item.resposta,
          em: p.em,
          perfil: u?.perfilQuiz ? perfilLabel(u.perfilQuiz) : undefined,
          cliente: u ? u.cliente : undefined,
        })
      }
    })
  }

  const question = (id: string): SurveyQuestion | undefined => {
    const s = scores.get(id)
    if (!s || s.valores.length === 0) return undefined
    const media = s.valores.reduce((a, b) => a + b, 0) / s.valores.length
    return {
      pergunta: s.label,
      media: round(media),
      totalRespostas: s.valores.length,
      grau: round(((media - 1) / 4) * 100),
      top2: round((s.valores.filter((v) => v >= 4).length / s.valores.length) * 100, 1),
    }
  }

  const blocos: SatisfactionBlock[] = []
  const q1 = question("atendimento")
  const q2 = question("palestras")
  const q3 = question("experiencia")
  const sat = [q1, q2, q3].filter(Boolean) as SurveyQuestion[]
  if (sat.length) {
    // Mesma ponderação dos relatórios BB anteriores: (Grau 1 + Grau 2 + 3 × Grau 3) ÷ 5
    const completo = q1 && q2 && q3
    blocos.push({
      title: "Satisfação",
      type: "satisfaction",
      formula: completo ? "(Atendimento + Palestras + 3 × Experiência geral) ÷ 5" : "Média simples das perguntas respondidas",
      questions: sat,
      averageScore: round(avg(sat.map((q) => q.media))),
      grade: round(completo ? (q1.grau + q2.grau + 3 * q3.grau) / 5 : avg(sat.map((q) => q.grau))),
    })
  }
  const pos = [question("simples"), question("conectado")].filter(Boolean) as SurveyQuestion[]
  if (pos.length) {
    blocos.push({
      title: "Posicionamento da marca",
      type: "positioning",
      formula: "Média dos graus das afirmações",
      questions: pos,
      averageScore: round(avg(pos.map((q) => q.media))),
      grade: round(avg(pos.map((q) => q.grau))),
    })
  }
  const rel = question("relacionamento")
  if (rel) {
    blocos.push({
      title: "Intenção de relacionamento",
      type: "relationship",
      formula: "Grau da pergunta de relacionamento",
      questions: [rel],
      averageScore: rel.media,
      grade: rel.grau,
    })
  }
  // Perguntas de escala não mapeadas (caso o questionário mude)
  const outras = Array.from(scores.keys())
    .filter((k) => k.startsWith("outra:"))
    .map(question)
    .filter(Boolean) as SurveyQuestion[]
  if (outras.length) {
    blocos.push({
      title: "Outras perguntas",
      type: "positioning",
      formula: "Média dos graus",
      questions: outras,
      averageScore: round(avg(outras.map((q) => q.media))),
      grade: round(avg(outras.map((q) => q.grau))),
    })
  }

  return {
    respostas: pesquisas.length,
    notaGeral: q3?.media ?? null,
    grauGeral: q3?.grau ?? null,
    blocos,
    categorias: Array.from(categorias.entries())
      .map(([k, total]) => ({ chave: k, rotulo: k, total }))
      .sort((a, b) => b.total - a.total),
    comentarios: comentarios.sort((a, b) => b.em.localeCompare(a.em)),
  }
}

// ============================================================
// Utilitários
// ============================================================

function inc<K>(m: Map<K, number>, k: K, by = 1) {
  m.set(k, (m.get(k) ?? 0) + by)
}

function avg(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0
}

/**
 * Conta itens por chave. `ordem` define a ordem fixa (ex.: faixas etárias);
 * chaves fora da lista vão para o fim. Itens sem chave viram "Não informado".
 */
function countBy<T>(
  items: T[],
  key: (t: T) => string | null,
  ordem: string[],
  label: (k: string) => string,
  manterOrdem = false,
): CountItem[] {
  const m = new Map<string, number>()
  let semValor = 0
  for (const it of items) {
    const k = key(it)
    if (k) inc(m, k)
    else semValor++
  }
  const chaves = [...ordem.filter((k) => m.has(k)), ...Array.from(m.keys()).filter((k) => !ordem.includes(k))]
  const out = chaves.map((k) => ({ chave: k, rotulo: label(k), total: m.get(k)! }))
  if (!manterOrdem) out.sort((a, b) => b.total - a.total)
  if (semValor > 0) out.push({ chave: "", rotulo: "Não informado", total: semValor })
  return out
}
