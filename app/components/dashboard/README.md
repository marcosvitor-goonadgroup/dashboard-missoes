# Componentes do dashboard

| Componente | Uso |
|---|---|
| `Header` | Logo BB, #MissãoBB, status "ao vivo", Atualizar e Filtros |
| `MetricCard` | Cartão de KPI (`tone="destaque"` = vidro azul) |
| `ChartCard` | Moldura de gráfico com botão Tabela (prop `table`) |
| `LineChartComponent` | Linhas Nivo com crosshair; legenda HTML quando há 2+ séries |
| `RankedBars` | Barras horizontais HTML (ranking, faixas) |
| `FunnelCard` | Funil da jornada com conversão entre etapas |
| `MissionCheckinsChart` | Barras horizontais de check-ins por missão (empilhadas por status) |
| `MissionsTable` | Tabela por missão com barra de status e ordenação |
| `ValidationCard` | Check-ins por método de validação + recusas da IA |
| `BaseCard` | Clientes × não clientes (barra segmentada) |
| `PrizesCard` | Estoque e resgates por prêmio |
| `SatisfactionBlockCard` | Bloco da pesquisa (grau, nota, perguntas) |
| `CommentsCard` | Comentários abertos da pesquisa |
| `FilterOffcanvas` | Painel lateral de filtros globais |
| `Icon` | Ícones SVG de traço |
| `chartTheme.ts` | Paleta validada + tema Nivo |

Estilos ficam em `app/globals.css` (classes `.glass`, `.card`, `.kpi`, `.hbar-*`, `.segbar`, `.meter`, `.data-table`…).
