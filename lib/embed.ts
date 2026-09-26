/**
 * MODO EMBED — a mesma página vista de dentro do iframe de outra plataforma.
 *
 * O hub (hub.primeverse.ca) mete os gráficos num iframe e já tem cabeçalho,
 * navegação e rodapé DELE por fora. Se mostrarmos os nossos por dentro, fica
 * tudo a dobrar e o gráfico esmagado numa faixa. O modo embed liga-se pela
 * query string — é o embutidor que decide, não nós a adivinhar pelo `Referer`
 * nem pelo `window.top` (isso mudaria o aspeto a quem já embebe hoje).
 *
 * Aceita `?embed=1` e também `?chrome=0`, porque "sem chrome" é como este tipo
 * de parâmetro costuma chamar-se e custa nada aceitar os dois.
 */

/** Nome do evento postMessage com que a página anuncia a altura ao pai. */
export const EVENTO_ALTURA = "primeverse:height"

const VERDADEIRO = new Set(["1", "true", "yes", "on"])
const FALSO = new Set(["0", "false", "no", "off"])

export type ModoEmbed = {
  /** Esconder cabeçalho/navegação/rodapé próprios — o embutidor já os tem. */
  embutido: boolean
  /** Mostrar os painéis abaixo do gráfico (alertas + calculadora). */
  painéis: boolean
}

/**
 * Lê o modo a partir dos parâmetros do URL.
 *
 * `?embed=1` (ou `?chrome=0`) → embutido. Dentro do embed os painéis abaixo do
 * gráfico ficam DE FORA por defeito: são eles que obrigam a fazer scroll dentro
 * do iframe. Quem os quiser acrescenta `&panels=1` e a altura anunciada ao pai
 * passa a incluí-los.
 */
export function lerModoEmbed(params: URLSearchParams | null | undefined): ModoEmbed {
  const valor = (nome: string) => params?.get(nome)?.trim().toLowerCase() ?? null

  const embed = valor("embed")
  const chrome = valor("chrome")
  const embutido = (embed !== null && !FALSO.has(embed)) || (chrome !== null && FALSO.has(chrome))

  const panels = valor("panels")
  const painéis = embutido ? panels !== null && VERDADEIRO.has(panels) : true

  return { embutido, painéis }
}
