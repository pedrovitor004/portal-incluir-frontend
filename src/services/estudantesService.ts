import { http } from "./http";
import type { EstudanteResponse } from "../types/estudante";
import type { EstudanteRequest } from "../types/estudante";

export const estudantesService = {
  async ativar(id: number): Promise<EstudanteResponse> {
    return (await http.post<EstudanteResponse>(`/estudantes/${id}/ativar`)).data;
  },
  async inativar(id: number): Promise<EstudanteResponse> {
    return (await http.post<EstudanteResponse>(`/estudantes/${id}/inativar`)).data;
  },
  async concluir(id: number, dataConclusao: string): Promise<EstudanteResponse> {
    return (await http.post<EstudanteResponse>(`/estudantes/${id}/concluir`, { dataConclusao })).data;
  },
  async listarTodos(): Promise<EstudanteResponse[]> {
    const response = await http.get<EstudanteResponse[]>("/estudantes");
    return response.data;
  },

  async buscarPorId(id: number): Promise<EstudanteResponse> {
    const response = await http.get<EstudanteResponse>(
      `/estudantes/${id}`
    );
    return response.data;
  },

  async buscarPorNome(nome: string): Promise<EstudanteResponse[]> {
    const response = await http.get<EstudanteResponse[]>(
      "/estudantes/buscar",
      { params: { nome } }
    );
    return response.data;
  },

  async listarAtivos(): Promise<EstudanteResponse[]> {
    const response = await http.get<EstudanteResponse[]>(
      "/estudantes/ativos"
    );
    return response.data;
  },

  async listarInativos(): Promise<EstudanteResponse[]> {
    const response = await http.get<EstudanteResponse[]>(
      "/estudantes/inativos"
    );
    return response.data;
  },

  async cadastrar(request: EstudanteRequest): Promise<EstudanteResponse> {
    const response = await http.post<EstudanteResponse>(
      "/estudantes",
      request
    );
    return response.data;
  },

  async atualizar(
    id: number,
    request: EstudanteRequest
  ): Promise<EstudanteResponse> {
    const response = await http.put<EstudanteResponse>(
      `/estudantes/${id}`,
      request
    );
    return response.data;
  },
};
