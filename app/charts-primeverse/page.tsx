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
// API Key for Prime Verse authentication
const PRIMEVERSE_API_KEY = process.env.NEXT_PUBLIC_PRIMEVERSE_API_KEY || "mn_eab2f6d4618dc90c1f816a31ce849cae07c893143a874c9fe701ef2e384cc6c7"

// Available studies (without KillShot, Supernova and Smartmonics)
const availableStudies = ["FreedomZone", "DirectEdge", "TruthSignal", "LibertyPoint", "SovereignSync"] as const
type StudyKey = (typeof availableStudies)[number]

export default function ChartsPrimeversePage() {
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [selectedStudies, setSelectedStudies] = useState<StudyKey[]>(["FreedomZone"])

  // Verify Prime Verse authentication via feed
  useEffect(() => {
    let mounted = true

    const checkPrimeVerseAuth = async () => {
      try {
        setIsChecking(true)

        // Check if there are return parameters after external login
        const urlParams = new URLSearchParams(window.location.search)
        const returnFromLogin = urlParams.get("return") === "true"
        const loginToken = urlParams.get("token")
        const fromParam = urlParams.get("from")

        // If returned from login, wait a bit for session to sync
        if (returnFromLogin || loginToken || fromParam) {
          console.log("🔄 [PRIMEVERSE] Returned from external login, waiting for cookies to sync...")
          console.log("📋 [PRIMEVERSE] URL params:", { returnFromLogin, loginToken, fromParam })
          
          // Wait longer for cookies to be set by the browser
          await new Promise((resolve) => setTimeout(resolve, 3000))

          // Clear URL parameters after waiting
          if (returnFromLogin || loginToken || fromParam) {
            window.history.replaceState({}, document.title, window.location.pathname)
            console.log("🧹 [PRIMEVERSE] URL parameters cleared")
          }
        }

        // Verify session by making API call to check authentication
        let attempts = 0
        const maxAttempts = 3

        while (attempts < maxAttempts && mounted) {
          attempts++
          console.log(`🔍 [PRIMEVERSE] Attempt ${attempts}/${maxAttempts} to verify session...`)

          try {
            // Try to verify by fetching user info from API
            const response = await fetch(`${PRIMEVERSE_BASE_URL}/api/v1/users/me`, {
              method: "GET",
              credentials: "include", // Important: include cookies
              mode: "cors",
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${PRIMEVERSE_API_KEY}`,
                "X-API-Key": PRIMEVERSE_API_KEY,
              },
            })

            console.log(`📡 [PRIMEVERSE] API Response status: ${response.status}`)

            if (response.ok) {
              const userData = await response.json()
              console.log("✅ [PRIMEVERSE] User authenticated:", userData.email || userData.id || "User found")
              if (mounted) {
                setIsAuthenticated(true)
                setIsChecking(false)
              }
              return
            } else if (response.status === 401 || response.status === 403) {
              console.log(`⚠️ [PRIMEVERSE] Authentication failed (${response.status}), user not logged in`)
              // Continue to next attempt or redirect
            } else {
              console.log(`⚠️ [PRIMEVERSE] Unexpected response status: ${response.status}`)
            }
          } catch (fetchError: any) {
            console.log("⚠️ [PRIMEVERSE] Error fetching user data:", fetchError.message)
            
            // If CORS error, try alternative method: check if we can access the feed page
            if (fetchError.message?.includes("CORS") || fetchError.message?.includes("Failed to fetch")) {
              console.log("🔄 [PRIMEVERSE] CORS error detected, trying alternative verification...")
              
              try {
                // Try to fetch feed page (no-cors mode to avoid CORS issues)
                const feedResponse = await fetch(PRIMEVERSE_FEED_URL, {
                  method: "GET",
                  credentials: "include",
                  mode: "no-cors", // This won't throw CORS errors but we can't read response
                })
                
                // If no error, assume authenticated (cookies are being sent)
                console.log("✅ [PRIMEVERSE] Feed accessible (no-cors), assuming authenticated")
                if (mounted) {
                  setIsAuthenticated(true)
                  setIsChecking(false)
                }
                return
              } catch (feedError) {
                console.log("⚠️ [PRIMEVERSE] Feed check also failed:", feedError)
              }
            }
          }

          // If no cookies on first attempt, wait a bit (might be loading)
          if (attempts < maxAttempts) {
            const waitTime = attempts * 1500 // Increased wait time
            console.log(`⏳ [PRIMEVERSE] Waiting ${waitTime}ms before next attempt...`)
            await new Promise((resolve) => setTimeout(resolve, waitTime))
          }
        }

        // If we got here after all attempts, no session found
        console.log("⚠️ [PRIMEVERSE] No session found after all attempts - redirecting to login")
        if (mounted) {
          redirectToLogin()
        }
      } catch (error) {
        console.error("❌ [PRIMEVERSE] Error verifying authentication:", error)
        if (mounted) {
          redirectToLogin()
        }
      }
    }

    const redirectToLogin = () => {
      if (!mounted) return
      setIsChecking(false)
      // Redirect to login with return URL
      const currentUrl = window.location.origin + window.location.pathname
      const loginUrl = `${PRIMEVERSE_LOGIN_URL}?from=${encodeURIComponent(currentUrl)}`
      console.log("🔐 [PRIMEVERSE] No authentication found")
      console.log("🔐 [PRIMEVERSE] Current URL:", currentUrl)
      console.log("🔐 [PRIMEVERSE] Redirecting to login:", loginUrl)
      window.location.href = loginUrl
    }

    setMounted(true)
    checkPrimeVerseAuth()

    // Add listener for when page gains focus (after returning from login)
    const handleFocus = () => {
      console.log("🌐 [PRIMEVERSE] Page focused, verifying authentication again...")
      if (!isAuthenticated && mounted) {
        checkPrimeVerseAuth()
      }
    }

    // Add listener for when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isAuthenticated && mounted) {
        console.log("👁️ [PRIMEVERSE] Page visible, verifying authentication...")
        checkPrimeVerseAuth()
      }
    }

    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      mounted = false
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

    // Redirect to login
    const currentUrl = window.location.href
    const loginUrl = `${PRIMEVERSE_LOGIN_URL}?from=${encodeURIComponent(currentUrl)}`
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
            excludedStudies={["KillShot", "Supernova", "Smartmonics"]}
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
