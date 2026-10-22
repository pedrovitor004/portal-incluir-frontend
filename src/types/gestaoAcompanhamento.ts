export type SituacaoAcompanhamento = "Ativo" | "Inativo" | "Arquivado";
export type TipoAcompanhamento = "adaptacao" | "atendimento";

export interface RegistroAcompanhamento {
  id: string;
  tipo: TipoAcompanhamento;
  estudante: string;
  matricula: string;
  curso: string;
  responsavel: string;
  area: string;
  data: string;
  titulo: string;
  descricao: string;
  conteudo: string;
  recursos: string;
  resultado: string;
  situacao: SituacaoAcompanhamento;
}

/** Prévia de saída, sem entrega ao destinatário até existir integração. */
export interface AvisoAcompanhamento {
  id: string;
  destinatario: string;
  titulo: string;
  mensagem: string;
  data: string;
  lido: boolean;
}

export interface GestaoAcompanhamento {
  demonstracao: boolean;
  registros: RegistroAcompanhamento[];
  avisos: AvisoAcompanhamento[];
}
