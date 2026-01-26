"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "../../components/ui/button"
import TradingViewWidget from "../../components/trading-view-widget"
import PositionCalculatorEN from "../../components/position-calculator-en"
import ScannerScreener from "../../components/scanner-screener"
import { Loader2, LogOut, BarChart3 } from "lucide-react"
import Image from "next/image"

// Primeverse color palette
const PRIMEVERSE_COLORS = {
  primary: "#015BF9", // Primary blue
  white: "#FFFFFF", // White
  dark: "#040507", // Very dark black
  darkBlue: "#1200DE", // Dark blue
  lightGray: "#EDECED", // Light gray
}

const PRIMEVERSE_BASE_URL = "https://prime-verse.mn.co"
const PRIMEVERSE_FEED_URL = "https://prime-verse.mn.co/spaces/21704112/feed"
const PRIMEVERSE_LOGIN_URL = "https://prime-verse.mn.co/sign_in"
const PRIMEVERSE_API_KEY = process.env.NEXT_PUBLIC_PRIMEVERSE_API_KEY || "mn_eab2f6d4618dc90c1f816a31ce849cae07c893143a874c9fe701ef2e384cc6c7"
const PRODUCTION_URL = "https://charts-primeverse.vercel.app"

// Available studies (without KillShot, Supernova and Smartmonics)
const availableStudies = ["FreedomZone", "DirectEdge", "TruthSignal", "LibertyPoint", "SovereignSync"] as const
type StudyKey = (typeof availableStudies)[number]

// Debug helper - only logs in development
const debug = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...args)
  }
}

// Get the correct Charts Primeverse URL (production or local)
const getChartsPrimeverseUrl = () => {
  const isProduction = process.env.NODE_ENV === "production" || (typeof window !== "undefined" && window.location.hostname.includes("vercel.app"))
  return isProduction 
    ? `${PRODUCTION_URL}/charts-primeverse`
    : (typeof window !== "undefined" ? window.location.origin : "") + "/charts-primeverse"
}

