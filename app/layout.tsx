import type React from "react"
import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "../components/theme-provider"
import { Toaster } from "../components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "Prime Verse - Professional Trading Platform",
  description:
    "Advanced technical analysis platform with multi-market scanners, real-time charting, and intelligent position sizing.",
  applicationName: "Prime Verse",
  icons: {
    icon: [{ url: "/images/favicon-20primeverse.png", type: "image/png" }],
    apple: "/images/favicon-20primeverse.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#040507",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
