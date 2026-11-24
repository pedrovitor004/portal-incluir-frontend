export type OperacaoAuditoria = "ADD" | "MOD" | "DEL";
export type EstadoAuditoria = Record<string, unknown> | null;
export type DetalhesAuditoria = {
  operacao: OperacaoAuditoria;
  anteriorDisponivel: boolean;
  antes: EstadoAuditoria;
  depois: EstadoAuditoria;
  camposAlterados: Record<string, { antes: unknown; depois: unknown }>;
};
export type RegistroAuditoria = {
  tabela: string;
  revisao: number;
  data: string;
  identidade: Record<string, unknown>;
  operacao: OperacaoAuditoria;
  detalhes: DetalhesAuditoria | null;
};
export type ConsultaAuditoria = { registros: RegistroAuditoria[]; total: number };
export type FiltrosAuditoria = { tabela: string; operacao: string; inicio: string; fim: string; registro: string };
export type FiltroRapidoAuditoria = { tipo: "todos" | "hoje" | "area"; tabela?: string; versao: number };
