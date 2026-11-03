import { endpoints } from "../config/endpoints";
import type {
  AdaptacaoPedagogicaRequest,
  AdaptacaoPedagogicaResponse,
} from "../types/adaptacaoPedagogica";
import { http } from "./http";

export const adaptacoesPedagogicasService = {
  async arquivar(id: number): Promise<AdaptacaoPedagogicaResponse> {
    return (await http.post<AdaptacaoPedagogicaResponse>(`${endpoints.documentos.adaptacoesPedagogicas}/${id}/arquivar`)).data;
  },
  async desarquivar(id: number): Promise<AdaptacaoPedagogicaResponse> {
    return (await http.post<AdaptacaoPedagogicaResponse>(`${endpoints.documentos.adaptacoesPedagogicas}/${id}/desarquivar`)).data;
  },
  async excluir(id: number): Promise<void> {
    await http.delete(`${endpoints.documentos.adaptacoesPedagogicas}/${id}`);
  },
  async listarPorProfessor(professorId: number, signal?: AbortSignal): Promise<AdaptacaoPedagogicaResponse[]> {
    if (!Number.isSafeInteger(professorId) || professorId <= 0) throw new Error("Professor não identificado.");
    return (await http.get<AdaptacaoPedagogicaResponse[]>(`${endpoints.documentos.adaptacoesPedagogicas}/professor/${professorId}`, { signal })).data;
  },
  async listarPorEstudanteEProfessor(estudanteId: number, professorId: number, signal?: AbortSignal): Promise<AdaptacaoPedagogicaResponse[]> {
    if (![estudanteId, professorId].every(id => Number.isSafeInteger(id) && id > 0)) throw new Error("Estudante ou professor não identificado.");
    return (await http.get<AdaptacaoPedagogicaResponse[]>(`${endpoints.documentos.adaptacoesPedagogicas}/estudante/${estudanteId}/professor/${professorId}`, { signal })).data;
  },
  async buscarPorId(id: number, signal?: AbortSignal): Promise<AdaptacaoPedagogicaResponse> {
    return (await http.get<AdaptacaoPedagogicaResponse>(`${endpoints.documentos.adaptacoesPedagogicas}/${id}`, { signal })).data;
  },
  async atualizar(id: number, request: AdaptacaoPedagogicaRequest): Promise<AdaptacaoPedagogicaResponse> {
    return (await http.put<AdaptacaoPedagogicaResponse>(`${endpoints.documentos.adaptacoesPedagogicas}/${id}`, request)).data;
  },
  async criar(request: AdaptacaoPedagogicaRequest): Promise<AdaptacaoPedagogicaResponse> {
    const response = await http.post<AdaptacaoPedagogicaResponse>(
      endpoints.documentos.adaptacoesPedagogicas,
      request,
    );
    return response.data;
  },
};
