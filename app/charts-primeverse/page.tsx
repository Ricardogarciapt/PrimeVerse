import { headers, cookies } from "next/headers"
import { SESSION_COOKIE, checkPrimeverseEmbed, getHubUrl, getAuthMode, verifySession, sessaoDoHub } from "../../lib/auth"
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

  const cabecalhos = await headers()

  /**
   * A ORDEM em que se pergunta, e porquê.
   *
   * 1. SESSÃO NO HUB — a pergunta certa. Quem tem sessão aberta na PrimeVerse
   *    entra, venha de onde vier: de um marcador, de um link partilhado, de um
   *    separador que ficou aberto desde ontem.
   * 2. `Referer` / chave de embed — a rede. Dentro de um iframe de outro domínio
   *    os nossos cookies são de terceiros e o Safari bloqueia-os: a pergunta de
   *    cima não tem como ser respondida, e é exactamente aí que o sinal de
   *    proveniência diz a verdade.
   * 3. Sessão própria antiga, de quem entrou pelo formulário antes disto existir.
   *
   * Primeiro a verificação forte, depois as fracas. Ao contrário, o `Referer`
   * respondia sempre primeiro e a sessão nunca chegava a ser consultada.
   */
  const noHub = await sessaoDoHub(cabecalhos)
  const embed = checkPrimeverseEmbed(cabecalhos, qs)
  // Sessão antiga (de quem já tinha entrado pelo formulário) continua a valer.
  const sessao = verifySession((await cookies()).get(SESSION_COOKIE)?.value)

  const aberto = modo === "disabled" || modo === "dev"
  if (aberto || noHub || embed.allowed || sessao) {
    // O botão "Logout" só faz sentido para quem tem sessão própria: quem entra
    // pela comunidade não tem de onde sair, e um botão que não faz nada confunde.
    // Quem entra pela comunidade — por sessão do hub ou emoldurado por ela — não tem de onde
    // sair: o botão levá-lo-ia a um logout que não é o dele.
    return <ChartsPrimeverseClient podeSair={Boolean(sessao) && !embed.allowed && !noHub} />
  }

  return <ForaDaPrimeverse hubUrl={getHubUrl()} />
}
