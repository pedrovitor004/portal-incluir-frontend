# Sessões stateful

A identidade da sessão vem de GET /api/auth/me, com o cookie JSESSIONID enviado por withCredentials. O cache local serve apenas de apoio e não libera rotas privadas. A inicialização aguarda a confirmação do servidor e oferece nova tentativa quando a rede falha.

Login e o cadastro vigente nesta etapa confirmam /auth/me antes de liberar a interface. Logout aguarda a invalidação no servidor; falhas preservam a identidade para permitir nova tentativa. Respostas antigas não restauram uma sessão após sair. Abas comunicam somente a necessidade de revalidação, sem copiar identidades.

O backend usa HttpSession e cookie HTTP-only, SameSite=Lax, com expiração de 30 minutos por inatividade (SESSION_TIMEOUT). Em HTTPS, configure SESSION_COOKIE_SECURE=true. Falha de credenciais não invalida a sessão anterior; login bem-sucedido troca o identificador. /auth/me retorna Cache-Control: no-store. Autorização por operação permanece no backend.

Validação: npm run test:auth, npm run build e npm run lint. Root e aprovação de cadastro pertencem ao recorte seguinte; este PR preserva o contrato atual de cadastro.
