import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Prime Verse - Professional Trading Platform",
  description:
    "Advanced technical analysis platform with AI-powered scanners, real-time charting, and intelligent position sizing.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/images/favicon-20primeverse.png",
        type: "image/png",
      },
    ],
    apple: "/images/favicon-20primeverse.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
</body>
    </html>
  )
}
