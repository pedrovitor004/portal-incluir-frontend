export interface AdaptacaoPedagogicaConteudo {
  componenteCurricular: string;
  semestreAno: string;
  objetivoGeral: string;
  objetivosEspecificos: string;
  conteudosProgramaticos: string;
  metodologia: string;
  avaliacao: string;
  bibliografiaBasica: string;
  bibliografiaComplementar: string;
}

export interface AdaptacaoPedagogicaRequest extends AdaptacaoPedagogicaConteudo {
  estudanteId: number;
  professorId: number;
  planoEducacionalId?: number | null;
}

export interface AdaptacaoPedagogicaResponse extends AdaptacaoPedagogicaConteudo {
  id: number;
  estudanteId: number;
  estudanteNome: string;
  estudanteMatricula: string;
  estudanteCurso: string;
  professorId: number;
  professorNome: string;
  arquivado: boolean;
  dataCriacao: string | null;
  dataAtualizacao: string | null;
}
