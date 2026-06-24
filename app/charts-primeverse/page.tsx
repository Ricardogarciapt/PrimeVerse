"use client"

import { useEffect, useState, useCallback } from "react"
import { useTheme } from "next-themes"
import { Button } from "../../components/ui/button"
import TradingViewWidget from "../../components/trading-view-widget"
import PositionCalculatorEN from "../../components/position-calculator-en"
import ScannerScreener from "../../components/scanner-screener"
import TickerTape from "../../components/ticker-tape"
import { Loader2, LogOut, BarChart3, Sun, Moon } from "lucide-react"
import Image from "next/image"

// Primeverse color palette
const PRIMEVERSE_COLORS = {
  primary: "#015BF9",
  white: "#FFFFFF",
  dark: "#040507",
  darkBlue: "#1200DE",
  lightGray: "#EDECED",
}

const PRIMEVERSE_LOGIN_URL = "https://prime-verse.mn.co/sign_in"

// Available studies (without KillShot, Supernova and Smartmonics)
const availableStudies = ["FreedomZone", "DirectEdge", "TruthSignal", "LibertyPoint", "SovereignSync"] as const
type StudyKey = (typeof availableStudies)[number]

const debug = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") console.log(...args)
}

export default function ChartsPrimeversePage() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [selectedStudies, setSelectedStudies] = useState<StudyKey[]>(["FreedomZone"])

  // Restore persisted UI preferences (client-only)
  useEffect(() => {
    setMounted(true)
    try {
      const savedHeatmap = localStorage.getItem("primeverse_show_heatmap")
      if (savedHeatmap !== null) setShowHeatmap(savedHeatmap === "true")
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
          redirectToLogin()
        }
      } catch (error) {
        debug("Auth check failed:", error)
        if (active) redirectToLogin()
      }
    }

    const redirectToLogin = () => {
      setIsChecking(false)
      const returnUrl = `${window.location.origin}/api/auth/login?return_to=/charts-primeverse`
      window.location.href = `${PRIMEVERSE_LOGIN_URL}?from=${encodeURIComponent(returnUrl)}`
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

  // Persist heatmap toggle
  useEffect(() => {
    if (mounted) localStorage.setItem("primeverse_show_heatmap", String(showHeatmap))
  }, [showHeatmap, mounted])

  const handleStudiesChange = useCallback((studies: string[]) => {
    const filtered = studies.filter((s) => availableStudies.includes(s as StudyKey)) as StudyKey[]
    setSelectedStudies(filtered.length > 0 ? filtered : ["FreedomZone"])
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      /* ignore */
    }
    setIsAuthenticated(false)
    setIsChecking(true)
    const returnUrl = `${window.location.origin}/api/auth/login?return_to=/charts-primeverse`
    window.location.href = `${PRIMEVERSE_LOGIN_URL}?from=${encodeURIComponent(returnUrl)}`
  }

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark")

  if (!mounted || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: PRIMEVERSE_COLORS.dark }}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: PRIMEVERSE_COLORS.primary }} />
          <p style={{ color: PRIMEVERSE_COLORS.lightGray, fontFamily: "'Gonero ExtExp Regular', sans-serif" }}>
            Checking access...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: PRIMEVERSE_COLORS.dark }}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: PRIMEVERSE_COLORS.primary }} />
          <p style={{ color: PRIMEVERSE_COLORS.lightGray, fontFamily: "'Gonero ExtExp Regular', sans-serif" }}>
            Redirecting to login...
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
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 shrink-0">
            <Image src="/images/image.png" alt="Prime Verse" width={180} height={40} className="h-9 w-auto sm:h-10" priority />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <a href="https://prime-verse.mn.co/feed" target="_blank" rel="noopener noreferrer" className="hidden sm:block">
              <Button
                size="sm"
                variant="outline"
                className="h-9 px-4 text-sm font-medium rounded-lg bg-transparent"
                style={{
                  borderColor: PRIMEVERSE_COLORS.primary + "60",
                  color: PRIMEVERSE_COLORS.lightGray,
                  fontFamily: "'Gonero ExtExp Regular', sans-serif",
                }}
              >
                Community
              </Button>
            </a>

            <Button
              variant={showHeatmap ? "default" : "outline"}
              size="sm"
              className="h-9 px-3 sm:px-4 text-sm font-medium rounded-lg"
              style={
                showHeatmap
                  ? { backgroundColor: PRIMEVERSE_COLORS.primary, borderColor: PRIMEVERSE_COLORS.primary, color: PRIMEVERSE_COLORS.white }
                  : { backgroundColor: "transparent", borderColor: PRIMEVERSE_COLORS.primary + "60", color: PRIMEVERSE_COLORS.lightGray }
              }
              onClick={() => setShowHeatmap((prev) => !prev)}
              aria-pressed={showHeatmap}
            >
              <BarChart3 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{showHeatmap ? "Hide Markets" : "Show Markets"}</span>
            </Button>

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

      {/* Live market ticker */}
      <TickerTape />

      <div className="w-full px-4 py-6">
        <div
          className="max-w-[98%] mx-auto rounded-lg border p-4 mb-6"
          style={{ backgroundColor: PRIMEVERSE_COLORS.dark, borderColor: PRIMEVERSE_COLORS.primary + "20" }}
        >
          <TradingViewWidget
            externalStudies={selectedStudies as any}
            externalTheme={resolvedTheme === "light" ? "light" : "dark"}
            excludedStudies={["KillShot", "Supernova", "Smartmonics"] as string[]}
            onStudiesChange={handleStudiesChange}
          />
        </div>

        {showHeatmap && (
          <div className="max-w-[98%] mx-auto mb-6">
            <ScannerScreener mode="desktop" />
          </div>
        )}

        <div className="max-w-[98%] mx-auto">
          <PositionCalculatorEN />
        </div>
      </div>
    </div>
  )
}
