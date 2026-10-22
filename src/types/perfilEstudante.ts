import type { PlanoResponse } from "../services/documentosService";
import type { RegistroAuditoria } from "./auditoria";
import type { Documento } from "./documento";
import type { EstudanteResponse } from "./estudante";
export interface PlanoAcaoPerfil extends PlanoResponse { dataAssinatura?: string | null }
export type AdaptacaoEstudante = {
  id: number; estudanteId: number; professorNome: string; componenteCurricular: string; semestreAno: string;
  objetivoGeral: string; objetivosEspecificos: string; conteudosProgramaticos: string; metodologia: string;
  avaliacao: string; bibliografiaBasica: string; bibliografiaComplementar: string;
  arquivado: boolean; dataCriacao: string | null; dataAtualizacao: string | null;
};
export type DadosPerfilEstudante = {
  estudante: EstudanteResponse; planos: PlanoAcaoPerfil[]; documentos: Documento[];
  adaptacoes: AdaptacaoEstudante[]; historico: RegistroAuditoria[];
  falhas: Partial<Record<"planos" | "peis" | "adaptacoes" | "historico", string>>;
};
