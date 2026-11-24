import type { AdaptacaoPedagogicaConteudo } from "./adaptacaoPedagogica";
export type ModalidadeSolicitacaoPea = "PROFESSORES" | "SETOR" | "TODOS";
export type SituacaoDestinatarioPea = "PENDENTE" | "ENTREGUE" | "CANCELADO";
export type SituacaoSolicitacaoPea = "PENDENTE" | "ENTREGUE" | "CANCELADA" | "PARCIALMENTE_ENTREGUE_CANCELADA";
export interface ProfessorElegivelPea {
  professorId: number; nome: string; setor: string; disciplina: string | null;
  cursosAtuacao: string[]; vinculado: boolean; mesmoCurso: boolean;
}
export interface SolicitacaoPeaRequest {
  modalidade: ModalidadeSolicitacaoPea; contexto: string; orientacoes?: string;
  setor?: string; professorIds?: number[];
}
export interface DestinatarioPea {
  id: number; professorId: number; professorNome: string; setorNoEnvio: string;
  situacao: SituacaoDestinatarioPea; respondidaEm: string | null; canceladaEm: string | null; peaId: number | null;
}
export interface SolicitacaoPeaResponse {
  id: number; versao: number; estudante: { id: number; nome: string; matricula: string; curso: string };
  solicitanteUsuarioId: number; solicitanteNome: string; contexto: string; orientacoes: string | null;
  modalidade: ModalidadeSolicitacaoPea; setor: string | null; criadaEm: string;
  canceladaEm: string | null; motivoCancelamento: string | null;
  situacao: SituacaoSolicitacaoPea; destinatarios: DestinatarioPea[];
}
export type EntregaPeaRequest = AdaptacaoPedagogicaConteudo;
