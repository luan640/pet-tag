# PetTag

Identificação digital para pets via tag NFC. O tutor cadastra fotos, vacinas e contato; quem
encontrar o pet aproxima o celular da coleira e cai direto numa página pública com essas
informações e um botão para ligar/chamar no WhatsApp.

## Como funciona

1. **Admin** (`/admin`) cria uma "tag": informa o nome do pet e gera um link público
   (`/p/{slug}`) + um login e senha temporários para o tutor.
2. O admin grava esse link na tag NFC física usando o **app de NFC do próprio celular**
   (esse sistema não grava a tag — só gera a URL). Entrega a tag + credenciais ao tutor.
3. Ao aproximar o celular, a página pública abre. Se o tutor ainda não configurou nada,
   aparece um estado vazio simpático + botão "Entrar".
4. No primeiro acesso (`/painel/primeiro-acesso`) o tutor troca a senha, cadastra e-mail de
   recuperação e preenche os dados do pet (fotos, raça, idade, vacinas, contato, localização).
5. Dali em diante a página pública mostra o perfil completo, sem exigir login de quem
   encontrar o pet — login é só para o tutor editar depois, em `/painel`.

## Stack

Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + Supabase (Postgres, Auth, Storage).

## Configuração do zero

### 1. Criar o projeto no Supabase

Crie um projeto em [supabase.com](https://supabase.com). Em **Project Settings → API**, copie:

- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (nunca exponha essa chave no client)

Copie `.env.example` para `.env.local` e preencha essas variáveis, junto com
`NEXT_PUBLIC_APP_URL` (em produção, a URL do seu domínio na Vercel).

### 2. Rodar as migrations

No **SQL Editor** do Supabase Studio, cole e execute o conteúdo de cada arquivo em
`supabase/migrations/`, em ordem (`001_initial.sql`, `002_...`, `003_...`, `004_...`). Isso
cria as tabelas, RLS, o bucket de storage `pet-photos` e as políticas de acesso.

(Alternativamente, com a [Supabase CLI](https://supabase.com/docs/guides/cli) instalada e o
projeto linkado: `supabase db push`.)

### 3. Criar o primeiro administrador

```bash
npm install
npx tsx scripts/seed-admin.ts admin@seuemail.com "SenhaForte123"
```

Isso cria a conta de admin diretamente (sem passar por cadastro público — só o dono do
sistema deve ter acesso a `/admin`).

### 4. Rodar localmente

```bash
npm run dev
```

Acesse `http://localhost:3000`, entre em `/entrar` com a conta de admin criada no passo 3.

### 5. Deploy (Vercel)

1. Suba o repositório para o GitHub/GitLab e importe na Vercel.
2. Configure as mesmas variáveis de ambiente do `.env.local` nas configurações do projeto
   na Vercel (`NEXT_PUBLIC_APP_URL` deve ser a URL final de produção).
3. Deploy. A partir daí, todo link gerado em `/admin` já aponta para o domínio de produção.

### 6. E-mails transacionais (Resend)

O app usa [Resend](https://resend.com) para 3 e-mails automáticos:

- **Localização reportada**: quando alguém abre a página pública e o celular envia a
  localização, o tutor recebe um e-mail com o link pro mapa (destaque extra se o pet
  estiver marcado como perdido).
- **Credenciais da nova tag**: se o e-mail do tutor for informado ao criar a tag em
  `/admin`, ele já recebe login e senha temporária por e-mail (além de aparecerem na tela).
- **Lembrete de vacina**: um cron diário (`/api/cron/vaccine-reminders`, configurado em
  `vercel.json`) avisa o tutor por e-mail quando uma vacina está atrasada ou vence nos
  próximos 30 dias. Cada vacina só gera um novo lembrete a cada 7 dias, pra não spammar.

Configuração:

1. Crie uma conta em [resend.com](https://resend.com) e gere uma API key.
2. Preencha `RESEND_API_KEY` no `.env.local` (e nas env vars da Vercel em produção).
3. **Sem domínio verificado no Resend**, o plano free só entrega e-mails para o endereço
   cadastrado na sua própria conta Resend — útil pra testar, mas não envia pros tutores de
   verdade. Para isso, verifique um domínio em **Resend > Domains** e ajuste
   `RESEND_FROM_EMAIL` para um remetente desse domínio (ex: `PetTag <avisos@seudominio.com>`).
4. Gere um valor aleatório para `CRON_SECRET` (ex: `openssl rand -hex 32`) e configure a
   mesma variável no projeto na Vercel — ela autentica as chamadas do cron automaticamente
   (a Vercel envia `Authorization: Bearer $CRON_SECRET` sozinha).
5. Sem `RESEND_API_KEY` configurada, os e-mails simplesmente não são enviados (fica um aviso
   no log) — o resto do app funciona normalmente.

## Fluxo de uso do dia a dia

- **Nova tag**: em `/admin`, clique em "Nova tag", informe o nome do pet (e o e-mail do
  tutor, se já souber). As credenciais geradas aparecem **uma única vez** — copie e anote
  antes de fechar o modal.
- **Gravar a tag física**: use um app de gravação NFC (ex: NFC Tools) para escrever a URL
  pública gerada (`/p/{slug}`) na tag.
- **Entregar ao tutor**: tag + login + senha temporária.
- **Tutor**: acessa `/entrar`, é levado ao assistente de primeiro acesso, troca a senha,
  cadastra e-mail de recuperação e preenche os dados do pet.

## Notas de segurança

- Contas de tutor são sempre criadas pelo admin (sem autocadastro público).
- A senha temporária só é exibida uma vez, no momento da criação da tag.
- Sem e-mail real cadastrado, o fluxo de "esqueci minha senha" não funciona — o tutor é
  incentivado a cadastrar o e-mail logo no primeiro acesso.
- `npm audit` acusa vulnerabilidades altas em `postcss`/`sharp`, mas são dependências
  internas do próprio pacote `next` nesta versão; a correção sugerida pelo audit
  (`--force`) rebaixaria o Next.js para uma versão muito antiga e quebraria o projeto —
  não aplique. Acompanhe atualizações do `next` para uma correção oficial.
