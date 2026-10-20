export type SituacaoRelatorio = "Ativo" | "Inativo";
export interface EstudanteRelatorio { id: number; curso: string; ingresso: string; situacao: SituacaoRelatorio; concluido: boolean; pei: boolean; planoAcao: boolean }
export interface BaseRelatorio { estudantes: EstudanteRelatorio[]; consultadoEm: string; demonstracoesExcluidas: number }
export interface FiltrosRelatorio { curso: string; ingresso: string; situacao: string; documento: string }
export type CampoRelatorio = "total" | "ativos" | "inativos" | "concluidos" | "comPei" | "comPlano";
export type ModeloRelatorio = "panorama" | "documentacao";
export interface LinhaRelatorio { curso: string; total: number; ativos: number; inativos: number; concluidos: number; comPei: number; comPlano: number }
export interface RelatorioInstitucional { titulo: string; modelo: ModeloRelatorio; filtros: FiltrosRelatorio; campos: CampoRelatorio[]; linhas: LinhaRelatorio[]; total: LinhaRelatorio; consultadoEm: string; demonstracoesExcluidas: number }
