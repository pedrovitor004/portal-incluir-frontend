# Root e solicitações de acesso

O bootstrap cria uma conta root coordenadora uma vez; reinícios preservam seus dados. As credenciais iniciais estão definidas no bootstrap do ambiente. Coordenadores comuns solicitam acesso administrativo ao root. A aprovação administrativa não transforma a conta em root.

POST /api/auth/register passa a devolver protocolo pendente e não autentica. A página pública usa esse contrato pelo estado de autenticação, sem liberar uma sessão. GET /api/solicitacoes-acesso lista pedidos; POST /{id}/decisao aprova ou recusa. Somente root decide elevações administrativas. Senhas são armazenadas como hash e removidas da solicitação após a decisão. Pedidos vencidos continuam pendentes e geram lembrete após 48 horas, com acesso permanente à análise.

A interface compartilha os contratos de sessão e de leitura de notificações com os respectivos recortes. Os arquivos compartilhados são idênticos para permitir o merge direto na develop. O contrato HTTP de cadastro exige atualizar frontend e backend em conjunto.
