# Funil de consulta

Aplicação Next.js preparada para publicação na Vercel.

## Etapas do site

O fluxo visual começa na página inicial, exibe uma breve tela de carregamento e segue diretamente para `/consulta`. As rotas antigas `/plataforma`, `/verificacao` e `/renegociacao` redirecionam à consulta. Depois de enviar um CPF válido, a consulta busca os dados no provedor autorizado e mostra o nome completo e o CPF retornados para a pessoa conferir. Só após selecionar “Confirmar e continuar” a aplicação cria a sessão e encaminha a pessoa para o Typebot.

## Configuração

1. Copie `.env.example` para `.env.local`.
2. No painel da CPF.CNPJ, gere ou copie o token em **API tokens**. Não coloque a chave diretamente no código.
3. Configure `CPF_PROVIDER_TOKEN` na Vercel. Para o pacote básico de CPF, mantenha `CPF_PROVIDER_PACKAGE=1`, `CPF_PROVIDER_METHOD=GET` e a URL padrão do `.env.example`.
4. Crie uma base Redis no Upstash e configure `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` localmente e na Vercel.
5. Configure `NEXT_PUBLIC_TYPEBOT_URL`. Depois de revisar o Typebot para receber esses dados, habilite `CPF_FLOW_ENABLED=true` e `TYPEBOT_FLOW_ENABLED=true` localmente e na Vercel.
6. Preencha `.env.local`, reinicie `npm run dev` e teste com autorização do provedor.

O endpoint `POST /api/cpf` recebe `{ "cpf": "00000000000" }`, valida os dígitos verificadores e faz uma requisição server-side para `https://api.cpfcnpj.com.br/{token}/{package}/{cpf}`. O token nunca é enviado ao navegador; CPF é enviado sem máscara e não é escrito em logs. Após a consulta, a resposta inclui um `lookupId` aleatório; o resultado canônico fica no Redis por até 20 minutos.

Após a consulta, o `lookupId` permanece no navegador até a pessoa confirmar os dados ou corrigir o CPF. Só ao confirmar, a página envia o `lookupId` a `POST /api/session`, que consome o resultado uma única vez no Redis e cria uma sessão final por 20 minutos. Com sucesso, o navegador segue para `/atendimento` no domínio da aplicação. A página busca os dados canônicos da sessão e envia `nome`, `cpf` e `session` como variáveis pré-preenchidas ao Typebot. O embed não coloca esses valores na URL. `POST /api/session` e `GET /api/session/[token]` permanecem bloqueados até `TYPEBOT_FLOW_ENABLED=true`.

O Meta Pixel não é carregado e não há rastreamento de publicidade. Para exibir os valores no Typebot, use `{{nome}}` e `{{cpf}}` nos blocos de texto.

O identificador de sessão funciona como credencial temporária de acesso aos dados durante 20 minutos. Restrinja seu uso ao fluxo pretendido, não o registre em ferramentas de analytics e configure o Typebot para não armazenar a resposta além do necessário. O bloco HTTP do Typebot precisa recuperar a sessão antes de mostrar nome, CPF ou nascimento; passar apenas a URL pública não configura essa etapa automaticamente.

Não publique a aplicação como se fosse um órgão público. Confirme e documente a base legal aplicável com a assessoria responsável antes de produção. Substitua também os textos, e-mail, política de privacidade e termos por informações reais e configure retenção mínima de dados conforme a LGPD.
