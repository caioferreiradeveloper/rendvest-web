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

## Área privada

As rotas internas ficam sob `/app`:

- `/app/dashboard`
- `/app/lancamentos` — ganhos e gastos
- `/app/emprestimos-a-pagar`
- `/app/devedores`
- `/app/investimentos`
- `/app/acoes`
- `/app/fiis`

Ganhos e gastos e empréstimos a pagar já possuem integração com a API. Os
demais módulos ainda exibem “Em andamento”.
As rotas privadas passam pelo guard de autenticação e dependem da validação de
sessão pelo backend antes de serem exibidas.

### Empréstimos

O módulo `/app/emprestimos-a-pagar` usa `GET/POST /api/v1/loans/`,
`GET/PATCH/DELETE /api/v1/loans/{id}/` e
`GET /api/v1/loans/{id}/installments/` para consultar o cronograma de parcelas.
O cadastro envia valor contratado, IOF, taxa efetiva mensal, CET mensal, prazo,
data de início e vencimento da primeira parcela. O backend calcula e retorna
valores financiados, parcelas, total, pagamentos e saldo; o frontend não
recalcula o sistema Price.

Pagamentos parciais ou integrais são registrados em
`POST /api/v1/loans/{id}/payments/` com `installment_number`, `amount` e,
opcionalmente, `paid_at`. O backend aloca o valor aos juros e depois ao
principal, cria a despesa vinculada e mantém os valores das demais parcelas.

## Autenticação e API

No desenvolvimento, o Vite encaminha `/api/*` para
`API_PROXY_TARGET` (padrão `http://localhost:8000`), evitando CORS entre
frontend e backend. Copie `.env.example` para `.env.local` para personalizar o
destino. Em produção, configure `VITE_API_BASE_URL` se a API estiver em outra
origem. O cliente usa `credentials: include` para enviar e receber cookies
HttpOnly:

- `GET /api/v1/auth/csrf/` para obter a proteção CSRF (lendo a resposta JSON ou
  o cookie Django `csrftoken`);
- `POST /api/v1/auth/login/` com `{ email, password }`;
- `POST /api/v1/auth/refresh/` sem corpo, usando o cookie de refresh;
- `POST /api/v1/auth/logout/` sem corpo, usando os cookies da sessão.

Todas as operações mutáveis enviam `X-CSRFToken`. O endpoint CSRF deve expor o
token na resposta como `csrfToken`, `csrf_token` ou `csrf`, ou emitir o cookie
legível `csrftoken`.

Na inicialização, o refresh valida a sessão. Respostas `401` nas chamadas da API
tentam renovar a sessão uma vez e repetir a requisição. As rotas `/app/*` exigem
sessão válida e `/login` redireciona sessões autenticadas. Logout invalida a
sessão no backend. Os tokens de acesso e refresh não são armazenados nem lidos
pelo JavaScript.

Quando `VITE_API_BASE_URL` aponta diretamente para uma API em outra origem, o
backend deve permitir essa origem com credenciais e aceitar o preflight
`OPTIONS` com `X-CSRFToken`. Um `200` no log do Django não garante, sozinho,
que o navegador aceitou a resposta. A página de contato ainda não envia
mensagens ao backend.

## Botões

Use os componentes de `src/components/ui/buttons`: `Button` para ações,
`ButtonLink` para navegação, `TextButton` para ações discretas e `IconButton`
para ações apenas com ícone (sempre com um rótulo acessível).

## Mensagens da API

`src/components/ui/MessageAlert.tsx` exibe mensagens de erro, sucesso e
informação. O catálogo em `src/config/apiStatusCodes.ts` associa códigos HTTP
à cor e ao título; `src/services/api/apiFeedback.ts` combina essa apresentação
com o texto retornado pelo backend. Por exemplo, erros `400` usam estilo
vermelho e mostram a mensagem enviada pela API.
