import type { FiltroDocumento, TipoDocumento } from "../types/documento";

export const tiposDocumento: { tipo: FiltroDocumento; titulo: string; descricao: string; cor: string; icone: string }[] = [
  { tipo: "TODOS", titulo: "Todos os documentos", descricao: "Visão geral dos registros", cor: "bg-green-50 text-green-700", icone: "M4 4h6l2 2h8v14H4V4ZM8 11h8M8 15h6" },
  { tipo: "PEI", titulo: "PEIs", descricao: "Planos educacionais individualizados", cor: "bg-sky-50 text-sky-700", icone: "M5 3h10l4 4v14H5V3ZM14 3v5h5M9 12h6M9 16h6" },
  { tipo: "ANAMNESE", titulo: "Anamneses", descricao: "Identificação e necessidades do estudante", cor: "bg-violet-50 text-violet-700", icone: "M9 4H5v17h14V4h-4M9 3h6v4H9V3ZM9 12h6M9 16h4" },
  { tipo: "PLANO_ACAO", titulo: "Planos de ação", descricao: "Demandas e propostas de intervenção", cor: "bg-amber-50 text-amber-700", icone: "M9 5h11M9 12h11M9 19h11M3 5l1 1 2-2M3 12l1 1 2-2M3 19l1 1 2-2" },
  { tipo: "RAI", titulo: "RAIs", descricao: "Relatórios de acompanhamento individual", cor: "bg-rose-50 text-rose-700", icone: "M5 3h10l4 4v14H5V3ZM14 3v5h5M9 17v-3M12 17v-6M15 17v-4" },
];

export const nomeTipoDocumento: Record<TipoDocumento, string> = {
  PEI: "PEI", ANAMNESE: "Anamnese", PLANO_ACAO: "Plano de ação", RAI: "RAI",
};

export function formatarDataDocumento(value: string | null): string {
  if (!value) return "Não informada";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Não informada" : date.toLocaleDateString("pt-BR");
}
