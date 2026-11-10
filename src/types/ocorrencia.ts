export interface Ocorrencia {
  id: number;
  estudanteId: number;
  estudanteNome: string;
  estudanteMatricula: string;
  autorId: number;
  autorNome: string;
  descricao: string;
  ocorridaEm: string;
  registradaEm: string;
  arquivoNome: string | null;
  arquivoTipo: string | null;
  arquivoTamanho: number | null;
}
export interface OcorrenciaRequest { estudanteId: number; descricao: string; ocorridaEm: string }
export interface FiltrosOcorrencia { estudanteId?: number; autorId?: number; mes?: string }
