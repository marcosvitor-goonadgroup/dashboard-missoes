# Dashboard Missão BB

Painel de resultados da **#MissãoBB** no Rec’n’Play 2026 (11 a 14/11, Recife).
Identidade visual baseada no app [missoesbb.com.br](https://www.missoesbb.com.br/boas-vindas).

## Rodando

```bash
npm install --legacy-peer-deps
npm run dev        # http://localhost:3000
npm run build && npm start
```

Variável opcional (ver `.env.example`):

| Variável | Padrão |
|---|---|
| `MISSOES_API_URL` | `https://api-rac-n-play.vercel.app/api/data/all?event=missoes` |

## Como funciona

```
API Missão BB (dump das tabelas Strapi, ~840 KB, inclui dados pessoais)
        │  fetch no servidor, cache de 20 s
        ▼
app/api/dashboard/route.ts  ──  app/lib/sanitize.ts
        │  dataset enxuto (~20 KB), SEM dados pessoais
        ▼
navegador: app/dashboard-page.tsx
        │  computeDashboard(dataset, filtros)  ← app/utils/dashboard.utils.ts
        ▼
cards e gráficos (app/components/dashboard)  · atualização automática a cada 60 s
```

- **Nada de dado pessoal chega ao navegador**: nome, e-mail, CPF, telefone, senha,
  data de nascimento e número da sorte ficam no servidor. A idade vira faixa etária
  antes de sair.
- **Contas de equipe** (promotor, supervisor, resgate) são excluídas de todas as métricas.
- **Strapi v5**: cada registro com rascunho/publicado aparece duas vezes; usamos só o
  publicado. O vínculo check-in → missão usa `ativacao_doc` (a tabela
  `checkins_ativacao_lnk` não cobre todos os check-ins).
- Datas e horários no fuso `America/Recife`.

## Métricas

| Bloco | Origem |
|---|---|
| Participantes | `up_users` com papel *authenticated* |
| Missões concluídas / pendentes / recusadas | `checkins.status` |
| Pontos distribuídos / trocados | soma de `transacoes_pontos.delta` (positivos / negativos) |
| Prêmios resgatados / entregues | `resgates` (+ `entregue_em`) |
| Berloques, números da sorte | `berloque_entregas`, `numero_da_sortes` |
| Funil | Cadastro → Quiz (`perfil_quiz`) → 1ª missão além da entrada → 3+ missões → Prêmio |
| Validação | `checkins.metodo` (QR do promotor, IA, automática) + motivos de recusa da IA |
| Público | `perfil_quiz`, `data_usuario` (faixa etária), `tenho_conta`, `funcionario_bb` |
| Estoque | `brindes.estoque_total` × `brindes.disponivel` |
| Pesquisa | `pesquisa_experiencias` — respostas em texto convertidas para escala 1–5 |

### Pesquisa de experiência

`Muito satisfeito`/`Concordo totalmente` = 5 … `Muito insatisfeito`/`Discordo totalmente` = 1.
Grau = (nota − 1) ÷ 4 × 100.

- **Satisfação** = (Atendimento + Palestras + 3 × Experiência geral) ÷ 5 (mesma ponderação dos relatórios anteriores)
- **Posicionamento** = média de "soluções simples e inteligentes" e "conectado com a sociedade"
- **Intenção de relacionamento** = "vontade de ampliar o relacionamento"

As perguntas são reconhecidas por palavras-chave (`classifyQuestion` em `dashboard.utils.ts`).
Se o questionário mudar, perguntas de escala não reconhecidas aparecem em "Outras perguntas".

## Filtros globais

- **Público** (faixa etária, relação com o BB, perfil do quiz): valem para todo o painel.
- **Atividade** (missão, dia): recortam check-ins, pontos e berloques. Com eles ativos, os
  gráficos de público mostram só quem fez check-in no recorte. Prêmios e números da sorte
  não pertencem a uma missão e seguem só o filtro de dia.

## Paleta dos gráficos

Validada para daltonismo e contraste sobre a superfície `#fffdf3`:
séries `#465eff` · `#e8507a` · `#0b9cbd`; rampa ordinal `#a3aeff → #2b2fa8`;
status reservados validado `#0ca30c` · pendente `#fab219` · recusado `#d03b3b` (sempre com ícone + rótulo).
Todo gráfico tem o botão **Tabela** com os valores exatos.
