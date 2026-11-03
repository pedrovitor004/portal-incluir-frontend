import { endpoints } from "../config/endpoints";
import type {
  AdaptacaoPedagogicaRequest,
  AdaptacaoPedagogicaResponse,
} from "../types/adaptacaoPedagogica";
import { http } from "./http";

export const adaptacoesPedagogicasService = {
  async criar(request: AdaptacaoPedagogicaRequest): Promise<AdaptacaoPedagogicaResponse> {
    const response = await http.post<AdaptacaoPedagogicaResponse>(
      endpoints.documentos.adaptacoesPedagogicas,
      request,
    );
    return response.data;
  },
};
