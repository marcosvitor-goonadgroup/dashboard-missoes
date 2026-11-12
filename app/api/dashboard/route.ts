import { gzipSync } from "node:zlib"
import { NextResponse } from "next/server"
import { sanitize } from "../../lib/sanitize"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 30

const API_URL = process.env.MISSOES_API_URL ?? "https://api-rac-n-play.vercel.app/api/data/all?event=missoes"

/** Evita bater na API de origem a cada refresh de cada pessoa olhando o painel */
const MEMO_TTL_MS = 20_000

interface Snapshot {
  at: number
  body: string
  /**
   * Corpo já comprimido. A Vercel limita a resposta de uma função a 4,5 MB; o JSON
   * cresce ~10× mais que a versão gzip (ex.: 3 MB → 300 KB no 2º dia do evento).
   */
  gz: Uint8Array
}

let memo: Snapshot | null = null
let inflight: Promise<Snapshot> | null = null

async function load(): Promise<Snapshot> {
  const res = await fetch(API_URL, { cache: "no-store", headers: { accept: "application/json" } })
  if (!res.ok) throw new Error(`API de origem respondeu ${res.status}`)
  const raw = await res.json()
  if (raw?.success === false) throw new Error("API de origem retornou success=false")
  const body = JSON.stringify(sanitize(raw))
  return { at: Date.now(), body, gz: new Uint8Array(gzipSync(body)) }
}

/**
 * Padrão: envia o gzip como binário (application/gzip) e o navegador descompacta com
 * DecompressionStream. Não usamos Content-Encoding porque o Next.js remove esse
 * cabeçalho das respostas de rotas. `?formato=json` devolve o JSON sem compressão
 * (fallback para navegadores sem DecompressionStream e para depuração).
 */
function respond(req: Request, snap: Snapshot, extra: Record<string, string> = {}) {
  const cache = { "cache-control": "public, s-maxage=20, stale-while-revalidate=60", ...extra }
  if (new URL(req.url).searchParams.get("formato") === "json") {
    return new NextResponse(snap.body, { headers: { "content-type": "application/json; charset=utf-8", ...cache } })
  }
  return new NextResponse(snap.gz as BodyInit, { headers: { "content-type": "application/gzip", ...cache } })
}

export async function GET(req: Request) {
  try {
    if (!memo || Date.now() - memo.at > MEMO_TTL_MS) {
      inflight ??= load().finally(() => {
        inflight = null
      })
      memo = await inflight
    }
    return respond(req, memo)
  } catch (err) {
    console.error("[api/dashboard]", err)
    // Se já houver um snapshot anterior, serve ele em vez de derrubar o painel
    if (memo) return respond(req, memo, { "x-dashboard-stale": "1", "cache-control": "no-store" })
    return NextResponse.json({ error: "Não foi possível carregar os dados da API." }, { status: 502 })
  }
}
