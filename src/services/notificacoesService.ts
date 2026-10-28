import { http } from "./http";
import type { EtapaFluxo } from "./fluxoEstudanteService";
import { accessProfiles } from "../config/access";
import type { PerfilUsuario } from "../types/auth";
export type NotificacaoFluxo = { id: number; estudanteId: number; estudanteNome: string; etapa: EtapaFluxo; planoId?: number; remetente: string; mensagem: string; criadaEm: string; lida: boolean };
export const notificacoesService = {
  async listar(signal?: AbortSignal) { return (await http.get<NotificacaoFluxo[]>("/notificacoes", { signal })).data; },
  async ler(id: number) { return (await http.patch<NotificacaoFluxo>(`/notificacoes/${id}/lida`)).data; },
};
export function destinoNotificacao(n: NotificacaoFluxo, perfil: PerfilUsuario): string {
  const base = accessProfiles[perfil].basePath;
  if (n.etapa === "ANAMNESE") return `${base}/anamnese?estudanteId=${n.estudanteId}`;
  if (n.etapa === "PLANO_ACAO") return `${base}/plano-acao?estudanteId=${n.estudanteId}${n.planoId ? `&planoId=${n.planoId}` : ""}`;
  return `${base}/estudantes/${n.estudanteId}/etapas/pei`;
}
