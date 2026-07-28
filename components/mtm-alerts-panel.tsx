"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { ArrowUp, ArrowDown, Minus, RefreshCw, Bell, Clock, Pin, Ban, Crosshair, X, Check } from "lucide-react"

const PV = { primary: "#015BF9", card: "#0A0E1A", border: "#015BF930" }
const FILTERS_KEY = "pv_alert_filters"

type RawPayload = {
  entry?: number
  sl?: number
  tp1?: number; tp2?: number; tp3?: number; tp4?: number
  action?: string
  strategy?: string
  timeframe?: string
  order_type?: string
  leverage?: number
  margin?: number
  notional?: number
  sl_pct?: number
  risk_pct?: number
  confirmations?: Record<string, boolean | number | string>
}

type Alert = {
  id: string
  ticker: string
  exchange?: string | null
  action?: string | null
  price?: number | null
  sl?: number | null
  tp?: number | number[] | null
  timeframe?: string | null
  alert_name?: string | null
  message?: string | null
  chart_image_url?: string | null
  trade_status?: string | null
  signal_kind?: string | null
  received_at?: string | null
  raw_payload?: RawPayload | null
}

type AssetClass = "gold_btc" | "forex" | "index" | "crypto_perp" | "other"
type StateCat = "pending" | "active" | "win" | "loss" | "discarded"

const CLASS_LABELS: Record<AssetClass, string> = {
  gold_btc: "Ouro & BTC",
  forex: "Forex",
  index: "Índices",
  crypto_perp: "Cripto Perp",
  other: "Outros",
}

const STATE_META: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "border-amber-500/40 bg-amber-500/10 text-amber-300" },
  active: { label: "Ativa", className: "border-blue-500/40 bg-blue-500/10 text-blue-300" },
  be: { label: "BreakEven", className: "border-amber-500/40 bg-amber-500/10 text-amber-300" },
  exit_1: { label: "Exit 1", className: "border-green-500/40 bg-green-500/10 text-green-300" },
  exit_2: { label: "Exit 2", className: "border-green-500/40 bg-green-500/10 text-green-300" },
  exit_3: { label: "Exit 3", className: "border-green-500/40 bg-green-500/10 text-green-300" },
  exit_4: { label: "Exit 4", className: "border-green-600/50 bg-green-600/15 text-green-300" },
  loss: { label: "Loss", className: "border-red-500/40 bg-red-500/15 text-red-400" },
  discarded: { label: "Descartado", className: "border-slate-500/40 bg-slate-500/10 text-slate-300" },
  expired: { label: "Expirado", className: "border-slate-500/40 bg-slate-500/10 text-slate-400" },
  closed: { label: "Fechada", className: "border-gray-500/40 bg-gray-500/10 text-gray-300" },
}

const FX_CODES = new Set(["EUR", "USD", "GBP", "JPY", "AUD", "NZD", "CAD", "CHF"])
const IDX_SET = new Set(["US30", "US100", "US500", "NAS100", "SPX500", "GER40", "UK100", "JPN225", "DE40", "DE30"])

