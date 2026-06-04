# MyLine CS2

Fantasy de CS2 + Campeonatos da Comunidade para o cenário brasileiro.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Pré-requisitos](#pré-requisitos)
- [Setup do Projeto](#setup-do-projeto)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Banco de Dados](#banco-de-dados)
- [Sistema de Pontuação](#sistema-de-pontuação)
- [Valorização de Line Coins](#valorização-de-line-coins)
- [Rotas da Aplicação](#rotas-da-aplicação)
- [Deploy](#deploy)

---

## Visão Geral

O **MyLine** é uma plataforma com duas frentes independentes para fãs de CS2:

| Frente | Descrição |
|---|---|
| **Fantasy Oficial** | Cartola CS2 — monte lineups com Line Coins (LC), pontue com stats reais do HLTV e suba no ranking a cada rodada |
| **Comunidade** | Crie ou participe de campeonatos amadores, registre partidas e acompanhe a tabela de classificação |

---

## Funcionalidades

### Fantasy Oficial
- Monte lineups com até **5 jogadores** por rodada
- Orçamento de **100.000 Line Coins (LC)** por campeonato
- Sistema de **capitão** por lineup
- Pontuação automática baseada em stats reais (importadas via extensão Chrome do HLTV)
- **Valorização/desvalorização** dos jogadores a cada rodada
- Ranking geral e por rodada

### Campeonatos da Comunidade
- Crie torneios com nome, formato (BO1 / BO3 / BO5 / etc.) e datas
- Inscreva times e gerencie membros
- Registre partidas e resultados
- Tabela de classificação automática
- Stats por mapa e por partida

### Autenticação
- Cadastro e login via Supabase Auth
- Sessão protegida por cookie HttpOnly (`myline-token`)
- Rotas `/dashboard`, `/fantasy` e `/comunidade` protegidas por proxy

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Frontend | React 19 + TypeScript + Tailwind CSS 4 |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Deploy | Vercel + GitHub |
| Dados | Extensão Chrome → HLTV manual |

---

## Pré-requisitos

- Node.js 20.9+
- Conta no [Supabase](https://supabase.com) com projeto criado
- Conta no GitHub com acesso ao repositório `henrique-gpu/MYLINE`

---

## Setup do Projeto

### 1. Clone e instale as dependências

```bash
git clone https://github.com/henrique-gpu/MYLINE.git
cd MYLINE
npm install
```

### 2. Configure as variáveis de ambiente

Crie o arquivo `.env.local` na raiz do projeto (veja a seção abaixo).

### 3. Rode a migration SQL no Supabase

No painel do Supabase → **SQL Editor** → cole e execute o conteúdo de:

```
supabase/migrations/001_create_tables.sql
```

Isso cria as 13 tabelas faltantes, índices e políticas RLS.

> **Tabelas existentes** (criadas anteriormente):
> `users`, `championships`, `teams`, `players`, `rounds`, `user_championships`

> **Tabelas criadas pela migration**:
> `lineups`, `lineup_players`, `player_prices`, `player_round_stats`, `player_map_stats`,
> `rankings`, `matches`, `community_tournaments`, `community_teams`,
> `community_player_profile`, `community_team_members`, `community_matches`,
> `community_player_stats`, `community_standings`

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-anon-key>
```

Obtenha esses valores em: **Supabase Dashboard → Project Settings → API**.

---

## Estrutura de Pastas

```
myline-app/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx          # Login com Supabase Auth
│   │   │   └── signup/page.tsx         # Cadastro
│   │   ├── api/
│   │   │   └── auth/cookie/route.ts    # Route Handler para cookie de sessão
│   │   ├── comunidade/
│   │   │   ├── [id]/page.tsx           # Detalhe do torneio
│   │   │   ├── criar/page.tsx          # Criar torneio
│   │   │   └── page.tsx                # Listagem de torneios
│   │   ├── dashboard/page.tsx          # Dashboard principal
│   │   ├── fantasy/
│   │   │   ├── [championshipId]/
│   │   │   │   ├── mercado/page.tsx    # Lineup builder (mercado de jogadores)
│   │   │   │   └── ranking/page.tsx   # Ranking por rodada
│   │   │   └── page.tsx               # Listagem de campeonatos
│   │   ├── globals.css                # Tema CS2 (dark + verde)
│   │   ├── layout.tsx                 # Root layout
│   │   └── page.tsx                   # Landing page
│   ├── components/
│   │   ├── fantasy/
│   │   │   └── lineup-builder.tsx     # Builder interativo de lineup
│   │   └── layout/
│   │       ├── app-layout.tsx         # Wrapper com Navbar
│   │       └── navbar.tsx             # Navbar com auth state
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts              # Singleton browser client
│   │       └── server.ts              # Server client factory
│   ├── proxy.ts                       # Proteção de rotas (Next.js 16)
│   └── types/
│       └── database.ts               # Tipos TypeScript de todas as tabelas
└── supabase/
    └── migrations/
        └── 001_create_tables.sql     # Migration completa com RLS
```

---

## Banco de Dados

### Fantasy Oficial

| Tabela | Descrição |
|---|---|
| `championships` | Campeonatos (tipo fantasy ou community) |
| `teams` | Times profissionais |
| `players` | Jogadores com time e role (awper, igl, entry…) |
| `rounds` | Rodadas de cada campeonato |
| `matches` | Partidas (BO1/BO3/BO5) com resultado |
| `user_championships` | Inscrição do usuário em campeonatos |
| `lineups` | Lineup por usuário+rodada (única por combinação) |
| `lineup_players` | Jogadores da lineup (máx. 5, 1 capitão) |
| `player_prices` | Preço em LC por rodada + % de variação |
| `player_round_stats` | Stats totais da série (kills, deaths, rating, ADR…) |
| `player_map_stats` | Stats por mapa individual |
| `rankings` | Posição e pontos por rodada |

### Comunidade

| Tabela | Descrição |
|---|---|
| `community_tournaments` | Torneios amadores |
| `community_teams` | Times inscritos nos torneios |
| `community_player_profile` | Perfil de jogador (Steam ID, nick) |
| `community_team_members` | Membros de cada time |
| `community_matches` | Partidas dos torneios |
| `community_player_stats` | Stats por partida comunitária |
| `community_standings` | Classificação do torneio |

---

## Sistema de Pontuação

Pontuação base por evento em cada série (soma de todos os mapas):

| Evento | Pontos |
|---|---|
| Kill | +1.0 |
| Assistência | +0.5 |
| Morte | −0.4 |
| K/D positivo | +2.0 |
| K/D > 1.5 | +4.0 |
| Rating > 1.20 | +5.0 |
| Rating 1.00–1.19 | +2.0 |
| Rating < 0.80 | −4.0 |
| ADR > 85 | +3.0 |
| ADR < 55 | −2.0 |
| Clutch | +4.0 |
| Ace | +6.0 |
| MVP | +5.0 |
| Vitória | +3.0 |
| Derrota | −1.0 |
| Eliminado do torneio | −3.0 |

> Stats calculadas como **soma total da série**. Stats individuais por mapa ficam em `player_map_stats`.

---

## Valorização de Line Coins

A cada rodada, os preços dos jogadores variam com base na pontuação obtida:

| Pontuação | Variação |
|---|---|
| 40+ pts | +8% |
| 30–39 pts | +5% |
| 20–29 pts | +2% |
| 10–19 pts | 0% |
| 0–9.99 pts | −3% |
| Pontuação negativa | −7% |
| Eliminado | −10% |

---

## Rotas da Aplicação

| Rota | Acesso | Descrição |
|---|---|---|
| `/` | Pública | Landing page com preview do projeto |
| `/login` | Pública | Login |
| `/signup` | Pública | Cadastro |
| `/dashboard` | Autenticada | Painel principal |
| `/fantasy` | Autenticada | Listagem de campeonatos fantasy |
| `/fantasy/[id]/mercado` | Autenticada | Lineup builder da rodada ativa |
| `/fantasy/[id]/ranking` | Autenticada | Ranking geral do campeonato |
| `/comunidade` | Autenticada | Listagem de torneios comunitários |
| `/comunidade/criar` | Autenticada | Criar novo torneio |
| `/comunidade/[id]` | Autenticada | Detalhe + classificação + partidas |

---

## Deploy

### Vercel (recomendado)

1. Importe o repositório em [vercel.com](https://vercel.com)
2. Configure as variáveis de ambiente no painel da Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy automático a cada push na branch `main`

---

## Licença

Projeto privado — todos os direitos reservados.
