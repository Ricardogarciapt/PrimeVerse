import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { SESSION_COOKIE, getAuthMode, verifySession } from "../../../../lib/auth"

export const dynamic = "force-dynamic"

/** Returns whether the current visitor is authenticated. No secrets exposed. */
export async function GET() {
  const mode = getAuthMode()

  if (mode === "disabled") {
    return NextResponse.json({ authenticated: true, mode })
  }
  if (mode === "dev") {
    return NextResponse.json({ authenticated: true, mode, dev: true })
  }

  const cookieStore = await cookies()
  const session = verifySession(cookieStore.get(SESSION_COOKIE)?.value)
  return NextResponse.json({ authenticated: Boolean(session), mode })
}
