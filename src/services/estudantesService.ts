import { http } from "./http";
import type { EstudanteResponse } from "../types/estudante";

export const estudantesService = {
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
};
