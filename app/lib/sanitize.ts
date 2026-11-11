// Executado SOMENTE no servidor (rota /api/dashboard).
// Converte a resposta bruta da API (dump das tabelas do Strapi v5) em um
// dataset enxuto e sem dados pessoais para o navegador.
//
// Particularidades do Strapi v5 tratadas aqui:
//  - Cada registro com "draft & publish" aparece duas vezes (rascunho com
//    published_at = null e versão publicada), com o mesmo document_id.
//    Usamos sempre a versão publicada.
//  - Relações ficam em tabelas *_lnk. Algumas estão incompletas (ex.: nem todo
//    check-in tem linha em checkins_ativacao_lnk), então preferimos o campo
//    desnormalizado ativacao_doc / brinde_doc quando existe.
//  - Contas de equipe (promotor, supervisor, resgate) ficam em up_users junto
//    com os participantes; elas são excluídas de todas as métricas.

import type {
  BerloqueEntrega,
  Brinde,
  Checkin,
  CheckinStatus,
  Evento,
  Missao,
  MissoesDataset,
  Participante,
  Pesquisa,
  Resgate,
  TransacaoPontos,
} from "../types/dashboard.types"
import { faixaEtaria, idadeEm } from "./missoes"

type Row = Record<string, any>
type Tables = Record<string, { count?: number; data?: Row[] } | undefined>

const PARTICIPANT_ROLE_TYPES = new Set(["authenticated"])

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === "number" ? v : Number.parseFloat(String(v ?? ""))
  return Number.isFinite(n) ? n : fallback
}

/** Mapa id_qualquer_versão → id da versão publicada (via document_id) */
function publishedIndex(rows: Row[]) {
  const publishedByDoc = new Map<string, Row>()
  for (const r of rows) if (r.published_at && r.document_id) publishedByDoc.set(r.document_id, r)
  const docById = new Map<number, string>()
  for (const r of rows) if (r.document_id) docById.set(r.id, r.document_id)
  return {
    published: Array.from(publishedByDoc.values()),
    byDoc: (doc: string | null | undefined) => (doc ? publishedByDoc.get(doc) : undefined),
    byAnyId: (id: number | null | undefined) => {
      if (id == null) return undefined
      const doc = docById.get(id)
      return doc ? publishedByDoc.get(doc) : undefined
    },
  }
}

/** Mapa a partir de uma tabela de ligação: chave → valor (primeiro encontrado) */
function linkMap(rows: Row[], from: string, to: string): Map<number, number> {
  const m = new Map<number, number>()
  for (const r of rows) if (r[from] != null && r[to] != null && !m.has(r[from])) m.set(r[from], r[to])
  return m
}

function normalizeStatus(s: unknown): CheckinStatus {
  const v = String(s ?? "").toLowerCase()
  if (v === "validado" || v === "aprovado" || v === "concluido") return "validado"
  if (v === "recusado" || v === "rejeitado" || v === "reprovado") return "recusado"
  return "pendente"
}

