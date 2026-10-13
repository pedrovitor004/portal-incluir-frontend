# Integração com o backend

## Camadas

- Telas de login e cadastro: chamam `useAuth().login()` e `useAuth().register()`.
- `hooks/useAuth.ts`: acessa o contrato em `contexts/AuthContext.ts`.
- `contexts/AuthProvider.tsx`: mantém o usuário reativo e coordena login, cadastro e logout.
- `services/authService.ts`: implementa as chamadas HTTP de autenticação.
- `services/http.ts`: instância Axios compartilhada, configurada por `config/api.ts`.
- `config/endpoints.ts`: centraliza todos os caminhos da integração.
- `types/auth.ts`: contratos de usuário e requisições, com campos específicos por perfil.
- `services/sessionStorage.ts`: persistência da identificação local; apenas o provider usa esse adaptador.

Dashboard: tela → `hooks/useDashboardCoordenador.ts` → `services/dashboardService.ts` → cliente HTTP → endpoint. O hook usa o usuário do AuthContext e controla carregamento, cancelamento, erro e tentativa novamente.

As telas não importam Axios, não montam URLs HTTP e não manipulam sessionStorage.

## Endpoints utilizados

| Função | Método | Caminho relativo a `/api` | Resposta |
| --- | --- | --- | --- |
| `authService.login` | POST | `/auth/login` | Usuario |
| `authService.register` | POST | `/auth/register` | Usuario (201) |
| `dashboardService.buscarCoordenador` | GET | `/coordenadores/{id}/dashboard` | DashboardCoordenadorData |

Login recebe `{email, senha}`. Cadastro usa `CadastroRequest`, que distingue coordenador, professor, administrador e equipe multidisciplinar. Estudante é somente registro acadêmico no backend e não faz login. Logout limpa o contexto e a identificação local; não há endpoint de logout porque ainda não existe sessão de servidor.

## Configuração

1. Execute o backend na porta 8080 com PostgreSQL configurado.
2. Copie `.env.example` para `.env.local`, se precisar ajustar a URL.
3. `VITE_API_URL=http://localhost:8080/api` é o padrão. Não repita `/api` nos endpoints.
4. Execute `npm install` e `npm run dev`. Reinicie o Vite após mudar variáveis.
5. No backend, CORS é configurado em `CorsConfig`, usando `CORS_ALLOWED_ORIGINS`. O padrão permite localhost e 127.0.0.1 em portas de desenvolvimento. Para outra origem, defina a URL do frontend nessa variável; múltiplas origens são separadas por vírgula.

Erros da API são apresentados por `services/apiError.ts`. A API retorna `message` para validações, duplicidades e credenciais inválidas. Os formulários impedem reenvio durante a requisição e validam os campos obrigatórios.

## Etapa atual

Sem JWT e sem autorização no servidor. A identificação em sessionStorage controla apenas a navegação. O coordenador acessa o dashboard; os outros perfis recebem uma página inicial enquanto suas áreas estão em desenvolvimento. O dashboard mostra estudantes/professores ativos da instituição e PEIs do coordenador. Últimos estudantes são ordenados por ID; notificações ainda não estão implementadas.


## Notificações globais

SweetAlert2 é encapsulado em `services/notificationService.ts`. Use `notificationService.success(mensagem)`, `.error(mensagem)`, `.warning(mensagem)` ou `.info(mensagem)`; componentes e contextos não importam SweetAlert2 diretamente. A configuração compartilhada fica em `config/toast.ts` e os estilos em `styles/toast.css`.

Os toasts aparecem no canto superior direito, têm botão de fechar e barra de progresso. Fecham em 4,5 segundos (erros: 8 segundos); o contador pausa ao passar o mouse ou focar a notificação. Mensagens são exibidas como texto. Preferências de movimento reduzido são respeitadas.

O AuthProvider notifica sucesso/erro de login e cadastro e informa o logout. Erros continuam sendo propagados para os formulários manterem sua mensagem junto aos campos, sem disparar um segundo toast. A confirmação de senha divergente gera aviso. O hook do dashboard notifica falhas de consulta; requisições canceladas não geram alertas.
