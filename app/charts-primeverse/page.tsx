import ChartsPrimeverseClient from "./charts-client"

export const dynamic = "force-dynamic"

/**
 * OS GRÁFICOS SÃO PÚBLICOS. Não há portão nenhum, e é de propósito.
 *
 * Esta página já teve três portões e os três estavam errados, cada um à sua maneira:
 *
 * · Um FORMULÁRIO que pedia as credenciais do hub — a quem já tinha entrado na comunidade, e
 *   obrigando o nosso servidor a receber a palavra-passe do hub para a reencaminhar.
 * · O `Referer`, que prova de ONDE a pessoa veio e não que ela está dentro: deixava entrar quem
 *   colasse o link numa página da comunidade e barrava quem abrisse os gráficos de um marcador.
 * · A sessão do hub, lida por cookie — que dentro de um iframe de outro domínio é de terceiros,
 *   e o Safari bloqueia. Resultado: gente com sessão aberta a ver o ecrã de entrada.
 *
 * O denominador comum é que NÃO HÁ AQUI NADA PARA PROTEGER. Os gráficos são o TradingView com
 * os nossos estudos por cima, e `/api/alerts` sempre foi público. O portão nunca guardou um
 * segredo — só estorvava quem tinha direito a passar, e falhava precisamente nos casos em que
 * mais importava não falhar.
 *
 * Se um dia houver mesmo alguma coisa a proteger, protege-se ESSA coisa na rota que a serve —
 * não a página inteira à porta.
 */
export default function ChartsPrimeversePage() {
  return <ChartsPrimeverseClient podeSair={false} />
}
