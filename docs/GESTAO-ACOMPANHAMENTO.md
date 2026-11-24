# Gestão do acompanhamento — frontend da coordenação

Rotas exclusivas de coordenador:

- `/coordenador/adaptacoes`: consulta e gestão das adaptações dos professores.
- `/coordenador/conteudo-academico`: os conteúdos das mesmas adaptações; não cria registros independentes.
- `/coordenador/atendimentos`: registros de ocorrência, apoio em aula e encaminhamentos da equipe multidisciplinar.
- `/coordenador/responsaveis`: atribuição de um estudante a vários profissionais da equipe, com motivo e encerramento de vínculo.

## Estado atual

Adaptações e atendimentos usam uma demonstração **opcional e explicitamente identificada**. Os exemplos são fictícios; não são buscados nem gravados na API. O estado vive na memória da aba e é separado por ID da conta. A recarga descarta a prévia. Não há criação de telas de professor/equipe, alterações em PEI/Plano de Ação ou implementação de backend.

Detalhes, edição, arquivamento, inativação, reativação, exclusão com confirmação e solicitações ao responsável podem ser explorados na demonstração. Filtros por busca, responsável, situação e período se aplicam à listagem. No celular os registros são cartões; no desktop, tabela com rolagem horizontal contida. Modais usam o componente acessível existente, com corpo rolável e ações em coluna no mobile.

A página de responsáveis reutiliza `estudantesService` e `vinculosEstudanteService`, usando os endpoints que já estavam definidos no projeto. **Confirmar uma atribuição nessa página salva um vínculo real**, se o backend estiver disponível. A seleção mostra apenas profissionais ativos da equipe multidisciplinar que ainda não tenham vínculo ativo. Contas profissionais inativas e vínculos encerrados permanecem identificados na consulta. Cadastros de estudantes inativos/concluídos ficam somente para consulta.

## Notificações

O sino da coordenação mostra **prévias de saída**, com destinatário, mensagem, horário e leitura local. Alterar um registro fictício ou salvar/encerrar um vínculo pela nova página gera uma prévia. A mensagem não é entregue ao profissional e isso é informado antes da confirmação. Os vínculos geridos pela área anterior do perfil do estudante mantêm seu comportamento anterior.

Na integração definitiva, a API deverá gerar eventos de atribuição/encerramento e alterações de registros na mesma transação das operações, persistir notificações para o destinatário e expor consulta/contagem/leitura. A leitura local atual não equivale à leitura pelo profissional. O histórico de saída da demonstração não é uma auditoria real.

## Integração futura

O modelo de apresentação está em `src/types/gestaoAcompanhamento.ts`; `gestaoAcompanhamentoPreview` concentra o comportamento simulado. A integração deverá substituir o adaptador em memória por serviços de API, incluindo IDs reais de estudante/profissional, autorização por vínculo, versionamento para concorrência, paginação e filtros no servidor. Não foram inventados endpoints de escrita para adaptações ou atendimentos.

Adaptação e conteúdo devem compartilhar uma identidade. Separar situação ativa/inativa de arquivamento na API, se o domínio permitir preservar a situação anterior ao arquivar. Confirmar também a política de exclusão e retenção. Para notificações, gerar eventos no servidor evita a confirmação do vínculo sem o registro da notificação.

Permissões existentes: `pedagogico.consultar` para adaptações; `academico.gerar` para conteúdo; `suporte.consultar` para atendimentos; `estudantes.vincular` para responsáveis. Edição gerencial usa `pedagogico.editar` ou `suporte.registrar`; o backend deverá aplicar a própria autorização.

Validação: `npm run build`, `npm run lint` e `node scripts/test-gestao-acompanhamento.mjs`.
