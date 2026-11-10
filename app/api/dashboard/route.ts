import { NextResponse } from "next/server"
import { sanitize } from "../../lib/sanitize"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 30

const API_URL = process.env.MISSOES_API_URL ?? "https://api-rac-n-play.vercel.app/api/data/all?event=missoes"

/** Evita bater na API de origem a cada refresh de cada pessoa olhando o painel */
const MEMO_TTL_MS = 20_000
let memo: { at: number; body: string } | null = null
let inflight: Promise<string> | null = null

async function load(): Promise<string> {
  const res = await fetch(API_URL, { cache: "no-store", headers: { accept: "application/json" } })
  if (!res.ok) throw new Error(`API de origem respondeu ${res.status}`)
  const raw = await res.json()
  if (raw?.success === false) throw new Error("API de origem retornou success=false")
  return JSON.stringify(sanitize(raw))
}

export async function GET() {
  const now = Date.now()
  try {
    if (!memo || now - memo.at > MEMO_TTL_MS) {
      inflight ??= load().finally(() => {
        inflight = null
      })
      memo = { at: Date.now(), body: await inflight }
    }
    return new NextResponse(memo.body, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, s-maxage=20, stale-while-revalidate=60",
      },
    })
  } catch (err) {
    console.error("[api/dashboard]", err)
    // Se já houver um snapshot anterior, serve ele em vez de derrubar o painel
    if (memo) {
      return new NextResponse(memo.body, {
        headers: { "content-type": "application/json; charset=utf-8", "x-dashboard-stale": "1", "cache-control": "no-store" },
      })
    }
    return NextResponse.json({ error: "Não foi possível carregar os dados da API." }, { status: 502 })
  }
}
