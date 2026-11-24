# RAI integrado ao acompanhamento

O relatório é preenchido a partir da anamnese, Plano de Ação, PEI e PEAs ativos do período. Cada campo mostra sua origem e permanece revisável. A importação preserva alterações manuais; frequências das nove habilidades são avaliadas pelo responsável, sem inferência automática. As adequações curriculares vêm dos PEAs e propostas do PEI e devem ser confirmadas conforme sua aplicação.

Técnicos usam bimestre ou ano; superiores usam semestre ou ano. Os planejamentos semestrais existentes servem de referência ao bimestre correspondente. Cidade da assinatura corresponde à linha de data e assinatura do modelo e vem preenchida com Monteiro.

A exportação usa o arquivo institucional original, preservando os demais componentes do pacote DOCX, estilos e propriedades de parágrafos e seções. Apenas os campos e marcações são preenchidos; dados de exemplo são substituídos. O PDF é convertido a partir desse mesmo Word no servidor. Windows usa Microsoft Word instalado, em modo oculto; outros ambientes podem configurar app.documentos.conversor=libreoffice e app.documentos.libreoffice com o executável do LibreOffice. Ausência do conversor retorna erro explícito, sem substituir o modelo por outro layout.

Após revisão e salvamento, Concluir acompanhamento deste período registra o fechamento e marca as etapas correspondentes como concluídas. O estudante permanece ativo; o fechamento não chama a conclusão definitiva nem inicia a retenção. RAIs concluídos preservam seu conteúdo e podem ser exportados; novos relatórios podem ser criados para o mesmo ou outro período.

O fluxo de cadastro não é disponibilizado ao professor, inclusive por pendências, notificações e permissões individuais. A API aplica essa restrição. As solicitações de PEA e consultas pedagógicas autorizadas permanecem disponíveis. O perfil consulta auditoria apenas quando a conta possui a permissão correspondente.

## API

GET/POST /api/rais/estudante/{estudanteId}; PUT /api/rais/estudante/{estudanteId}/{id}; POST /{id}/concluir com versao e revisado=true; GET /{id}/arquivo?formato=docx ou pdf. Escrita exige gestão, documentos, sensivel.consultar e pei.editar. Edição e conclusão verificam versão, escopo e disponibilidade do estudante.

O Hibernate atualiza as tabelas do RAI na inicialização conforme ddl-auto=update. Reinicie o backend após atualizar. Ambientes com migrações devem incluir relatorios_rai e auditoria.relatorios_rai_aud, incluindo concluido_em.

## Validação

npm run build; npm run lint; npm run test:rai; node scripts/test-perfil-estudante.mjs; npm run test:solicitacoes-pea. Backend: RelatorioRaiTest, RaiModeloDocumentoTest, RaiPeriodoAcessoTest e FluxoEstudanteTest. O teste do modelo compara todas as partes preservadas, a geometria de seção e as propriedades de parágrafos.
