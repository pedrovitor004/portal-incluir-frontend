import type { AdaptacaoPedagogicaResponse } from "./adaptacaoPedagogica";

export interface PlanoEducacionalConteudo {
  semestreAno: string;
  historico: string;
  necessidadesEspecificas: string;
  conhecimentosHabilidadesInteresses: string;
  dificuldadesApresentadas: string;
  propostasAdaptacoesCurriculares: string;
}

export interface PlanoEducacionalRequest extends PlanoEducacionalConteudo {
  estudanteId: number;
  coordenadorId: number;
}

export interface PlanoEducacionalResponse extends PlanoEducacionalRequest {
  id: number;
  estudanteNome: string;
  estudanteMatricula: string;
  estudanteCurso: string;
  coordenadorNome: string;
  adaptacoesPedagogicas: AdaptacaoPedagogicaResponse[];
  arquivado: boolean;
  dataCriacao: string | null;
  dataAtualizacao: string | null;
}