export default function ChartsPrimeversePage() {
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(true) // Mostrar scanners por padrão quando logado
  const [selectedStudies, setSelectedStudies] = useState<StudyKey[]>(["FreedomZone"])

  // Detect if we're on a Prime Verse page and redirect seamlessly to Charts Primeverse
  useEffect(() => {
    if (typeof window === "undefined") return

    const hostname = window.location.hostname
    const referrer = document.referrer

    // Check if we're on prime-verse.mn.co domain (any page like /spaces/21082967/page, etc.)
    if (hostname === "prime-verse.mn.co" || hostname.includes("prime-verse.mn.co")) {
      debug("🔄 [PRIMEVERSE] Detected Prime Verse domain, redirecting seamlessly to Charts Primeverse...")
      // Redirect immediately to Charts Primeverse with scanners enabled
      const chartsUrl = getChartsPrimeverseUrl()
      // Use replace to avoid adding to history
      window.location.replace(chartsUrl)
      return
    }

    // Also check if we came from Prime Verse (referrer check)
    if (referrer && referrer.includes("prime-verse.mn.co") && !referrer.includes("charts-primeverse")) {
      debug("🔄 [PRIMEVERSE] Detected referrer from Prime Verse, ensuring we're on Charts Primeverse...")
      const chartsUrl = getChartsPrimeverseUrl()
      if (window.location.href !== chartsUrl) {
        window.location.replace(chartsUrl)
      }
    }
  }, [])

  // Verify Prime Verse authentication via feed
  useEffect(() => {
    let mounted = true

    const checkPrimeVerseAuth = async () => {
      try {
        setIsChecking(true)

        // Check if we're on prime-verse.mn.co domain - redirect immediately
        if (typeof window !== "undefined" && window.location.hostname === "prime-verse.mn.co") {
          debug("🔄 [PRIMEVERSE] Detected Prime Verse domain in auth check, redirecting...")
          const chartsUrl = getChartsPrimeverseUrl()
          window.location.href = chartsUrl
          return
        }

        // Check if there are return parameters after external login
        const urlParams = new URLSearchParams(window.location.search)
        const returnFromLogin = urlParams.get("return") === "true"
        const returnTo = urlParams.get("return_to")
        const loginToken = urlParams.get("token")
        const fromParam = urlParams.get("from")

        // If return_to is charts-primeverse, ensure we're on the right page
        if (returnTo === "charts-primeverse") {
          const chartsUrl = getChartsPrimeverseUrl()
          if (window.location.href !== chartsUrl) {
            debug("🔄 [PRIMEVERSE] Redirecting to Charts Primeverse based on return_to parameter")
            window.location.replace(chartsUrl)
            return
          }
        }

        const currentPath = window.location.pathname
        if (currentPath !== "/charts-primeverse" && currentPath.startsWith("/")) {
          debug("🔄 [PRIMEVERSE] Redirecting to Charts Primeverse from:", currentPath)
          window.location.href = getChartsPrimeverseUrl()
          return
        }

        // Quick check: if returning from login, minimal delay for cookie sync
        if (returnFromLogin || returnTo === "charts-primeverse" || loginToken || fromParam) {
          debug("🔄 [PRIMEVERSE] Returned from external login, quick cookie sync...")
          await new Promise((resolve) => setTimeout(resolve, 500))
          // Clean URL parameters
          window.history.replaceState({}, document.title, window.location.pathname)
        }

        // Fast authentication check - single attempt with timeout
        debug("🔍 [PRIMEVERSE] Fast authentication check...")

        try {
          // Use Promise.race to add timeout for faster failure
          const authCheck = fetch(`${PRIMEVERSE_BASE_URL}/api/v1/users/me`, {
            method: "GET",
            credentials: "include",
            mode: "cors",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${PRIMEVERSE_API_KEY}`,
              "X-API-Key": PRIMEVERSE_API_KEY,
            },
          })

          const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Timeout")), 3000)
          )

          const response = await Promise.race([authCheck, timeout]) as Response

          debug(`📡 [PRIMEVERSE] API Response status: ${response.status}`)

            if (response.ok) {
              const userData = await response.json()
              debug("✅ [PRIMEVERSE] User authenticated:", userData.email || userData.id || "User found")
              if (mounted) {
                setIsAuthenticated(true)
                setIsChecking(false)
                setShowHeatmap(true) // Ativar scanners automaticamente quando autenticado
              }
              return
          } else if (response.status === 401 || response.status === 403) {
            debug(`⚠️ [PRIMEVERSE] Authentication failed (${response.status})`)
            if (mounted) {
              redirectToLogin()
            }
            return
          }
        } catch (fetchError: any) {
          debug("⚠️ [PRIMEVERSE] Error fetching user data:", fetchError.message)
          
          // Quick fallback: try no-cors feed check
          if (fetchError.message?.includes("CORS") || fetchError.message?.includes("Failed to fetch") || fetchError.message?.includes("Timeout")) {
            debug("🔄 [PRIMEVERSE] Trying quick feed check...")
            
            try {
              const feedCheck = fetch(PRIMEVERSE_FEED_URL, {
                method: "GET",
                credentials: "include",
                mode: "no-cors",
              })
              
              const feedTimeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Feed timeout")), 2000)
              )
              
              await Promise.race([feedCheck, feedTimeout])
              
              debug("✅ [PRIMEVERSE] Feed accessible, assuming authenticated")
              if (mounted) {
                setIsAuthenticated(true)
                setIsChecking(false)
                setShowHeatmap(true) // Ativar scanners automaticamente quando autenticado
              }
              return
            } catch (feedError) {
              debug("⚠️ [PRIMEVERSE] Feed check failed, redirecting to login")
            }
          }
        }

        debug("⚠️ [PRIMEVERSE] No session found - redirecting to login")
        if (mounted) {
          redirectToLogin()
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ [PRIMEVERSE] Error verifying authentication:", error)
        }
        if (mounted) {
          redirectToLogin()
        }
      }
    }

    const redirectToLogin = () => {
      if (!mounted) return
      setIsChecking(false)
      const chartsPrimeverseUrl = getChartsPrimeverseUrl()
      // Add explicit return parameter to ensure we come back to Charts Primeverse
      const loginUrl = `${PRIMEVERSE_LOGIN_URL}?from=${encodeURIComponent(chartsPrimeverseUrl)}&return_to=charts-primeverse`
      debug("🔐 [PRIMEVERSE] Redirecting to login:", loginUrl)
      window.location.href = loginUrl
    }

    setMounted(true)
    checkPrimeVerseAuth()

    const handleFocus = () => {
      debug("🌐 [PRIMEVERSE] Page focused, verifying authentication again...")
      if (!isAuthenticated && mounted) {
        checkPrimeVerseAuth()
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isAuthenticated && mounted) {
        debug("👁️ [PRIMEVERSE] Page visible, verifying authentication...")
        checkPrimeVerseAuth()
      }
    }

    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Monitor for Prime Verse redirects - check periodically if we're on wrong domain
    const checkDomainInterval = setInterval(() => {
      if (!mounted) {
        clearInterval(checkDomainInterval)
        return
      }
      
      if (typeof window !== "undefined") {
        const hostname = window.location.hostname
        // If we're on prime-verse.mn.co, redirect to Charts Primeverse
        if (hostname === "prime-verse.mn.co" || hostname.includes("prime-verse.mn.co")) {
          debug("🔄 [PRIMEVERSE] Domain check: Detected Prime Verse domain, redirecting...")
          const chartsUrl = getChartsPrimeverseUrl()
          window.location.replace(chartsUrl)
          clearInterval(checkDomainInterval)
        }
      }
    }, 1000) // Check every second

    return () => {
      mounted = false
      clearInterval(checkDomainInterval)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isAuthenticated])

  // Filter allowed studies
  const handleStudiesChange = useCallback((studies: string[]) => {
    const filtered = studies.filter((s) => availableStudies.includes(s as StudyKey)) as StudyKey[]
    setSelectedStudies(filtered.length > 0 ? filtered : ["FreedomZone"])
  }, [])

  const handleLogout = () => {
    // Clear related cookies and localStorage
    document.cookie.split(";").forEach((c) => {
      if (c.trim().startsWith("_primeverse_session") || c.trim().startsWith("primeverse") || c.trim().includes("mn.co")) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      }
    })
    localStorage.removeItem("primeverse_session")
    sessionStorage.removeItem("primeverse_session")

    // Reset auth state
    setIsAuthenticated(false)
    setIsChecking(true)

    const chartsPrimeverseUrl = getChartsPrimeverseUrl()
    const loginUrl = `${PRIMEVERSE_LOGIN_URL}?from=${encodeURIComponent(chartsPrimeverseUrl)}`
    debug("🔐 [PRIMEVERSE] Logout - redirecting to login")
    window.location.href = loginUrl
  }

  if (!mounted || isChecking) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: PRIMEVERSE_COLORS.dark }}
      >
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
    // This should not be visible as redirect happens automatically
    // But keeping it as fallback in case redirect fails
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: PRIMEVERSE_COLORS.dark }}
      >
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
      {/* Header with Logo and Title */}
      <header
        className="border-b sticky top-0 z-50 backdrop-blur-sm"
        style={{ backgroundColor: PRIMEVERSE_COLORS.dark + "F0", borderColor: PRIMEVERSE_COLORS.primary + "30" }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Primeverse Logo - using provided images */}
            <div className="flex items-center gap-3">
              <Image src="/images/image.png" alt="Prime Verse" width={180} height={40} className="h-10 w-auto" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a href="https://prime-verse.mn.co/feed" target="_blank" rel="noopener noreferrer">
              <Button
                size="sm"
                variant="outline"
                className="h-9 px-4 text-sm font-medium rounded-lg transition-colors bg-transparent"
                style={{
                  backgroundColor: "transparent",
                  borderColor: PRIMEVERSE_COLORS.primary + "60",
                  color: PRIMEVERSE_COLORS.lightGray,
                  fontFamily: "'Gonero ExtExp Regular', sans-serif",
                }}
              >
                Prime Verse
              </Button>
            </a>

            <Button
              variant={showHeatmap ? "default" : "outline"}
              size="sm"
              className="h-9 px-4 text-sm font-medium rounded-lg transition-colors"
              style={
                showHeatmap
                  ? {
                      backgroundColor: PRIMEVERSE_COLORS.primary,
                      borderColor: PRIMEVERSE_COLORS.primary,
                      color: PRIMEVERSE_COLORS.white,
                      fontFamily: "'Gonero ExtExp Regular', sans-serif",
                    }
                  : {
                      backgroundColor: "transparent",
                      borderColor: PRIMEVERSE_COLORS.primary + "60",
                      color: PRIMEVERSE_COLORS.lightGray,
                      fontFamily: "'Gonero ExtExp Regular', sans-serif",
                    }
              }
              onClick={() => setShowHeatmap((prev) => !prev)}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
            </Button>

            <Button
              onClick={handleLogout}
              size="sm"
              variant="outline"
              className="h-9 px-3 text-xs font-medium border rounded-lg transition-colors bg-transparent"
              style={{
                backgroundColor: "transparent",
                borderColor: PRIMEVERSE_COLORS.primary + "60",
                color: PRIMEVERSE_COLORS.lightGray,
                fontFamily: "'Gonero ExtExp Regular', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = PRIMEVERSE_COLORS.primary + "20"
                e.currentTarget.style.color = PRIMEVERSE_COLORS.white
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent"
                e.currentTarget.style.color = PRIMEVERSE_COLORS.lightGray
              }}
            >
              <LogOut className="h-3 w-3 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* TradingView Widget */}
      <div className="w-full px-4 py-6">
        <div
          className="max-w-[98%] mx-auto rounded-lg border p-4 mb-6"
          style={{ backgroundColor: PRIMEVERSE_COLORS.dark, borderColor: PRIMEVERSE_COLORS.primary + "20" }}
        >
          <TradingViewWidget
            externalStudies={selectedStudies as any}
            excludedStudies={["KillShot", "Supernova", "Smartmonics"] as string[]}
            onStudiesChange={handleStudiesChange}
          />
        </div>

        {/* Heatmap - aparece logo abaixo do TradingView Widget */}
        {showHeatmap && (
          <div className="max-w-[98%] mx-auto mb-6">
            <ScannerScreener mode="desktop" />
          </div>
        )}

        {/* Position Size Calculator */}
        <div className="max-w-[98%] mx-auto">
          <PositionCalculatorEN />
        </div>
      </div>
    </div>
  )
}
