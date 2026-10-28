# Root e solicitações de acesso

O bootstrap cria uma conta root coordenadora uma vez; reinícios preservam seus dados. As credenciais iniciais estão definidas no bootstrap do ambiente. Coordenadores comuns solicitam acesso administrativo ao root. A aprovação administrativa não transforma a conta em root.

POST /api/auth/register passa a devolver protocolo pendente e não autentica. A página pública usa esse contrato diretamente. GET /api/solicitacoes-acesso lista pedidos; POST /{id}/decisao aprova ou recusa. Somente root decide elevações administrativas. Senhas são armazenadas como hash e removidas da solicitação após a decisão. Pedidos vencidos continuam pendentes e geram lembrete após 48 horas, com acesso permanente à análise.

Este recorte preserva a implementação de sessão da develop e pode ser integrado com o recorte stateful. O contrato HTTP de cadastro exige atualizar frontend e backend em conjunto.
