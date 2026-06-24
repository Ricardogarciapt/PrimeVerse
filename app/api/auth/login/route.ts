import { NextRequest, NextResponse } from "next/server"
import { SESSION_COOKIE, getAuthMode, signSession, sessionCookieOptions, validateMightyToken } from "../../../../lib/auth"

export const dynamic = "force-dynamic"

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
