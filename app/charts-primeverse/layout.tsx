import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Charts Primeverse - Professional Trading Platform",
  description: "Advanced technical analysis platform with multi-market scanners.",
}

export default function ChartsPrimeverseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={null}>
      <main>{children}</main>
    </Suspense>
  )
}
