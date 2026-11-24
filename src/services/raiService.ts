import { http } from "./http";
import type { RaiConteudo, RaiResponse } from "../types/rai";
export const raiService = {
  async concluir(estudanteId: number, registro: RaiResponse) {
    return (await http.post<RaiResponse>(`/rais/estudante/${estudanteId}/${registro.id}/concluir`, { versao: registro.versao, revisado: true })).data;
  },
  async arquivo(estudanteId: number, raiId: number, formato: "pdf" | "docx") {
    return (await http.get<Blob>(`/rais/estudante/${estudanteId}/${raiId}/arquivo`, { params: { formato }, responseType: "blob", timeout: 120000 })).data;
  },
  async listar(estudanteId: number, signal?: AbortSignal) {
    const { data } = await http.get<RaiResponse[]>(`/rais/estudante/${estudanteId}`, { signal });
    if (!Array.isArray(data) || data.some(r => r.estudanteId !== estudanteId)) throw new Error("Resposta inválida ao consultar os RAIs.");
    return data;
  },
  async salvar(estudanteId: number, dados: RaiConteudo, registro?: RaiResponse) {
    const corpo = { dados, versao: registro?.versao ?? null };
    return (registro
      ? await http.put<RaiResponse>(`/rais/estudante/${estudanteId}/${registro.id}`, corpo)
      : await http.post<RaiResponse>(`/rais/estudante/${estudanteId}`, corpo)).data;
  },
};
