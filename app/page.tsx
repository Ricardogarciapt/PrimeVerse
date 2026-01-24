"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to charts page after animation
    const timer = setTimeout(() => {
      router.push("/charts-primeverse")
    }, 2500)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#040507]">
      <div className="text-center">
        {/* Logo with fade-in and scale animation */}
        <div className="animate-fadeInScale mb-8">
          <Image src="/images/image.png" alt="Prime Verse" width={400} height={100} className="mx-auto" priority />
        </div>

        {/* Loading spinner */}
        <div className="flex justify-center">
          <div className="relative w-16 h-16">
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-[#015BF9]/20 rounded-full"></div>
            {/* Animated ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-[#015BF9] rounded-full animate-spin"></div>
            {/* Inner glow */}
            <div className="absolute inset-2 bg-[#015BF9]/10 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Loading text */}
        <p className="mt-6 text-[#EDECED] text-sm animate-pulse">Loading Charts Primeverse...</p>
      </div>
    </div>
  )
}
