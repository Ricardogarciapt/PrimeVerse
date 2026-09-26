# Embeber os PrimeVerse Charts noutra plataforma

## O URL

```
https://<dominio-dos-charts>/charts-primeverse?embed=1
```

`?embed=1` (ou, se preferirem, `?chrome=0`) esconde **o nosso** cabeçalho, o
botão Community e o seletor de tema — o embutidor já tem os dele por fora, e a
dobrar ficava tudo esmagado. Continuam visíveis e utilizáveis os controlos que
são mesmo funcionais: classe de ativo, símbolo, intervalo e as estratégias.

Nesse modo o gráfico ocupa a altura útil toda do iframe e os painéis abaixo dele
(Live Alerts e calculadora de posição) ficam de fora — são eles que obrigavam a
fazer scroll dentro do iframe. Quem os quiser acrescenta `&panels=1`; a altura
anunciada ao pai passa a incluí-los.

## Altura do iframe (o lado do hub)

A página anuncia a altura que quer por `postMessage`, no evento
`primeverse:height`. **O iframe não se redimensiona a si próprio** — quem manda
na altura é a página que o embebe. Sem este bocado do lado do hub, o iframe fica
com a altura que lhe derem e volta a aparecer scroll lá dentro.

```html
<iframe
  id="primeverse-charts"
  src="https://<dominio-dos-charts>/charts-primeverse?embed=1"
  style="width:100%;height:760px;border:0;display:block"
  allow="fullscreen"
  title="PrimeVerse Charts"
></iframe>

<script>
  (function () {
    var iframe = document.getElementById('primeverse-charts');
    var ORIGEM = 'https://<dominio-dos-charts>'; // a origem exata do iframe

    window.addEventListener('message', function (evento) {
      if (evento.origin !== ORIGEM) return;
      if (evento.source !== iframe.contentWindow) return;

      var dados = evento.data;
      if (!dados || dados.type !== 'primeverse:height') return;

      var altura = Number(dados.height);
      if (!isFinite(altura) || altura <= 0) return;

      // Limites sãos: nunca abaixo de 600px, nunca acima de 2400px.
      iframe.style.height = Math.min(Math.max(Math.round(altura), 600), 2400) + 'px';
    });
  })();
</script>
```

Notas para quem instala do lado do hub:

- o `height` inicial no `style` importa: é o que se vê antes da primeira
  mensagem. 760px é um bom ponto de partida em desktop, 640px em telefone;
- **não** meter o iframe dentro de um contentor com `height` ou `max-height`
  fixos, nem com `overflow:hidden` a cortá-lo — se o contentor não deixar
  crescer, o `postMessage` não serve de nada;
- a barra de navegação do hub em mobile não deve ficar **por cima** do iframe:
  ou reserva-se espaço (`padding-bottom` no contentor) ou ela passa a ocupar
  lugar em vez de flutuar sobre o conteúdo;
- em telefone convém `width:100%` sem margens laterais — a área útil é pouca e
  a fila de estratégias já se percorre na horizontal (com sombra a indicar que
  há mais).

## Enquadramento (framing)

Não há `X-Frame-Options` nem `Content-Security-Policy: frame-ancestors` nesta
app (`next.config.mjs` sem `headers()`, sem `middleware.ts`, sem `vercel.json`),
portanto o enquadramento já é permitido de qualquer origem. Se um dia se quiser
fechar a uma lista explícita, é um `headers()` no `next.config.mjs` com

```
Content-Security-Policy: frame-ancestors 'self' https://hub.primeverse.ca https://*.primeverse.ca
```

(e, para desenvolvimento, `http://localhost:3000`). Enquanto não houver essa
necessidade fica como está — acrescentar a diretiva agora só arriscava partir
outro embutidor que hoje funcione.
