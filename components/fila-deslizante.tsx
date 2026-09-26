"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"

/**
 * FILA HORIZONTAL COM SINAL DE CORTE.
 *
 * Em ~375px de largura a fila de estratégias (e a das classes de ativo) não cabe:
 * ficava simplesmente cortada à direita, sem nada a dizer que havia mais. Isto
 * mantém a fila percorrível com scroll-snap e acende uma sombra em cada ponta —
 * só do lado onde ainda há conteúdo escondido, para o aviso não mentir.
 */
export default function FilaDeslizante({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [maisEsquerda, setMaisEsquerda] = useState(false)
  const [maisDireita, setMaisDireita] = useState(false)

  const medir = useCallback(() => {
    const el = ref.current
    if (!el) return
    const folga = el.scrollWidth - el.clientWidth - el.scrollLeft
    setMaisEsquerda(el.scrollLeft > 4)
    setMaisDireita(folga > 4)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    for (const filho of Array.from(el.children)) ro.observe(filho)
    return () => ro.disconnect()
  }, [medir])

  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={medir}
        className={`flex overflow-x-auto pb-1 [scrollbar-width:thin] [-webkit-overflow-scrolling:touch] [scroll-snap-type:x_proximity] [&>*]:[scroll-snap-align:start] ${className}`}
      >
        {children}
      </div>

      {/* Sombras de corte — decorativas, nunca apanham o toque */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-gray-900 to-transparent transition-opacity duration-200 ${
          maisEsquerda ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-gray-900 to-transparent transition-opacity duration-200 ${
          maisDireita ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  )
}
