"use client"

import { useEffect, useRef, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle,
  Search,
  Crown,
  Waves,
  Shield,
  ChevronDown,
  Settings,
  Save,
  FolderOpen,
  Maximize2,
  Sun,
  Moon,
  Clock,
  X,
  Target,
  Activity,
  Sparkles,
  Coins,
  DollarSign,
  Bitcoin,
  BarChart3,
  TrendingUp,
  RotateCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Ordem explícita dos scanners (mantém a ordem dos botões) — nomes/IDs MTM, cores PrimeVerse
const scannerOrder = [
  "GoldenZone",
  "Momentum",
  "AurumFlow",
  "Winzone",
  "Sinergy",
  "Goldkiller",
  "MTMScanner",
  "Sensei",
] as const

type ScannerKey = (typeof scannerOrder)[number]

// Debug helper - only logs in development
const debug = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...args)
  }
}

// Scanners disponíveis — nomes e IDs Pine IGUAIS ao scanner-access do MTM (scanner-mobile.tsx)
const scannerStudies: Record<ScannerKey, string[]> = {
  GoldenZone: ["PUB;0b373fb0e6634a73bc8b838cf0690725"],
  Momentum: ["PUB;00ec48baf0ee43f0a43e1658bb54cdab", "PUB;38080827cf244587b5e7dbb9f272db0a"],
  AurumFlow: ["PUB;039b58f362ea4bbeb81867687c2fffd5"],
  Winzone: [
    "PUB;6c003d30b2154ef3a31074d5c703954f",
    "PUB;e6adb5e5246c43f4a8dcffde5c98db4e",
    "PUB;162198dcae874d5da28f7b048feb76e7",
    "PUB;b6587ba7dc7b4489927cfd94d1fb8a9f",
    "PUB;0bf15eb0edba447f84e19fce69391ccb",
  ],
  Sinergy: ["PUB;3b86bd1192124fd98583490bb7508041"],
  Goldkiller: ["PUB;a3eaa6af54de4202a2c2f807fd8baa08"],
  MTMScanner: ["PUB;134fd950920e435694c40be33e3aa98f"],
  Sensei: ["PUB;73e1daff8be44976998dade66c6a11d7"],
}

// Nomes visíveis = nomes MTM
const scannerLabels: Record<ScannerKey, string> = {
  GoldenZone: "Golden Zone",
  Momentum: "Momentum",
  AurumFlow: "Aurum Flow",
  Winzone: "Sniper Pro",
  Sinergy: "Quantum",
  Goldkiller: "GoldKiller",
  MTMScanner: "MTM",
  Sensei: "Sensei",
}

// Ícones + gradientes (paleta PrimeVerse — azul elétrico / ciano / roxo)
const scannerLogos: Record<ScannerKey, { icon: any; color: string; bgColor: string }> = {
  GoldenZone: { icon: Crown, color: "text-blue-200", bgColor: "bg-gradient-to-r from-[#015BF9] to-blue-400" },
  Momentum: { icon: Waves, color: "text-cyan-200", bgColor: "bg-gradient-to-r from-cyan-500 to-sky-400" },
  AurumFlow: { icon: Sparkles, color: "text-indigo-200", bgColor: "bg-gradient-to-r from-indigo-500 to-blue-500" },
  Winzone: { icon: Target, color: "text-violet-200", bgColor: "bg-gradient-to-r from-violet-600 to-purple-500" },
  Sinergy: { icon: Search, color: "text-fuchsia-200", bgColor: "bg-gradient-to-r from-fuchsia-600 to-pink-500" },
  Goldkiller: { icon: Shield, color: "text-blue-200", bgColor: "bg-gradient-to-r from-blue-700 to-indigo-600" },
  MTMScanner: { icon: Activity, color: "text-teal-200", bgColor: "bg-gradient-to-r from-teal-500 to-cyan-500" },
  Sensei: { icon: AlertCircle, color: "text-purple-200", bgColor: "bg-gradient-to-r from-purple-600 to-violet-500" },
}

