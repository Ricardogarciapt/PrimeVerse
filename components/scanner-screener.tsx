"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ScannerScreenerProps {
  mode?: "desktop" | "mobile"
}

export default function ScannerScreener({ mode = "desktop" }: ScannerScreenerProps) {
  const [activeTab, setActiveTab] = useState("crypto")

  // URLs dos heatmaps do TradingView para diferentes categorias
  const heatmapConfigs = {
    crypto: {
      url: "https://www.tradingview-widget.com/embed-widget/crypto-coins-heatmap/?locale=en#%7B%22dataSource%22%3A%22Crypto%22%2C%22blockSize%22%3A%22market_cap_calc%22%2C%22blockColor%22%3A%22change%22%2C%22hasTopBar%22%3Atrue%2C%22isDataSetEnabled%22%3Atrue%2C%22isZoomEnabled%22%3Atrue%2C%22hasSymbolTooltip%22%3Atrue%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%7D",
      title: "Crypto Heatmap",
    },
    stocks: {
      url: "https://www.tradingview-widget.com/embed-widget/screener/?locale=en#%7B%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22defaultColumn%22%3A%22overview%22%2C%22screener_type%22%3A%22stock_mkt%22%2C%22displayCurrency%22%3A%22USD%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%2C%22utm_source%22%3A%22localhost%22%2C%22utm_medium%22%3A%22widget_new%22%2C%22utm_campaign%22%3A%22screener%22%7D",
      title: "Stocks Heatmap",
    },
    etfs: {
      url: "https://www.tradingview-widget.com/embed-widget/screener/?locale=en#%7B%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22defaultColumn%22%3A%22overview%22%2C%22screener_type%22%3A%22etf_mkt%22%2C%22displayCurrency%22%3A%22USD%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%2C%22utm_source%22%3A%22localhost%22%2C%22utm_medium%22%3A%22widget_new%22%2C%22utm_campaign%22%3A%22screener%22%7D",
      title: "ETFs Heatmap",
    },
    forex: {
      url: "https://www.tradingview-widget.com/embed-widget/forex-cross-rates/?locale=en#%7B%22currencies%22%3A%5B%22EUR%22%2C%22USD%22%2C%22JPY%22%2C%22GBP%22%2C%22CHF%22%2C%22AUD%22%2C%22CAD%22%2C%22NZD%22%5D%2C%22isTransparent%22%3Atrue%2C%22colorTheme%22%3A%22dark%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22locale%22%3A%22en%22%7D",
      title: "Forex Cross Rates",
    },
    commodities: {
      url: "https://www.tradingview-widget.com/embed-widget/screener/?locale=en#%7B%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22defaultColumn%22%3A%22overview%22%2C%22screener_type%22%3A%22forex_mkt%22%2C%22displayCurrency%22%3A%22USD%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%2C%22utm_source%22%3A%22localhost%22%2C%22utm_medium%22%3A%22widget_new%22%2C%22utm_campaign%22%3A%22screener%22%7D",
      title: "Commodities Heatmap",
    },
  }

  const currentConfig = heatmapConfigs[activeTab as keyof typeof heatmapConfigs]

  return (
    <Card className="bg-card border-border p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="etfs">ETFs</TabsTrigger>
          <TabsTrigger value="forex">Forex</TabsTrigger>
          <TabsTrigger value="commodities">Commodities</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <div className="w-full h-[400px] rounded-lg overflow-hidden">
            <iframe
              key={activeTab}
              src={currentConfig.url}
              title={currentConfig.title}
              className="w-full h-full border-0"
            />
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
