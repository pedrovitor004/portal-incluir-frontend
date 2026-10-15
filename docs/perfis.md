# Consulta e edição do próprio perfil

Este fluxo atende às operações de leitura e atualização do cadastro da pessoa conectada. A criação da conta continua no cadastro/autenticação. Inativação e reativação são operações administrativas e não fazem parte destes componentes ou adaptadores.

## Estrutura

- `src/types/profile.ts`: contrato compartilhado de dados, campos e adaptadores.
- `src/config/profileFields.ts`: catálogo de campos reutilizáveis, com rótulos, tipos e limites.
- `src/config/profile.ts`: registro dos adaptadores habilitados por perfil de acesso.
- `src/services/profileService.ts`: entrada para as operações `read` e `update`, selecionando o adaptador pelo perfil.
- `src/services/profile/adapters/`: integração com os contratos específicos de cada API.
- `src/components/profile/ProfileMenu.tsx`: acesso ao perfil pelo cabeçalho. Exibe ações somente para perfis registrados.
- `src/components/profile/ProfileModal.tsx`: consulta, edição, carregamento, erros e confirmação de sucesso.
- `src/components/profile/ProfileForm.tsx`: formulário gerado a partir dos campos do adaptador.
- `src/components/profile/profileValidation.ts`: validação e normalização dos campos configurados.

Os componentes compartilhados não conhecem os endpoints nem os DTOs de coordenador. O arquivo `coordinatorProfileAdapter.ts` tem um nome específico porque implementa o contrato real desse backend; seu tipo de retorno público é `ProfileData`, como será para os demais adaptadores.

## Como adicionar outro perfil

1. Confira os contratos de consulta e atualização no backend: identificador, campos obrigatórios, limites e representação do status.
2. Crie um adaptador em `src/services/profile/adapters/` implementando `ProfileAdapter`.
3. Defina `fields` com os campos aceitos pela atualização. Reutilize o catálogo comum e acrescente definições específicas, como disciplina ou área de atuação, conforme o contrato real.
4. Em `read` e `update`, normalize a resposta para `{ id, values, active }`. Os DTOs específicos permanecem no adaptador.
5. Monte o payload de atualização explicitamente. Não envie campos administrativos como status, role, identificadores ou senha.
6. Defina `emailChangesLogin` conforme o comportamento confirmado do backend. Essa opção controla o aviso do formulário e a atualização do e-mail na sessão local; ela não implementa sincronização no servidor.
7. Registre o adaptador em `config/profile.ts` usando a chave de `PerfilUsuario`. O menu e o modal passarão a utilizá-lo sem cópias de componentes.
8. Valide consulta, atualização, erros de API, campos obrigatórios e preservação dos dados de acesso.

## Estado atual

Somente `COORDENADOR` está habilitado. O adaptador consome `GET` e `PUT /coordenadores/{perfilId}`. Professor, administrador e equipe multidisciplinar continuam sem ações de consulta/edição no frontend até terem seus adaptadores implementados.

O e-mail de cadastro permanece separado do e-mail de login. Por isso, `emailChangesLogin` é `false`, e salvar o perfil atualiza apenas o nome da sessão local. O contexto usa `atualizarDadosPerfil`, com conferência do tipo de perfil e do `perfilId`, para não aplicar respostas de outra identidade.
