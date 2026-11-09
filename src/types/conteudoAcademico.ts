export type TipoConteudoAcademico = "PROVA" | "ATIVIDADE" | "MATERIAL_APOIO" | "OUTRO";

export interface ConteudoAcademicoRequest {
  titulo: string;
  tipo: TipoConteudoAcademico;
  componenteCurricular: string;
  descricao: string;
  orientacoesAdaptacao?: string | null;
  estudanteId?: number | null;
  link?: string | null;
}

export interface AtualizarConteudoAcademicoRequest extends ConteudoAcademicoRequest {
  versao: number;
}

export interface ConteudoAcademicoResponse {
  id: number;
  versao: number;
  professorId: number;
  professorNome: string;
  estudanteId: number | null;
  estudanteNome: string | null;
  estudanteMatricula: string | null;
  titulo: string;
  tipo: TipoConteudoAcademico;
  componenteCurricular: string;
  descricao: string;
  orientacoesAdaptacao: string | null;
  link: string | null;
  arquivoNome: string | null;
  arquivoTipo: string | null;
  arquivoTamanho: number | null;
  dataCriacao: string;
  dataAtualizacao: string;
}
