import { NextRequest, NextResponse } from "next/server"
import { SESSION_COOKIE, getAuthMode, signSession, sessionCookieOptions, validateMightyToken, validateHubLogin } from "../../../../lib/auth"

export const dynamic = "force-dynamic"

/**
 * Login por credenciais (mesma API do hub.primeverse.ca).
 * Body: { username, password }  (username = username OU email)
 * Valida server-side contra o hub e emite o cookie de sessão assinado (pv_session).
 */
export async function POST(req: NextRequest) {
  const mode = getAuthMode()
  if (mode === "disabled" || mode === "dev") {
    return NextResponse.json({ ok: true, dev: true })
  }
  let payload: { username?: string; email?: string; password?: string } = {}
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: "Pedido inválido." }, { status: 400 })
  }
  const username = (payload.username || payload.email || "").trim()
  const password = payload.password || ""
  if (!username || !password) {
    return NextResponse.json({ ok: false, error: "Introduz o utilizador e a password." }, { status: 400 })
  }

  const user = await validateHubLogin(username, password)
  if (!user) {
    return NextResponse.json({ ok: false, error: "Credenciais inválidas." }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true, user: { email: user.email, name: user.name } })
  res.cookies.set(
    SESSION_COOKIE,
    signSession({ sub: user.id, email: user.email, name: user.name, role: user.role }),
    sessionCookieOptions(),
  )
  return res
}

/**
 * Login callback. Mighty Networks redirects the member here with a token,
 * e.g. /api/auth/login?token=XXXX&return_to=/charts-primeverse
 * We validate the token server-side, then issue a signed httpOnly cookie on our domain.
 */
export async function GET(req: NextRequest) {
  const mode = getAuthMode()
  const url = new URL(req.url)
  const returnTo = url.searchParams.get("return_to") || "/charts-primeverse"
  const safeReturn = returnTo.startsWith("/") ? returnTo : "/charts-primeverse"

  if (mode === "disabled" || mode === "dev") {
    return NextResponse.redirect(new URL(safeReturn, url.origin))
  }

  const token = url.searchParams.get("token")
  const user = token ? await validateMightyToken(token) : null

  if (!user) {
    const loginUrl = process.env.PRIMEVERSE_LOGIN_URL || "https://prime-verse.mn.co/sign_in"
    return NextResponse.redirect(loginUrl)
  }

  const res = NextResponse.redirect(new URL(safeReturn, url.origin))
  res.cookies.set(SESSION_COOKIE, signSession({ sub: user.id, email: user.email }), sessionCookieOptions())
  return res
}
