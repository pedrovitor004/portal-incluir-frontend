import { http } from "./http";
import type { AdaptacaoPedagogicaResponse } from "../types/adaptacaoPedagogica";
import type { EntregaPeaRequest, ProfessorElegivelPea, SolicitacaoPeaRequest, SolicitacaoPeaResponse } from "../types/solicitacaoPea";
const base = "/solicitacoes-pea";
const porEstudante = (id: number) => `/estudantes/${id}/solicitacoes-pea`;
function professorElegivelValido(valor: unknown): valor is ProfessorElegivelPea {
  if (typeof valor !== "object" || valor === null) return false;
  const p = valor as Record<string, unknown>;
  return typeof p.professorId === "number" && Number.isSafeInteger(p.professorId) && p.professorId > 0
    && typeof p.nome === "string" && typeof p.setor === "string"
    && (p.disciplina === null || typeof p.disciplina === "string")
    && Array.isArray(p.cursosAtuacao) && p.cursosAtuacao.every(curso => typeof curso === "string")
    && typeof p.vinculado === "boolean" && typeof p.mesmoCurso === "boolean";
}
export const solicitacoesPeaService = {
  async elegiveis(id: number, setor?: string, signal?: AbortSignal) {
    if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Identificador do estudante inválido para consultar professores elegíveis.");
    const { data } = await http.get<unknown>(`${porEstudante(id)}/elegiveis`, { params: setor ? { setor } : undefined, signal });
    // Falhas HTTP/rede são propagadas. Uma resposta inválida nunca vira lista vazia.
    if (!Array.isArray(data) || !data.every(professorElegivelValido)) {
      throw new Error("Resposta inválida ao consultar professores elegíveis. O servidor retornou dados incompatíveis com o formato esperado.");
    }
    return data as ProfessorElegivelPea[];
  },
  async listar(id: number, signal?: AbortSignal) {
    return (await http.get<SolicitacaoPeaResponse[]>(porEstudante(id), { signal })).data;
  },
  async criar(id: number, dados: SolicitacaoPeaRequest, chave: string) {
    return (await http.post<SolicitacaoPeaResponse>(porEstudante(id), dados, { headers: { "Idempotency-Key": chave } })).data;
  },
  async recebidas(signal?: AbortSignal) {
    return (await http.get<SolicitacaoPeaResponse[]>(`${base}/recebidas`, { signal })).data;
  },
  async detalhes(id: number, signal?: AbortSignal) {
    return (await http.get<SolicitacaoPeaResponse>(`${base}/${id}`, { signal })).data;
  },
  async contexto(id: number, signal?: AbortSignal) {
    return (await http.get<SolicitacaoPeaResponse>(`${base}/${id}/contexto`, { signal })).data;
  },
  async andamento(id: number, signal?: AbortSignal) {
    return (await http.get<SolicitacaoPeaResponse>(`${base}/${id}/andamento`, { signal })).data;
  },
  async entregar(id: number, conteudo: EntregaPeaRequest, chave: string) {
    return (await http.post<AdaptacaoPedagogicaResponse>(`${base}/${id}/entregas`, conteudo, { headers: { "Idempotency-Key": chave } })).data;
  },
  async cancelar(id: number, versao: number, motivo: string) {
    return (await http.post<SolicitacaoPeaResponse>(`${base}/${id}/cancelar`, { versao, motivo })).data;
  },
};
