# Acompanhamento por estudante

O menu **Cadastro do estudante** abre a apresentação do fluxo. A anamnese é o cadastro inicial; não há uma etapa adicional de cadastro. A sequência visual é **Anamnese → Plano de ação → PEI → RAI**, sem bloqueio de navegação entre etapas de um estudante já salvo.

O primeiro salvamento exige os dados básicos obrigatórios da API. Os demais campos podem permanecer em rascunho. As atribuições e o status da anamnese ficam no servidor, vinculados ao estudante. Um profissional atribuído pode preencher sua etapa pelas mesmas telas; o backend verifica a atribuição a cada gravação. Atribuir uma etapa não concede permissões gerais à conta.

## Integração do PEI

O formulário de PEI será implementado separadamente. Reutilize `StudentFlow` com `estudanteId` e `atual="pei"` no topo da página e mantenha o identificador do estudante na URL. A etapa PEI usa a rota `/:perfil/estudantes/:id/etapas/pei`, com consulta apenas dos PEIs do estudante. Substitua seu conteúdo pelo formulário quando estiver disponível. O RAI usa `/:perfil/estudantes/:id/etapas/rai`. A linha do tempo aparece somente nas páginas do fluxo; as pendências ficam acessíveis pelo botão Pendências da tabela de estudantes.

O serviço `fluxoEstudanteService.consultar` retorna os responsáveis por `ANAMNESE`, `PLANO_ACAO` e `PEI`, a situação da anamnese, o status do plano e a presença de PEI ativo. A atribuição de PEI organiza o responsável; a gravação pela API de planos educacionais continua sujeita à permissão `pei.editar`. A futura tela deve respeitar essa permissão e a atribuição.

O Anexo III fornecido contém as seções de histórico, necessidades específicas, conhecimentos/habilidades/interesses, dificuldades e adaptações curriculares, seguidas do plano de ensino adaptado por componente curricular. Os campos de assinatura são: setor pedagógico, assistência estudantil, docente, CLAI, coordenação de curso e estudante ou responsável. Os dados pessoais preenchidos no exemplo não devem virar valores padrão.

## Documentos

O Word do plano preenche `src/assets/documentos/plano-acao-clai.docx`, cópia do Anexo II fornecido. Preserva as partes do pacote, os títulos, as orientações e os campos de assinatura e data. Alterar a estrutura do modelo exige revisar o mapeamento e rodar `npm run test:fluxo`.

O PDF usa os mesmos campos do Anexo II e reserva espaço para assinatura da coordenação da COAPNE e data. Seu layout é gerado em PDF, sem conversão do Word; a paginação pode diferir. Exportações usam os dados salvos no servidor. Assinatura manuscrita tem espaço reservado; emitir um arquivo não assina eletronicamente o documento.

A anamnese pode ser exportada em PDF e Word. O RAI acumula os dados atuais, planos, PEIs, adaptações e histórico disponível na emissão. Não representa uma declaração de conclusão de todas as etapas. Se o histórico de alterações estiver indisponível, essa limitação aparece no relatório; falhas nas fontes de documentos impedem a emissão.

## Backend

As alterações correspondentes estão em `C:/Users/pedro/Desktop/portal-incluir`. Reinicie a aplicação Java para carregar o controller `/api/estudantes/{id}/fluxo` e atualizar o esquema pela configuração existente do Hibernate. A nova tabela de fluxo também possui auditoria e participa do descarte por retenção.

Planos incompletos podem ser salvos como rascunho. A assinatura valida os campos obrigatórios. A retomada atualiza o mesmo plano e o servidor impede transferi-lo para outro estudante.

Na tela do plano, **Marcar como assinado e concluir** salva o preenchimento atual e, após confirmação, chama `POST /api/planos-acao/{id}/assinar`. A ação exige a permissão `planos.gerar`, além de acesso de edição à etapa. O status `ASSINADO` representa a conclusão do plano e impede novas edições. Se a assinatura falhar após salvar, o registro permanece como rascunho e pode ser retomado. A opção registra a conclusão no sistema; não insere assinatura manuscrita nos arquivos exportados.

## Validação

### Encaminhamento de pendências

Ao concluir ou avançar na anamnese e no plano de ação, a tela verifica os campos obrigatórios. Havendo pendências, oferece à coordenação o encaminhamento para um profissional ativo. Primeiro salva o rascunho, depois solicita profissional e mensagem. Encaminhar não conclui nem assina a etapa. A identificação básica do estudante continua necessária para o primeiro salvamento. No PEI, a verificação considera a existência de um registro ativo; o formulário continua previsto para implementação separada.

A seleção consulta as permissões efetivas, informa quais faltam e oferece um link para Administração › Permissões em outra aba. A atribuição não concede permissões. O servidor verifica novamente os acessos antes de salvar a atribuição e a notificação na mesma transação. Anamnese exige `estudantes.consultar`, `anamnese` e `sensivel.consultar`; plano exige `estudantes.consultar`, `planos.gerar` e `sensivel.consultar`; PEI exige `estudantes.consultar`, `pei.consultar`, `pei.editar` e `sensivel.consultar`.

`PUT /api/estudantes/{id}/fluxo/responsaveis/{etapa}` recebe `usuarioId`, `mensagem` (até 2.000 caracteres) e `planoId` opcional para vincular um plano específico. `GET /api/notificacoes` lista exclusivamente as mensagens da conta autenticada. `PATCH /api/notificacoes/{id}/lida` marca a mensagem como lida apenas para o destinatário. O sino e os painéis consultam a API; as prévias locais do gerenciamento continuam identificadas como simulação.

As notificações são auditadas e descartadas junto com os dados do estudante ao encerrar o prazo de retenção. Os controllers e o serviço de auditorias devem estar no backend antes de reiniciá-lo; apenas atualizar o frontend não registra essas rotas na porta 8080.

- `npm run build`
- `npm run test:encaminhamento`
- `npm run test:fluxo`
- `npm run test:documentos`
- Teste Java `FluxoEstudanteTest`: cadastro/anamnese, rascunho, retomada, atribuição, bloqueio de outro profissional, rejeição de transferência e conclusão da anamnese.
