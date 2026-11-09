import axios from "axios";
import { endpoints } from "../config/endpoints";
import type {
  AtualizarConteudoAcademicoRequest,
  ConteudoAcademicoRequest,
  ConteudoAcademicoResponse,
} from "../types/conteudoAcademico";
import { http } from "./http";

const api = endpoints.conteudosAcademicos;

export const conteudosAcademicosService = {
  async listar(signal?: AbortSignal): Promise<ConteudoAcademicoResponse[]> {
    return (await http.get<ConteudoAcademicoResponse[]>(api.base, { signal })).data;
  },

  async buscarPorId(id: number, signal?: AbortSignal): Promise<ConteudoAcademicoResponse> {
    return (await http.get<ConteudoAcademicoResponse>(api.porId(id), { signal })).data;
  },

  async criar(request: ConteudoAcademicoRequest, signal?: AbortSignal): Promise<ConteudoAcademicoResponse> {
    return (await http.post<ConteudoAcademicoResponse>(api.base, request, { signal })).data;
  },

  async criarComArquivo(request: ConteudoAcademicoRequest, arquivo: File, signal?: AbortSignal): Promise<ConteudoAcademicoResponse> {
    const form = new FormData();
    form.append("dados", new Blob([JSON.stringify(request)], { type: "application/json" }));
    form.append("arquivo", arquivo);
    // O navegador define o boundary multipart; o cadastro e o anexo sao atomicos no backend.
    return (await http.post<ConteudoAcademicoResponse>(api.base, form, { signal })).data;
  },

  async atualizar(id: number, request: AtualizarConteudoAcademicoRequest, signal?: AbortSignal): Promise<ConteudoAcademicoResponse> {
    return (await http.put<ConteudoAcademicoResponse>(api.porId(id), request, { signal })).data;
  },

  async excluir(id: number, versao: number, signal?: AbortSignal): Promise<void> {
    await http.delete(api.porId(id), { params: { versao }, signal });
  },

  async definirFavorito(id: number, versao: number, favorito: boolean, signal?: AbortSignal): Promise<ConteudoAcademicoResponse> {
    return (await http.put<ConteudoAcademicoResponse>(`${api.porId(id)}/favorito`, null, { params: { versao, favorito }, signal })).data;
  },

  async enviarArquivo(id: number, versao: number, arquivo: File, signal?: AbortSignal): Promise<ConteudoAcademicoResponse> {
    const form = new FormData();
    form.append("arquivo", arquivo);
    return (await http.put<ConteudoAcademicoResponse>(api.arquivo(id), form, { params: { versao }, signal })).data;
  },

  async removerArquivo(id: number, versao: number, signal?: AbortSignal): Promise<ConteudoAcademicoResponse> {
    return (await http.delete<ConteudoAcademicoResponse>(api.arquivo(id), { params: { versao }, signal })).data;
  },

  async baixarArquivo(id: number, signal?: AbortSignal): Promise<Blob> {
    try {
      return (await http.get<Blob>(api.arquivo(id), { responseType: "blob", signal })).data;
    } catch (error) {
      // responseType blob tambem se aplica aos erros JSON; preserva a mensagem para mensagemErro.
      if (axios.isAxiosError(error) && error.response?.data instanceof Blob && error.response.data.type.includes("json")) {
        try { error.response.data = JSON.parse(await error.response.data.text()); }
        catch { /* Preserva o erro HTTP original caso a resposta nao seja JSON valido. */ }
      }
      throw error;
    }
  },
};
