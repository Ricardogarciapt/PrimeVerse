"use client"

import { useEffect } from "react"
import { EVENTO_ALTURA } from "@/lib/embed"

/**
 * ANUNCIA A ALTURA AO PAI (padrão iframe-resizer).
 *
 * Um iframe não se mede a si próprio: quem manda na altura é o embutidor. Se ele
 * fixar 600px e o conteúdo pedir 900, aparece scroll DENTRO do iframe — que é o
 * que o dono se queixou. Aqui a página diz quanta altura quer e o hub, do lado
 * dele, cresce o iframe (o snippet está em docs/embed.md).
 *
 * Não há ciclo: no modo embed a página é `100dvh` com um mínimo, logo a altura
 * pedida é o maior entre esse mínimo e a altura do próprio iframe — assim que o
 * pai a satisfaz, o valor estabiliza. Ignoram-se variações de 1px.
 */
export default function EmbedHeightReporter() {
  useEffect(() => {
    // Fora de um iframe não há a quem anunciar nada.
    if (typeof window === "undefined" || window.parent === window) return

    let última = 0
    let pendente = 0

    const anunciar = () => {
      const el = document.documentElement
      const altura = Math.ceil(Math.max(el.scrollHeight, document.body?.scrollHeight ?? 0))
      if (!altura || Math.abs(altura - última) <= 1) return
      última = altura
      // '*' porque o embutidor pode ser qualquer origem autorizada; a mensagem
      // só leva um número, não há nada aqui que valha proteger.
      window.parent.postMessage({ type: EVENTO_ALTURA, height: altura }, "*")
    }

    // Agrupa rajadas de resize num único anúncio por frame.
    const agendar = () => {
      if (pendente) return
      pendente = window.requestAnimationFrame(() => {
        pendente = 0
        anunciar()
      })
    }

    const ro = new ResizeObserver(agendar)
    ro.observe(document.documentElement)
    if (document.body) ro.observe(document.body)
    window.addEventListener("resize", agendar)
    window.addEventListener("load", agendar)
    anunciar()

    return () => {
      ro.disconnect()
      window.removeEventListener("resize", agendar)
      window.removeEventListener("load", agendar)
      if (pendente) window.cancelAnimationFrame(pendente)
    }
  }, [])

  return null
}