// Categorias de ativos
const assetCategories = {
  commodities: [
    { value: "OANDA:XAUUSD", label: "Gold (XAU/USD)", popular: true },
    { value: "OANDA:XAGUSD", label: "Silver (XAG/USD)", popular: true },
    { value: "OANDA:XPTUSD", label: "Platinum (XPT/USD)", popular: false },
    { value: "OANDA:XPDUSD", label: "Palladium (XPD/USD)", popular: false },
    { value: "OANDA:WTICOUSD", label: "WTI Crude Oil", popular: true },
    { value: "OANDA:BCOUSD", label: "Brent Crude Oil", popular: true },
    { value: "OANDA:NATGASUSD", label: "Natural Gas", popular: false },
    { value: "OANDA:CORNUSD", label: "Corn", popular: false },
    { value: "OANDA:WHEATUSD", label: "Wheat", popular: false },
    { value: "OANDA:SOYBNUSD", label: "Soybeans", popular: false },
    { value: "OANDA:SUGARUSD", label: "Sugar", popular: false },
    { value: "OANDA:XCUUSD", label: "Copper", popular: true },
  ],
  forex: [
    { value: "OANDA:EURUSD", label: "EUR/USD", popular: true },
    { value: "OANDA:GBPUSD", label: "GBP/USD", popular: true },
    { value: "OANDA:USDJPY", label: "USD/JPY", popular: true },
    { value: "OANDA:AUDUSD", label: "AUD/USD", popular: true },
    { value: "OANDA:USDCAD", label: "USD/CAD", popular: true },
    { value: "OANDA:USDCHF", label: "USD/CHF", popular: true },
    { value: "OANDA:NZDUSD", label: "NZD/USD", popular: true },
    { value: "OANDA:EURGBP", label: "EUR/GBP", popular: false },
    { value: "OANDA:EURJPY", label: "EUR/JPY", popular: false },
    { value: "OANDA:GBPJPY", label: "GBP/JPY", popular: false },
    { value: "OANDA:AUDJPY", label: "AUD/JPY", popular: false },
    { value: "OANDA:EURAUD", label: "EUR/AUD", popular: false },
    { value: "OANDA:EURCHF", label: "EUR/CHF", popular: false },
    { value: "OANDA:AUDCAD", label: "AUD/CAD", popular: false },
    { value: "OANDA:GBPAUD", label: "GBP/AUD", popular: false },
    { value: "OANDA:GBPCAD", label: "GBP/CAD", popular: false },
    { value: "OANDA:GBPCHF", label: "GBP/CHF", popular: false },
    { value: "OANDA:AUDCHF", label: "AUD/CHF", popular: false },
    { value: "OANDA:CADJPY", label: "CAD/JPY", popular: false },
    { value: "OANDA:CHFJPY", label: "CHF/JPY", popular: false },
    { value: "OANDA:EURNZD", label: "EUR/NZD", popular: false },
    { value: "OANDA:GBPNZD", label: "GBP/NZD", popular: false },
    { value: "OANDA:NZDJPY", label: "NZD/JPY", popular: false },
    { value: "OANDA:AUDNZD", label: "AUD/NZD", popular: false },
    { value: "OANDA:CADCHF", label: "CAD/CHF", popular: false },
  ],
  crypto: [
    { value: "BINANCE:BTCUSDT", label: "Bitcoin (BTC)", popular: true },
    { value: "BINANCE:ETHUSDT", label: "Ethereum (ETH)", popular: true },
    { value: "BINANCE:BNBUSDT", label: "Binance Coin (BNB)", popular: true },
    { value: "BINANCE:XRPUSDT", label: "Ripple (XRP)", popular: true },
    { value: "BINANCE:ADAUSDT", label: "Cardano (ADA)", popular: true },
    { value: "BINANCE:SOLUSDT", label: "Solana (SOL)", popular: true },
    { value: "BINANCE:DOTUSDT", label: "Polkadot (DOT)", popular: false },
    { value: "BINANCE:DOGEUSDT", label: "Dogecoin (DOGE)", popular: true },
    { value: "BINANCE:MATICUSDT", label: "Polygon (MATIC)", popular: false },
    { value: "BINANCE:LINKUSDT", label: "Chainlink (LINK)", popular: false },
    { value: "BINANCE:LTCUSDT", label: "Litecoin (LTC)", popular: true },
    { value: "BINANCE:AVAXUSDT", label: "Avalanche (AVAX)", popular: false },
    { value: "BINANCE:UNIUSDT", label: "Uniswap (UNI)", popular: false },
    { value: "BINANCE:ATOMUSDT", label: "Cosmos (ATOM)", popular: false },
    { value: "BINANCE:VETUSDT", label: "VeChain (VET)", popular: false },
    { value: "BINANCE:ICPUSDT", label: "Internet Computer (ICP)", popular: false },
    { value: "BINANCE:FILUSDT", label: "Filecoin (FIL)", popular: false },
    { value: "BINANCE:TRXUSDT", label: "Tron (TRX)", popular: false },
    { value: "BINANCE:ETCUSDT", label: "Ethereum Classic (ETC)", popular: false },
    { value: "BINANCE:XLMUSDT", label: "Stellar (XLM)", popular: false },
  ],
  indices: [
    { value: "OANDA:SPX500USD", label: "S&P 500", popular: true },
    { value: "OANDA:NAS100USD", label: "NASDAQ 100", popular: true },
    { value: "OANDA:US30USD", label: "Dow Jones 30", popular: true },
    { value: "OANDA:UK100GBP", label: "FTSE 100 (UK)", popular: true },
    { value: "OANDA:DE30EUR", label: "DAX 30 (Germany)", popular: true },
    { value: "OANDA:FR40EUR", label: "CAC 40 (France)", popular: false },
    { value: "OANDA:JP225USD", label: "Nikkei 225 (Japan)", popular: true },
    { value: "OANDA:AU200AUD", label: "ASX 200 (Australia)", popular: false },
    { value: "OANDA:HK33HKD", label: "Hang Seng (Hong Kong)", popular: false },
    { value: "OANDA:US2000USD", label: "Russell 2000", popular: false },
    { value: "CAPITALCOM:DXY", label: "Dollar Index (DXY)", popular: true },
    { value: "TVC:VIX", label: "VIX (Volatility)", popular: true },
  ],
  stocks: [
    { value: "NASDAQ:AAPL", label: "Apple Inc.", popular: true },
    { value: "NASDAQ:MSFT", label: "Microsoft", popular: true },
    { value: "NASDAQ:GOOGL", label: "Alphabet (Google)", popular: true },
    { value: "NASDAQ:AMZN", label: "Amazon", popular: true },
    { value: "NASDAQ:TSLA", label: "Tesla", popular: true },
    { value: "NASDAQ:META", label: "Meta (Facebook)", popular: true },
    { value: "NASDAQ:NVDA", label: "NVIDIA", popular: true },
    { value: "NYSE:JPM", label: "JPMorgan Chase", popular: false },
    { value: "NYSE:V", label: "Visa", popular: false },
    { value: "NYSE:WMT", label: "Walmart", popular: false },
  ],
}

