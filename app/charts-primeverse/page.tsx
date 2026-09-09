import { headers, cookies } from "next/headers"
import { SESSION_COOKIE, checkPrimeverseEmbed, getHubUrl, getAuthMode, verifySession } from "../../lib/auth"
import ChartsPrimeverseClient from "./charts-client"
import ForaDaPrimeverse from "./fora-da-primeverse"

export const dynamic = "force-dynamic"

/**
 * QUEM VÊ OS GRÁFICOS — decidido aqui, no pedido do documento.
 *
 * Antes esta página pedia utilizador e palavra-passe do hub a toda a gente. Mas
 * quem chega aos gráficos já entrou na PrimeVerse: o segundo login era atrito, e
 * obrigava o nosso servidor a receber a palavra-passe do hub para a reencaminhar.
 *
 * Agora: vindo de dentro da comunidade, entra directo. De fora, não há formulário
 * nenhum — o sítio para entrar é o hub, e é para lá que se manda a pessoa.
 *
 * Porque é que isto é server-side e não um `fetch` do cliente: o sinal de que o
 * pedido vem da PrimeVerse (`Referer`, `Sec-Fetch-*`) só existe no pedido do
 * DOCUMENTO. Num XHR feito pela própria página esse cabeçalho já é o nosso — o
 * sinal perdia-se pelo caminho.
 */
export default async function ChartsPrimeversePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const modo = getAuthMode()
  const sp = await searchParams
  const qs = new URLSearchParams(
    Object.entries(sp).flatMap(([k, v]) =>
      v == null ? [] : Array.isArray(v) ? v.map((x) => [k, x] as [string, string]) : [[k, v] as [string, string]],
    ),
  )

  const embed = checkPrimeverseEmbed(await headers(), qs)
  // Sessão antiga (de quem já tinha entrado pelo formulário) continua a valer.
  const sessao = verifySession((await cookies()).get(SESSION_COOKIE)?.value)

  const aberto = modo === "disabled" || modo === "dev"
  if (aberto || embed.allowed || sessao) {
    // O botão "Logout" só faz sentido para quem tem sessão própria: quem entra
    // pela comunidade não tem de onde sair, e um botão que não faz nada confunde.
    return <ChartsPrimeverseClient podeSair={Boolean(sessao) && !embed.allowed} />
  }

  return <ForaDaPrimeverse hubUrl={getHubUrl()} />
}
