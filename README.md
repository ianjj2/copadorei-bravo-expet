# Ranking App

Sistema de ranking com autenticação e gerenciamento de pontos.

## Requisitos

- Node.js 16+ instalado
- NPM ou Yarn
- Conta no Supabase (para o banco de dados)

## Configuração do Ambiente

1. Clone o repositório:
```bash
git clone [URL_DO_SEU_REPOSITORIO]
cd [NOME_DO_DIRETORIO]
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

## Deploy

### Opção 1: Vercel (Recomendado)

1. Crie uma conta na [Vercel](https://vercel.com)
2. Instale a CLI da Vercel:
```bash
npm i -g vercel
```

3. Faça login na Vercel:
```bash
vercel login
```

4. Deploy:
```bash
vercel
```

### Opção 2: Netlify

1. Crie uma conta na [Netlify](https://netlify.com)
2. Instale a CLI do Netlify:
```bash
npm i -g netlify-cli
```

3. Faça login no Netlify:
```bash
netlify login
```

4. Deploy:
```bash
netlify deploy
```

### Opção 3: Deploy Manual

1. Construa o projeto:
```bash
npm run build
# ou
yarn build
```

2. O diretório `dist` será criado com os arquivos estáticos
3. Faça upload desses arquivos para qualquer servidor web

## Configuração do Banco de Dados

1. Acesse [Supabase](https://app.supabase.com)
2. Crie um novo projeto
3. Vá em "Settings" > "API"
4. Copie a URL e a anon key para o arquivo `.env`

## Estrutura do Banco de Dados

Tabela `participants`:
- id (uuid)
- name (text)
- tag (text)
- points (integer)
- image_url (text)
- created_at (timestamp)
- updated_at (timestamp)

## Manutenção

Para atualizar o sistema:
1. Faça pull das alterações mais recentes
2. Instale novas dependências:
```bash
npm install
# ou
yarn install
```
3. Construa novamente:
```bash
npm run build
# ou
yarn build
```
4. Faça o deploy novamente usando um dos métodos acima

## Suporte

Para problemas ou dúvidas, abra uma issue no repositório. 