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
      url: "https://www.tradingview-widget.com/embed-widget/symbol-overview/?locale=en#%7B%22symbols%22%3A%5B%5B%22NASDAQ%3AAAPL%22%2C%22NASDAQ%3AMSF%22%2C%22NASDAQ%3AGOOGL%22%2C%22NASDAQ%3AMETA%22%2C%22NASDAQ%3ATSLA%22%2C%22NYSE%3AJPM%22%2C%22NYSE%3AV%22%2C%22NYSE%3AWMT%22%5D%5D%2C%22chartOnly%22%3Afalse%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22colorTheme%22%3A%22dark%22%2C%22autosize%22%3Atrue%2C%22showVolume%22%3Afalse%2C%22hideDateRanges%22%3Afalse%2C%22scalePosition%22%3A%22right%22%2C%22scaleMode%22%3A%22Normal%22%2C%22fontFamily%22%3A%22-apple-system%2C%20BlinkMacSystemFont%2C%20Trebuchet%20MS%2C%20Roboto%2C%20Ubuntu%2C%20sans-serif%22%2C%22fontSize%22%3A%2210%22%2C%22noTimeScale%22%3Afalse%2C%22valuesTracking%22%3A1%2C%22changeMode%22%3A%22price-and-percent%22%2C%22chartType%22%3A%22area%22%2C%22lineColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%201)%22%2C%22bottomColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.1)%22%2C%22topColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.3)%22%2C%22gridLineColor%22%3A%22rgba(42%2C%2046%2C%2057%2C%200.06)%22%2C%22scaleFontColor%22%3A%22rgba(120%2C%20123%2C%20134%2C%201)%22%2C%22belowLineFillColorGrowing%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.12)%22%2C%22belowLineFillColorFalling%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.12)%22%2C%22symbolActiveColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.12)%22%7D",
      title: "Stocks Overview",
    },
    etfs: {
      url: "https://www.tradingview-widget.com/embed-widget/symbol-overview/?locale=en#%7B%22symbols%22%3A%5B%5B%22SPY%22%2C%22QQQ%22%2C%22IWM%22%2C%22DIA%22%2C%22VTI%22%2C%22VEA%22%2C%22VWO%22%2C%22AGG%22%5D%5D%2C%22chartOnly%22%3Afalse%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22colorTheme%22%3A%22dark%22%2C%22autosize%22%3Atrue%2C%22showVolume%22%3Afalse%2C%22hideDateRanges%22%3Afalse%2C%22scalePosition%22%3A%22right%22%2C%22scaleMode%22%3A%22Normal%22%2C%22fontFamily%22%3A%22-apple-system%2C%20BlinkMacSystemFont%2C%20Trebuchet%20MS%2C%20Roboto%2C%20Ubuntu%2C%20sans-serif%22%2C%22fontSize%22%3A%2210%22%2C%22noTimeScale%22%3Afalse%2C%22valuesTracking%22%3A1%2C%22changeMode%22%3A%22price-and-percent%22%2C%22chartType%22%3A%22area%22%2C%22lineColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%201)%22%2C%22bottomColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.1)%22%2C%22topColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.3)%22%2C%22gridLineColor%22%3A%22rgba(42%2C%2046%2C%2057%2C%200.06)%22%2C%22scaleFontColor%22%3A%22rgba(120%2C%20123%2C%20134%2C%201)%22%2C%22belowLineFillColorGrowing%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.12)%22%2C%22belowLineFillColorFalling%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.12)%22%2C%22symbolActiveColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.12)%22%7D",
      title: "ETFs Overview",
    },
    forex: {
      url: "https://www.tradingview-widget.com/embed-widget/forex-cross-rates/?locale=en#%7B%22currencies%22%3A%5B%22EUR%22%2C%22USD%22%2C%22JPY%22%2C%22GBP%22%2C%22CHF%22%2C%22AUD%22%2C%22CAD%22%2C%22NZD%22%5D%2C%22isTransparent%22%3Atrue%2C%22colorTheme%22%3A%22dark%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22locale%22%3A%22en%22%7D",
      title: "Forex Cross Rates",
    },
    commodities: {
      url: "https://www.tradingview-widget.com/embed-widget/symbol-overview/?locale=en#%7B%22symbols%22%3A%5B%5B%22OANDA%3AXAUUSD%22%2C%22OANDA%3AXAGUSD%22%2C%22OANDA%3AWTICOUSD%22%2C%22OANDA%3ABCOUSD%22%2C%22OANDA%3ANATGASUSD%22%2C%22OANDA%3AXCUUSD%22%5D%5D%2C%22chartOnly%22%3Afalse%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22colorTheme%22%3A%22dark%22%2C%22autosize%22%3Atrue%2C%22showVolume%22%3Afalse%2C%22hideDateRanges%22%3Afalse%2C%22scalePosition%22%3A%22right%22%2C%22scaleMode%22%3A%22Normal%22%2C%22fontFamily%22%3A%22-apple-system%2C%20BlinkMacSystemFont%2C%20Trebuchet%20MS%2C%20Roboto%2C%20Ubuntu%2C%20sans-serif%22%2C%22fontSize%22%3A%2210%22%2C%22noTimeScale%22%3Afalse%2C%22valuesTracking%22%3A1%2C%22changeMode%22%3A%22price-and-percent%22%2C%22chartType%22%3A%22area%22%2C%22lineColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%201)%22%2C%22bottomColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.1)%22%2C%22topColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.3)%22%2C%22gridLineColor%22%3A%22rgba(42%2C%2046%2C%2057%2C%200.06)%22%2C%22scaleFontColor%22%3A%22rgba(120%2C%20123%2C%20134%2C%201)%22%2C%22belowLineFillColorGrowing%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.12)%22%2C%22belowLineFillColorFalling%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.12)%22%2C%22symbolActiveColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.12)%22%7D",
      title: "Commodities Overview",
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
