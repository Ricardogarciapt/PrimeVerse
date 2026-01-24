# TradingView Widget - Código e Comportamento

## Visão Geral

Este documento descreve o código e comportamento do iframe do TradingView utilizado no Charts Primeverse, incluindo todos os estudos (scanners) disponíveis e suas configurações.

## Estrutura do Widget

### Carregamento do Script

O widget do TradingView é carregado dinamicamente através de um script externo:

\`\`\`javascript
const script = document.createElement("script")
script.id = "tradingview-script"
script.src = "https://s3.tradingview.com/tv.js"
script.async = true
document.head.appendChild(script)
\`\`\`

### Inicialização do Widget

O widget é inicializado através da classe `TradingView.widget()` com as seguintes configurações principais:

\`\`\`javascript
const widgetOptions = {
  autosize: true,
  symbol: selectedSymbol,              // Ex: "OANDA:XAUUSD"
  interval: favoriteTimeframe,         // Ex: "60" (1 hora)
  timezone: "Etc/UTC",
  theme: theme,                        // "light" ou "dark"
  style: "1",                          // Estilo de candles
  locale: "br",
  container_id: "tradingview_widget",
  studies: studiesToApply,             // Array de IDs dos estudos
  // ... outras configurações
}
\`\`\`

## Estudos Disponíveis (Scanners)



| Scanner | ID(s) do Estudo | Descrição |
|---------|----------------|-----------|
| **GoldenZone** | `PUB;0b373fb0e6634a73bc8b838cf0690725` | Zona dourada de suporte/resistência |
| **Momentum** | `PUB;00ec48baf0ee43f0a43e1658bb54cdab`<br>`PUB;38080827cf244587b5e7dbb9f272db0a` | Indicador de momentum (2 estudos) |
| **Winzone** | `PUB;6c003d30b2154ef3a31074d5c703954f`<br>`PUB;e6adb5e5246c43f4a8dcffde5c98db4e`<br>`PUB;162198dcae874d5da28f7b048feb76e7`<br>`PUB;b6587ba7dc7b4489927cfd94d1fb8a9f`<br>`PUB;0bf15eb0edba447f84e19fce69391ccb` | Zona de alta probabilidade (5 estudos) |
| **Nexus** | `PUB;862506c546514212b9728a634dbc7152` | Ponto de convergência de sinais |
| **Sinergy** | `PUB;3b86bd1192124fd98583490bb7508041` | Análise sinérgica de múltiplos fatores |

### Mapeamento de Estudos

\`\`\`javascript
const availableStudies = ["GoldenZone", "Momentum", "Winzone", "Nexus", "Sinergy"] as const

const scannerStudies: Record<StudyKey, string[]> = {
  GoldenZone: ["PUB;0b373fb0e6634a73bc8b838cf0690725"],
  Momentum: ["PUB;00ec48baf0ee43f0a43e1658bb54cdab", "PUB;38080827cf244587b5e7dbb9f272db0a"],
  Winzone: [
    "PUB;6c003d30b2154ef3a31074d5c703954f",
    "PUB;e6adb5e5246c43f4a8dcffde5c98db4e",
    "PUB;162198dcae874d5da28f7b048feb76e7",
    "PUB;b6587ba7dc7b4489927cfd94d1fb8a9f",
    "PUB;0bf15eb0edba447f84e19fce69391ccb",
  ],
  Nexus: ["PUB;862506c546514212b9728a634dbc7152"],
  Sinergy: ["PUB;3b86bd1192124fd98583490bb7508041"],
}
\`\`\`


## Configurações Importantes

### Features Desabilitadas

\`\`\`javascript
disabled_features: [
  "header_widget_dom_node", 
  "header_widget", 
  "volume_force_overlay", 
  "scanner-access",
  "create_volume_indicator_by_default",
  "volumePaneSize",
  "tick_volume",
]
\`\`\`

### Features Habilitadas

\`\`\`javascript
enabled_features: [
  "study_on_study",
  "save_chart_properties_to_local_storage",
  "use_localstorage_for_settings",
  "header_screenshot",
  "show_chart_property_page",
  "property_pages",
  "context_menus",
  "control_bar",
  "timeframes_toolbar",
  "border_around_the_chart",
  "header_chart_type",
  "header_settings",
  "header_indicators",
  "header_compare",
  "header_undo_redo",
  "header_fullscreen_button",
  "header_saveload",
  "header_symbol_search",
  "header_interval_dialog_button",
  "header_resolutions",
]
\`\`\`

### Overrides (Configurações de Visualização)

\`\`\`javascript
overrides: {
  // Contagem regressiva
  "mainSeriesProperties.showCountdown": true,
  
  // Mostrar último valor da série principal
  "scalesProperties.showSeriesLastValue": true,
  
  // === ESCONDER LEGENDAS DOS ESTUDOS ===
  "scalesProperties.showStudyLastValue": false,
  "paneProperties.legendProperties.showStudyTitles": false,
  "paneProperties.legendProperties.showStudyArguments": false,
  "paneProperties.legendProperties.showStudyValues": false,
  "volumePaneSize": "hide",
  
  // === ESCALA DE PREÇOS (PRICE SCALE) ===
  "scalesProperties.autoScale": true,               // Auto (ajusta dados à tela)
  "scalesProperties.lockPriceToBarRatio": false,    // Não travar proporção preço/barra
  "scalesProperties.scaleSeriesOnly": true,         // Escalar apenas gráfico de preços
  "scalesProperties.invertScale": false,            // Não inverter escala
}
\`\`\`

## Comportamento de AUTO e Escala de Preços

### Configuração Automática

Após o widget estar pronto, todos os estudos são configurados automaticamente para:

1. **AUTO Scale (AutoScale)**: A escala se ajusta automaticamente aos dados visíveis
2. **Price Scale Only**: Os estudos usam apenas a escala de preços (não criam escala separada)

### Código de Configuração

\`\`\`javascript
widgetRef.current.onChartReady(() => {
  const chart = widgetRef.current.chart && widgetRef.current.chart()
  if (chart) {
    setTimeout(() => {
      const allStudies = chart.getAllStudies?.() || []
      
      allStudies.forEach((study) => {
        // Habilitar AUTO (autoScale)
        if (typeof study.setAutoScale === 'function') {
          study.setAutoScale(true)
        }
        
        // Configurar para usar apenas escala de preços
        if (typeof study.setPriceScale === 'function') {
          study.setPriceScale(true)
        }
        
        // Alternativa via setEntityInfo
        if (typeof study.setEntityInfo === 'function') {
          study.setEntityInfo({ 
            priceScaleId: 'right',
            autoScale: true 
          })
        }
      })
    }, 1500) // Delay para garantir que estudos estão carregados
  }
})
\`\`\`

## Adicionar/Remover Estudos

### Adicionar um Novo Estudo

1. Adicione o ID do estudo ao objeto `scannerStudies`:

\`\`\`javascript
const scannerStudies = {
  // ... estudos existentes
  NovoEstudo: ["PUB;seu-id-aqui"],
}
\`\`\`

2. Adicione o estudo ao array `availableStudies`:

\`\`\`javascript
const availableStudies = [
  "GoldenZone", 
  "Momentum", 
  "Winzone", 
  "Nexus", 
  "Sinergy",
  "NovoEstudo"  // Adicionar aqui
] as const
\`\`\`

3. Adicione o label e logo (se necessário para UI):

\`\`\`javascript
const scannerLabels = {
  // ... labels existentes
  NovoEstudo: "Novo Estudo",
}
\`\`\`

### Remover um Estudo

1. Remova o estudo de `availableStudies`
2. Remova a entrada de `scannerStudies`
3. Se houver UI, remova de `scannerLabels` e `scannerLogos`

### Filtrar Estudos

O Charts Primeverse filtra automaticamente os estudos permitidos:

\`\`\`javascript
const handleStudiesChange = useCallback((studies: string[]) => {
  const filtered = studies.filter(s => availableStudies.includes(s as StudyKey)) as StudyKey[]
  setSelectedStudies(filtered.length > 0 ? filtered : ["GoldenZone"])
}, [])
\`\`\`

## Símbolos Suportados

### Formatos de Símbolos

- **Forex**: `OANDA:EURUSD`, `OANDA:GBPUSD`, etc.
- **Crypto**: `BINANCE:BTCUSDT`, `BINANCE:ETHUSDT`, etc.
- **Commodities**: `OANDA:XAUUSD`, `OANDA:WTICOUSD`, etc.
- **Índices**: `OANDA:SPX500USD`, `OANDA:NAS100USD`, etc.
- **Ações**: `NASDAQ:AAPL`, `NYSE:MSFT`, etc.

### Timeframes Suportados

- `1` - 1 minuto
- `5` - 5 minutos
- `15` - 15 minutos
- `30` - 30 minutos
- `60` - 1 hora
- `240` - 4 horas
- `D` - 1 dia
- `W` - 1 semana

## Persistência de Dados

### LocalStorage

O widget salva automaticamente as seguintes configurações no `localStorage`:

- `mtm_active_scanners`: Estudos selecionados
- `mtm_chart_theme`: Tema (light/dark)
- `mtm_favorite_timeframe`: Timeframe favorito
- `mtm_saved_charts`: Gráficos salvos (até 20)

### Charts Storage

O TradingView também utiliza seu próprio sistema de armazenamento:

\`\`\`javascript
charts_storage_url: "https://saveload.tradingview.com",
charts_storage_api_version: "1.1",
client_id: "tradingview.com",
user_id: "public_user_id",
\`\`\`

## Eventos e Callbacks

### onChartReady

Callback executado quando o gráfico está pronto:

\`\`\`javascript
widgetRef.current.onChartReady(() => {
  // Configurar estudos
  // Aplicar configurações personalizadas
  // Resetar dados se necessário
})
\`\`\`

### Mudanças de Estado

O widget é recarregado automaticamente quando mudam:

- `selectedStudies` - Estudos selecionados
- `selectedSymbol` - Símbolo do gráfico
- `theme` - Tema (light/dark)
- `favoriteTimeframe` - Timeframe

## Diferenças do IQCharts2

### Estudos Excluídos

Charts Primeverse **não inclui**:
- KillShot
- Supernova
- Smartmonics

### Estudos Disponíveis

Apenas 5 estudos estão disponíveis:
1. GoldenZone
2. Momentum
3. Winzone
4. Nexus
5. Sinergy

## Troubleshooting

### Estudos não aparecem

1. Verifique se os IDs dos estudos estão corretos
2. Confirme que os estudos estão no array `studies` do widget
3. Verifique se o estudo não está na lista de excluídos
4. Verifique o console para erros de carregamento

### Escala não está em AUTO

1. Verifique se `scalesProperties.autoScale` está definido como `true` nos overrides
2. Confirme que o callback `onChartReady` está sendo executado
3. Verifique se `setAutoScale(true)` está sendo chamado para cada estudo

### Legendas aparecem

1. Confirme que os overrides estão configurados:
   - `scalesProperties.showStudyLastValue: false`
   - `paneProperties.legendProperties.showStudyTitles: false`
   - `paneProperties.legendProperties.showStudyArguments: false`
   - `paneProperties.legendProperties.showStudyValues: false`

### Estudo não está disponível

1. Verifique se o estudo está no array `availableStudies`
2. Confirme que não está na lista de estudos excluídos (KillShot, Supernova, Smartmonics)
3. Verifique se o filtro de estudos está funcionando corretamente

## Referências

- [TradingView Widget API Documentation](https://www.tradingview.com/widget-docs/)
- [TradingView Charting Library](https://www.tradingview.com/charting-library/)
- [Pine Script Documentation](https://www.tradingview.com/pine-script-docs/)

## Notas Importantes

1. **Charts Primeverse tem estudos limitados** - Apenas 5 estudos estão disponíveis (sem KillShot, Supernova e Smartmonics)
2. **Todos os estudos são públicos** (prefixo `PUB;`) e podem ser acessados por qualquer usuário do TradingView
3. **A configuração de AUTO e Price Scale** é aplicada automaticamente após 1.5 segundos do carregamento do gráfico
4. **O widget é recriado** sempre que há mudanças nos estudos, símbolo, tema ou timeframe
5. **O localStorage é usado** para persistir preferências do usuário entre sessões
6. **O limite de gráficos salvos** é de 20 por usuário
7. **O filtro de estudos** garante que apenas estudos permitidos sejam aplicados
