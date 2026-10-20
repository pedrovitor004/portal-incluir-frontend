# Relatórios institucionais - frontend

Rota: `/coordenador/relatorios`. Modelos: Panorama institucional e Cobertura documental. A seleção de indicadores controla as colunas dos arquivos PDF e XLSX; curso é a dimensão fixa. A tela apresenta filtros horizontais e AG Grid com o mesmo tema, tipografia, linhas e paginação da área de documentos. Botões usam o componente compartilhado Button, também aplicado em Limpar filtros de Documentos. A altura mínima de acessibilidade fica na camada base do CSS, permitindo que as dimensões dos componentes sejam respeitadas. A seleção de campos e o título ficam no modal Configurar relatório. A navegação Tabela/Gráficos mantém os mesmos filtros. Na visualização gráfica, Por curso/Por situação alterna o agrupamento, barras acessíveis aplicam/removem filtros e chips mostram os filtros ativos. Percentuais usam o total da distribuição com os demais filtros mantidos e o próprio agrupamento sem restrição, para permitir comparação. Há retorno direto à tabela. Os critérios detalhados ficam em Sobre os dados. Coorte significa período de ingresso, não período de realização de atendimentos.

## Fontes e atualização

A consulta usa os endpoints existentes `/estudantes`, `/planos-educacionais` e `/planos-acao`. Cada exportação realiza nova consulta sem reutilizar a prévia. Falha em qualquer fonte impede exportar o conjunto incompleto. As consultas são independentes; a API atual não fornece snapshot transacional entre endpoints. Apenas campos mínimos são mantidos no estado do relatório; nomes, matrículas, contatos e textos clínicos não compõem a base projetada nem os arquivos. A API existente ainda retorna respostas mais amplas na rede, o que depende de uma futura projeção no servidor.

Documentos com marcador `[DEMONSTRAÇÃO UI DOCUMENTOS]` são excluídos dos indicadores. Estudantes únicos são contados por ID, inclusive quando têm vários PEIs. Registros cujo prazo de retenção expirou são descartados. Ativo/inativo segue exclusivamente o campo ativo do cadastro, como no dashboard. Conclusão é independente: quem tem data de conclusão também integra o total de ativos ou inativos. Portanto, ativos + inativos = total; concluídos é uma informação adicional e não deve ser somada a esses dois totais. A presença de documento não arquivado não comprova execução do atendimento. A base contém apenas os estudantes cadastrados no Portal, não o total de matrículas do campus.

## Acesso e escopo pendente

Implementação restrita ao frontend, conforme solicitado. A rota e as consultas/exportações verificam o perfil local COORDENADOR. Isso não substitui autenticação, autorização por campo/estudante e escopo no servidor: a API atual tem endpoints públicos. O critério de aceite de autorização ponta a ponta permanece pendente. Não há relatórios nominais ou clínicos nesta entrega. Relatórios agregados não são automaticamente anônimos: cursos com poucos estudantes podem permitir inferências, por isso a circulação indicada é institucional restrita.

Antes de liberar dados identificados, implementar uma consulta dedicada autenticada que projete somente os campos autorizados, aplique escopo do usuário e retenção no servidor, defina permissões e registre as exportações. Não há alterações no backend nesta etapa.

## Arquivos

PDF com identidade IFPB/CLAI e brasão da República, tabela dos indicadores selecionados, filtros, data de consulta, notas de leitura, referências e rodapés. Sem capa separada; a paginação acompanha o conteúdo. Usa orientação retrato ou paisagem conforme a quantidade de colunas. O brasão foi extraído do modelo DOCX fornecido pelo usuário (`MODELO - RELATÓRIO DE ACOMPANHAMENTO DISCENTE - PEI.docx`, mídia `word/media/image1.jpg`), sem alterar o desenho. É um arquivo pequeno de origem; para impressão em maior tamanho, substituir por versão institucional de alta resolução. Não foi aplicada marca promocional do Governo Federal.

Excel com Resumo institucional, Indicadores por curso e Metodologia; valores numéricos nativos, filtros e cabeçalho fixo. Sem macros, fórmulas externas, linhas nominais ou dados ocultos. A seleção de indicadores é respeitada no resumo e na tabela. Exportadores são carregados sob demanda.

Referências de estruturação (consultadas em 20/10/2026):
- IFPB, Relatórios anuais de gestão: https://www.ifpb.edu.br/transparencia/relatorios-anuais-de-gestao
- IFPB, Acessibilidade e inclusão: https://www.ifpb.edu.br/pro-reitoria/prae/acessibilidade-e-inclusao/legislacao-e-documentos-pertinentes
- Inep, Censo da Educação Superior: https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-da-educacao-superior/

Não foi identificado nessas referências um formulário único que esta geração possa substituir. O relatório é apoio interno à gestão. Requisitos e leiautes de entrega oficial devem ser confirmados com a diretoria e com o instrumento específico MEC/Inep. Não são calculadas evasão, permanência histórica, execução orçamentária ou atendimentos realizados sem dados que os comprovem.

## Verificação

`npm run test:relatorios` valida contagens, filtros, ausência de identificação na projeção, seleção de colunas, retenção, exclusão de demonstrações, bloqueio por perfil local, falha de fonte, geração PDF multipágina e reabertura do XLSX. Os arquivos de teste usam dados fictícios isolados em `tmp/relatorios.local`, sem criar registros na API. Testes de build e lint complementam as verificações.

A atualização manual avisa sucesso pelo SweetAlert padrão somente após a consulta completar. Falha avisa erro; requisições canceladas e a carga inicial não geram aviso de atualização. O PDF diferencia a fonte dos registros das referências de contexto e explicita que concluídos não devem ser somados a ativos e inativos.
