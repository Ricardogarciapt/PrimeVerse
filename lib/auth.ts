import { createHmac, timingSafeEqual } from "crypto"

/**
 * Server-side authentication helpers for Prime Verse.
 *
 * Design goals:
 *  - No secrets ever reach the client bundle (the Mighty Networks API key lives
 *    only in a server-only env var, never NEXT_PUBLIC_*).
 *  - The browser only ever talks to our own /api/auth/* routes.
 *  - A signed, httpOnly cookie issued on OUR domain is the source of truth,
 *    so we don't depend on cross-domain cookies from mn.co (which never worked).
 *
 * AUTH_MODE controls behaviour:
 *  - "disabled" : app is fully public, no gate.
 *  - "dev"      : gate is present but always grants access (for local testing).
 *  - "mighty"   : real validation — a Mighty Networks member token is exchanged,
 *                 server-side, for a signed pv_session cookie.
 */

export type AuthMode = "disabled" | "dev" | "mighty"

export const SESSION_COOKIE = "pv_session"
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days

export function getAuthMode(): AuthMode {
  const mode = (process.env.AUTH_MODE || "dev").toLowerCase()
  if (mode === "disabled" || mode === "dev" || mode === "mighty") return mode
  return "dev"
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret || secret.length < 16) {
    // Fail loudly in production; allow a dev default locally.
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET must be set (>=16 chars) in production")
    }
    return "dev-only-insecure-secret-change-me"
  }
  return secret
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

/** Create a signed session token: base64url(payload).hmac */
export function signSession(payload: Record<string, unknown>): string {
  const body = base64url(JSON.stringify({ ...payload, exp: Date.now() + SESSION_TTL_SECONDS * 1000 }))
  const sig = base64url(createHmac("sha256", getSecret()).update(body).digest())
  return `${body}.${sig}`
}

/** Verify a signed session token; returns the payload or null if invalid/expired. */
export function verifySession(token: string | undefined | null): Record<string, unknown> | null {
  if (!token) return null
  const parts = token.split(".")
  if (parts.length !== 2) return null
  const [body, sig] = parts
  const expected = base64url(createHmac("sha256", getSecret()).update(body).digest())
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const payload = JSON.parse(Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString())
    if (typeof payload.exp === "number" && payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  }
}

/**
 * Validate a Mighty Networks member token, server-side, using the server-only API key.
 * Returns a minimal user object on success, or null on failure.
 *
 * NOTE: Mighty Networks' exact member-verification endpoint depends on your plan
 * (full SSO/JWT is a paid feature). This function is the single integration point —
 * adjust the request below to match your MN configuration. It never runs on the client.
 */
export async function validateMightyToken(token: string): Promise<{ id: string; email?: string } | null> {
  const apiKey = process.env.PRIMEVERSE_API_KEY
  const baseUrl = process.env.PRIMEVERSE_BASE_URL || "https://prime-verse.mn.co"
  if (!apiKey || !token) return null

  try {
    const res = await fetch(`${baseUrl}/api/v1/users/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-API-Key": apiKey,
      },
      // Server-to-server, no browser CORS involved.
      cache: "no-store",
    })
    if (!res.ok) return null
    const data = (await res.json()) as { id?: string; email?: string }
    if (!data?.id) return null
    return { id: String(data.id), email: data.email }
  } catch {
    return null
  }
}
