import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Alertas de trading — espelha os alertas do MoreThanMoney.
 * Lê a RPC sanitizada `primeverse_recent_alerts` no Supabase MTM com a chave publishable
 * (anon), server-side. Só devolve campos de display (sem telegram/rotas/PII).
 */
export async function GET(request: Request) {
  const url = process.env.MTM_SUPABASE_URL?.trim()
  const key = process.env.MTM_SUPABASE_ANON_KEY?.trim()
  if (!url || !key) {
    return NextResponse.json({ alerts: [], configured: false })
  }

  const limitParam = Number(new URL(request.url).searchParams.get("limit") || "40")
  const limit = Math.max(1, Math.min(Number.isFinite(limitParam) ? limitParam : 40, 100))

  try {
    const res = await fetch(`${url}/rest/v1/rpc/primeverse_recent_alerts`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_limit: limit }),
      cache: "no-store",
    })
    if (!res.ok) {
      return NextResponse.json({ alerts: [], error: `upstream ${res.status}` }, { status: 200 })
    }
    const data = await res.json()
    const alerts = Array.isArray(data) ? data : []
    return NextResponse.json({ alerts, configured: true })
  } catch (e) {
    return NextResponse.json({ alerts: [], error: e instanceof Error ? e.message : "erro" }, { status: 200 })
  }
}