export function sanitize(raw: any): MissoesDataset {
  const tables: Tables = raw?.tables ?? {}
  const t = (name: string): Row[] => tables[name]?.data ?? []

  // ---------- Papéis / participantes ----------
  const roleType = new Map<number, string>(t("up_roles").map((r) => [r.id, String(r.type ?? r.name ?? "").toLowerCase()]))
  const roleOfUser = linkMap(t("up_users_role_lnk"), "user_id", "role_id")

  const staffIds = new Set<number>()
  const participantes: Participante[] = []
  const hoje = new Date()

  for (const u of t("up_users")) {
    const role = roleOfUser.has(u.id) ? roleType.get(roleOfUser.get(u.id)!) : "authenticated"
    if (!role || !PARTICIPANT_ROLE_TYPES.has(role)) {
      staffIds.add(u.id)
      continue
    }
    const idade = u.data_usuario ? idadeEm(u.data_usuario, hoje) : null
    participantes.push({
      id: u.id,
      criadoEm: u.created_at,
      cliente: typeof u.tenho_conta === "boolean" ? u.tenho_conta : null,
      funcionarioBB: typeof u.funcionario_bb === "boolean" ? u.funcionario_bb : null,
      faixaEtaria: idade != null ? faixaEtaria(idade) : null,
      perfilQuiz: typeof u.perfil_quiz === "string" && u.perfil_quiz ? u.perfil_quiz : null,
      avatarPronto: u.avatar_status === "pronto",
    })
  }

  const isStaff = (userId: number | null | undefined) => userId != null && staffIds.has(userId)

  // ---------- Evento ----------
  const eventos = publishedIndex(t("eventos")).published
  const ev = eventos[0]
  const evento: Evento | null = ev
    ? { nome: ev.nome, inicio: ev.data_de_inicio ?? null, fim: ev.data_de_fim ?? null, status: ev.status_do_evento ?? null }
    : null

  // ---------- Missões (ativações) ----------
  const ativ = publishedIndex(t("ativacoes"))
  // ativacoes_grupo_lnk: ativacao_id = filha, inv_ativacao_id = agrupadora
  const grupoDe = new Map<number, number>()
  const agrupadoras = new Set<number>()
  for (const l of t("ativacoes_grupo_lnk")) {
    const filha = ativ.byAnyId(l.ativacao_id)
    const pai = ativ.byAnyId(l.inv_ativacao_id)
    if (filha && pai) {
      grupoDe.set(filha.id, pai.id)
      agrupadoras.add(pai.id)
    }
  }

  const missoes: Missao[] = ativ.published
    .map((a) => ({
      id: a.id,
      nome: String(a.nome ?? "Sem nome"),
      categoria: String(a.categoria ?? "missao"),
      modo: String(a.modo_validacao ?? ""),
      pontos: num(a.pontuacao),
      ordem: num(a.ordem, 999),
      local: a.local ?? null,
      ehGrupo: agrupadoras.has(a.id),
      grupoId: grupoDe.get(a.id) ?? null,
    }))
    .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome))

  const missaoId = (doc?: string | null, anyId?: number | null) => (ativ.byDoc(doc) ?? ativ.byAnyId(anyId))?.id ?? null

  // ---------- Check-ins ----------
  const ckMissao = linkMap(t("checkins_ativacao_lnk"), "checkin_id", "ativacao_id")
  const ckUser = linkMap(t("checkins_users_permissions_user_lnk"), "checkin_id", "user_id")

  const checkins: Checkin[] = []
  for (const c of t("checkins")) {
    if (!c.published_at) continue
    const userId = ckUser.get(c.id) ?? null
    if (isStaff(userId)) continue
    const ia = c.ia_resultado && typeof c.ia_resultado === "object" ? c.ia_resultado : null
    const status = normalizeStatus(c.status)
    checkins.push({
      id: c.id,
      em: c.created_at,
      validadoEm: c.validado_em ?? null,
      status,
      metodo: String(c.metodo ?? "outro"),
      pontos: num(c.pontos_ganhos),
      missaoId: missaoId(c.ativacao_doc, ckMissao.get(c.id)),
      userId,
      motivo: status === "recusado" ? (c.motivo ?? ia?.motivo ?? null) : null,
    })
  }

  // ---------- Transações de pontos ----------
  const txUser = linkMap(t("transacoes_pontos_users_permissions_user_lnk"), "transacao_pontos_id", "user_id")
  const transacoes: TransacaoPontos[] = []
  for (const r of t("transacoes_pontos")) {
    if (!r.published_at) continue
    const userId = txUser.get(r.id) ?? null
    if (isStaff(userId)) continue
    // chave no formato "checkin:<userId>:<document_id da ativação>"
    const docFromKey = typeof r.chave === "string" ? r.chave.split(":")[2] : undefined
    transacoes.push({
      em: r.created_at,
      delta: num(r.delta),
      origem: String(r.origem ?? "outro"),
      userId,
      missaoId: docFromKey ? missaoId(docFromKey) : null,
    })
  }

  // ---------- Brindes / resgates ----------
  const brin = publishedIndex(t("brindes"))
  const brindes: Brinde[] = brin.published
    .map((b) => ({
      id: b.id,
      titulo: String(b.titulo ?? "Brinde"),
      pontos: num(b.pontos),
      altoValor: !!b.alto_valor,
      estoqueTotal: num(b.estoque_total),
      disponivel: num(b.disponivel),
    }))
    .sort((a, b) => a.pontos - b.pontos)

  const rgBrinde = linkMap(t("resgates_brinde_lnk"), "resgate_id", "brinde_id")
  const rgUser = linkMap(t("resgates_users_permissions_user_lnk"), "resgate_id", "user_id")
  const resgates: Resgate[] = []
  for (const r of t("resgates")) {
    if (!r.published_at) continue
    const userId = rgUser.get(r.id) ?? null
    if (isStaff(userId)) continue
    resgates.push({
      id: r.id,
      em: r.created_at,
      entregueEm: r.entregue_em ?? null,
      status: String(r.status ?? "reservado"),
      pontos: num(r.pontos),
      brindeId: (brin.byDoc(r.brinde_doc) ?? brin.byAnyId(rgBrinde.get(r.id)))?.id ?? null,
      userId,
    })
  }

  // ---------- Berloques ----------
  const blMissao = linkMap(t("berloque_entregas_ativacao_lnk"), "berloque_entrega_id", "ativacao_id")
  const blUser = linkMap(t("berloque_entregas_users_permissions_user_lnk"), "berloque_entrega_id", "user_id")
  const berloques: BerloqueEntrega[] = []
  for (const b of t("berloque_entregas")) {
    if (!b.published_at) continue
    const userId = blUser.get(b.id) ?? null
    if (isStaff(userId)) continue
    berloques.push({ em: b.created_at, missaoId: missaoId(null, blMissao.get(b.id)), userId })
  }

  // ---------- Pesquisa de experiência ----------
  const psUser = linkMap(t("pesquisa_experiencias_users_permissions_user_lnk"), "pesquisa_experiencia_id", "user_id")
  const pesquisas: Pesquisa[] = []
  for (const p of t("pesquisa_experiencias")) {
    if (!p.published_at || p.respondeu === false) continue
    const userId = psUser.get(p.id) ?? null
    if (isStaff(userId)) continue
    const lista = Array.isArray(p.pergunta_resposta) ? p.pergunta_resposta : []
    pesquisas.push({
      id: p.id,
      em: p.created_at,
      userId,
      respostas: lista
        .filter((i: any) => i && typeof i.pergunta === "string")
        .map((i: any) => ({
          pergunta: i.pergunta,
          // formato antigo guardava texto livre em "comentario"
          resposta: String(i.resposta ?? i.comentario ?? "").trim(),
        })),
    })
  }

  return {
    geradoEm: new Date().toISOString(),
    evento,
    missoes,
    participantes,
    checkins,
    transacoes,
    brindes,
    resgates,
    berloques,
    pesquisas,
    contasEquipeIgnoradas: staffIds.size,
  }
}
