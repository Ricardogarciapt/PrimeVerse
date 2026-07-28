"use client"

import { useEffect, useState, useCallback } from "react"
import { useTheme } from "next-themes"
import { Button } from "../../components/ui/button"
import TradingViewWidget from "../../components/trading-view-widget"
import PositionCalculatorEN from "../../components/position-calculator-en"
import MtmAlertsPanel from "../../components/mtm-alerts-panel"
import { Loader2, LogOut, Sun, Moon, Users } from "lucide-react"
import Image from "next/image"

// Primeverse color palette (ref. hub.primeverse.ca)
const PRIMEVERSE_COLORS = {
  primary: "#015BF9",
  cyan: "#22D3EE",
  white: "#FFFFFF",
  dark: "#040507",
  darkBlue: "#1200DE",
  lightGray: "#EDECED",
}

const PRIMEVERSE_LOGIN_URL = "https://prime-verse.mn.co/sign_in"
// Destino da comunidade PrimeVerse
const PRIMEVERSE_COMMUNITY_URL = "https://hub.primeverse.ca"

// Studies disponíveis — nomes/IDs iguais ao scanner-access do MTM
const availableStudies = [
  "GoldenZone",
  "Momentum",
  "AurumFlow",
  "Winzone",
  "Sinergy",
  "Goldkiller",
  "MTMScanner",
  "Sensei",
] as const
type StudyKey = (typeof availableStudies)[number]

const debug = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") console.log(...args)
}