const timeframes = [
  { value: "1", label: "1 min" },
  { value: "5", label: "5 min" },
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
  { value: "60", label: "1 hour" },
  { value: "240", label: "4 hours" },
  { value: "D", label: "1 day" },
  { value: "W", label: "1 week" },
]

// Categorias com ícone (linha de botões — estilo scanner-mobile)
const categoryMeta: Record<keyof typeof assetCategories, { icon: any; label: string }> = {
  commodities: { icon: Coins, label: "Commodities" },
  forex: { icon: DollarSign, label: "Forex" },
  crypto: { icon: Bitcoin, label: "Crypto" },
  indices: { icon: BarChart3, label: "Indices" },
  stocks: { icon: TrendingUp, label: "Stocks" },
}

declare global {
  interface Window {
    TradingView?: any
  }
}

interface SavedChart {
  id: string
  name: string
  symbol: string
  data: any
  timestamp: number
}

export default function TradingViewWidget({
  scannerType = "GoldenZone",
  // Optional props for external control (used by the layout system)
  externalSymbol,
  externalTimeframe,
  externalTheme,
  externalStudies,
  excludedStudies,
  onSymbolChange,
  onTimeframeChange,
  onThemeChange,
  onStudiesChange,
}: {
  scannerType?: ScannerKey
  externalSymbol?: string
  externalTimeframe?: string
  externalTheme?: "light" | "dark"
  externalStudies?: ScannerKey[]
  excludedStudies?: string[]
  onSymbolChange?: (symbol: string) => void
  onTimeframeChange?: (timeframe: string) => void
  onThemeChange?: (theme: "light" | "dark") => void
  onStudiesChange?: (studies: ScannerKey[]) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<any>(null)
  const [widgetLoaded, setWidgetLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isLoadingScanner = useRef(false)

  // Estados - usar props externas se fornecidas, senão usar localStorage
  const [selectedStudies, setSelectedStudies] = useState<ScannerKey[]>(() => {
    if (externalStudies) return externalStudies
    const saved = localStorage.getItem("primeverse_active_scanners")
    const parsed: ScannerKey[] = saved ? JSON.parse(saved) : []
    // Sanitiza chaves antigas (nomes anteriores) — mantém só scanners válidos
    const valid = parsed.filter((k) => (scannerOrder as readonly string[]).includes(k))
    return valid.length ? valid : (["AurumFlow"] as ScannerKey[])
  })
  const [selectedSymbol, setSelectedSymbol] = useState(externalSymbol || "OANDA:XAUUSD")
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (externalTheme) return externalTheme
    const saved = localStorage.getItem("primeverse_chart_theme")
    return (saved as "light" | "dark") || "dark"
  })
  const [favoriteTimeframe, setFavoriteTimeframe] = useState(() => {
    if (externalTimeframe) return externalTimeframe
    const saved = localStorage.getItem("primeverse_favorite_timeframe")
    return saved || "15"
  })

  // Sincronizar com props externas quando mudarem
  useEffect(() => {
    if (externalSymbol) setSelectedSymbol(externalSymbol)
  }, [externalSymbol])

  useEffect(() => {
    if (externalTimeframe) setFavoriteTimeframe(externalTimeframe)
  }, [externalTimeframe])

  useEffect(() => {
    if (externalTheme) setTheme(externalTheme)
  }, [externalTheme])

  useEffect(() => {
    if (externalStudies) {
      debug("📊 [TRADINGVIEW] Updating studies via external props:", externalStudies)
      setSelectedStudies(externalStudies)
    }
  }, [externalStudies])

  // Dropdown de ativos
  const [showAssetDropdown, setShowAssetDropdown] = useState(false)
  const [assetSearchTerm, setAssetSearchTerm] = useState("")
  // Categoria inicial = a que contém o símbolo selecionado (evita Select vazio no arranque)
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof assetCategories>(() => {
    const cats = Object.keys(assetCategories) as Array<keyof typeof assetCategories>
    const found = cats.find((c) => assetCategories[c].some((a) => a.value === (externalSymbol || "OANDA:XAUUSD")))
    return found || "commodities"
  })

  // Configurações
  const [showSettings, setShowSettings] = useState(false)

  // Gráficos salvos
  const [savedCharts, setSavedCharts] = useState<SavedChart[]>(() => {
    const saved = localStorage.getItem("primeverse_saved_charts")
    return saved ? JSON.parse(saved) : []
  })
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [chartNameToSave, setChartNameToSave] = useState("")

  // Persistir estudos selecionados
  useEffect(() => {
    localStorage.setItem("primeverse_active_scanners", JSON.stringify(selectedStudies))
  }, [selectedStudies])

  // Persistir tema
  useEffect(() => {
    localStorage.setItem("primeverse_chart_theme", theme)
  }, [theme])

  // Persistir timeframe favorito
  useEffect(() => {
    localStorage.setItem("primeverse_favorite_timeframe", favoriteTimeframe)
  }, [favoriteTimeframe])

  // Persistir gráficos salvos
  useEffect(() => {
    localStorage.setItem("primeverse_saved_charts", JSON.stringify(savedCharts))
  }, [savedCharts])

  const toggleStudy = (study: ScannerKey) => {
    setSelectedStudies((prev) => {
      const newStudies = prev.includes(study) ? prev.filter((s) => s !== study) : [...prev, study]
      if (onStudiesChange) onStudiesChange(newStudies)
      return newStudies
    })
  }

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol)
    if (onSymbolChange) onSymbolChange(symbol)
    setShowAssetDropdown(false)
    setAssetSearchTerm("")
  }

  // Trocar de categoria seleciona o 1.º ativo dessa categoria (como no scanner-mobile)
  const selectCategory = (cat: keyof typeof assetCategories) => {
    setSelectedCategory(cat)
    const first = assetCategories[cat][0]
    if (first) handleSymbolSelect(first.value)
  }

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme)
    if (onThemeChange) onThemeChange(newTheme)
  }

  const handleTimeframeChange = (newTimeframe: string) => {
    setFavoriteTimeframe(newTimeframe)
    if (onTimeframeChange) onTimeframeChange(newTimeframe)
  }

  const handleSaveChart = async () => {
    if (!chartNameToSave.trim()) {
      alert("Please enter a name for the chart")
      return
    }

    if (savedCharts.length >= 20) {
      alert("Limit of 20 saved charts reached. Delete an old chart to save a new one.")
      return
    }

    try {
      // Salvar estado completo do gráfico
      const chartState = {
        symbol: selectedSymbol,
        studies: selectedStudies,
        theme: theme,
        timeframe: favoriteTimeframe,
        timestamp: Date.now(),
      }

      const newChart: SavedChart = {
        id: Date.now().toString(),
        name: chartNameToSave,
        symbol: selectedSymbol,
        data: chartState,
        timestamp: Date.now(),
      }

      setSavedCharts((prev) => [...prev, newChart])
      setChartNameToSave("")
      setShowSaveDialog(false)

      alert(`✅ Chart "${newChart.name}" saved successfully!`)
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error saving chart:", error)
      }
      alert("❌ Error saving chart. Please try again.")
    }
  }

  const handleLoadChart = async (chart: SavedChart) => {
    try {
      debug("📂 Loading chart:", chart.name)
      if (chart.data) {
        setSelectedSymbol(chart.data.symbol || chart.symbol)
        setSelectedStudies(chart.data.studies || [])
        handleThemeChange(chart.data.theme || "dark")
        handleTimeframeChange(chart.data.timeframe || "60")
      }

      setShowLoadDialog(false)
      alert(`✅ Chart "${chart.name}" loaded successfully!`)
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error loading chart:", error)
      }
      alert("❌ Error loading chart. Please try again.")
    }
  }

  const handleDeleteChart = (chartId: string) => {
    if (confirm("Are you sure you want to delete this chart?")) {
      setSavedCharts((prev) => prev.filter((c) => c.id !== chartId))
    }
  }

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        containerRef.current.requestFullscreen()
      }
    }
  }

  const loadTradingViewWidget = async () => {
    if (!window.TradingView) {
      setError("TradingView is not available. Please try reloading the page.")
      return
    }

    if (isLoadingScanner.current) return
    isLoadingScanner.current = true

    try {
      if (containerRef.current) {
        containerRef.current.innerHTML = '<div id="tradingview_widget" style="height: 100%; width: 100%;"></div>'
      }

      // Usar a abordagem simples que funcionava - todos os estudos no array studies
      const studiesToApply = selectedStudies.flatMap((key) => scannerStudies[key] || [])

      debug("📊 [TRADINGVIEW] Loading widget with studies:", {
        selectedStudies,
        studiesToApply,
        count: studiesToApply.length,
        usingExternal: !!externalStudies,
      })

      // Config PURA do widget gratuito (tv.js) — todas as ferramentas/toolbars nativas ligadas.
      // (enabled_features/disabled_features/overrides são da Charting Library paga; o widget
      // gratuito ignora-os E a sua presença fazia a top bar nativa não aparecer.)
      const widgetOptions = {
        autosize: true,
        symbol: selectedSymbol,
        interval: favoriteTimeframe,
        timezone: "Etc/UTC",
        theme: theme,
        style: "1",
        locale: "en",
        toolbar_bg: theme === "dark" ? "#1E1E1E" : "#FFFFFF",
        enable_publishing: true,
        allow_symbol_change: true,
        hide_top_toolbar: false, // top bar (símbolo, timeframes, indicadores, settings, fullscreen)
        hide_legend: false,
        hide_side_toolbar: false, // barra de desenho à esquerda
        withdateranges: true,
        details: true,
        calendar: true,
        save_image: true,
        show_popup_button: true, // abrir em popup grande
        popup_width: "1200",
        popup_height: "700",
        container_id: "tradingview_widget",
        studies: studiesToApply,
      }

      widgetRef.current = new window.TradingView.widget(widgetOptions)

      // Tentar abrir o gráfico com uma vista inicial "resetada" para melhor visualização dos scanners
      // E configurar AUTO e apenas escala de preço após o chart estar pronto
      if (widgetRef.current && typeof widgetRef.current.onChartReady === "function") {
        widgetRef.current.onChartReady(() => {
          try {
            const chart = widgetRef.current.chart && widgetRef.current.chart()
            if (chart) {
              // Reset inicial (opcional)
              if (typeof chart.resetData === "function") {
                chart.resetData()
              }

              // Configurar todos os estudos para usar AUTO e apenas escala de preço
              setTimeout(() => {
                try {
                  const allStudies = chart.getAllStudies?.() || []
                  debug(`📊 [TRADINGVIEW] Configuring ${allStudies.length} studies with AUTO and price scale`)

                  allStudies.forEach((study: any, index: number) => {
                    try {
                      if (typeof study.setAutoScale === "function") {
                        study.setAutoScale(true)
                      }
                      if (typeof study.setPriceScale === "function") {
                        study.setPriceScale(true)
                      }
                      if (typeof study.setEntityInfo === "function") {
                        study.setEntityInfo({
                          priceScaleId: "right",
                          autoScale: true,
                        })
                      }
                      // Esconder título do estudo
                      if (typeof study.setVisible === "function") {
                        // Manter visível mas esconder título
                      }
                      if (typeof study.setTitle === "function") {
                        study.setTitle("")
                      }
                      if (typeof study.hideTitle === "function") {
                        study.hideTitle()
                      }
                    } catch (e) {
                      if (process.env.NODE_ENV === "development") {
                        console.warn(`⚠️ [TRADINGVIEW] Error configuring study ${index}:`, e)
                      }
                    }
                  })

                  debug(`✅ [TRADINGVIEW] Study configuration complete`)
                } catch (e) {
                  console.warn("Failed to apply resetData and configure studies:", e)
                }
              }, 1500) // Delay para garantir que estudos estão carregados
            }
          } catch (e) {
            console.warn("Failed to apply resetData and configure studies:", e)
          }
        })
      }
      setWidgetLoaded(true)
      setError(null)
    } catch (err: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error initializing widget:", err)
      }
      setError(`Error initializing widget: ${err.message}`)
    } finally {
      isLoadingScanner.current = false
    }
  }

  useEffect(() => {
    const loadScript = () => {
      if (document.getElementById("tradingview-script")) {
        init()
        return
      }

      const script = document.createElement("script")
      script.id = "tradingview-script"
      script.src = "https://s3.tradingview.com/tv.js"
      script.async = true
      script.onload = init
      script.onerror = () => setError("Failed to load TradingView script")
      document.head.appendChild(script)
    }

    const init = () => {
      if (!window.TradingView) {
        setTimeout(init, 100)
        return
      }
      loadTradingViewWidget()
    }

    loadScript()

    return () => {
      if (widgetRef.current?.remove) {
        try {
          widgetRef.current.remove()
        } catch {
          /* widget já removido durante re-init — benigno */
        }
      }
    }
  }, [])

  useEffect(() => {
    if (widgetRef.current?.remove) {
      try {
        widgetRef.current.remove()
      } catch (e) {}
    }
    loadTradingViewWidget()
  }, [selectedStudies, selectedSymbol, theme, favoriteTimeframe])

  // Filtrar ativos por categoria e busca
  const filteredAssets = assetCategories[selectedCategory].filter(
    (asset) =>
      asset.label.toLowerCase().includes(assetSearchTerm.toLowerCase()) ||
      asset.value.toLowerCase().includes(assetSearchTerm.toLowerCase()),
  )

  const popularAssets = filteredAssets.filter((a) => a.popular)
  const otherAssets = filteredAssets.filter((a) => !a.popular)

  return (
    <>
      <div className="w-full flex flex-col bg-gray-900 border border-[#015BF9]/30 rounded-lg overflow-hidden h-[70vh] lg:h-[calc(100vh-8rem)] min-h-[480px]">
        {error && (
          <Alert className="absolute top-2 left-2 right-2 z-20 bg-red-500/20 border-red-500">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Controls — replica os botões/dropdowns do scanner-mobile */}
        <div className="bg-gray-900 border-b border-[#015BF9]/30 p-3 space-y-3 shrink-0">
          {/* Linha 1 — Categorias */}
          <div className="flex gap-2 pb-1 overflow-x-auto">
            {(Object.keys(categoryMeta) as Array<keyof typeof assetCategories>).map((key) => {
              const { icon: Icon, label } = categoryMeta[key]
              const isSel = selectedCategory === key
              return (
                <button
                  key={key}
                  onClick={() => selectCategory(key)}
                  className={`flex items-center gap-2 rounded-lg whitespace-nowrap transition-all px-3 py-2 text-xs sm:text-sm ${
                    isSel ? "bg-[#015BF9] text-white font-semibold" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              )
            })}
          </div>

          {/* Linha 2 — Símbolo + Intervalo */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            <Select value={selectedSymbol} onValueChange={handleSymbolSelect}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white text-xs sm:text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white max-h-72">
                {assetCategories[selectedCategory].map((s) => (
                  <SelectItem key={s.value} value={s.value} className="text-xs sm:text-sm">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={favoriteTimeframe} onValueChange={handleTimeframeChange}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white text-xs sm:text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                {timeframes.map((tf) => (
                  <SelectItem key={tf.value} value={tf.value} className="text-xs sm:text-sm">
                    {tf.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="hidden lg:flex items-center rounded-md border border-gray-700 bg-gray-800 text-gray-400 text-xs px-3 font-medium tabular-nums">
              {selectedSymbol}
            </div>
          </div>

          {/* Linha 3 — Scanners */}
          <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-[#015BF9]/50">
            {scannerOrder
              .filter((key) => !excludedStudies || !excludedStudies.includes(key))
              .map((key) => {
                const logo = scannerLogos[key]
                const Icon = logo.icon
                const isChecked = selectedStudies.includes(key)
                return (
                  <button
                    key={key}
                    onClick={() => toggleStudy(key)}
                    className={`transition-all duration-300 ${
                      isChecked
                        ? `${logo.bgColor} text-white shadow-lg scale-105`
                        : "bg-gray-700/80 text-gray-300 hover:bg-gray-600/80"
                    } border border-gray-600/50 rounded-md flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 text-[10px] sm:text-xs h-8 sm:h-9`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${isChecked ? "bg-white" : "bg-gray-400"}`} />
                    <Icon className={`w-3 h-3 ${isChecked ? "text-white" : logo.color}`} />
                    <span>{scannerLabels[key]}</span>
                  </button>
                )
              })}
          </div>

          {/* Linha 4 — Ações */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleFullscreen}
              size="sm"
              className="flex-1 bg-[#015BF9] text-white hover:bg-[#1200DE] h-8 sm:h-9 text-xs sm:text-sm"
            >
              <Maximize2 className="w-3.5 h-3.5 mr-1.5" /> Fullscreen
            </Button>
              {/* Configurações */}
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button className="h-9 px-3 bg-gray-700/80 text-white hover:bg-gray-600/80" title="Settings">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-600 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-[#015BF9]">Chart Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {/* Tema */}
                    <div className="space-y-3">
                      <Label className="text-gray-300">Theme</Label>
                      <RadioGroup value={theme} onValueChange={(v) => handleThemeChange(v as "light" | "dark")}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dark" id="dark" />
                          <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                            <Moon className="w-4 h-4" />
                            Dark
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="light" id="light" />
                          <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                            <Sun className="w-4 h-4" />
                            Light
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Timeframe favorito */}
                    <div className="space-y-3">
                      <Label className="text-gray-300 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Default Timeframe
                      </Label>
                      <Select value={favoriteTimeframe} onValueChange={handleTimeframeChange}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600 text-white">
                          {timeframes.map((tf) => (
                            <SelectItem key={tf.value} value={tf.value}>
                              {tf.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Salvar gráfico */}
              <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogTrigger asChild>
                  <Button className="h-9 px-3 bg-gray-700/80 text-white hover:bg-gray-600/80" title="Save Chart">
                    <Save className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-600 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-[#015BF9]">Save Chart</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Chart Name</Label>
                      <Input
                        value={chartNameToSave}
                        onChange={(e) => setChartNameToSave(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleSaveChart()
                          }
                        }}
                        placeholder="e.g., XAU/USD Analysis - 01/10"
                        className="bg-gray-700 border-gray-600 text-white"
                        autoFocus
                      />
                    </div>
                    <div className="text-xs text-gray-400">Saved charts: {savedCharts.length}/20</div>
                    <Button
                      onClick={handleSaveChart}
                      className="w-full bg-gradient-to-r from-[#015BF9] to-[#1200DE] text-white hover:opacity-90"
                    >
                      Save
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Carregar gráfico */}
              <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
                <DialogTrigger asChild>
                  <Button className="h-9 px-3 bg-gray-700/80 text-white hover:bg-gray-600/80" title="Load Chart">
                    <FolderOpen className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-[#015BF9]">Load Saved Chart</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 max-h-[400px] overflow-y-auto">
                    {savedCharts.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">No saved charts</div>
                    ) : (
                      <div className="space-y-2">
                        {savedCharts.map((chart) => (
                          <div
                            key={chart.id}
                            className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-white">{chart.name}</div>
                              <div className="text-xs text-gray-400">
                                {chart.symbol} • {new Date(chart.timestamp).toLocaleDateString("en-US")}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => handleLoadChart(chart)}
                                size="sm"
                                className="bg-[#015BF9] text-white hover:bg-[#1200DE]"
                              >
                                Load
                              </Button>
                              <Button
                                onClick={() => handleDeleteChart(chart.id)}
                                size="sm"
                                variant="ghost"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

            <Button
              onClick={loadTradingViewWidget}
              size="sm"
              variant="outline"
              className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700 h-8 sm:h-9 px-2 sm:px-3"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Chart — ocupa o resto do espaço (desktop maximiza) */}
        <div className="relative flex-1 min-h-0 bg-black">
          <div ref={containerRef} className="w-full h-full" style={{ visibility: widgetLoaded ? "visible" : "hidden" }} />
          {!widgetLoaded && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#015BF9] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[#3b82f6] font-medium">Loading TradingView...</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </>
  )
}
