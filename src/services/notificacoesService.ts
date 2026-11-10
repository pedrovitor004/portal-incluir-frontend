import { http } from "./http";
type EtapaFluxo = "ANAMNESE" | "PLANO_ACAO" | "PEI" | "PEA" | "OCORRENCIA";
export const nomesEtapas: Record<EtapaFluxo, string> = { OCORRENCIA: "Ocorrência", PEA: "PEA", ANAMNESE: "Anamnese", PLANO_ACAO: "Plano de ação", PEI: "PEI" };
import { accessProfiles } from "../config/access";
import type { PerfilUsuario } from "../types/auth";
export type NotificacaoFluxo = { id: number; estudanteId: number; estudanteNome: string; etapa: EtapaFluxo; planoId?: number; ocorrenciaId?: number; solicitacaoPeaId?: number; peaId?: number; remetente: string; mensagem: string; criadaEm: string; lida: boolean };
export const notificacoesService = {
  async listar(signal?: AbortSignal, background = false) { return (await http.get<NotificacaoFluxo[]>("/notificacoes", { signal, background })).data; },
  async ler(id: number) { return (await http.patch<NotificacaoFluxo>(`/notificacoes/${id}/lida`)).data; },
};
export function destinoNotificacao(n: NotificacaoFluxo, perfil: PerfilUsuario): string {
  const base = accessProfiles[perfil].basePath;
  if (n.etapa === "OCORRENCIA") return `${base}/ocorrencias${n.ocorrenciaId ? `?id=${n.ocorrenciaId}` : ""}`;
  if (n.etapa === "PEA") return n.solicitacaoPeaId && perfil === "PROFESSOR" ? `${base}/documentos/solicitacoes-pea/${n.solicitacaoPeaId}` : `${base}/documentos`;
  if (n.etapa === "ANAMNESE") return `${base}/anamnese?estudanteId=${n.estudanteId}`;
  if (n.etapa === "PLANO_ACAO") return `${base}/plano-acao?estudanteId=${n.estudanteId}${n.planoId ? `&planoId=${n.planoId}` : ""}`;
  return `${base}/estudantes/${n.estudanteId}/etapas/pei`;
}
