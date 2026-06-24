"use client"

import { useMemo } from "react"

/**
 * Live market ticker tape (TradingView embed).
 * Lightweight, transparent, and theme-aware.
 */
export default function TickerTape() {
  const src = useMemo(() => {
    const config = {
      symbols: [
        { proName: "OANDA:XAUUSD", title: "Gold" },
        { proName: "OANDA:XAGUSD", title: "Silver" },
        { proName: "BINANCE:BTCUSDT", title: "Bitcoin" },
        { proName: "BINANCE:ETHUSDT", title: "Ethereum" },
        { proName: "OANDA:EURUSD", title: "EUR/USD" },
        { proName: "OANDA:GBPUSD", title: "GBP/USD" },
        { proName: "OANDA:SPX500USD", title: "S&P 500" },
        { proName: "OANDA:NAS100USD", title: "NASDAQ 100" },
        { proName: "CAPITALCOM:DXY", title: "Dollar Index" },
        { proName: "OANDA:WTICOUSD", title: "Crude Oil" },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "en",
    }
    return `https://www.tradingview-widget.com/embed-widget/ticker-tape/?locale=en#${encodeURIComponent(
      JSON.stringify(config),
    )}`
  }, [])

  return (
    <div className="w-full border-b" style={{ borderColor: "#015BF920", height: 46 }}>
      <iframe
        src={src}
        title="Market ticker"
        className="w-full border-0"
        style={{ height: 46 }}
        loading="lazy"
      />
    </div>
  )
}