function clean(text?: string | null): string {
  return (text || "")
    .replace(/more\s*than\s*money(\.pt)?/gi, "")
    .replace(/@?morethanmoney(\.pt)?/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim()
}
// Etiqueta de estratégia sem a marca (remove "MTM " inicial, mantém nomes de scanner)
function stratLabel(s?: string | null): string {
  return clean((s || "").replace(/^\s*MTM\s+/i, "")).trim()
}

function classifyAsset(rawTicker?: string | null): AssetClass {
  const t = (rawTicker || "").toUpperCase().replace(/^[A-Z]+:/, "").replace(/[^A-Z0-9.]/g, "")
  if (!t) return "other"
  if (t.startsWith("XAUUSD") || t.startsWith("BTCUSD")) return "gold_btc"
  if (t.endsWith(".P") || t.includes("USDT") || t.includes("PERP")) return "crypto_perp"
  const base6 = t.slice(0, 6)
  if (base6.length === 6 && FX_CODES.has(base6.slice(0, 3)) && FX_CODES.has(base6.slice(3, 6))) return "forex"
  if (IDX_SET.has(t)) return "index"
  return "other"
}

function stateCategory(s?: string | null): StateCat {
  const v = (s || "").toLowerCase()
  if (v === "pending") return "pending"
  if (v === "discarded" || v === "expired") return "discarded" // SL antes de ativar / expirou → não é loss
  if (v === "loss") return "loss"
  if (v.startsWith("exit_") || v === "closed") return "win"
  return "active"
}
function stateMeta(s?: string | null) {
  return STATE_META[(s || "").toLowerCase()] ?? { label: s || "—", className: "border-slate-500/40 bg-slate-500/10 text-slate-200" }
}
function timeAgo(iso?: string | null): string {
  if (!iso) return ""
  const d = new Date(iso).getTime()
  if (!Number.isFinite(d)) return ""
  const s = Math.max(0, Math.floor((Date.now() - d) / 1000))
  if (s < 60) return "agora"
  const m = Math.floor(s / 60)
  if (m < 60) return `há ${m}min`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h}h`
  return `há ${Math.floor(h / 24)}d`
}
function fmt(n?: number | null): string {
  if (n == null || !Number.isFinite(n)) return "—"
  return n.toLocaleString("pt-PT", { maximumFractionDigits: 6 })
}
const num = (v: unknown): number | undefined => (typeof v === "number" && Number.isFinite(v) ? v : undefined)

// Extrai todos os parâmetros (raw_payload tem prioridade sobre as colunas)
function params(a: Alert) {
  const rp = a.raw_payload || {}
  const entry = num(rp.entry) ?? num(a.price ?? undefined)
  const sl = num(rp.sl) ?? num(a.sl ?? undefined)
  const tpsRaw = [rp.tp1, rp.tp2, rp.tp3, rp.tp4].map(num).filter((x): x is number => x != null)
  const tps = tpsRaw.length ? tpsRaw : Array.isArray(a.tp) ? a.tp.filter((x) => Number.isFinite(x)) : num(a.tp as number) != null ? [a.tp as number] : []
  const confirmations = Object.entries(rp.confirmations || {})
  return {
    entry,
    sl,
    tps,
    confirmations,
    leverage: num(rp.leverage),
    margin: num(rp.margin),
    notional: num(rp.notional),
    slPct: num(rp.sl_pct),
    orderType: rp.order_type,
    strategy: stratLabel(rp.strategy || a.alert_name),
  }
}

function LevelRow({ label, value, icon, tone }: { label: string; value?: number | null; icon: React.ReactNode; tone: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs py-1">
      <span className="flex items-center gap-1.5 text-slate-400">{icon}{label}</span>
      <span className={`font-semibold tabular-nums ${tone}`}>{fmt(value)}</span>
    </div>
  )
}

type FiltersState = { dir: "all" | "buy" | "sell"; classF: "all" | AssetClass; tf: string; strat: string; state: "all" | StateCat; search: string }
const DEFAULT_FILTERS: FiltersState = { dir: "all", classF: "all", tf: "all", strat: "all", state: "all", search: "" }

// Ticker + exchange → símbolo TradingView (best-effort)
const IDX_TV: Record<string, string> = {
  US30: "OANDA:US30USD", US100: "OANDA:NAS100USD", NAS100: "OANDA:NAS100USD",
  US500: "OANDA:SPX500USD", SPX500: "OANDA:SPX500USD", GER40: "OANDA:DE30EUR",
  DE40: "OANDA:DE30EUR", DE30: "OANDA:DE30EUR", UK100: "OANDA:UK100GBP", JPN225: "OANDA:JP225USD",
}
const COM_TV: Record<string, string> = {
  USOIL: "TVC:USOIL", UKOIL: "TVC:UKOIL", NATURALGAS: "TVC:NATGAS", NATGAS: "TVC:NATGAS",
  XAUUSD: "OANDA:XAUUSD", XAGUSD: "OANDA:XAGUSD",
}
function tvSymbolFor(ticker?: string | null, exchange?: string | null): string {
  const t = (ticker || "").toUpperCase().trim()
  if (!t) return "OANDA:XAUUSD"
  if (t.endsWith(".P") || t.includes("USDT")) {
    return (exchange || "").toUpperCase() === "BYBIT" ? `BYBIT:${t}` : `BINANCE:${t.replace(".P", "")}`
  }
  if (IDX_TV[t]) return IDX_TV[t]
  if (COM_TV[t]) return COM_TV[t]
  if (/^[A-Z]{6}$/.test(t)) return `OANDA:${t}` // forex/metais
  const ex = (exchange || "").toUpperCase()
  if (["CAPITALCOM", "OANDA", "BINANCE", "BYBIT", "NASDAQ", "NYSE", "FX", "TVC"].includes(ex)) return `${ex}:${t}`
  return `OANDA:${t}`
}
// Estratégia do sinal → chave de study/scanner do widget
function strategyToStudy(s?: string | null): string {
  const v = (s || "").toLowerCase()
  if (v.includes("aurum")) return "AurumFlow"
  if (v.includes("goldkiller") || v.includes("gold killer")) return "Goldkiller"
  if (v.includes("sensei")) return "Sensei"
  if (v.includes("golden")) return "GoldenZone"
  if (v.includes("momentum")) return "Momentum"
  if (v.includes("sniper") || v.includes("winzone")) return "Winzone"
  if (v.includes("quantum") || v.includes("sinergy") || v.includes("synergy")) return "Sinergy"
  return "MTMScanner"
}

export default function MtmAlertsPanel({
  onSelectAlert,
}: {
  onSelectAlert?: (opts: { symbol: string; timeframe?: string; studyKey: string }) => void
} = {}) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [f, setF] = useState<FiltersState>(DEFAULT_FILTERS)
  const restored = useRef(false)

  // Restaurar filtros guardados (config pessoal)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FILTERS_KEY)
      if (saved) setF({ ...DEFAULT_FILTERS, ...JSON.parse(saved) })
    } catch {}
    restored.current = true
  }, [])
  // Guardar filtros sempre que mudam
  useEffect(() => {
    if (!restored.current) return
    try { localStorage.setItem(FILTERS_KEY, JSON.stringify(f)) } catch {}
  }, [f])

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts?limit=100", { cache: "no-store" })
      const data = (await res.json()) as { alerts?: Alert[]; error?: string }
      setAlerts(Array.isArray(data.alerts) ? data.alerts : [])
      setError(data.error ?? null)
    } catch {
      setError("Falha ao carregar alertas")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 30_000)
    return () => clearInterval(t)
  }, [load])

  const tfOptions = useMemo(() => [...new Set(alerts.map((a) => a.timeframe).filter(Boolean))] as string[], [alerts])
  const stratOptions = useMemo(() => [...new Set(alerts.map((a) => params(a).strategy).filter(Boolean))], [alerts])
  const dirOf = (a: Alert) => {
    const v = (a.action || "").toLowerCase()
    return v.startsWith("b") ? "buy" : v.startsWith("s") ? "sell" : "neutral"
  }
  const matchBase = (a: Alert) => {
    if (f.dir !== "all" && dirOf(a) !== f.dir) return false
    if (f.classF !== "all" && classifyAsset(a.ticker) !== f.classF) return false
    if (f.tf !== "all" && a.timeframe !== f.tf) return false
    if (f.strat !== "all" && params(a).strategy !== f.strat) return false
    if (f.search.trim() && !(a.ticker || "").toUpperCase().includes(f.search.trim().toUpperCase())) return false
    return true
  }
  const visible = useMemo(
    () => alerts.filter((a) => matchBase(a) && (f.state === "all" || stateCategory(a.trade_status) === f.state)),
    [alerts, f],
  )
  const perfBase = useMemo(() => alerts.filter(matchBase), [alerts, f])
  const perf = useMemo(() => {
    const c = { pending: 0, active: 0, win: 0, loss: 0, discarded: 0 }
    for (const a of perfBase) c[stateCategory(a.trade_status)]++
    return c
  }, [perfBase])
  const closed = perf.win + perf.loss
  const winRate = closed > 0 ? Math.round((perf.win / closed) * 100) : null

  const set = (patch: Partial<FiltersState>) => setF((p) => ({ ...p, ...patch }))
  const anyFilter = f.classF !== "all" || f.tf !== "all" || f.strat !== "all" || f.dir !== "all" || f.state !== "all"
  const clearFilters = () => setF({ ...DEFAULT_FILTERS })

  const STATE_TABS: { key: "all" | StateCat; label: string; count: number; active: string }[] = [
    { key: "all", label: "Todos", count: perfBase.length, active: "border-[#015BF9] bg-[#015BF9]/15 text-[#5b9dff]" },
    { key: "pending", label: "Pendentes", count: perf.pending, active: "border-amber-500 bg-amber-500/15 text-amber-300" },
    { key: "active", label: "Ativas", count: perf.active, active: "border-blue-500 bg-blue-500/15 text-blue-300" },
    { key: "win", label: "Wins", count: perf.win, active: "border-green-500 bg-green-500/15 text-green-300" },
    { key: "loss", label: "Loss", count: perf.loss, active: "border-red-500 bg-red-500/15 text-red-400" },
    { key: "discarded", label: "Descartados", count: perf.discarded, active: "border-slate-500 bg-slate-500/15 text-slate-300" },
  ]
  const selectCls = "bg-gray-800 border border-gray-700 text-white text-xs rounded-md px-2 py-1.5 focus:outline-none focus:border-[#015BF9]"

  return (
    <div className="rounded-xl border p-4 space-y-4" style={{ backgroundColor: PV.card, borderColor: PV.border }}>
      {/* Header + direção + pesquisa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <Bell className="w-4 h-4" style={{ color: PV.primary }} />
          <h3 className="text-sm font-semibold text-white tracking-wide">Alertas ao Vivo</h3>
          <span className="rounded border border-green-500/30 bg-green-500/10 text-green-400 text-xs px-1.5 py-0.5">{visible.length}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {(["all", "buy", "sell"] as const).map((d) => (
            <button
              key={d}
              onClick={() => set({ dir: d })}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                f.dir === d ? "text-white border-transparent" : "text-slate-300 border-slate-600/40 hover:bg-white/5"
              }`}
              style={f.dir === d ? { backgroundColor: PV.primary } : undefined}
            >
              {d === "all" ? "Todos" : d === "buy" ? "Compras" : "Vendas"}
            </button>
          ))}
          <input
            value={f.search}
            onChange={(e) => set({ search: e.target.value })}
            placeholder="Filtrar ativo"
            className="w-28 bg-gray-800 border border-gray-700 text-white text-xs rounded-md px-2 py-1.5 focus:outline-none focus:border-[#015BF9]"
          />
          <button onClick={load} className="p-1.5 rounded-md text-slate-300 border border-slate-600/40 hover:bg-white/5" title="Atualizar">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <select value={f.classF} onChange={(e) => set({ classF: e.target.value as any })} className={selectCls}>
          <option value="all">Todas as classes</option>
          {(Object.keys(CLASS_LABELS) as AssetClass[]).map((k) => (<option key={k} value={k}>{CLASS_LABELS[k]}</option>))}
        </select>
        <select value={f.tf} onChange={(e) => set({ tf: e.target.value })} className={selectCls}>
          <option value="all">Todos os timeframes</option>
          {tfOptions.map((o) => (<option key={o} value={o}>{o}m</option>))}
        </select>
        <select value={f.strat} onChange={(e) => set({ strat: e.target.value })} className={selectCls}>
          <option value="all">Todas as estratégias</option>
          {stratOptions.map((o) => (<option key={o} value={o}>{o}</option>))}
        </select>
        {anyFilter && (
          <button onClick={clearFilters} className="text-xs text-slate-300 border border-slate-600/40 rounded-md px-2 py-1.5 hover:bg-white/5 flex items-center gap-1">
            <X className="w-3 h-3" /> Limpar filtros
          </button>
        )}
      </div>

      {/* Estado + win rate */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2" style={{ borderColor: PV.border }}>
        <div className="flex flex-wrap gap-1.5">
          {STATE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => set({ state: tab.key })}
              className={`px-2 py-1 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                f.state === tab.key ? tab.active : "border-gray-700 text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
              <span className="rounded bg-black/40 px-1 text-[10px]">{tab.count}</span>
            </button>
          ))}
        </div>
        {winRate != null && (
          <div className="text-xs text-slate-300">
            Win rate <span className="font-semibold text-green-400">{winRate}%</span>{" "}
            <span className="text-slate-500">({perf.win}·{perf.loss})</span>
          </div>
        )}
      </div>

      {/* Lista */}
      {loading && alerts.length === 0 ? (
        <div className="py-10 text-center text-slate-400 text-sm">A carregar alertas…</div>
      ) : error && alerts.length === 0 ? (
        <div className="py-6 text-center text-red-300 text-sm">{error}</div>
      ) : visible.length === 0 ? (
        <div className="py-10 text-center text-slate-400 text-sm">
          <Bell className="w-5 h-5 mx-auto mb-2 opacity-60" />
          Sem sinais para estes filtros. Os alertas dos scanners aparecem aqui em tempo real.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3 max-h-[80vh] overflow-y-auto pr-1">
          {visible.map((a) => {
            const d = dirOf(a)
            const st = stateMeta(a.trade_status)
            const p = params(a)
            return (
              <div
                key={a.id}
                onClick={() =>
                  onSelectAlert?.({
                    symbol: tvSymbolFor(a.ticker, a.exchange),
                    timeframe: a.timeframe || undefined,
                    studyKey: strategyToStudy(p.strategy || a.alert_name),
                  })
                }
                title="Abrir no gráfico (símbolo, timeframe e scanner do sinal)"
                className="rounded-xl border bg-gradient-to-br from-[#141826] to-black p-4 flex flex-col gap-3 cursor-pointer transition-all hover:border-[#015BF9]/60 hover:ring-1 hover:ring-[#015BF9]/40"
                style={{ borderColor: PV.border }}
              >
                {/* Estratégia */}
                {p.strategy ? (
                  <span className="self-start inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border border-[#015BF9]/40 bg-[#015BF9]/10 text-[#5b9dff]">
                    {p.strategy}
                  </span>
                ) : null}

                {/* Cabeçalho: ticker + direção + tf + estado + tempo */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-bold text-white">{a.ticker || "—"}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                    d === "buy" ? "bg-green-500/15 text-green-400" : d === "sell" ? "bg-red-500/15 text-red-400" : "bg-slate-500/15 text-slate-300"
                  }`}>
                    {d === "buy" ? <ArrowUp className="w-3.5 h-3.5" /> : d === "sell" ? <ArrowDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                    {d === "buy" ? "COMPRA" : d === "sell" ? "VENDA" : "NEUTRO"}
                  </span>
                  {a.timeframe ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] border border-gray-600/50 text-gray-300">
                      <Clock className="w-3 h-3" /> {a.timeframe}m
                    </span>
                  ) : null}
                  {a.trade_status ? (
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${st.className}`}>{st.label}</span>
                  ) : null}
                  <span className="ml-auto flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3" /> {timeAgo(a.received_at)}
                  </span>
                </div>

                {/* Imagem COMPLETA do gráfico do sinal (como no MTM) */}
                {a.chart_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.chart_image_url}
                    alt={`${a.ticker} chart`}
                    loading="lazy"
                    className="w-full max-h-96 object-contain rounded-lg border border-white/5 bg-black/40"
                  />
                ) : null}

                {/* Níveis: Entrada / SL / Exits */}
                <div className="rounded-lg border border-white/5 bg-black/30 px-3 py-1.5">
                  <LevelRow label="Entrada" value={p.entry} icon={<Pin className="w-3.5 h-3.5 text-[#5b9dff]" />} tone="text-white" />
                  <LevelRow label="Invalidação (Stop Loss)" value={p.sl} icon={<Ban className="w-3.5 h-3.5 text-red-400" />} tone="text-red-300" />
                  {p.tps.map((t, i) => (
                    <LevelRow key={i} label={`Exit ${i + 1} (Take Profit)`} value={t} icon={<Crosshair className="w-3.5 h-3.5 text-green-400" />} tone="text-green-300" />
                  ))}
                </div>

                {/* Chips extra: SL% / alavancagem / margem */}
                {(p.slPct != null || p.leverage != null || p.margin != null) && (
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {p.slPct != null && <span className="rounded bg-red-500/10 border border-red-500/30 text-red-300 px-1.5 py-0.5">🛑 SL {p.slPct.toFixed(2)}%</span>}
                    {p.leverage != null && <span className="rounded bg-[#015BF9]/10 border border-[#015BF9]/30 text-[#5b9dff] px-1.5 py-0.5">⚡ Alav {p.leverage.toFixed(2)}x</span>}
                    {(p.margin != null || p.notional != null) && (
                      <span className="rounded bg-white/5 border border-white/10 text-slate-300 px-1.5 py-0.5">
                        💵 Margem ${p.margin != null ? Math.round(p.margin) : "—"} · Posição ${p.notional != null ? Math.round(p.notional) : "—"}
                      </span>
                    )}
                  </div>
                )}

                {/* Confirmações */}
                {p.confirmations.length > 0 && (
                  <div>
                    <div className="text-[11px] text-slate-400 mb-1">Confirmações</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {p.confirmations.map(([name, val]) => {
                        const isBool = typeof val === "boolean"
                        const ok = val === true
                        return (
                          <div
                            key={name}
                            className={`flex items-center justify-between gap-1 px-2 py-1 rounded text-[11px] border ${
                              isBool
                                ? ok ? "border-green-500/30 bg-green-500/5 text-green-300" : "border-red-500/25 bg-red-500/5 text-red-300"
                                : "border-white/10 bg-white/5 text-slate-300"
                            }`}
                          >
                            <span className="truncate">{name}</span>
                            {isBool ? (ok ? <Check className="w-3 h-3 shrink-0" /> : <X className="w-3 h-3 shrink-0" />) : <span className="font-semibold tabular-nums">{String(val)}</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <p className="text-[10px] text-slate-500 text-center">
        ⚠️ Sinais educativos gerados pelos scanners. Não constituem aconselhamento financeiro.
      </p>
    </div>
  )
}
