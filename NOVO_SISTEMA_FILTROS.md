# 🎯 Novo Sistema de Filtros com Offcanvas

## O que mudou?

### ❌ Antes
- Seção de filtros sempre visível ocupando espaço na tela
- Filtros aplicados globalmente sem controle fino
- Interface menos limpa e intuitiva

### ✅ Agora
- **Botões de filtro integrados nos cards** - Apenas nos gráficos que suportam filtros
- **Offcanvas deslizante** - Painel lateral que aparece apenas quando necessário
- **Indicadores visuais** - Botão azul quando há filtros ativos
- **Filtros contextuais** - Cada gráfico tem seus próprios filtros

---

## 📊 Cards e seus Filtros

### 1. Check-ins por Dia
- **Filtro**: Ativação
- **Botão**: Canto superior direito do card
- **Efeito**: Mostra apenas check-ins da ativação selecionada

### 2. Distribuição por Faixa Etária
- **Filtro**: Ativação
- **Botão**: Canto superior direito do card
- **Efeito**: Mostra faixa etária apenas da ativação selecionada

### 3. Intenção de Relacionamento (Top 2 Box)
- **Filtro**: Ativação
- **Botão**: Canto superior direito do card
- **Efeito**: Mostra intenção apenas da ativação selecionada

### 4. Picos de Horário das Ativações
- **Filtros**: Ativação + Data Específica
- **Botão**: Canto superior direito do card
- **Efeito**: Mostra horários filtrados por ativação e/ou data

### 5. Check-ins por Ativação
- **Sem filtro** - Mostra sempre todas as ativações

### 6. Usuários Cadastrados por Dia
- **Sem filtro** - Mostra sempre todos os usuários

---

## 🎨 Interface do Offcanvas

### Características:
- ✨ **Animação suave** ao abrir/fechar
- 🎯 **Largura responsiva** (400px ou 90% da tela)
- 🌑 **Overlay escuro** ao fundo para foco
- 🔵 **Botão "Aplicar"** para confirmar seleção
- 🔴 **Botão "Limpar Filtros"** quando há filtros ativos
- ❌ **Botão de fechar** (X) no canto superior direito
- 📝 **Textos explicativos** abaixo de cada filtro

### Layout:
```
┌─────────────────────────────────┐
│ Filtrar por Ativação          × │ ← Header
├─────────────────────────────────┤
│                                 │
│ Ativação                        │
│ [Dropdown com ativações]        │
│ Filtra os dados apenas para...  │
│                                 │
│ Data Específica (se aplicável)  │
│ [Dropdown com datas]            │
│ Selecione uma data específica...│
│                                 │
├─────────────────────────────────┤
│ [Limpar Filtros] [Aplicar]      │ ← Footer
└─────────────────────────────────┘
```

---

## 💡 Como Usar

### 1. Clicar no botão de filtro
- Localizado no canto superior direito dos cards com filtros
- Ícone de funil (🔽)
- Texto "Filtrar" ou "Filtro Ativo" (se já houver filtro)

### 2. Selecionar opções
- Escolher ativação no dropdown
- Escolher data (se disponível)
- Ver descrição abaixo de cada opção

### 3. Aplicar ou limpar
- **Aplicar**: Confirma e fecha o offcanvas
- **Limpar Filtros**: Remove todos os filtros ativos
- **Fechar (×)**: Fecha mantendo seleção atual

### 4. Indicadores visuais
- **Botão cinza**: Sem filtros ativos
- **Botão azul**: Com filtros ativos
- **Subtitle no card**: Nome da ativação/data selecionada

---

## 🏗️ Arquitetura Técnica

### Componentes Criados:

#### FilterOffcanvas.tsx
- Painel lateral reutilizável
- Suporta múltiplos tipos de filtros
- Animações CSS nativas
- Bloqueia scroll do body quando aberto

#### ChartCard.tsx
- Wrapper para gráficos
- Botão de filtro integrado
- Suporte a título e subtítulo
- Altura fixa de 300px para gráficos

### Estados Gerenciados:
```typescript
// Dashboard principal
const [selectedActivation, setSelectedActivation] = useState<number>()
const [selectedDate, setSelectedDate] = useState<string>("")
const [isActivationFilterOpen, setIsActivationFilterOpen] = useState(false)
const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false)
```

### Fluxo de Dados:
1. Usuário clica no botão de filtro
2. Estado `isFilterOpen` muda para `true`
3. Offcanvas desliza da direita
4. Usuário seleciona opções
5. Ao aplicar, estados de filtro são atualizados
6. `useEffect` recalcula dados filtrados
7. Gráficos são re-renderizados

---

## ✅ Benefícios

1. **Interface Mais Limpa**
   - Sem seção permanente de filtros
   - Mais espaço para os gráficos

2. **UX Melhorada**
   - Filtros contextuais por card
   - Indicadores visuais claros
   - Animações suaves

3. **Código Mais Organizado**
   - Componentes reutilizáveis
   - Separação de responsabilidades
   - Fácil adicionar novos filtros

4. **Performance**
   - Offcanvas renderizado apenas quando necessário
   - Filtros aplicados de forma eficiente

5. **Responsivo**
   - Funciona em desktop e mobile
   - Largura adaptativa do offcanvas

---

## 🚀 Como Adicionar Novos Filtros

### Em um card existente:
```tsx
<ChartCard
  title="Meu Gráfico"
  onFilterClick={() => setIsMyFilterOpen(true)}
  hasActiveFilter={!!myFilter}
>
  <MyChart data={filteredData} />
</ChartCard>
```

### Criar novo offcanvas:
```tsx
<FilterOffcanvas
  isOpen={isMyFilterOpen}
  onClose={() => setIsMyFilterOpen(false)}
  title="Meus Filtros"
  showActivationFilter={true}
  activations={activations}
  selectedActivation={selected}
  onActivationChange={setSelected}
/>
```

### Processar dados filtrados:
```typescript
useEffect(() => {
  if (!rawData) return
  setFilteredData(
    processMyData(rawData, myFilter)
  )
}, [myFilter, rawData])
```

---

## 📝 Notas de Implementação

- ✅ Build compilando sem erros
- ✅ TypeScript types completos
- ✅ Componentes documentados
- ✅ README atualizado
- ✅ Código modular e reutilizável
- ✅ Animações suaves com CSS puro
- ✅ Acessibilidade (ESC fecha offcanvas via overlay)
