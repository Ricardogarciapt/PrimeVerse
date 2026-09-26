"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "../../components/ui/button"
import TradingViewWidget from "../../components/trading-view-widget"
import PositionCalculatorEN from "../../components/position-calculator-en"
import MtmAlertsPanel from "../../components/mtm-alerts-panel"
import { Loader2, LogOut, Sun, Moon, Users } from "lucide-react"
import Image from "next/image"
import EmbedHeightReporter from "../../components/embed-height-reporter"
import { lerModoEmbed } from "../../lib/embed"

// Primeverse color palette (ref. hub.primeverse.ca)
const PRIMEVERSE_COLORS = {
  primary: "#015BF9",
  cyan: "#22D3EE",
  white: "#FFFFFF",
  dark: "#040507",
  darkBlue: "#1200DE",
  lightGray: "#EDECED",
}

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

/**
 * O ecrã dos gráficos. Quem pode vê-lo já foi decidido no servidor (page.tsx):
 * aqui não há verificação de sessão nem formulário de login.
 */
export default function ChartsPrimeverseClient({ podeSair }: { podeSair: boolean }) {
  const { resolvedTheme, setTheme } = useTheme()
  const searchParams = useSearchParams()
  // ?embed=1 (ou ?chrome=0) → sem cabeçalho nosso; &panels=1 traz os painéis de volta.
  const { embutido, painéis } = lerModoEmbed(searchParams)
  const [mounted, setMounted] = useState(false)
  const [selectedStudies, setSelectedStudies] = useState<StudyKey[]>(["AurumFlow"])
  const [selectedSymbol, setSelectedSymbol] = useState("OANDA:XAUUSD")
  const [selectedTimeframe, setSelectedTimeframe] = useState("15")

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

  /** Só existe para quem entrou com sessão própria; a partir da PrimeVerse não há de onde sair. */
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      /* ignore */
    }
    window.location.reload()
  }

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark")

  if (!mounted) {
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

  return (
    <div
      className={
        embutido
          ? painéis
            ? // Com painéis a altura vem do CONTEÚDO e é o pai que segue. Nada de `dvh` aqui:
              // dentro do iframe `100dvh` é a altura do iframe, e crescê-la realimentava-se.
              "flex flex-col"
            : // Sem painéis o embed é uma só folha da altura do iframe: os controlos e o
              // gráfico cabem todos, e não há scroll dentro do iframe para chegar a eles.
              "h-[100dvh] min-h-[600px] overflow-hidden flex flex-col"
          : "min-h-screen"
      }
      style={{ backgroundColor: PRIMEVERSE_COLORS.dark, color: PRIMEVERSE_COLORS.white }}
    >
      {embutido && <EmbedHeightReporter />}
      {!embutido && (
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

            {podeSair && (
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
            )}
          </div>
        </div>
      </header>
      )}

      {/* Desktop aproveita o ecrã todo (w-full, padding mínimo); mobile empilha */}
      <div
        className={
          embutido
            ? "w-full flex-1 min-h-0 flex flex-col px-1.5 sm:px-2 py-1.5 gap-3"
            : "w-full px-2 sm:px-3 lg:px-4 py-3"
        }
      >
        {/* Chart — no embed come a altura útil toda; fora dele mantém a moldura */}
        <div
          className={
            embutido
              ? painéis
                ? // Com painéis a página cresce e o pai segue-a: a altura do gráfico TEM de ser
                  // em px. Em `vh` entrava em ciclo — o iframe crescia, o `vh` crescia com ele.
                  "w-full h-[440px] sm:h-[560px] lg:h-[640px]"
                : "w-full flex-1 min-h-0"
              : "w-full rounded-lg border p-1.5 sm:p-2 mb-4"
          }
          style={{
            backgroundColor: PRIMEVERSE_COLORS.dark,
            borderColor: embutido ? undefined : PRIMEVERSE_COLORS.primary + "20",
          }}
        >
          <TradingViewWidget
            externalStudies={selectedStudies as any}
            externalSymbol={selectedSymbol}
            externalTimeframe={selectedTimeframe}
            externalTheme={resolvedTheme === "light" ? "light" : "dark"}
            excludedStudies={[] as string[]}
            fillParent={embutido}
            onStudiesChange={handleStudiesChange}
            onSymbolChange={setSelectedSymbol}
            onTimeframeChange={setSelectedTimeframe}
          />
        </div>

        {painéis && (
          <>
            {/* Alertas (espelho dos alertas MoreThanMoney) */}
            <div className="w-full mb-4">
              <MtmAlertsPanel onSelectAlert={handleSelectAlert} />
            </div>

            {/* Calculadora de posição */}
            <div className="w-full">
              <PositionCalculatorEN />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
