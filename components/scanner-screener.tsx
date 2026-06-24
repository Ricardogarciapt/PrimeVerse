"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ScannerScreenerProps {
  mode?: "desktop" | "mobile"
}

type TabKey = "crypto" | "forex" | "stocks" | "indices" | "calendar"

const buildEmbedUrl = (widget: string, config: Record<string, unknown>) =>
  `https://www.tradingview-widget.com/embed-widget/${widget}/?locale=en#${encodeURIComponent(
    JSON.stringify({ locale: "en", colorTheme: "dark", isTransparent: true, width: "100%", ...config }),
  )}`

export default function ScannerScreener({ mode = "desktop" }: ScannerScreenerProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("crypto")
  const height = mode === "mobile" ? 360 : 460

  const tabs = useMemo(
    () => ({
      crypto: {
        title: "Crypto Heatmap",
        url: buildEmbedUrl("crypto-coins-heatmap", {
          dataSource: "Crypto",
          blockSize: "market_cap_calc",
          blockColor: "change",
          hasTopBar: true,
          isDataSetEnabled: true,
          isZoomEnabled: true,
          hasSymbolTooltip: true,
          height: String(height),
        }),
      },
      forex: {
        title: "Forex Cross Rates",
        url: buildEmbedUrl("forex-cross-rates", {
          currencies: ["EUR", "USD", "JPY", "GBP", "CHF", "AUD", "CAD", "NZD"],
          height: String(height),
        }),
      },
      stocks: {
        title: "Stock Heatmap",
        url: buildEmbedUrl("stock-heatmap", {
          dataSource: "SPX500",
          blockSize: "market_cap_basic",
          blockColor: "change",
          grouping: "sector",
          hasTopBar: true,
          isDataSetEnabled: true,
          isZoomEnabled: true,
          hasSymbolTooltip: true,
          height: String(height),
        }),
      },
      indices: {
        title: "Market Quotes",
        url: buildEmbedUrl("market-quotes", {
          height: String(height),
          symbolsGroups: [
            {
              name: "Indices",
              symbols: [
                { name: "OANDA:SPX500USD", displayName: "S&P 500" },
                { name: "OANDA:NAS100USD", displayName: "NASDAQ 100" },
                { name: "OANDA:US30USD", displayName: "Dow 30" },
                { name: "OANDA:DE30EUR", displayName: "DAX" },
                { name: "OANDA:UK100GBP", displayName: "FTSE 100" },
                { name: "OANDA:JP225USD", displayName: "Nikkei 225" },
              ],
            },
            {
              name: "Commodities",
              symbols: [
                { name: "OANDA:XAUUSD", displayName: "Gold" },
                { name: "OANDA:XAGUSD", displayName: "Silver" },
                { name: "OANDA:WTICOUSD", displayName: "Crude Oil" },
                { name: "OANDA:NATGASUSD", displayName: "Natural Gas" },
              ],
            },
          ],
        }),
      },
      calendar: {
        title: "Economic Calendar",
        url: buildEmbedUrl("events", {
          importanceFilter: "-1,0,1",
          countryFilter: "us,eu,gb,jp,ch,au,ca,de,fr",
          height: String(height),
        }),
      },
    }),
    [height],
  )

  const order: { key: TabKey; label: string }[] = [
    { key: "crypto", label: "Crypto" },
    { key: "forex", label: "Forex" },
    { key: "stocks", label: "Stocks" },
    { key: "indices", label: "Markets" },
    { key: "calendar", label: "Calendar" },
  ]

  const current = tabs[activeTab]

  return (
    <Card className="bg-card border-border p-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 mb-4 gap-1 h-auto">
          {order.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="text-xs sm:text-sm">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <div className="w-full rounded-lg overflow-hidden" style={{ height }}>
            <iframe
              key={activeTab}
              src={current.url}
              title={current.title}
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
