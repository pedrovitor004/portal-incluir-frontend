import axios from "axios";
import { http } from "./http";
import { auditoriasService } from "./auditoriasService";
import { mapearDocumento, type PlanoResponse } from "./documentosService";
import type { RegistroAuditoria } from "../types/auditoria";
import type { EstudanteResponse } from "../types/estudante";
import type { AdaptacaoEstudante, DadosPerfilEstudante, PlanoAcaoPerfil } from "../types/perfilEstudante";

export function pertenceAoEstudante(registro: RegistroAuditoria, estudanteId: number): boolean {
  const igual = (valor: unknown) => (typeof valor === "number" || typeof valor === "string") && String(valor) === String(estudanteId);
  if (registro.tabela === "estudantes_aud") return igual(registro.identidade.id);
  const estados = [registro.identidade, registro.detalhes?.antes, registro.detalhes?.depois];
  return estados.some(estado => estado && (igual(estado.estudante_id) || igual(estado.estudanteId)));
}
export function ordenarMaisRecentes<T extends { dataAtualizacao?: string | null; dataCriacao?: string | null; id: number }>(registros: T[]): T[] {
  return [...registros].sort((a, b) => (b.dataAtualizacao || b.dataCriacao || "").localeCompare(a.dataAtualizacao || a.dataCriacao || "") || b.id - a.id);
}
export const perfilEstudanteService = {
  async consultar(id: number, signal: AbortSignal): Promise<DadosPerfilEstudante> {
    if (!Number.isSafeInteger(id) || id <= 0) throw new Error("O estudante informado não foi encontrado.");
    const respostas = await Promise.allSettled([
      http.get<EstudanteResponse>(`/estudantes/${id}`, { signal }),
      http.get<PlanoAcaoPerfil[]>("/planos-acao", { signal }),
      http.get<PlanoResponse[]>(`/planos-educacionais/estudante/${id}`, { signal }),
      http.get<AdaptacaoEstudante[]>(`/adaptacoes-pedagogicas/estudante/${id}`, { signal }),
      auditoriasService.listarHistorico(signal),
    ] as const);
    if (respostas[0].status === "rejected") throw respostas[0].reason;
    const falhas: DadosPerfilEstudante["falhas"] = {};
    const planos = respostas[1].status === "fulfilled" ? ordenarMaisRecentes(respostas[1].value.data.filter(p => p.estudanteId === id)) : [];
    const peis = respostas[2].status === "fulfilled" ? ordenarMaisRecentes(respostas[2].value.data.filter(p => p.estudanteId === id)) : [];
    const adaptacoes = respostas[3].status === "fulfilled" ? ordenarMaisRecentes(respostas[3].value.data.filter(a => a.estudanteId === id)) : [];
    const historico = respostas[4].status === "fulfilled" ? respostas[4].value.registros.filter(r => pertenceAoEstudante(r, id)).sort((a, b) => b.revisao - a.revisao || b.data.localeCompare(a.data)) : [];
    if (respostas[1].status === "rejected") falhas.planos = "Não foi possível consultar os planos de ação deste estudante.";
    if (respostas[2].status === "rejected") falhas.peis = "Não foi possível consultar os PEIs deste estudante.";
    if (respostas[3].status === "rejected") falhas.adaptacoes = "Não foi possível consultar as adaptações deste estudante.";
    if (respostas[4].status === "rejected") {
      const erro = respostas[4].reason;
      falhas.historico = axios.isAxiosError(erro) && erro.response?.status === 401
        ? "Para consultar o histórico de alterações, entre novamente na sua conta."
        : "Não foi possível consultar o histórico de alterações. Tente atualizar os dados.";
    }
    return { estudante: respostas[0].value.data, planos, documentos: [...planos.map(p => mapearDocumento(p, "PLANO_ACAO")), ...peis.map(p => mapearDocumento(p, "PEI"))].sort((a, b) => (b.dataAtualizacao || b.dataRegistro || "").localeCompare(a.dataAtualizacao || a.dataRegistro || "")), adaptacoes, historico, falhas };
  },
};
