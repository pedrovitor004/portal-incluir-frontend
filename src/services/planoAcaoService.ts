import { http } from "./http";
import type {
 PlanoAcaoRequest,
 PlanoAcaoResponse,
 StatusPlanoAcao,
} from "../types/planoAcao";


export const planoAcaoService = {
 async criar(request: PlanoAcaoRequest): Promise<PlanoAcaoResponse> {
   const response = await http.post<PlanoAcaoResponse>(
     "/planos-acao",
     request,
   );
   return response.data;
 },


 async listarTodos(
   status?: StatusPlanoAcao,
 ): Promise<PlanoAcaoResponse[]> {
   const response = await http.get<PlanoAcaoResponse[]>("/planos-acao", {
     params: status ? { status } : {},
   });
   return response.data;
 },


 async buscarPorId(id: number): Promise<PlanoAcaoResponse> {
   const response = await http.get<PlanoAcaoResponse>(
     `/planos-acao/${id}`,
   );
   return response.data;
 },


 async atualizar(
   id: number,
   request: PlanoAcaoRequest,
 ): Promise<PlanoAcaoResponse> {
   const response = await http.put<PlanoAcaoResponse>(
     `/planos-acao/${id}`,
     request,
   );
   return response.data;
 },


 async excluir(id: number): Promise<void> {
   await http.delete(`/planos-acao/${id}`);
 },


 async arquivar(id: number): Promise<PlanoAcaoResponse> {
   const response = await http.post<PlanoAcaoResponse>(
     `/planos-acao/${id}/arquivar`,
   );
   return response.data;
 },


 async desarquivar(id: number): Promise<PlanoAcaoResponse> {
   const response = await http.post<PlanoAcaoResponse>(
     `/planos-acao/${id}/desarquivar`,
   );
   return response.data;
 },


 async assinar(id: number): Promise<PlanoAcaoResponse> {
   const response = await http.post<PlanoAcaoResponse>(
     `/planos-acao/${id}/assinar`,
   );
   return response.data;
 },
};

