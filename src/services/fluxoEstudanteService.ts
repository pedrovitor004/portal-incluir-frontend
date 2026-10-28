import { http } from "./http";
import type { EstudanteRequest, EstudanteResponse } from "../types/estudante";
import type { PlanoAcaoRequest, PlanoAcaoResponse } from "../types/planoAcao";

export type EtapaFluxo = "ANAMNESE" | "PLANO_ACAO" | "PEI";
export type ResponsavelEtapa = { usuarioId: number; nome: string; perfil: string; permissoes: string[] };
export type FluxoEstudante = {
  estudanteId: number;
  anamneseStatus: "PENDENTE" | "RASCUNHO" | "CONCLUIDA";
  planoStatus?: "RASCUNHO" | "ASSINADO" | null;
  peiRegistrado?: boolean;
  responsaveis: Partial<Record<EtapaFluxo, ResponsavelEtapa>>;
};
const url = (id: number) => `/estudantes/${id}/fluxo`;
export const fluxoEstudanteService = {
  async consultar(id: number, signal?: AbortSignal) { return (await http.get<FluxoEstudante>(url(id), { signal })).data; },
  async candidatos(id: number, signal?: AbortSignal) { return (await http.get<ResponsavelEtapa[]>(`${url(id)}/profissionais`, { signal })).data; },
  async atribuir(id: number, etapa: EtapaFluxo, usuarioId: number | null, mensagem?: string, planoId?: number) { return (await http.put<FluxoEstudante>(`${url(id)}/responsaveis/${etapa}`, { usuarioId, mensagem, planoId })).data; },
  async salvarAnamnese(id: number, dados: EstudanteRequest, concluir: boolean) { return (await http.put<EstudanteResponse>(`${url(id)}/anamnese`, { dados, concluir })).data; },
  async salvarPlano(id: number, dados: PlanoAcaoRequest, planoId: number | null) { return (await http.post<PlanoAcaoResponse>(`${url(id)}/plano`, { dados, planoId })).data; },
};
