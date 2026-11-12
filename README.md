# Rendvest Web

Aplicação React com TypeScript, Vite e Sass.

## Começar

```bash
npm install
npm run dev
```

`npm run build` executa a checagem de tipos e gera a versão de produção em
`dist/`. Para visualizar o build localmente, use `npm run preview`.

## Arquitetura

```text
src/
├── app/                 # Composição da aplicação
├── components/          # Componentes reutilizáveis
│   ├── forms/fields/     # Campos de texto, senha, número, data e textarea
│   ├── navigation/      # Cabeçalho e navegação pública
│   ├── private/          # Componentes da área interna
│   └── ui/               # Botões e elementos compartilhados
├── config/               # Configuração central dos módulos privados
├── layouts/              # Layouts público e privado
├── pages/
│   ├── public/           # Home, Login, Contact, About e NotFound
│   └── private/          # Dashboard, lançamentos e módulos financeiros
├── routes/               # Mapeamento de rotas
└── styles/               # Tokens de tema e estilos globais
```

Cada página mantém seu `index.tsx` e seu Sass na própria pasta. Estilos
reutilizáveis de campos, botões, navegação e layout permanecem junto aos
componentes correspondentes.

Os formulários de login e contato estão preparados visualmente, mas ainda não
enviam dados nem se conectam a serviços de autenticação ou mensagens.

## Área privada

As rotas internas ficam sob `/app`:

- `/app/dashboard`
- `/app/lancamentos` — ganhos e gastos
- `/app/emprestimos-a-pagar`
- `/app/devedores`
- `/app/investimentos`
- `/app/acoes`
- `/app/fiis`

Os módulos e o menu estão estruturados; as páginas exibem “Em andamento”.
Ainda não há autenticação ou proteção de rotas: conecte esses recursos antes
de usar a área privada com dados reais.

## Botões

Use os componentes de `src/components/ui/buttons`: `Button` para ações,
`ButtonLink` para navegação, `TextButton` para ações discretas e `IconButton`
para ações apenas com ícone (sempre com um rótulo acessível).
