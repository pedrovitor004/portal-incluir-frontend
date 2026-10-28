# Sessão, root e solicitações de acesso

A autenticação usa a sessão HTTP do backend e o cookie `JSESSIONID`, HTTP-only, com SameSite=Lax e expiração por inatividade de 30 minutos (configurável por `SESSION_TIMEOUT`). Em HTTPS, configure `SESSION_COOKIE_SECURE=true`. A sessão é criada apenas após login bem-sucedido; o identificador anterior é invalidado nessa troca. Falha de credenciais não encerra uma sessão já válida. Logout invalida a sessão no servidor antes de a interface anunciar a saída.

O frontend consulta `/api/auth/me` ao iniciar, recuperar o foco e receber avisos de outra aba. Não autentica pelo sessionStorage nem copia identidades entre abas. O cache é apenas auxiliar. Respostas atrasadas não restauram uma sessão encerrada; falhas de rede na inicialização permitem tentar novamente. As rotas protegidas aguardam a confirmação inicial do servidor.

O backend cria uma única conta inicial com identificador e credenciais definidos no bootstrap, perfil COORDENADOR e identificação de administrador geral. Reinícios não recriam a conta nem redefinem sua senha. Root recebe o catálogo completo de permissões e é protegido contra exclusão, inativação e alteração pela gestão de outras contas.

Coordenadores comuns não recebem administração de usuários, permissões nem auditorias por padrão. Podem solicitar acesso administrativo ao root. Somente o root pode decidir esse tipo de pedido. A aprovação concede as permissões administrativas ao coordenador; não transforma a conta em um novo root. Ajustes de permissões não substituem essa aprovação.

`POST /api/auth/register` recebe os dados públicos e devolve um protocolo PENDENTE, sem criar usuário autenticável nem sessão. A senha é armazenada codificada e não aparece nos dados nem na auditoria da solicitação. O acesso só existe após aprovação da coordenação autorizada. Recusa não cria conta. Contas existentes continuam ativas.

`GET /api/solicitacoes-acesso` lista pendências para os responsáveis autorizados; `?todas=true` inclui decisões anteriores. `POST /api/solicitacoes-acesso/{id}/decisao` aprova ou recusa, registrando autor e data na mesma transação. Decisões concorrentes são bloqueadas. O prazo de 48 horas é calculado no servidor; vencê-lo não aprova nem recusa automaticamente. A pendência continua no sino e produz lembrete em cada entrada até uma decisão.

`POST /api/solicitacoes-acesso/administracao` envia o pedido de um coordenador autenticado ao root. `GET /api/solicitacoes-acesso/minhas` permite consultar o andamento dos próprios pedidos administrativos.

Validação: `npm run test:auth`, `npm run build`, `npm run lint`, testes de permissões e vínculos do frontend e suíte Java com H2.
