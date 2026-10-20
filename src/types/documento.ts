export type TipoDocumento = "PEI" | "ANAMNESE" | "PLANO_ACAO" | "RAI";
export type FiltroDocumento = TipoDocumento | "TODOS";

export interface Documento {
  chave: string;
  id: number;
  tipo: TipoDocumento;
  nome: string;
  estudanteId: number;
  estudanteNome: string;
  estudanteMatricula: string;
  curso: string;
  periodo: string;
  dataRegistro: string | null;
  dataAtualizacao: string | null;
  status: string;
  arquivado: boolean;
  assinado: boolean;
  detalhes: { titulo: string; valor: string }[];
}

export interface ConsultaDocumentos {
  documentos: Documento[];
  tiposDisponiveis: TipoDocumento[];
  falhas: { tipo: TipoDocumento; mensagem: string }[];
}
