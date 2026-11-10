# Ocorrências da equipe multidisciplinar

O registro usa o backend Spring Boot em `C:/Users/pedro/Desktop/portal-incluir` e as permissões existentes `suporte.registrar`, `suporte.consultar`, `estudantes.consultar` e `relatorios`.

- A equipe registra ocorrências para estudantes ativos e vinculados ao seu acompanhamento. Consulta e relata somente os registros de sua autoria, inclusive depois de encerrar um vínculo, enquanto o histórico do estudante estiver disponível.
- O professor consulta ocorrências e anexos somente dos estudantes atualmente vinculados ou atribuídos a ele. Encerrar o vínculo também retira os alertas de ocorrência de sua consulta.
- A coordenação consulta todos os registros. Professores e coordenadores recebem uma notificação com link para a ocorrência, sem incluir a descrição sensível no texto do alerta.
- Registros são preservados sem edição ou exclusão pela interface. Autoria e horário de gravação vêm da sessão e do servidor.

## API

- `POST /api/ocorrencias`: multipart com `dados` (JSON: `estudanteId`, `descricao`, `ocorridaEm`) e `arquivo` opcional.
- `GET /api/ocorrencias`: consulta autorizada, com filtros opcionais `estudanteId`, `autorId` e `mes` (`AAAA-MM`). A equipe não pode ampliar seu escopo usando `autorId`.
- `GET /api/ocorrencias/{id}`: detalhes autorizados.
- `GET /api/ocorrencias/{id}/arquivo`: download autorizado, sem cache, com nome sanitizado e `nosniff`.
- `GET /api/ocorrencias/relatorio`: consulta para o relatório mensal ou geral da equipe e coordenação. Exige `relatorios`. O mês considera a data da ocorrência e limites inclusivo no início/exclusivo no próximo mês.

Descrição obrigatória com até 5.000 caracteres; data e hora no horário de Brasília. Anexo único opcional de até 10 MB em PNG, JPEG, PDF, DOCX ou TXT. O conteúdo é validado no servidor, não apenas a extensão. O registro, anexo e notificações são gravados na mesma transação.

## Interface

- `/equipe/ocorrencias/nova`: formulário com lista dos estudantes disponíveis, data, descrição e anexo.
- `/{perfil}/ocorrencias`: registros, detalhes, filtro mensal e PDF mensal/geral para equipe e coordenação.
- Perfil do estudante: seção Ocorrências.
- O menu da equipe possui acessos diretos; a seção expansível Equipe multidisciplinar permanece somente para a coordenação. A antiga rota Atendimentos redireciona para Ocorrências.

As notificações usam a atualização já existente a cada 30 segundos enquanto a página está visível. O relatório atualiza a consulta antes de gerar o PDF e inclui os nomes dos anexos, sem incorporar seus arquivos.

## Banco e execução

Reinicie o backend para carregar os endpoints e atualizar o esquema com a configuração existente `spring.jpa.hibernate.ddl-auto=update`. São adicionadas `ocorrencias`, `arquivos_ocorrencia`, suas tabelas de auditoria e a coluna `ocorrencia_id` nas notificações e auditoria correspondente. Binários não são copiados para a auditoria. A política de retenção remove registros, anexos e revisões do estudante quando o prazo vence.

Os testes usam H2 em memória e não alteram os dados do banco de desenvolvimento.

Frontend: `node scripts/test-ocorrencias.mjs`, `node scripts/test-dashboard.mjs`, `npm run test:notificacoes`, `npm run build`.

Backend: `mvn -Dtest=OcorrenciaTest,FluxoEstudanteTest,ConteudoAcademicoTest test`.
