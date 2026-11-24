import { endpoints } from "../config/endpoints";
import type { PlanoEducacionalRequest, PlanoEducacionalResponse } from "../types/planoEducacional";
import { http } from "./http";

const url = endpoints.documentos.pei;
export const planoEducacionalService = {
  async listarPorEstudante(estudanteId: number, signal?: AbortSignal): Promise<PlanoEducacionalResponse[]> {
    return (await http.get<PlanoEducacionalResponse[]>(`${url}/estudante/${estudanteId}`, { signal })).data;
  },
  async buscarPorId(id: number, signal?: AbortSignal): Promise<PlanoEducacionalResponse> {
    return (await http.get<PlanoEducacionalResponse>(`${url}/${id}`, { signal })).data;
  },
  async criar(request: PlanoEducacionalRequest): Promise<PlanoEducacionalResponse> {
    return (await http.post<PlanoEducacionalResponse>(url, request)).data;
  },
  async atualizar(id: number, request: PlanoEducacionalRequest): Promise<PlanoEducacionalResponse> {
    return (await http.put<PlanoEducacionalResponse>(`${url}/${id}`, request)).data;
  },
};