export default function ChartsPrimeversePage() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [selectedStudies, setSelectedStudies] = useState<StudyKey[]>(["AurumFlow"])
  const [selectedSymbol, setSelectedSymbol] = useState("OANDA:XAUUSD")
  const [selectedTimeframe, setSelectedTimeframe] = useState("15")
  // Login (mesma API do hub.primeverse.ca)
  const [loginUser, setLoginUser] = useState("")
  const [loginPass, setLoginPass] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginSubmitting, setLoginSubmitting] = useState(false)

  // Restore persisted UI preferences (client-only)
  useEffect(() => {
    setMounted(true)
    try {
      const savedStudies = localStorage.getItem("primeverse_active_scanners")
      if (savedStudies) {
        const parsed = JSON.parse(savedStudies) as string[]
        const filtered = parsed.filter((s) => availableStudies.includes(s as StudyKey)) as StudyKey[]
        if (filtered.length) setSelectedStudies(filtered)
      }
    } catch {
      /* ignore */
    }
  }, [])

  // Secure auth check — talks only to our own server route. No secrets in the client.
  useEffect(() => {
    let active = true
    const check = async () => {
      try {
        setIsChecking(true)
        const res = await fetch("/api/auth/check", { cache: "no-store" })
        const data = (await res.json()) as { authenticated: boolean }
        if (!active) return
        if (data.authenticated) {
          setIsAuthenticated(true)
          setIsChecking(false)
        } else {
          // Sem sessão → mostra o formulário de login (mesma API do hub)
          setIsAuthenticated(false)
          setIsChecking(false)
        }
      } catch (error) {
        debug("Auth check failed:", error)
        if (active) {
          setIsAuthenticated(false)
          setIsChecking(false)
        }
      }
    }

    check()

    const onFocus = () => {
      if (!isAuthenticated) check()
    }
    window.addEventListener("focus", onFocus)
    return () => {
      active = false
      window.removeEventListener("focus", onFocus)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleStudiesChange = useCallback((studies: string[]) => {
    const filtered = studies.filter((s) => availableStudies.includes(s as StudyKey)) as StudyKey[]
    setSelectedStudies(filtered.length > 0 ? filtered : ["AurumFlow"])
  }, [])

  // Click num alerta → encaminha o gráfico para o símbolo, timeframe e scanner do sinal
  const handleSelectAlert = useCallback(({ symbol, timeframe, studyKey }: { symbol: string; timeframe?: string; studyKey: string }) => {
    setSelectedSymbol(symbol)
    if (timeframe) setSelectedTimeframe(timeframe)
    const k = studyKey as StudyKey
    if (availableStudies.includes(k)) setSelectedStudies([k])
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      /* ignore */
    }
    setIsAuthenticated(false)
    setLoginUser("")
    setLoginPass("")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setLoginSubmitting(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser.trim(), password: loginPass }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (res.ok && data.ok) {
        setIsAuthenticated(true)
        setLoginPass("")
      } else {
        setLoginError(data.error || "Credenciais inválidas.")
      }
    } catch {
      setLoginError("Falha de ligação. Tenta novamente.")
    } finally {
      setLoginSubmitting(false)
    }
  }

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark")

  if (!mounted || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: PRIMEVERSE_COLORS.dark }}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: PRIMEVERSE_COLORS.primary }} />
          <p style={{ color: PRIMEVERSE_COLORS.lightGray }}>
            Checking access...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4" style={{ backgroundColor: PRIMEVERSE_COLORS.dark }}>
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8">
            <Image src="/images/image.png" alt="Prime Verse" width={200} height={44} className="h-10 w-auto" priority />
          </div>
          <div className="rounded-2xl border p-6 sm:p-8" style={{ backgroundColor: "#0A0E1A", borderColor: PRIMEVERSE_COLORS.primary + "30" }}>
            <h1 className="text-xl font-semibold text-white">Bem-vindo de volta</h1>
            <p className="text-sm text-slate-400 mb-6">Inicia sessão para continuar.</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1.5">Utilizador ou email</label>
                <input
                  type="text"
                  autoComplete="username"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full rounded-lg bg-black/40 border border-slate-700 px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#015BF9]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1.5">Password</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full rounded-lg bg-black/40 border border-slate-700 px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#015BF9]"
                  required
                />
              </div>
              {loginError && <p className="text-sm text-red-400">{loginError}</p>}
              <button
                type="submit"
                disabled={loginSubmitting}
                className="w-full rounded-lg py-2.5 text-white text-sm font-semibold disabled:opacity-60"
                style={{ background: `linear-gradient(90deg, ${PRIMEVERSE_COLORS.primary}, #6d3bf5)` }}
              >
                {loginSubmitting ? "A entrar…" : "Entrar"}
              </button>
            </form>
            <div className="mt-4 text-center">
              <a
                href={`${PRIMEVERSE_COMMUNITY_URL}/forgot-password`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-400 hover:text-white"
              >
                Esqueceste a password?
              </a>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-slate-500">
            Ainda não tens conta?{" "}
            <a href={PRIMEVERSE_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className="text-[#5b9dff] hover:underline">
              Junta-te ao PrimeVerse
            </a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: PRIMEVERSE_COLORS.dark, color: PRIMEVERSE_COLORS.white }}>
      <header
        className="border-b sticky top-0 z-50 backdrop-blur-sm"
        style={{ backgroundColor: PRIMEVERSE_COLORS.dark + "F0", borderColor: PRIMEVERSE_COLORS.primary + "30" }}
      >
        <div className="w-full px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 shrink-0">
            <Image src="/images/image.png" alt="Prime Verse" width={180} height={40} className="h-8 w-auto sm:h-10" priority />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <a href={PRIMEVERSE_COMMUNITY_URL} target="_blank" rel="noopener noreferrer">
              <Button
                size="sm"
                variant="outline"
                className="h-9 px-2.5 sm:px-4 text-sm font-medium rounded-lg bg-transparent"
                style={{
                  borderColor: PRIMEVERSE_COLORS.primary + "60",
                  color: PRIMEVERSE_COLORS.lightGray,
                 
                }}
              >
                <Users className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Community</span>
              </Button>
            </a>

            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 rounded-lg bg-transparent"
              style={{ borderColor: PRIMEVERSE_COLORS.primary + "60", color: PRIMEVERSE_COLORS.lightGray }}
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button
              onClick={handleLogout}
              size="sm"
              variant="outline"
              className="h-9 px-2.5 sm:px-3 text-xs font-medium rounded-lg bg-transparent"
              style={{ borderColor: PRIMEVERSE_COLORS.primary + "60", color: PRIMEVERSE_COLORS.lightGray }}
            >
              <LogOut className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Desktop aproveita o ecrã todo (w-full, padding mínimo); mobile empilha */}
      <div className="w-full px-2 sm:px-3 lg:px-4 py-3">
        {/* Chart — ocupa o máximo de altura no desktop */}
        <div
          className="w-full rounded-lg border p-1.5 sm:p-2 mb-4"
          style={{ backgroundColor: PRIMEVERSE_COLORS.dark, borderColor: PRIMEVERSE_COLORS.primary + "20" }}
        >
          <TradingViewWidget
            externalStudies={selectedStudies as any}
            externalSymbol={selectedSymbol}
            externalTimeframe={selectedTimeframe}
            externalTheme={resolvedTheme === "light" ? "light" : "dark"}
            excludedStudies={[] as string[]}
            onStudiesChange={handleStudiesChange}
            onSymbolChange={setSelectedSymbol}
            onTimeframeChange={setSelectedTimeframe}
          />
        </div>

        {/* Alertas (espelho dos alertas MoreThanMoney) */}
        <div className="w-full mb-4">
          <MtmAlertsPanel onSelectAlert={handleSelectAlert} />
        </div>

        {/* Calculadora de posição */}
        <div className="w-full">
          <PositionCalculatorEN />
        </div>
      </div>
    </div>
  )
}
