# Gestão e acompanhamento de estudantes

Coordenadores e administradores podem acessar a lista de estudantes de seu próprio perfil e usar as três ações por linha: abrir perfil, consultar etapas e gerenciar situação.

## Situação

- Ativar: `POST /api/estudantes/{id}/ativar`.
- Inativar: `POST /api/estudantes/{id}/inativar`.
- Concluir: `POST /api/estudantes/{id}/concluir`, com `{ dataConclusao: "AAAA-MM-DD" }`.
- Cada alteração pede confirmação em SweetAlert e usa a resposta do servidor para atualizar a situação na lista.
- Conclusão exige uma data passada ou atual dentro do prazo de retenção. O aviso informa o bloqueio posterior para alterações e a retenção por cinco anos.
- Estudantes concluídos não podem ser ativados, inativados, concluídos novamente ou editados no formulário.
- Exclusão manual não está habilitada pelo backend atual: `EstudanteService.excluir` responde com conflito e orienta inativação/conclusão. O frontend oferece a explicação dessa política em SweetAlert, sem disparar uma requisição de exclusão que seria recusada.

## Cadastro

Novo estudante confirma a abertura do formulário. O formulário também pede confirmação antes de gravar um novo cadastro ou editar dados existentes. As rotas de lista, perfil e formulário estão disponíveis para coordenador e administrador, mantendo a navegação na área correspondente.

## Etapas

O painel consulta os dados atuais do estudante, planos de ação e PEIs. Diferencia registrado, pendente, a revisar e a verificar:

- Identificação inicial: verifica os campos básicos preenchidos.
- Anamnese: permite revisar o formulário; o modelo atual não tem um marcador separado de conclusão da anamnese.
- Plano de Ação: distingue ausência, rascunho, assinatura e arquivamento.
- PEI: identifica os documentos não arquivados, sem presumir revisão ou assinatura.
- RAI: aparece como a verificar porque não há uma rota de consulta disponível no backend inspecionado.
- Falhas de consulta não são apresentadas como ausência de documento.

## Verificação

`node scripts/test-estudantes.mjs` verifica as rotas com HTTP simulado, transições de situação, data de conclusão, etapas e falhas parciais. No navegador foram conferidos os painéis, a proteção de estudante concluído, o aviso de conclusão com data e o aviso de novo cadastro, cancelando as confirmações. Nenhum cadastro foi alterado durante essa revisão.

## Perfil do estudante

As seis seções do perfil consultam registros reais vinculados ao estudante selecionado:

- Dados pessoais: identificação, contatos, responsável e, quando houver, conclusão e prazo de guarda.
- Diagnóstico: opções da anamnese com os mesmos nomes do formulário, incluindo respostas negativas e dados não informados. Informações complementares do Plano de Ação aparecem com a indicação do período de origem.
- Plano de Ação: conteúdo da aba preservado exatamente como em develop. A nova linha do tempo dessa aba fica reservada fora dos PRs para conciliação com o trabalho em PEI/Plano de Ação.
- Adaptações: tabela com filtros, incluindo adaptações arquivadas, detalhes pedagógicos e acesso às alterações de cada adaptação.
- Histórico: alterações no cadastro e nos registros vinculados ao estudante, com Antes/Depois. O vínculo considera o estudante no estado anterior ou posterior, preservando exclusões. IDs iguais em tabelas sem vínculo não são considerados pertencentes ao estudante.
- Documentos: Planos de Ação e PEIs, inclusive arquivados, com detalhes. RAI e arquivos anexos ainda não possuem consulta disponível por essa tela.

Uma falha em uma consulta não impede a apresentação das outras informações nem é apresentada como uma lista vazia confirmada. O histórico exige uma sessão autenticada no servidor; em caso de sessão expirada, a tela orienta entrar novamente.

`node scripts/test-perfil-estudante.mjs` verifica isolamento por estudante, exclusões e coleções no histórico, documentos de tipos diferentes com IDs iguais, adaptações arquivadas e falhas parciais. Dados pessoais, diagnóstico, plano e abertura de documento foram conferidos no navegador. A consulta real do histórico pediu novo login na sessão usada na revisão.

## Geração de documentos do estudante

O botão Gerar documento oferece duas opções em PDF, independentes da aba aberta:

- Histórico do estudante: consulta novamente as informações e reúne cadastro, anamnese, Planos de Ação, PEIs, adaptações, registros arquivados, linha do tempo acumulada e todas as alterações preservadas, com Antes/Depois. A emissão é bloqueada se uma consulta necessária falhar, evitando apresentar um histórico incompleto como completo. Não são inventados horários ou autores ausentes. RAI e arquivos anexos não consultáveis são identificados no alcance do documento.
- Declaração de acompanhamento: nome, matrícula, curso, período conferido pelo usuário, data de emissão, três logomarcas (IFPB Campus Monteiro, CLAI e Portal Incluir em verde) e campo de assinatura da Coordenação Local de Acessibilidade e Inclusão. O texto é justificado. Para estudantes inativos/concluídos, o texto usa acompanhamento realizado no período informado.

Os PDFs usam dados consultados no momento da geração, com confirmação em SweetAlert, controle de operação em andamento e verificação da conta antes de salvar o arquivo. A declaração é emitida sem assinatura automática.

`node scripts/test-documentos-estudante.mjs` gera arquivos de teste em `tmp/pdfs/` e verifica histórico acumulado, exclusões, horários, dados incompletos e declarações de acompanhamento atual e anterior. Foram verificados textos e margens em todas as páginas e conferidos visualmente o histórico de 20 páginas e a declaração de uma página. A declaração também foi gerada pela interface.
