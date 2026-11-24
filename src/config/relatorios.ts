import type { CampoRelatorio, FiltrosRelatorio, ModeloRelatorio } from "../types/relatorio";
export const camposRelatorio: { id: CampoRelatorio; titulo: string; descricao: string }[] = [
  { id: "total", titulo: "Total de estudantes", descricao: "Estudantes únicos no recorte" },
  { id: "ativos", titulo: "Ativos", descricao: "Cadastro ativo, inclusive com conclusão" },
  { id: "inativos", titulo: "Inativos", descricao: "Cadastro inativo, inclusive com conclusão" },
  { id: "concluidos", titulo: "Concluídos", descricao: "Data de conclusão registrada" },
  { id: "comPei", titulo: "Com PEI", descricao: "Estudantes com PEI não arquivado" },
  { id: "comPlano", titulo: "Com plano de ação", descricao: "Estudantes com plano não arquivado" },
];
export const modelosRelatorio: { id: ModeloRelatorio; titulo: string; descricao: string; icone: string; campos: CampoRelatorio[] }[] = [
  { id: "panorama", titulo: "Panorama institucional", descricao: "Distribuição dos estudantes por curso e situação cadastral.", icone: "M3 3v18h18M7 16v-5m5 5V7m5 9v-8", campos: ["total", "ativos", "inativos", "concluidos"] },
  { id: "documentacao", titulo: "Cobertura documental", descricao: "Estudantes com PEI e plano de ação não arquivados.", icone: "M5 3h10l4 4v14H5V3ZM14 3v5h5M9 12h6M9 16h6", campos: ["total", "comPei", "comPlano"] },
];
export const filtrosIniciais: FiltrosRelatorio = { curso: "", ingresso: "", situacao: "", documento: "" };
export const referenciasRelatorio = [
  { titulo: "IFPB · Relatórios anuais de gestão", url: "https://www.ifpb.edu.br/transparencia/relatorios-anuais-de-gestao" },
  { titulo: "IFPB · Acessibilidade e inclusão", url: "https://www.ifpb.edu.br/pro-reitoria/prae/acessibilidade-e-inclusao/legislacao-e-documentos-pertinentes" },
  { titulo: "Inep · Censo da Educação Superior", url: "https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-da-educacao-superior/" },
];
export const notaMetodologica = "Retrato cadastral da consulta, restrito aos estudantes encontrados na consulta do Portal Incluir. Não representa o total de matrículas do campus, atendimento efetivamente realizado, série histórica, taxa de evasão ou declaração ao Censo. Ativos e inativos seguem a situação do cadastro. Concluído significa possuir data de conclusão e não retira o estudante dos totais de ativos ou inativos. Com PEI/plano significa possuir ao menos um documento não arquivado; não mede qualidade ou execução do acompanhamento. Registros de demonstração são excluídos dos indicadores documentais. As categorias documentais podem se sobrepor. O período de ingresso seleciona o grupo de estudantes pelo ingresso, não a data de atendimento. Totais por curso podem permitir inferências em grupos pequenos; circulação institucional restrita.";
