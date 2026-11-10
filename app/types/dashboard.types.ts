// ============================================================
// Dataset sanitizado — é o que a rota /api/dashboard devolve ao navegador.
// Não contém dados pessoais (sem nome, e-mail, CPF, telefone, senha,
// data de nascimento ou número da sorte). Datas em ISO 8601 (UTC).
// ============================================================

export type CheckinStatus = "validado" | "pendente" | "recusado"

export interface Evento {
  nome: string
  inicio: string | null
  fim: string | null
  status: string | null
}

export interface Missao {
  id: number
  nome: string
  /** "missao" | "booster" */
  categoria: string
  /** cadastro | video | qr_promotor | foto_ia | comprovante_ia | pesquisa */
  modo: string
  pontos: number
  ordem: number
  local: string | null
  /** Missão "agrupadora" (ex.: Cartão BB Visa Parade, que reúne C1–C4) */
  ehGrupo: boolean
  /** id da missão agrupadora, quando esta for parte de um grupo */
  grupoId: number | null
}

export interface Participante {
  id: number
  criadoEm: string
  /** tenho_conta: true = cliente BB, false = não cliente, null = não informado */
  cliente: boolean | null
  funcionarioBB: boolean | null
  faixaEtaria: string | null
  perfilQuiz: string | null
  avatarPronto: boolean
}

export interface Checkin {
  id: number
  em: string
  validadoEm: string | null
  status: CheckinStatus
  /** qr | ia | automatico */
  metodo: string
  pontos: number
  missaoId: number | null
  userId: number | null
  /** motivo de recusa (vem da análise de IA ou do promotor) */
  motivo: string | null
}

export interface TransacaoPontos {
  em: string
  delta: number
  /** missao | booster | resgate | ... */
  origem: string
  userId: number | null
  missaoId: number | null
}

export interface Brinde {
  id: number
  titulo: string
  pontos: number
  altoValor: boolean
  estoqueTotal: number
  disponivel: number
}

export interface Resgate {
  id: number
  em: string
  entregueEm: string | null
  status: string
  pontos: number
  brindeId: number | null
  userId: number | null
}

export interface BerloqueEntrega {
  em: string
  missaoId: number | null
  userId: number | null
}

export interface NumeroDaSorte {
  em: string
  userId: number | null
}

export interface PerguntaResposta {
  pergunta: string
  resposta: string
}

export interface Pesquisa {
  id: number
  em: string
  userId: number | null
  respostas: PerguntaResposta[]
}

export interface MissoesDataset {
  geradoEm: string
  evento: Evento | null
  missoes: Missao[]
  participantes: Participante[]
  checkins: Checkin[]
  transacoes: TransacaoPontos[]
  brindes: Brinde[]
  resgates: Resgate[]
  berloques: BerloqueEntrega[]
  numerosDaSorte: NumeroDaSorte[]
  pesquisas: Pesquisa[]
  /** Contas de equipe (promotor, supervisor, resgate) removidas das métricas */
  contasEquipeIgnoradas: number
}

// ============================================================
// Filtros globais
// ============================================================

export type TipoCliente = "" | "cliente" | "nao-cliente"

export interface DashboardFilters {
  missaoId?: number
  /** dia no formato YYYY-MM-DD (fuso do evento) */
  dia: string
  faixaEtaria: string
  tipoCliente: TipoCliente
  perfilQuiz: string
}

// ============================================================
// Dados de visualização (resultado de computeDashboard)
// ============================================================

export interface Kpis {
  participantes: number
  participantesComMissao: number
  missoesConcluidas: number
  missoesPendentes: number
  missoesRecusadas: number
  pontosDistribuidos: number
  pontosResgatados: number
  resgates: number
  resgatesEntregues: number
  berloques: number
  numerosDaSorte: number
}

export interface FunnelStage {
  etapa: string
  descricao: string
  total: number
}

export interface MissaoResumo {
  id: number
  nome: string
  categoria: string
  modo: string
  pontos: number
  validados: number
  pendentes: number
  recusados: number
  participantesUnicos: number
  berloques: number
}

export interface DailyPoint {
  dia: string
  rotulo: string
  cadastros: number
  concluidas: number
}

export interface HourPoint {
  hora: string
  total: number
}

export interface CountItem {
  chave: string
  rotulo: string
  total: number
}

export interface MetodoResumo {
  metodo: string
  rotulo: string
  validados: number
  pendentes: number
  recusados: number
}

export interface RecusaRecente {
  missao: string
  motivo: string
  em: string
}

export interface ValidacaoResumo {
  metodos: MetodoResumo[]
  taxaAprovacaoIA: number | null
  analisadasIA: number
  recusasRecentes: RecusaRecente[]
}

export interface BaseResumo {
  total: number
  clientes: number
  naoClientes: number
  naoInformado: number
  funcionariosBB: number
}

export interface PremioResumo {
  id: number
  titulo: string
  pontos: number
  altoValor: boolean
  estoqueTotal: number
  disponivel: number
  resgatados: number
  entregues: number
}

export interface SurveyQuestion {
  pergunta: string
  media: number
  totalRespostas: number
  /** (média - 1) / 4 × 100 */
  grau: number
  /** % de respostas nas duas notas mais altas (4 e 5) */
  top2: number
}

export interface SatisfactionBlock {
  title: string
  type: "satisfaction" | "positioning" | "relationship"
  formula: string
  questions: SurveyQuestion[]
  averageScore: number
  grade: number
}

export interface Comment {
  id: string
  pergunta: string
  comentario: string
  em: string
  perfil?: string
  cliente?: boolean | null
}

export interface PesquisaResumo {
  respostas: number
  notaGeral: number | null
  grauGeral: number | null
  blocos: SatisfactionBlock[]
  categorias: CountItem[]
  comentarios: Comment[]
}

export interface DashboardView {
  kpis: Kpis
  funil: FunnelStage[]
  missoes: MissaoResumo[]
  diario: DailyPoint[]
  porHora: HourPoint[]
  validacao: ValidacaoResumo
  perfis: CountItem[]
  faixas: CountItem[]
  base: BaseResumo
  premios: PremioResumo[]
  pesquisa: PesquisaResumo
  /** true quando Missão ou Dia estão filtrando a atividade */
  recorteDeAtividade: boolean
}

export interface FilterOptions {
  missoes: { id: number; nome: string }[]
  dias: { valor: string; rotulo: string }[]
  faixas: string[]
  perfis: { chave: string; rotulo: string }[]
}
