# Growly 🚀

> **Plataforma B2B de Gestão de Desempenho e Desenvolvimento Profissional Contínuo.**

O **Growly** transforma avaliações de desempenho em evolução prática e contínua. Ele organiza ciclos de avaliação corporativos, compara a percepção de cada colaborador com a de sua liderança, mapeia os maiores *gaps* de competência e utiliza **Inteligência Artificial** para orientar a criação de Planos de Desenvolvimento Individual (PDI) objetivos e acionáveis.

---

## 📌 Índice

- [Para que serve](#-para-que-serve)
- [Principais Funcionalidades](#-principais-funcionalidades)
- [Fluxo de Funcionamento](#-fluxo-de-funcionamento)
- [Arquitetura e Stack Tecnológica](#-arquitetura-e-stack-tecnol%C3%B3gica)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Guia de Instalação e Execução](#-guia-de-instala%C3%A7%C3%A3o-e-execu%C3%A7%C3%A3o)
- [Variáveis de Ambiente](#-vari%C3%A1veis-de-ambiente)
- [Scripts Disponíveis](#-scripts-dispon%C3%ADveis)
- [Usuários de Teste (Seed)](#-usu%C3%A1rios-de-teste-seed)
- [Contexto do Projeto](#-contexto-do-projeto)

---

## 🎯 Para que serve

Muitos processos de avaliação em empresas terminam em planilhas esquecidas e pouca clareza de como o colaborador deve evoluir. O **Growly** resolve essa dor:

1. **Alinha Expectativas:** Constrói uma régua clara de competências por área e senioridade.
2. **Cruza Percepções:** Compara nota a nota a autoavaliação do liderado com a avaliação do gestor para identificar pontos cegos e forças.
3. **Traduz Gaps em Ação:** Através de um assistente com IA, ajuda o colaborador a montar metas de desenvolvimento sem burocracia.
4. **Dá Visibilidade ao RH e à Liderança:** Dashboards analíticos em tempo real e relatórios executivos em PDF com diagnósticos do time.

---

## ✨ Principais Funcionalidades

### 🏢 Gestão Organizacional & Multi-tenant
- Estrutura multi-tenant por empresa com isolamento estrito de dados.
- Mapeamento de áreas, times, cargos e níveis de senioridade (Júnior, Pleno, Sênior, etc.).
- Gestão de colaboradores com perfis de acesso (Admin/RH, Líder e Colaborador).

### 🎯 Matriz de Competências
- Catálogo flexível de competências comportamentais e técnicas.
- Níveis de proficiência esperados para cada cargo e momento de carreira.

### 🔄 Ciclos de Avaliação 180°
- Criação e acompanhamento de ciclos com prazos e status (*Rascunho*, *Aberto*, *Em Revisão*, *Concluído*).
- Fluxo de **Autoavaliação** pelo colaborador.
- Fluxo de **Avaliação do Líder** com comentários e notas ponderadas.

### 📊 Radar de Gaps & Comparação
- Gráficos visuais (Radar e Colunas) contrastando as percepções de autoavaliação vs. avaliação da liderança.
- Identificação instantânea dos maiores *gaps* a serem trabalhados no próximo ciclo.

### 🤖 PDI com Inteligência Artificial
- **Assistente Interativo de PDI:** Conversa estruturada orientada por IA (OpenAI + Vercel AI SDK) que investiga os maiores gaps identificados na avaliação.
- Sugestão contextualizada de ações concretas, métricas de sucesso e prazos antes de salvar o plano.

### 📄 Relatórios Executivos & PDF
- Geração de relatórios completos de ciclo para tomada de decisão por gestores e RH.
- Exportação nativa de relatórios consolidados em formato PDF (via `pdf-lib`).
- Geração automatizada de *insights* e resumos executivos via IA.

---

## 🔄 Fluxo de Funcionamento

O ciclo de desenvolvimento dentro do Growly segue 5 etapas principais:

```mermaid
flowchart TD
    A["1. RH configura o Ciclo e Competências"] --> B["2. Abertura do Ciclo"]
    B --> C["3. Autoavaliação do Colaborador"]
    B --> D["4. Avaliação pelo Líder"]
    C --> E["5. Consolidação e Cálculo de Gaps"]
    D --> E
    E --> F["6. Radar de Competências e Relatório"]
    F --> G["7. Chat com IA para Elaboração do PDI"]
    G --> H["8. Acompanhamento Contínuo de Metas"]
```

### Fluxo de Criação de PDI com IA

```mermaid
sequenceDiagram
    actor Colaborador
    participant App as Growly (Next.js)
    participant IA as Vercel AI SDK / OpenAI
    participant DB as Neon Postgres

    Colaborador->>App: Solicita montagem de PDI baseado no ciclo
    App->>DB: Busca gaps da última avaliação e perfil
    DB-->>App: Retorna histórico de competências e gaps
    App->>IA: Inicia diálogo contextualizado (Briefing de gaps)
    IA-->>Colaborador: Faz perguntas reflexivas sobre desafios práticos
    Colaborador->>IA: Responde com situações do dia a dia
    IA->>App: Dispara tool 'proporObjetivo' com metas e ações sugeridas
    App-->>Colaborador: Apresenta rascunho estruturado do PDI
    Colaborador->>App: Revisa, ajusta e confirma
    App->>DB: Salva novo Plano de Desenvolvimento Individual
```

---

## 🏗️ Arquitetura e Stack Tecnológica

```mermaid
graph LR
    Client["Navegador / Usuário"] --> NextApp["Next.js 16 (App Router)"]
    
    subgraph "Camada de Aplicação"
        NextApp --> Proxy["Proxy Middleware (Auth Guard)"]
        Proxy --> Routes["Páginas & Server Actions"]
        Routes --> AIService["Vercel AI SDK (@ai-sdk/openai)"]
        Routes --> Drizzle["Drizzle ORM (node-postgres)"]
    end

    subgraph "Serviços em Nuvem (Neon)"
        Routes --> NeonAuth["Neon Auth (Managed Better Auth)"]
        Drizzle --> NeonPooler["Neon Connection Pooler (PgBouncer)"]
        NeonPooler --> Postgres["Lakebase Postgres (AWS sa-east-1)"]
    end

    subgraph "Provedores Externos"
        AIService --> OpenAI["OpenAI API (GPT-4o / GPT-5-mini)"]
    end
```

### Componentes Técnicos
- **Framework:** Next.js 16 (App Router + Turbopack).
- **Linguagem & Tipagem:** TypeScript 5 e React 19.
- **Estilização & UI:** Tailwind CSS v4, Base UI, Lucide Icons e Sonner.
- **Banco de Dados:** [Neon Serverless Postgres](https://neon.tech) com *branching* e *scale-to-zero*.
- **ORM & Migrações:** [Drizzle ORM](https://orm.drizzle.team) e Drizzle Kit.
- **Autenticação:** [Neon Auth](https://neon.com/docs/auth/overview) (Better Auth integrado ao Postgres no schema `neon_auth`).
- **Engine de IA:** [Vercel AI SDK](https://sdk.vercel.ai/docs) conectado à OpenAI.
- **Geração de Documentos:** `pdf-lib` para renderização de relatórios em PDF.

---

## 📁 Estrutura do Projeto

```text
growly/
├── .agents/skills/            # Skills de IA e automação (Neon, etc.)
├── drizzle/                   # Migrações geradas pelo Drizzle Kit
├── public/                    # Ativos estáticos e logos
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (app)/             # Rotas protegidas (Dashboard, Pessoas, PDI, etc.)
│   │   ├── (auth)/            # Telas de autenticação (Sign-in, Primeiro Acesso, etc.)
│   │   ├── api/               # API Routes (Auth callbacks, PDI Chat, Relatórios)
│   │   ├── orcamento/         # Área pública de planos e orçamentos
│   │   ├── layout.tsx         # Layout raiz
│   │   └── page.tsx           # Landing page institucional
│   ├── components/            # Componentes reutilizáveis
│   │   ├── auth/              # Formulários de autenticação
│   │   ├── layout/            # Shell autenticado, Sidebar e Header
│   │   ├── marketing/         # Componentes da Landing Page
│   │   └── ui/                # Primitivos de UI (Buttons, Cards, Modais, etc.)
│   ├── lib/                   # Lógica de domínio e utilitários
│   │   ├── actions/           # Server Actions para mutações
│   │   ├── ai/                # Prompts, ferramentas e esquemas de IA do PDI
│   │   ├── auth/              # Instância do Neon Auth (servidor e cliente)
│   │   ├── db/                # Conexão Pool, Schemas Drizzle e Seeds
│   │   │   ├── schema/        # Definições de tabelas (users, companies, etc.)
│   │   │   ├── seed.ts        # Script de seed principal
│   │   │   └── seed-demo.ts   # Dados detalhados da empresa demonstração
│   │   └── reports/           # Cálculos de métricas e geração de PDFs
│   └── proxy.ts               # Middleware de proteção de rotas (Next.js 16)
├── drizzle.config.ts          # Configuração do Drizzle Kit
├── neon.ts                    # Configuração de infraestrutura do Neon CLI
└── package.json
```

---

## 🚀 Guia de Instalação e Execução

### 1. Clonar o repositório e instalar dependências
```bash
git clone <url-do-repositorio>
cd Growly
npm install
```

### 2. Configurar o Neon CLI e Variáveis de Ambiente
Você pode provisionar os serviços automaticamente via CLI do Neon:

```bash
# 1. Instalar o Neon CLI (se ainda não tiver)
npm i -g neon@latest

# 2. Inicializar e autenticar
neon login
neon deploy
```

O comando irá injetar as variáveis de conexão diretamente no arquivo `.env.local`.

### 3. Executar as Migrações do Banco
Aplique o schema no banco de dados Neon:
```bash
npm run db:migrate
```

### 4. Popular o Banco de Dados com Dados de Demonstração
```bash
npm run db:seed
```

### 5. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto (baseado em `.env.example`):

```dotenv
# Conexão com pooling (PgBouncer) para a aplicação em runtime
DATABASE_URL="postgresql://usuario:senha@ep-xyz-pooler.regiao.aws.neon.tech/neondb?sslmode=require"

# Conexão direta (sem pooler) obrigatória para migrações DDL do Drizzle Kit
DATABASE_URL_UNPOOLED="postgresql://usuario:senha@ep-xyz.regiao.aws.neon.tech/neondb?sslmode=require"

# URLs do serviço Neon Auth
NEON_AUTH_BASE_URL="https://ep-xyz.neonauth.regiao.aws.neon.tech/neondb/auth"
NEON_AUTH_JWKS_URL="https://ep-xyz.neonauth.regiao.aws.neon.tech/neondb/auth/.well-known/jwks.json"

# Chave secreta aleatória de 32+ caracteres para assinatura dos cookies de sessão
# Gere uma com: openssl rand -hex 32
NEON_AUTH_COOKIE_SECRET="sua-chave-secreta-com-pelo-menos-32-caracteres"

# Chave da OpenAI para o assistente de PDI e geração de insights
OPENAI_API_KEY="sk-proj-..."
```

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento com Turbopack. |
| `npm run build` | Compila o projeto e valida tipagens para produção. |
| `npm run start` | Inicia o servidor Next.js em modo produção. |
| `npm run lint` | Executa a verificação estática com ESLint. |
| `npm run db:generate` | Gera novas migrações SQL a partir das alterações nos schemas do Drizzle. |
| `npm run db:migrate` | Executa as migrações pendentes no banco de dados. |
| `npm run db:studio` | Abre a interface visual do Drizzle Studio para inspecionar tabelas e dados. |
| `npm run db:seed` | Popula o banco com empresas, colaboradores e ciclos de teste. |

---

## 👥 Usuários de Teste (Seed)

Após executar `npm run db:seed`, os seguintes acessos demonstrativos estarão disponíveis:

| E-mail | Empresa | Cargo / Perfil | Como acessar |
| :--- | :--- | :--- | :--- |
| **`admin@growly.dev`** | Growly Demo | People Partner (Admin/RH) | Acesse `/first-access` para definir a senha inicial |
| **`other@acme.dev`** | Acme | Administrador Geral | Acesse `/first-access` para definir a senha inicial |

---

## 🎓 Contexto do Projeto

Projeto acadêmico desenvolvido no âmbito do **FIAP Startup One**, com foco na modernização dos processos de gestão de pessoas através de tecnologia em nuvem e inteligência artificial aplicada.
