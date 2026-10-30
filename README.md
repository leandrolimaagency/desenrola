# Funil de consulta

Aplicação Next.js preparada para publicação na Vercel.

## Etapas do site

O fluxo visual começa na página inicial, passa por `/verificacao` (uma conta simples para filtrar avanços acidentais), segue para `/plataforma` e vai diretamente para `/consulta`. A antiga rota `/renegociacao` redireciona à consulta. O desafio matemático é apenas uma barreira visual simples; não valida identidade nem protege endpoints contra automação. A consulta continua dependendo do consentimento explícito e da validação própria da API.

## Configuração

1. Copie `.env.example` para `.env.local`.
2. No painel da CPF.CNPJ, gere/copiei o seu token em **API tokens**. Não coloque a chave diretamente no código.
3. Configure `CPF_PROVIDER_TOKEN` na Vercel. Para o pacote básico de CPF, mantenha `CPF_PROVIDER_PACKAGE=1`, `CPF_PROVIDER_METHOD=GET` e a URL padrão do `.env.example`.
4. Crie uma base Redis no Upstash e configure `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` localmente e na Vercel.
5. Configure `NEXT_PUBLIC_TYPEBOT_URL` e `TYPEBOT_FLOW_ENABLED=true` somente quando o Typebot estiver revisado e pronto para receber dados.
6. Execute `npm install` e `npm run dev`.

O endpoint `POST /api/cpf` recebe `{ "cpf": "00000000000", "consent": true }`, valida os dígitos verificadores e faz uma requisição server-side para `https://api.cpfcnpj.com.br/{token}/{package}/{cpf}`. O token nunca é enviado ao navegador; CPF é enviado sem máscara e não é escrito em logs. Após a consulta, a resposta inclui os dados para confirmação e um `lookupId` aleatório; o resultado canônico fica no Redis por até 20 minutos.

Após a consulta, a página só oferece continuidade ao Typebot quando `NEXT_PUBLIC_TYPEBOT_URL` estiver configurada. `POST /api/session` e `GET /api/session/[token]` permanecem bloqueados até `TYPEBOT_FLOW_ENABLED=true`. Ao habilitar, `POST /api/session` recebe apenas o `lookupId`, consome esse resultado uma única vez no Redis e cria uma sessão final por 20 minutos. Após a confirmação, o navegador segue para `/atendimento` no domínio da aplicação. A página busca o nome da sessão para personalizar o botão de retorno, mas não envia nome, CPF ou token ao Typebot enquanto o fluxo publicado apresentar alegações de vínculo oficial não verificadas. Reavalie essa restrição após revisar e publicar o conteúdo do Typebot.

O identificador de sessão funciona como credencial temporária de acesso aos dados durante 20 minutos. Restrinja seu uso ao fluxo pretendido, não o registre em ferramentas de analytics e configure o Typebot para não armazenar a resposta além do necessário. O bloco HTTP do Typebot precisa recuperar a sessão antes de mostrar nome, CPF ou nascimento; passar apenas a URL pública não configura essa etapa automaticamente.

Não publique a aplicação como se fosse um órgão público. Antes de produção, substitua os textos, e-mail, política de privacidade e termos por informações reais, valide a base legal da consulta e configure retenção mínima de dados conforme a LGPD.
